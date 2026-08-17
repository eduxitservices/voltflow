const Vehicle = require('../models/Vehicle');
const ChargingStation = require('../models/ChargingStation');
const ChargingSession = require('../models/ChargingSession');
const Alert = require('../models/Alert');

class OrchestrationEngine {
  constructor() {
    this.gridLimit = 150; // Total site capacity in kW
    this.optimizationMode = 'Balanced'; // 'Cost Optimized' | 'SOC Optimized' | 'Time Optimized' | 'Balanced'
    this.targetSOC = 90;
    this.tariffPeakCost = 14.5; // INR per kWh
    this.tariffOffPeakCost = 8.5; // INR per kWh
    this.isAutoOrchestrating = true;
  }

  calculatePriorityScore(vehicle, schedule = null) {
    const socScore = (100 - vehicle.currentSOC) * 1.5;
    
    let vehicleTierScore = 0;
    if (vehicle.priorityLevel === 'Critical') vehicleTierScore = 50;
    else if (vehicle.priorityLevel === 'Low SOC') vehicleTierScore = 35;
    else if (vehicle.priorityLevel === 'Scheduled') vehicleTierScore = 20;

    let departureScore = 0;
    if (schedule && schedule.startTime) {
      const hoursUntilDeparture = Math.max(0.5, (new Date(schedule.startTime) - new Date()) / (1000 * 60 * 60));
      departureScore = Math.max(0, (12 - hoursUntilDeparture) * 4);
    }

    let modeAdjustment = 0;
    if (this.optimizationMode === 'SOC Optimized') modeAdjustment += (100 - vehicle.currentSOC) * 0.5;
    if (this.optimizationMode === 'Cost Optimized') modeAdjustment -= 10; 

    return Number((socScore + vehicleTierScore + departureScore + modeAdjustment).toFixed(2));
  }

  async runOrchestration(io) {
    try {
      const stations = await ChargingStation.find({ status: { $ne: 'Offline' } });
      const activeSessions = await ChargingSession.find({ status: 'Active' }).populate('vehicle');

      let currentAllocatedLoad = activeSessions.reduce((acc, sess) => acc + (sess.chargingPower || 0), 0);

      // Verify grid boundary safety
      if (currentAllocatedLoad > this.gridLimit) {
        if (io) {
          io.emit('alert:new', {
            type: 'Grid Overload',
            severity: 'Critical',
            title: 'Grid Threshold Exceeded',
            message: `Current consumption of ${currentAllocatedLoad.toFixed(1)} kW exceeds ${this.gridLimit} kW safe limit.`
          });
        }
      }

      // Identify unassigned vehicles queued for charging
      const queuedVehicles = await Vehicle.find({ status: 'Scheduled' });
      const rankedQueue = queuedVehicles
        .map(v => ({ vehicle: v, score: this.calculatePriorityScore(v) }))
        .sort((a, b) => b.score - a.score);

      for (const item of rankedQueue) {
        const targetVehicle = item.vehicle;
        const availableStation = stations.find(s => s.availableConnectors > 0 && s.status !== 'Maintenance');
        
        const standardPowerRequirement = 22.0; // kW
        if (availableStation && (currentAllocatedLoad + standardPowerRequirement <= this.gridLimit)) {
          // Allocate Charging Slot
          availableStation.availableConnectors -= 1;
          availableStation.currentLoad += standardPowerRequirement;
          if (availableStation.availableConnectors === 0) availableStation.status = 'Busy';
          await availableStation.save();

          targetVehicle.status = 'Charging';
          targetVehicle.chargingStation = availableStation._id;
          targetVehicle.currentChargingPower = standardPowerRequirement;
          await targetVehicle.save();

          const newSession = await ChargingSession.create({
            sessionId: `SESS-${Date.now().toString().slice(-6)}`,
            vehicle: targetVehicle._id,
            station: availableStation._id,
            startSOC: targetVehicle.currentSOC,
            chargingPower: standardPowerRequirement,
            startTime: new Date()
          });

          currentAllocatedLoad += standardPowerRequirement;

          if (io) {
            io.emit('orchestration:dispatch', {
              message: `Vehicle ${targetVehicle.registrationNumber} allocated ${standardPowerRequirement} kW at ${availableStation.name}`,
              sessionId: newSession.sessionId
            });
          }
        }
      }
    } catch (err) {
      console.error('[Orchestration Error]', err);
    }
  }
}

module.exports = new OrchestrationEngine();
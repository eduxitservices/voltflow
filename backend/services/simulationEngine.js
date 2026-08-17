const Vehicle = require('../models/Vehicle');
const ChargingStation = require('../models/ChargingStation');
const ChargingSession = require('../models/ChargingSession');
const EnergyRecord = require('../models/EnergyRecord');
const Alert = require('../models/Alert');

let simInterval = null;

const startSimulation = (io) => {
  if (simInterval) clearInterval(simInterval);

  console.log('[Simulation] Real-Time EV telemetry loop initialized (3-second cadence)');

  simInterval = setInterval(async () => {
    try {
      const activeSessions = await ChargingSession.find({ status: 'Active' })
        .populate('vehicle')
        .populate('station');

      if (!activeSessions.length) return;

      for (const session of activeSessions) {
        const vehicle = session.vehicle;
        const station = session.station;

        if (!vehicle || !station) continue;

        // SOC Step simulation (0.4% increment every cycle)
        const socIncrement = 0.4;
        const newSOC = Math.min(100, Number((vehicle.currentSOC + socIncrement).toFixed(1)));
        
        // Energy consumption math: Energy (kWh) = Power (kW) * Hours
        const energyDelta = (session.chargingPower * (3 / 3600)); 
        const newEnergy = Number((session.energyConsumed + energyDelta).toFixed(3));
        
        // Dynamic tariff pricing: ~₹12.50 per kWh
        const costDelta = energyDelta * 12.5;
        const newCost = Number((session.cost + costDelta).toFixed(2));
        
        const newDuration = Math.floor((Date.now() - new Date(session.startTime)) / 60000);

        // Update session
        session.energyConsumed = newEnergy;
        session.cost = newCost;
        session.endSOC = newSOC;
        session.duration = newDuration;

        // Update vehicle
        vehicle.currentSOC = newSOC;
        // Range estimation: ~5.5 km per kWh
        vehicle.currentRange = Math.round((newSOC / 100) * vehicle.batteryCapacity * 5.5);

        // Auto-completion check
        if (newSOC >= 100) {
          session.status = 'Completed';
          session.endTime = new Date();
          vehicle.status = 'Idle';
          vehicle.currentChargingPower = 0;
          vehicle.chargingStation = null;

          station.availableConnectors = Math.min(station.totalConnectors, station.availableConnectors + 1);
          station.currentLoad = Math.max(0, station.currentLoad - session.chargingPower);
          if (station.status === 'Busy') station.status = 'Available';
          await station.save();

          await Alert.create({
            type: 'Charging Completed',
            severity: 'Success',
            title: 'Charging Completed',
            message: `Vehicle ${vehicle.registrationNumber} reached 100% capacity at ${station.name}.`,
            vehicle: vehicle._id,
            station: station._id
          });
        }

        await session.save();
        await vehicle.save();

        // Write analytical stream entry
        await EnergyRecord.create({
          vehicle: vehicle._id,
          station: station._id,
          energyConsumed: energyDelta,
          cost: costDelta,
          timestamp: new Date()
        });

        // Broadcast telemetry to clients
        if (io) {
          io.emit('telemetry:update', {
            sessionId: session.sessionId,
            vehicleId: vehicle._id,
            registrationNumber: vehicle.registrationNumber,
            currentSOC: vehicle.currentSOC,
            currentRange: vehicle.currentRange,
            energyConsumed: session.energyConsumed,
            cost: session.cost,
            power: session.chargingPower,
            duration: session.duration,
            stationName: station.name
          });
        }
      }
    } catch (err) {
      console.error('[Simulation Error]', err);
    }
  }, 3000);
};

module.exports = { startSimulation };
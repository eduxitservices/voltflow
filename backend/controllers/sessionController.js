const ChargingSession = require('../models/ChargingSession');
const Vehicle = require('../models/Vehicle');
const ChargingStation = require('../models/ChargingStation');

exports.getSessions = async (req, res, next) => {
  try {
    const sessions = await ChargingSession.find()
      .populate('vehicle')
      .populate('station')
      .sort({ startTime: -1 });
    res.json({ success: true, count: sessions.length, data: sessions });
  } catch (err) {
    next(err);
  }
};

exports.startSession = async (req, res, next) => {
  try {
    const { vehicleId, stationId } = req.body;
    const vehicle = await Vehicle.findById(vehicleId);
    const station = await ChargingStation.findById(stationId);

    if (!vehicle || !station) {
      return res.status(404).json({ success: false, message: 'Vehicle or Charging Station not found' });
    }
    if (station.availableConnectors <= 0) {
      return res.status(400).json({ success: false, message: 'No available connectors at this station' });
    }

    const chargingPower = 22.0; // Fast charge rating
    station.availableConnectors -= 1;
    station.currentLoad += chargingPower;
    if (station.availableConnectors === 0) station.status = 'Busy';
    await station.save();

    vehicle.status = 'Charging';
    vehicle.chargingStation = station._id;
    vehicle.currentChargingPower = chargingPower;
    await vehicle.save();

    const session = await ChargingSession.create({
      sessionId: `SESS-${Date.now().toString().slice(-6)}`,
      vehicle: vehicle._id,
      station: station._id,
      startSOC: vehicle.currentSOC,
      chargingPower
    });

    res.status(201).json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
};

exports.stopSession = async (req, res, next) => {
  try {
    const session = await ChargingSession.findById(req.params.id).populate('vehicle').populate('station');
    if (!session || session.status !== 'Active') {
      return res.status(400).json({ success: false, message: 'Active session not found' });
    }

    session.status = 'Completed';
    session.endTime = new Date();
    await session.save();

    if (session.vehicle) {
      session.vehicle.status = 'Idle';
      session.vehicle.currentChargingPower = 0;
      session.vehicle.chargingStation = null;
      await session.vehicle.save();
    }

    if (session.station) {
      session.station.availableConnectors = Math.min(session.station.totalConnectors, session.station.availableConnectors + 1);
      session.station.currentLoad = Math.max(0, session.station.currentLoad - session.chargingPower);
      if (session.station.status === 'Busy') session.station.status = 'Available';
      await session.station.save();
    }

    res.json({ success: true, data: session });
  } catch (err) {
    next(err);
  }
};
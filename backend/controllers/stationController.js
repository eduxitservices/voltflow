const ChargingStation = require('../models/ChargingStation');

exports.getStations = async (req, res, next) => {
  try {
    const stations = await ChargingStation.find();
    res.json({ success: true, count: stations.length, data: stations });
  } catch (err) {
    next(err);
  }
};

exports.createStation = async (req, res, next) => {
  try {
    const station = await ChargingStation.create(req.body);
    res.status(201).json({ success: true, data: station });
  } catch (err) {
    next(err);
  }
};

exports.updateStation = async (req, res, next) => {
  try {
    const station = await ChargingStation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!station) return res.status(404).json({ success: false, message: 'Station not found' });
    res.json({ success: true, data: station });
  } catch (err) {
    next(err);
  }
};

exports.deleteStation = async (req, res, next) => {
  try {
    const station = await ChargingStation.findByIdAndDelete(req.params.id);
    if (!station) return res.status(404).json({ success: false, message: 'Station not found' });
    res.json({ success: true, message: 'Station deleted' });
  } catch (err) {
    next(err);
  }
};
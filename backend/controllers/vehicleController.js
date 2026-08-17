const Vehicle = require('../models/Vehicle');
const ChargingSession = require('../models/ChargingSession');

exports.getVehicles = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    let query = {};
    if (status && status !== 'All') query.status = status;
    if (search) {
      query.$or = [
        { registrationNumber: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } }
      ];
    }
    const vehicles = await Vehicle.find(query).populate('chargingStation').populate('driver', 'name phone');
    res.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (err) {
    next(err);
  }
};

exports.getVehicleById = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate('chargingStation').populate('driver', 'name phone');
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    const history = await ChargingSession.find({ vehicle: vehicle._id }).populate('station').sort({ startTime: -1 }).limit(10);
    res.json({ success: true, data: vehicle, chargingHistory: history });
  } catch (err) {
    next(err);
  }
};

exports.createVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ success: true, data: vehicle });
  } catch (err) {
    next(err);
  }
};

exports.updateVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.json({ success: true, data: vehicle });
  } catch (err) {
    next(err);
  }
};

exports.deleteVehicle = async (req, res, next) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, message: 'Vehicle not found' });
    res.json({ success: true, message: 'Vehicle successfully removed' });
  } catch (err) {
    next(err);
  }
};
const mongoose = require('mongoose');

const energyRecordSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  station: { type: mongoose.Schema.Types.ObjectId, ref: 'ChargingStation' },
  energyConsumed: { type: Number, required: true }, // kWh
  cost: { type: Number, required: true }, // INR
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EnergyRecord', energyRecordSchema);
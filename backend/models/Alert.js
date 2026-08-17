const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['Low Battery', 'Charger Offline', 'Charging Failed', 'Grid Overload', 'Vehicle Disconnected', 'Charging Completed'], 
    required: true 
  },
  severity: { type: String, enum: ['Critical', 'Warning', 'Info', 'Success'], default: 'Info' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', default: null },
  station: { type: mongoose.Schema.Types.ObjectId, ref: 'ChargingStation', default: null },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', alertSchema);
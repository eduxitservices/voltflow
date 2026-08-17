const mongoose = require('mongoose');

const chargingScheduleSchema = new mongoose.Schema({
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  station: { type: mongoose.Schema.Types.ObjectId, ref: 'ChargingStation', required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  targetSOC: { type: Number, required: true, default: 90 },
  priority: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'], default: 'High' },
  status: { type: String, enum: ['Scheduled', 'In-Progress', 'Completed', 'Cancelled'], default: 'Scheduled' }
});

module.exports = mongoose.model('ChargingSchedule', chargingScheduleSchema);
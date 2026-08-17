const mongoose = require('mongoose');

const chargingSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle', required: true },
  station: { type: mongoose.Schema.Types.ObjectId, ref: 'ChargingStation', required: true },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date, default: null },
  startSOC: { type: Number, required: true },
  endSOC: { type: Number, default: null },
  energyConsumed: { type: Number, default: 0 }, // in kWh
  chargingPower: { type: Number, default: 7.2 }, // in kW
  duration: { type: Number, default: 0 }, // in minutes
  cost: { type: Number, default: 0 }, // in INR (₹)
  status: { 
    type: String, 
    enum: ['Active', 'Completed', 'Failed', 'Cancelled'], 
    default: 'Active' 
  }
});

module.exports = mongoose.model('ChargingSession', chargingSessionSchema);
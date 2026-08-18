const mongoose = require('mongoose');

const ChargingStationSchema = new mongoose.Schema({
  stationId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  location: {
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  totalCapacityKW: { type: Number, required: true },
  currentLoadKW: { type: Number, default: 0 },
  totalGuns: { type: Number, required: true },
  activeGuns: { type: Number, default: 0 },
  gridLimitKW: { type: Number, required: true },
  status: { type: String, enum: ['operational', 'maintenance', 'offline'], default: 'operational' },
  
  // Point 15: Pricing Model (AC, DC Fast, Peak, Off-Peak)
  pricing: {
    acPricePerKWh: { type: Number, required: true },
    dcPricePerKWh: { type: Number, required: true },
    peakPricePerKWh: { type: Number, required: true },
    offPeakPricePerKWh: { type: Number, required: true },
    currentActivePricePerKWh: { type: Number, required: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('ChargingStation', ChargingStationSchema);
const mongoose = require('mongoose');

const chargingStationSchema = new mongoose.Schema({
  stationId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  address: { type: String, required: true },
  chargerType: { type: String, enum: ['AC Type 2', 'CCS2 Fast Charger', 'CHAdeMO'], default: 'CCS2 Fast Charger' },
  totalConnectors: { type: Number, required: true, default: 4 },
  availableConnectors: { type: Number, required: true, default: 4 },
  powerCapacity: { type: Number, required: true }, // Max kW rating
  currentLoad: { type: Number, default: 0 }, // Current active kW
  status: { 
    type: String, 
    enum: ['Available', 'Charging', 'Busy', 'Offline', 'Maintenance'], 
    default: 'Available' 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChargingStation', chargingStationSchema);
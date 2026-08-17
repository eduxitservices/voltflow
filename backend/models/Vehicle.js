const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  vehicleId: { type: String, required: true, unique: true },
  registrationNumber: { type: String, required: true, unique: true },
  brand: { type: String, required: true },
  model: { type: String, required: true },
  vehicleType: { type: String, enum: ['Sedan', 'SUV', 'Van', 'Bus'], default: 'SUV' },
  batteryCapacity: { type: Number, required: true }, // in kWh
  currentSOC: { type: Number, required: true, min: 0, max: 100 }, // Percentage
  currentRange: { type: Number, required: true }, // in km
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, default: 'Mumbai Hub' }
  },
  status: { 
    type: String, 
    enum: ['Idle', 'Charging', 'Scheduled', 'Offline', 'Maintenance'], 
    default: 'Idle' 
  },
  priorityLevel: { 
    type: String, 
    enum: ['Critical', 'Low SOC', 'Scheduled', 'Normal'], 
    default: 'Normal' 
  },
  chargingStation: { type: mongoose.Schema.Types.ObjectId, ref: 'ChargingStation', default: null },
  currentChargingPower: { type: Number, default: 0 }, // in kW
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  fleetGroup: { type: String, default: 'Core Fleet' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
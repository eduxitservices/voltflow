const express = require('express');
const router = express.Router();

const authCtrl = require('../controllers/authController');
const vehicleCtrl = require('../controllers/vehicleController');
const stationCtrl = require('../controllers/stationController');
const sessionCtrl = require('../controllers/sessionController');
const analyticsCtrl = require('../controllers/analyticsController');
const orchestrationEngine = require('../services/orchestrationEngine');
const Vehicle = require('../models/Vehicle');
const ChargingSchedule = require('../models/ChargingSchedule');
const Alert = require('../models/Alert');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Auth
router.post('/auth/register', authCtrl.register);
router.post('/auth/login', authCtrl.login);
router.get('/auth/me', protect, authCtrl.getMe);

// Vehicles
router.get('/vehicles', protect, vehicleCtrl.getVehicles);
router.get('/vehicles/:id', protect, vehicleCtrl.getVehicleById);
router.post('/vehicles', protect, vehicleCtrl.createVehicle);
router.put('/vehicles/:id', protect, vehicleCtrl.updateVehicle);
router.delete('/vehicles/:id', protect, vehicleCtrl.deleteVehicle);

// Bulk CSV Upload for Vehicles
router.post('/vehicles/bulk', protect, async (req, res) => {
  try {
    const { vehicles } = req.body;
    if (!vehicles || !Array.isArray(vehicles) || vehicles.length === 0) {
      return res.status(400).json({ success: false, message: 'No vehicle records provided in CSV' });
    }

    const inserted = [];
    for (const item of vehicles) {
      const vId = item.vehicleId || `VF-UP-${Date.now().toString().slice(-4)}${Math.floor(Math.random()*90)}`;
      const doc = await Vehicle.findOneAndUpdate(
        { registrationNumber: item.registrationNumber },
        {
          vehicleId: vId,
          registrationNumber: item.registrationNumber,
          brand: item.brand || 'Tata',
          model: item.model || 'EV Fleet',
          vehicleType: item.vehicleType || 'SUV',
          batteryCapacity: Number(item.batteryCapacity) || 40.0,
          currentSOC: Number(item.currentSOC) || 80,
          currentRange: Math.round(((Number(item.currentSOC) || 80) / 100) * (Number(item.batteryCapacity) || 40) * 5.5),
          location: {
            lat: Number(item.lat) || 26.8467,
            lng: Number(item.lng) || 80.9462,
            address: item.location || 'Lucknow Urban'
          },
          status: item.status || 'Idle',
          priorityLevel: item.priorityLevel || 'Normal'
        },
        { upsert: true, new: true }
      );
      inserted.push(doc);
    }

    res.json({ success: true, count: inserted.length, message: `Successfully imported ${inserted.length} vehicles.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Stations
router.get('/stations', protect, stationCtrl.getStations);
router.post('/stations', protect, stationCtrl.createStation);
router.put('/stations/:id', protect, stationCtrl.updateStation);
router.delete('/stations/:id', protect, stationCtrl.deleteStation);

// Sessions
router.get('/sessions', protect, sessionCtrl.getSessions);
router.post('/sessions/start', protect, sessionCtrl.startSession);
router.post('/sessions/:id/stop', protect, sessionCtrl.stopSession);

// Schedules
router.get('/schedules', protect, async (req, res) => {
  const list = await ChargingSchedule.find().populate('vehicle').populate('station');
  res.json({ success: true, data: list });
});

router.post('/schedules', protect, async (req, res) => {
  const sched = await ChargingSchedule.create(req.body);
  res.status(201).json({ success: true, data: sched });
});

// Analytics
router.get('/analytics/overview', protect, analyticsCtrl.getOverview);

// Alerts
router.get('/alerts', protect, async (req, res) => {
  const alerts = await Alert.find().sort({ createdAt: -1 });
  res.json({ success: true, data: alerts });
});

router.put('/alerts/:id/read', protect, async (req, res) => {
  await Alert.findByIdAndUpdate(req.params.id, { read: true });
  res.json({ success: true });
});

// Users
router.get('/users', protect, async (req, res) => {
  const users = await User.find().select('-password');
  res.json({ success: true, data: users });
});

// Orchestration
router.get('/orchestration/status', protect, (req, res) => {
  res.json({
    success: true,
    data: {
      gridLimit: orchestrationEngine.gridLimit,
      optimizationMode: orchestrationEngine.optimizationMode,
      targetSOC: orchestrationEngine.targetSOC
    }
  });
});

router.post('/orchestration/configure', protect, (req, res) => {
  const { gridLimit, optimizationMode, targetSOC } = req.body;
  if (gridLimit) orchestrationEngine.gridLimit = Number(gridLimit);
  if (optimizationMode) orchestrationEngine.optimizationMode = optimizationMode;
  if (targetSOC) orchestrationEngine.targetSOC = Number(targetSOC);
  
  res.json({ success: true, message: 'Orchestrator parameters updated' });
});

module.exports = router;
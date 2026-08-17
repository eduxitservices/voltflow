const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const ChargingStation = require('./models/ChargingStation');
const ChargingSession = require('./models/ChargingSession');
const Alert = require('./models/Alert');
const EnergyRecord = require('./models/EnergyRecord');

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('[Seed] Connected to database. Purging stale records...');

    await Promise.all([
      User.deleteMany(),
      Vehicle.deleteMany(),
      ChargingStation.deleteMany(),
      ChargingSession.deleteMany(),
      Alert.deleteMany(),
      EnergyRecord.deleteMany()
    ]);

    // 1. Seed Admin User
    await User.create({
      name: 'Mayank Tiwari',
      email: 'admin@voltflow.io',
      password: 'adminpassword123',
      role: 'Super Admin',
      phone: '+91 98765 43210'
    });

    // 2. Seed Charging Stations in Lucknow Hubs
    const stationsData = [
      { stationId: 'CS-LKO-01', name: 'Hazratganj EV Superhub', location: { lat: 26.8467, lng: 80.9462 }, address: 'MG Marg, Hazratganj, Lucknow', chargerType: 'CCS2 Fast Charger', totalConnectors: 8, availableConnectors: 3, powerCapacity: 180, currentLoad: 55 },
      { stationId: 'CS-LKO-02', name: 'Gomti Nagar Cyber Tower Hub', location: { lat: 26.8530, lng: 80.9984 }, address: 'Vibhuti Khand, Gomti Nagar, Lucknow', chargerType: 'CCS2 Fast Charger', totalConnectors: 6, availableConnectors: 2, powerCapacity: 120, currentLoad: 44 },
      { stationId: 'CS-LKO-03', name: 'Alambagh Transport Hub', location: { lat: 26.8184, lng: 80.9080 }, address: 'Kanpur Road, Alambagh, Lucknow', chargerType: 'AC Type 2', totalConnectors: 4, availableConnectors: 3, powerCapacity: 60, currentLoad: 11 },
      { stationId: 'CS-LKO-04', name: 'Indira Nagar Rapid Station', location: { lat: 26.8838, lng: 80.9856 }, address: 'Munshi Pulia, Indira Nagar, Lucknow', chargerType: 'CCS2 Fast Charger', totalConnectors: 6, availableConnectors: 4, powerCapacity: 120, currentLoad: 22 },
      { stationId: 'CS-LKO-05', name: 'Shaheed Path Express Hub', location: { lat: 26.7915, lng: 81.0025 }, address: 'Amar Shaheed Path, Near Lulu Mall, Lucknow', chargerType: 'CCS2 Fast Charger', totalConnectors: 10, availableConnectors: 4, powerCapacity: 240, currentLoad: 66 }
    ];
    const stations = await ChargingStation.insertMany(stationsData);

    // 3. Seed Realistic Lucknow (UP32) EV Fleet
    const vehiclesData = [
      { vehicleId: 'VF-LKO-101', registrationNumber: 'UP32 AB 1234', brand: 'Tata', model: 'Nexon EV Max', batteryCapacity: 40.5, currentSOC: 58, currentRange: 198, location: { lat: 26.8480, lng: 80.9480, address: 'Hazratganj Core' }, status: 'Charging', priorityLevel: 'Critical', chargingStation: stations[0]._id, currentChargingPower: 22.0 },
      { vehicleId: 'VF-LKO-102', registrationNumber: 'UP32 CD 5678', brand: 'Mahindra', model: 'XUV400', batteryCapacity: 39.4, currentSOC: 72, currentRange: 215, location: { lat: 26.8540, lng: 80.9990, address: 'Gomti Nagar Vibhuti Khand' }, status: 'Charging', priorityLevel: 'Normal', chargingStation: stations[1]._id, currentChargingPower: 11.0 },
      { vehicleId: 'VF-LKO-103', registrationNumber: 'UP32 EF 9012', brand: 'MG', model: 'ZS EV', batteryCapacity: 50.3, currentSOC: 22, currentRange: 75, location: { lat: 26.8190, lng: 80.9090, address: 'Alambagh Stand' }, status: 'Scheduled', priorityLevel: 'Low SOC', currentChargingPower: 0 },
      { vehicleId: 'VF-LKO-104', registrationNumber: 'UP32 GH 3456', brand: 'Hyundai', model: 'Ioniq 5', batteryCapacity: 72.6, currentSOC: 85, currentRange: 380, location: { lat: 26.8850, lng: 80.9870, address: 'Indira Nagar Sector 14' }, status: 'Idle', priorityLevel: 'Normal', currentChargingPower: 0 },
      { vehicleId: 'VF-LKO-105', registrationNumber: 'UP32 IJ 7890', brand: 'BYD', model: 'Atto 3', batteryCapacity: 60.4, currentSOC: 65, currentRange: 280, location: { lat: 26.7930, lng: 81.0040, address: 'Lulu Mall Parking' }, status: 'Idle', priorityLevel: 'Normal', currentChargingPower: 0 },
      { vehicleId: 'VF-LKO-106', registrationNumber: 'UP32 KL 1122', brand: 'Tata', model: 'Tigor EV', batteryCapacity: 26.0, currentSOC: 16, currentRange: 40, location: { lat: 26.8400, lng: 80.9300, address: 'Charbagh Railway Hub' }, status: 'Scheduled', priorityLevel: 'Critical', currentChargingPower: 0 },
      { vehicleId: 'VF-LKO-107', registrationNumber: 'UP32 MN 3344', brand: 'Tata', model: 'Nexon EV', batteryCapacity: 30.2, currentSOC: 92, currentRange: 195, location: { lat: 26.8500, lng: 80.9400, address: 'Jankipuram Ext' }, status: 'Idle', priorityLevel: 'Normal', currentChargingPower: 0 },
      { vehicleId: 'VF-LKO-108', registrationNumber: 'UP32 OP 5566', brand: 'Mahindra', model: 'XUV400', batteryCapacity: 39.4, currentSOC: 44, currentRange: 130, location: { lat: 26.7900, lng: 81.0010, address: 'Shaheed Path North' }, status: 'Charging', priorityLevel: 'Low SOC', chargingStation: stations[4]._id, currentChargingPower: 22.0 }
    ];
    const vehicles = await Vehicle.insertMany(vehiclesData);

    // 4. Seed Active Sessions
    await ChargingSession.create([
      { sessionId: 'SESS-LKO-801', vehicle: vehicles[0]._id, station: stations[0]._id, startSOC: 35, endSOC: 58, energyConsumed: 21.4, chargingPower: 22.0, duration: 45, cost: 267.50, status: 'Active', startTime: new Date(Date.now() - 45 * 60000) },
      { sessionId: 'SESS-LKO-802', vehicle: vehicles[1]._id, station: stations[1]._id, startSOC: 40, endSOC: 72, energyConsumed: 17.8, chargingPower: 11.0, duration: 60, cost: 222.50, status: 'Active', startTime: new Date(Date.now() - 60 * 60000) },
      { sessionId: 'SESS-LKO-803', vehicle: vehicles[7]._id, station: stations[4]._id, startSOC: 15, endSOC: 44, energyConsumed: 23.6, chargingPower: 22.0, duration: 42, cost: 295.00, status: 'Active', startTime: new Date(Date.now() - 42 * 60000) }
    ]);

    // 5. Seed Alerts
    await Alert.create([
      { type: 'Low Battery', severity: 'Critical', title: 'Critical Battery Level', message: 'UP32 KL 1122 is at 16% SOC near Charbagh. Auto-rerouting recommended.', vehicle: vehicles[5]._id },
      { type: 'Grid Overload', severity: 'Warning', title: 'Substation Peak Warning', message: 'Hazratganj Superhub current power draws at 75% of local transformer headroom.', station: stations[0]._id }
    ]);

    // 6. Seed Energy Records
    for (let i = 0; i < 25; i++) {
      await EnergyRecord.create({
        vehicle: vehicles[i % vehicles.length]._id,
        station: stations[i % stations.length]._id,
        energyConsumed: Number((Math.random() * 20 + 8).toFixed(2)),
        cost: Number((Math.random() * 240 + 80).toFixed(2)),
        timestamp: new Date(Date.now() - (i * 3600000))
      });
    }

    console.log('[Seed] Database populated successfully with Lucknow EV Fleet.');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]', err);
    process.exit(1);
  }
};

seedDB();
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Vehicle = require('./models/Vehicle');
const ChargingStation = require('./models/ChargingStation');
const ChargingSchedule = require('./models/ChargingSchedule');
const Alert = require('./models/Alert');
const EnergyRecord = require('./models/EnergyRecord');

const MONGODB_URI = process.env.MONGODB_URI;

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB Connected for Cost-Aware Seeding...');

    await Promise.all([
      User.deleteMany({}),
      Vehicle.deleteMany({}),
      ChargingStation.deleteMany({}),
      ChargingSchedule.deleteMany({}),
      Alert.deleteMany({}),
      EnergyRecord.deleteMany({})
    ]);

    // 1. Admin User
    await User.create({
      name: "VoltFlow Fleet Admin",
      email: "admin@voltflow.io",
      password: "adminpassword123",
      role: "admin",
      fleet: "Lucknow Smart EV Fleet"
    });

    // 2. Point 15: 5 Lucknow Hubs with Station-Wise Dynamic Pricing
    const stations = await ChargingStation.create([
      {
        stationId: "CS-LKO-01",
        name: "Hazratganj EV Superhub",
        location: { address: "Hazratganj Main Metro Circle, Lucknow", lat: 26.8467, lng: 80.9462 },
        totalCapacityKW: 180,
        currentLoadKW: 105,
        totalGuns: 8,
        activeGuns: 5,
        gridLimitKW: 150,
        status: "operational",
        pricing: {
          acPricePerKWh: 8,
          dcPricePerKWh: 12,
          peakPricePerKWh: 14,
          offPeakPricePerKWh: 9,
          currentActivePricePerKWh: 12
        }
      },
      {
        stationId: "CS-LKO-02",
        name: "Gomti Nagar Cyber Tower",
        location: { address: "Vibhuti Khand, Gomti Nagar, Lucknow", lat: 26.8722, lng: 80.9984 },
        totalCapacityKW: 240,
        currentLoadKW: 120,
        totalGuns: 10,
        activeGuns: 4,
        gridLimitKW: 200,
        status: "operational",
        pricing: {
          acPricePerKWh: 7,
          dcPricePerKWh: 10,
          peakPricePerKWh: 12,
          offPeakPricePerKWh: 8,
          currentActivePricePerKWh: 10
        }
      },
      {
        stationId: "CS-LKO-03",
        name: "Alambagh Transport Hub",
        location: { address: "Alambagh Inter-State Hub, Lucknow", lat: 26.8142, lng: 80.9022 },
        totalCapacityKW: 160,
        currentLoadKW: 40,
        totalGuns: 6,
        activeGuns: 2,
        gridLimitKW: 140,
        status: "operational",
        pricing: {
          acPricePerKWh: 6,
          dcPricePerKWh: 9,
          peakPricePerKWh: 11,
          offPeakPricePerKWh: 7,
          currentActivePricePerKWh: 9
        }
      },
      {
        stationId: "CS-LKO-04",
        name: "Indira Nagar Rapid Station",
        location: { address: "Munshipulia Metro Station, Indira Nagar", lat: 26.8833, lng: 80.9833 },
        totalCapacityKW: 120,
        currentLoadKW: 45,
        totalGuns: 4,
        activeGuns: 2,
        gridLimitKW: 100,
        status: "operational",
        pricing: {
          acPricePerKWh: 9,
          dcPricePerKWh: 13,
          peakPricePerKWh: 15,
          offPeakPricePerKWh: 10,
          currentActivePricePerKWh: 13
        }
      },
      {
        stationId: "CS-LKO-05",
        name: "Shaheed Path Express Hub",
        location: { address: "Ekana Stadium Junction, Shaheed Path", lat: 26.7922, lng: 80.9989 },
        totalCapacityKW: 200,
        currentLoadKW: 80,
        totalGuns: 8,
        activeGuns: 3,
        gridLimitKW: 180,
        status: "operational",
        pricing: {
          acPricePerKWh: 8,
          dcPricePerKWh: 11,
          peakPricePerKWh: 13,
          offPeakPricePerKWh: 8,
          currentActivePricePerKWh: 11
        }
      }
    ]);

    // 3. Vehicles with Varied SOC & Targets
    await Vehicle.create([
      {
        vehicleId: "EV-001",
        licensePlate: "UP32-EV-4101",
        model: "Tata Nexon EV Max",
        batteryCapacityKWh: 40.5,
        currentSOC: 42,
        targetSOC: 90,
        currentRangeKM: 135,
        status: "charging",
        assignedStation: "CS-LKO-01",
        currentChargingPowerKW: 45,
        departureDeadline: new Date("2026-08-18T06:30:00Z"),
        priority: "High",
        location: { lat: 26.8467, lng: 80.9462, address: "Hazratganj Hub Gun #1" }
      },
      {
        vehicleId: "EV-002",
        licensePlate: "UP32-EV-9022",
        model: "Mahindra XUV400",
        batteryCapacityKWh: 39.4,
        currentSOC: 16,
        targetSOC: 85,
        currentRangeKM: 48,
        status: "charging",
        assignedStation: "CS-LKO-02",
        currentChargingPowerKW: 60,
        departureDeadline: new Date("2026-08-18T05:15:00Z"),
        priority: "Critical",
        location: { lat: 26.8722, lng: 80.9984, address: "Gomti Nagar Gun #2" }
      },
      {
        vehicleId: "EV-003",
        licensePlate: "UP32-EV-7788",
        model: "Tata Ace EV (Cargo)",
        batteryCapacityKWh: 21.3,
        currentSOC: 68,
        targetSOC: 95,
        currentRangeKM: 88,
        status: "charging",
        assignedStation: "CS-LKO-03",
        currentChargingPowerKW: 30,
        departureDeadline: new Date("2026-08-18T08:00:00Z"),
        priority: "Medium",
        location: { lat: 26.8142, lng: 80.9022, address: "Alambagh Hub Gun #4" }
      },
      {
        vehicleId: "EV-004",
        licensePlate: "UP32-EV-1120",
        model: "MG ZS EV Long Range",
        batteryCapacityKWh: 50.3,
        currentSOC: 80,
        targetSOC: 90,
        currentRangeKM: 320,
        status: "idle",
        assignedStation: "CS-LKO-03",
        currentChargingPowerKW: 0,
        departureDeadline: new Date("2026-08-18T09:30:00Z"),
        priority: "Low",
        location: { lat: 26.8142, lng: 80.9022, address: "Alambagh Standby Bay" }
      }
    ]);

    console.log('✅ VoltFlow Database Seeded Successfully with Multi-Station Pricing & Cost Metrics!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Error:', err);
    process.exit(1);
  }
};

seedDatabase();
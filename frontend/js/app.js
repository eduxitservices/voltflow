// VoltFlow Engine Controller — Full Simulation + CRUD + Auth + Live Loop

// 5 Lucknow Hubs with Station-Wise Pricing Models
let fleetStations = [
  {
    id: "CS-LKO-01",
    name: "Hazratganj EV Superhub",
    location: "Hazratganj Metro Circle, Lucknow",
    lat: 26.8467,
    lng: 80.9462,
    acPrice: 8,
    dcPrice: 12,
    peakPrice: 14,
    offPeakPrice: 9,
    currentPrice: 12,
    currentLoadKW: 105,
    totalCapacityKW: 180,
    gridLimitKW: 150,
    availablePowerKW: 75,
    activeSessions: "2 / 8",
    utilizationPct: 58
  },
  {
    id: "CS-LKO-02",
    name: "Gomti Nagar Cyber Tower",
    location: "Vibhuti Khand, Gomti Nagar",
    lat: 26.8722,
    lng: 80.9984,
    acPrice: 7,
    dcPrice: 10,
    peakPrice: 12,
    offPeakPrice: 8,
    currentPrice: 10,
    currentLoadKW: 120,
    totalCapacityKW: 240,
    gridLimitKW: 200,
    availablePowerKW: 120,
    activeSessions: "3 / 10",
    utilizationPct: 50
  },
  {
    id: "CS-LKO-03",
    name: "Alambagh Transport Hub",
    location: "Alambagh Inter-State Bus Stand",
    lat: 26.8142,
    lng: 80.9022,
    acPrice: 6,
    dcPrice: 9,
    peakPrice: 11,
    offPeakPrice: 7,
    currentPrice: 9,
    currentLoadKW: 40,
    totalCapacityKW: 160,
    gridLimitKW: 140,
    availablePowerKW: 120,
    activeSessions: "1 / 6",
    utilizationPct: 25
  },
  {
    id: "CS-LKO-04",
    name: "Indira Nagar Rapid Station",
    location: "Munshipulia Metro Station",
    lat: 26.8833,
    lng: 80.9833,
    acPrice: 9,
    dcPrice: 13,
    peakPrice: 15,
    offPeakPrice: 10,
    currentPrice: 13,
    currentLoadKW: 45,
    totalCapacityKW: 120,
    gridLimitKW: 100,
    availablePowerKW: 55,
    activeSessions: "2 / 4",
    utilizationPct: 38
  },
  {
    id: "CS-LKO-05",
    name: "Shaheed Path Express Hub",
    location: "Ekana Stadium Junction",
    lat: 26.7922,
    lng: 80.9989,
    acPrice: 8,
    dcPrice: 11,
    peakPrice: 13,
    offPeakPrice: 8,
    currentPrice: 11,
    currentLoadKW: 80,
    totalCapacityKW: 200,
    gridLimitKW: 180,
    availablePowerKW: 100,
    activeSessions: "3 / 8",
    utilizationPct: 40
  }
];

// Initial Vehicles List (Preserved)
let fleetVehicles = [
  {
    vehicleId: "EV-001",
    licensePlate: "UP32-EV-4101",
    model: "Tata Nexon EV Max",
    batteryCapacityKWh: 40.5,
    currentSOC: 42,
    targetSOC: 90,
    currentRangeKM: 135,
    status: "charging",
    assignedStation: "Gomti Nagar Cyber Tower",
    stationId: "CS-LKO-02",
    currentChargingPowerKW: 45,
    departureDeadline: "18 Aug 2026, 06:30 AM",
    priority: "High",
    eta: "05:42 AM",
    startTime: "04:50 AM",
    safetyBuffer: "48 min",
    unmanagedCost: 620,
    lat: 26.8467,
    lng: 80.9462
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
    assignedStation: "Gomti Nagar Cyber Tower",
    stationId: "CS-LKO-02",
    currentChargingPowerKW: 60,
    departureDeadline: "18 Aug 2026, 05:15 AM",
    priority: "Critical",
    eta: "05:05 AM",
    startTime: "04:15 AM",
    safetyBuffer: "10 min",
    unmanagedCost: 405,
    lat: 26.8722,
    lng: 80.9984
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
    assignedStation: "Alambagh Transport Hub",
    stationId: "CS-LKO-03",
    currentChargingPowerKW: 30,
    departureDeadline: "18 Aug 2026, 08:00 AM",
    priority: "Medium",
    eta: "06:30 AM",
    startTime: "05:10 AM",
    safetyBuffer: "90 min",
    unmanagedCost: 380,
    lat: 26.8142,
    lng: 80.9022
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
    assignedStation: "Alambagh Transport Hub",
    stationId: "CS-LKO-03",
    currentChargingPowerKW: 0,
    departureDeadline: "18 Aug 2026, 09:30 AM",
    priority: "Low",
    eta: "--",
    startTime: "--",
    safetyBuffer: "120 min",
    unmanagedCost: 0,
    lat: 26.8180,
    lng: 80.9050
  },
  {
    vehicleId: "EV-005",
    licensePlate: "UP32-EV-3344",
    model: "Tata Tigor EV Express",
    batteryCapacityKWh: 26.0,
    currentSOC: 24,
    targetSOC: 90,
    currentRangeKM: 55,
    status: "charging",
    assignedStation: "Hazratganj EV Superhub",
    stationId: "CS-LKO-01",
    currentChargingPowerKW: 35,
    departureDeadline: "18 Aug 2026, 05:45 AM",
    priority: "Critical",
    eta: "05:25 AM",
    startTime: "04:30 AM",
    safetyBuffer: "20 min",
    unmanagedCost: 280,
    lat: 26.8480,
    lng: 80.9490
  },
  {
    vehicleId: "EV-006",
    licensePlate: "UP32-EV-8899",
    model: "Hyundai Kona Electric",
    batteryCapacityKWh: 39.2,
    currentSOC: 55,
    targetSOC: 85,
    currentRangeKM: 175,
    status: "queued",
    assignedStation: "Gomti Nagar Cyber Tower",
    stationId: "CS-LKO-02",
    currentChargingPowerKW: 0,
    departureDeadline: "18 Aug 2026, 07:15 AM",
    priority: "Medium",
    eta: "06:45 AM",
    startTime: "05:30 AM",
    safetyBuffer: "30 min",
    unmanagedCost: 0,
    lat: 26.8740,
    lng: 80.9950
  },
  {
    vehicleId: "EV-007",
    licensePlate: "UP32-EV-6611",
    model: "Tata Nexon EV Prime",
    batteryCapacityKWh: 30.2,
    currentSOC: 12,
    targetSOC: 80,
    currentRangeKM: 32,
    status: "in-transit",
    assignedStation: "Hazratganj EV Superhub",
    stationId: "CS-LKO-01",
    currentChargingPowerKW: 0,
    departureDeadline: "18 Aug 2026, 05:00 AM",
    priority: "Critical",
    eta: "04:55 AM",
    startTime: "04:20 AM",
    safetyBuffer: "5 min",
    unmanagedCost: 0,
    lat: 26.8380,
    lng: 80.9300
  },
  {
    vehicleId: "EV-008",
    licensePlate: "UP32-EV-5522",
    model: "BYD E6 Commercial",
    batteryCapacityKWh: 71.7,
    currentSOC: 75,
    targetSOC: 95,
    currentRangeKM: 365,
    status: "charging",
    assignedStation: "Shaheed Path Express Hub",
    stationId: "CS-LKO-05",
    currentChargingPowerKW: 40,
    departureDeadline: "18 Aug 2026, 10:00 AM",
    priority: "Low",
    eta: "07:30 AM",
    startTime: "05:00 AM",
    safetyBuffer: "150 min",
    unmanagedCost: 350,
    lat: 26.7922,
    lng: 80.9989
  }
];

let fleetAlerts = [
  {
    id: "ALT-01",
    severity: "critical",
    title: "Critical Battery Level (<20%)",
    message: "EV-002 at 16% SOC near Gomti Nagar. Immediate charge required before 05:15 AM departure.",
    actionTitle: "Route & Reserve Gun #2 at Gomti Nagar Hub",
    power: "60 kW",
    target: "85%",
    rate: "₹10/kWh"
  },
  {
    id: "ALT-02",
    severity: "warning",
    title: "Substation Headroom Modulation",
    message: "Hazratganj Hub approached 110 kW peak. Auto-modulated EV-005 to 35 kW to safeguard 150 kW transformer threshold.",
    actionTitle: "Shift Non-Critical EV to Shaheed Path Express Hub",
    power: "30 kW",
    target: "85%",
    rate: "₹11/kWh"
  }
];

let fleetMap = null;
let vehicleToDeleteId = null;
let currentSelectedModalVehicleId = null;

// ================= INITIALIZATION & AUTH GUARD (POINT 5) =================
document.addEventListener('DOMContentLoaded', () => {
  checkAuthSession();
  lucide.createIcons();
  renderAllViews();
  initMap();
  initAllCharts();
  startRealChargingSimulation(); // Point 1: Real-time simulation loop
});

function checkAuthSession() {
  const token = localStorage.getItem('voltflow_auth_token');
  const authModal = document.getElementById('auth-modal-container');
  if (!token) {
    authModal.classList.remove('hidden');
  } else {
    authModal.classList.add('hidden');
  }
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  if (email === 'admin@voltflow.io' && password === 'adminpassword123') {
    localStorage.setItem('voltflow_auth_token', 'voltflow_jwt_session_token_lucknow_2026');
    document.getElementById('auth-modal-container').classList.add('hidden');
    renderAllViews();
  } else {
    alert('Invalid fleet admin credentials. Use admin@voltflow.io / adminpassword123');
  }
}

function handleLogout() {
  localStorage.removeItem('voltflow_auth_token');
  document.getElementById('auth-modal-container').classList.remove('hidden');
}

// ================= POINT 1: REAL CHARGING SIMULATION LOOP =================
function startRealChargingSimulation() {
  setInterval(() => {
    let updated = false;

    fleetVehicles.forEach(v => {
      if (v.status === 'charging') {
        if (v.currentSOC < v.targetSOC) {
          v.currentSOC += 1; // Increment SOC realistically
          v.currentRangeKM = Math.min(Math.round(v.currentSOC * 3.3), 420);
          updated = true;
        } else {
          v.status = 'completed';
          v.currentChargingPowerKW = 0;
          v.eta = "Completed ✅";
          updated = true;
        }
      }
    });

    if (updated) {
      updateDashboardKPIs();
      renderOrchestrationTable();
      renderVehiclesTable(fleetVehicles);
      renderSchedulesTable();
      
      // Update open modal if visible
      if (currentSelectedModalVehicleId) {
        updateVehicleModalDynamic(currentSelectedModalVehicleId);
      }
    }
  }, 3500); // 3.5-second realistic pulse
}

function updateDashboardKPIs() {
  const total = fleetVehicles.length;
  const charging = fleetVehicles.filter(v => v.status === 'charging').length;
  const queued = fleetVehicles.filter(v => v.status === 'queued').length;
  const transit = fleetVehicles.filter(v => v.status === 'in-transit').length;
  const completed = fleetVehicles.filter(v => v.status === 'completed').length;

  const totalSOC = fleetVehicles.reduce((acc, v) => acc + v.currentSOC, 0);
  const avgSOC = (totalSOC / total).toFixed(1);

  const fleetCountEl = document.getElementById('dash-kpi-fleet-count');
  if (fleetCountEl) fleetCountEl.textContent = `${total} EVs`;

  const statusSub = document.getElementById('dash-kpi-status-sub');
  if (statusSub) statusSub.textContent = `${charging} Charging • ${completed} Done • ${transit} Transit`;

  const avgSocEl = document.getElementById('dash-kpi-avg-soc');
  if (avgSocEl) avgSocEl.textContent = `${avgSOC}%`;
}

// ================= VIEW RENDERERS =================
function renderAllViews() {
  updateDashboardKPIs();
  renderOrchestrationTable();
  renderVehiclesTable(fleetVehicles);
  renderStationsGrid();
  renderStationComparisonTable();
  renderSchedulesTable();
  renderAlerts();
}

function getPriorityBadge(priority) {
  if (priority === 'Critical') return '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-700">🔴 Critical</span>';
  if (priority === 'High') return '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">🟠 High</span>';
  if (priority === 'Medium') return '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-yellow-100 text-yellow-800">🟡 Medium</span>';
  return '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">🟢 Low</span>';
}

function getStatusBadge(status) {
  if (status === 'charging') return '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 animate-pulse">⚡ Charging</span>';
  if (status === 'completed') return '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">✅ Completed</span>';
  if (status === 'queued') return '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">⏳ Queued</span>';
  if (status === 'in-transit') return '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">🚗 En-Route</span>';
  return '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">💤 Standby</span>';
}

function calculateChargingCost(vehicle) {
  const energyRequired = Math.max(0, (vehicle.batteryCapacityKWh * (vehicle.targetSOC - vehicle.currentSOC)) / 100);
  const station = fleetStations.find(s => s.id === vehicle.stationId) || fleetStations[0];
  const pricePerKWh = station.currentPrice;
  const estimatedCost = Math.round(energyRequired * pricePerKWh);
  const estimatedSaving = vehicle.unmanagedCost > 0 ? Math.max(0, vehicle.unmanagedCost - estimatedCost) : 0;

  return {
    energyRequired: energyRequired.toFixed(1),
    pricePerKWh,
    estimatedCost,
    estimatedSaving
  };
}

// Orchestration Table Render
function renderOrchestrationTable() {
  const tbody = document.getElementById('orchestration-table-body');
  if (!tbody) return;

  tbody.innerHTML = fleetVehicles.map(v => {
    const costData = calculateChargingCost(v);
    return `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="py-3 px-4">
          <div class="font-bold text-slate-900">${v.vehicleId}</div>
          <div class="text-[10px] text-slate-400 font-medium">${v.model}</div>
        </td>
        <td class="py-3 px-4">${getPriorityBadge(v.priority)}</td>
        <td class="py-3 px-4 font-semibold text-slate-800">${v.assignedStation}</td>
        <td class="py-3 px-4 font-bold ${v.currentChargingPowerKW > 0 ? 'text-blue-600' : 'text-slate-400'}">${v.currentChargingPowerKW} kW</td>
        <td class="py-3 px-4 text-slate-700 font-bold">${costData.energyRequired} kWh</td>
        <td class="py-3 px-4 text-slate-700 font-semibold">₹${costData.pricePerKWh}/kWh</td>
        <td class="py-3 px-4 font-black text-emerald-600">₹${costData.estimatedCost}</td>
        <td class="py-3 px-4 font-bold text-blue-600">${costData.estimatedSaving > 0 ? '₹' + costData.estimatedSaving : '—'}</td>
        <td class="py-3 px-4 text-rose-600 font-semibold">${v.departureDeadline}</td>
        <td class="py-3 px-4 text-right">
          <button onclick="openVehicleModal('${v.vehicleId}')" class="text-blue-600 font-bold hover:underline">Details</button>
        </td>
      </tr>
    `;
  }).join('');
}

// Vehicles Table with Add/Delete actions (Point 2 & 3)
function renderVehiclesTable(vehicles) {
  const tbody = document.getElementById('vehicles-table-body');
  if (!tbody) return;

  tbody.innerHTML = vehicles.map(v => `
    <tr class="hover:bg-slate-50 transition-colors">
      <td class="py-3 px-4 font-bold text-slate-900">${v.vehicleId}</td>
      <td class="py-3 px-4 font-semibold text-slate-700">${v.licensePlate}</td>
      <td class="py-3 px-4 text-slate-600">${v.model}</td>
      <td class="py-3 px-4">
        <div class="flex items-center space-x-2">
          <div class="w-14 bg-slate-200 h-2 rounded-full overflow-hidden">
            <div class="bg-blue-600 h-full transition-all duration-300" style="width: ${v.currentSOC}%"></div>
          </div>
          <span class="font-bold text-xs">${v.currentSOC}%</span>
        </div>
      </td>
      <td class="py-3 px-4 text-slate-700 font-semibold">${v.currentRangeKM} km</td>
      <td class="py-3 px-4">${getPriorityBadge(v.priority)}</td>
      <td class="py-3 px-4">${getStatusBadge(v.status)}</td>
      <td class="py-3 px-4 text-right space-x-1 whitespace-nowrap">
        <button onclick="openVehicleModal('${v.vehicleId}')" class="touch-btn bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold">View</button>
        <button onclick="openDeleteModal('${v.vehicleId}')" class="touch-btn bg-rose-50 hover:bg-rose-100 text-rose-600 px-2.5 py-1 rounded-lg text-xs font-semibold">Delete 🗑️</button>
      </td>
    </tr>
  `).join('');

  const countIndicator = document.getElementById('fleet-count-indicator');
  if (countIndicator) countIndicator.textContent = `Showing ${vehicles.length} vehicles`;
}

// Master Schedule Render
function renderSchedulesTable() {
  const tbody = document.getElementById('schedules-table-body');
  if (!tbody) return;
  tbody.innerHTML = fleetVehicles.map(v => `
    <tr class="hover:bg-slate-50">
      <td class="py-3 px-4 font-bold text-slate-900">${v.vehicleId}</td>
      <td class="py-3 px-4 font-bold">${v.currentSOC}%</td>
      <td class="py-3 px-4 font-bold text-blue-600">${v.targetSOC}%</td>
      <td class="py-3 px-4 text-slate-600">${v.startTime}</td>
      <td class="py-3 px-4 text-slate-800 font-semibold">${v.eta}</td>
      <td class="py-3 px-4 text-rose-600 font-semibold">${v.departureDeadline}</td>
      <td class="py-3 px-4 text-emerald-700 font-bold bg-emerald-50/50">${v.safetyBuffer}</td>
      <td class="py-3 px-4">${getPriorityBadge(v.priority)}</td>
      <td class="py-3 px-4 text-slate-700">${v.assignedStation}</td>
      <td class="py-3 px-4 font-bold text-blue-600">${v.currentChargingPowerKW} kW</td>
      <td class="py-3 px-4">${getStatusBadge(v.status)}</td>
    </tr>
  `).join('');
}

// Station Comparisons
function renderStationComparisonTable() {
  const tbody = document.getElementById('stations-comparison-tbody');
  if (!tbody) return;

  tbody.innerHTML = fleetStations.map(s => {
    const est30Cost = 30 * s.currentPrice;
    let recommendation = '—';
    if (s.id === 'CS-LKO-03') recommendation = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">🟢 Cheapest</span>';
    if (s.id === 'CS-LKO-02') recommendation = '<span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">🟢 Best Value</span>';

    return `
      <tr class="hover:bg-slate-50">
        <td class="py-3 px-4 font-bold text-slate-900">${s.name}</td>
        <td class="py-3 px-4 font-semibold text-slate-800">₹${s.currentPrice}/kWh</td>
        <td class="py-3 px-4 text-slate-500">₹${s.peakPrice} / ₹${s.offPeakPrice}</td>
        <td class="py-3 px-4 font-bold text-blue-600">${s.availablePowerKW} kW</td>
        <td class="py-3 px-4 font-black text-slate-900">₹${est30Cost}</td>
        <td class="py-3 px-4 text-right">${recommendation}</td>
      </tr>
    `;
  }).join('');
}

// Stations Grid
function renderStationsGrid() {
  const grid = document.getElementById('stations-card-grid');
  if (!grid) return;

  grid.innerHTML = fleetStations.map(s => `
    <div class="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
      <div>
        <div class="flex items-start justify-between mb-2">
          <div>
            <span class="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">${s.id}</span>
            <h4 class="font-bold text-slate-900 text-sm sm:text-base mt-1">${s.name}</h4>
            <p class="text-xs text-slate-500">${s.location}</p>
          </div>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Operational</span>
        </div>

        <div class="grid grid-cols-4 gap-1.5 my-3 bg-slate-50 p-2.5 rounded-xl text-center text-[10px]">
          <div><span class="text-slate-400 block">AC Rate</span><strong class="text-slate-800">₹${s.acPrice}</strong></div>
          <div><span class="text-slate-400 block">DC Fast</span><strong class="text-blue-600">₹${s.dcPrice}</strong></div>
          <div><span class="text-slate-400 block">Peak</span><strong class="text-rose-600">₹${s.peakPrice}</strong></div>
          <div><span class="text-slate-400 block">Off-Peak</span><strong class="text-emerald-600">₹${s.offPeakPrice}</strong></div>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs mb-3">
          <div class="bg-slate-50 p-2 rounded-lg"><span class="text-[9px] text-slate-400 uppercase block">Current Load</span><strong>${s.currentLoadKW} / ${s.totalCapacityKW} kW</strong></div>
          <div class="bg-slate-50 p-2 rounded-lg"><span class="text-[9px] text-slate-400 uppercase block">Utilization</span><strong class="text-blue-600">${s.utilizationPct}%</strong></div>
          <div class="bg-slate-50 p-2 rounded-lg"><span class="text-[9px] text-slate-400 uppercase block">Available</span><strong class="text-emerald-600">${s.availablePowerKW} kW</strong></div>
          <div class="bg-slate-50 p-2 rounded-lg"><span class="text-[9px] text-slate-400 uppercase block">Active Guns</span><strong>${s.activeSessions}</strong></div>
        </div>
      </div>

      <div>
        <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div class="bg-blue-600 h-full rounded-full" style="width: ${s.utilizationPct}%"></div>
        </div>
        <div class="flex justify-between text-[10px] text-slate-400 mt-1">
          <span>Cap: ${s.gridLimitKW} kW</span>
          <span>${s.availablePowerKW} kW Headroom</span>
        </div>
      </div>
    </div>
  `).join('');
}

// Alerts
function renderAlerts() {
  const container = document.getElementById('panel-alerts');
  if (!container) return;
  container.innerHTML = fleetAlerts.map(a => `
    <div class="bg-white p-4 sm:p-5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center space-x-2">
          <h4 class="font-bold text-slate-900 text-sm">${a.title}</h4>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${a.severity === 'critical' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'}">${a.severity.toUpperCase()}</span>
        </div>
        <p class="text-xs text-slate-600 mt-1">${a.message}</p>
        <div class="mt-2 text-xs font-semibold text-slate-700">
          Recommended: <span class="text-blue-600 font-bold">"${a.actionTitle}"</span> • Power: <span class="font-bold">${a.power}</span> • Tariff: <span class="font-bold text-emerald-600">${a.rate}</span>
        </div>
      </div>
      <button onclick="applyAlertRecommendation('${a.id}')" class="touch-btn px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl whitespace-nowrap shadow-sm">
        APPLY RECOMMENDATION
      </button>
    </div>
  `).join('');
  lucide.createIcons();
}

function applyAlertRecommendation(id) {
  alert(`Recommendation dispatched to OCPP hub for ${id}. Fast Gun reserved at off-peak rate.`);
}

// ================= POINT 2: ADD VEHICLE HANDLERS =================
function openAddVehicleModal() {
  document.getElementById('add-vehicle-modal').classList.remove('hidden');
}

function closeAddVehicleModal() {
  document.getElementById('add-vehicle-modal').classList.add('hidden');
}

function handleCreateVehicle(e) {
  e.preventDefault();
  const stationId = document.getElementById('new-station').value;
  const station = fleetStations.find(s => s.id === stationId);

  const newEV = {
    vehicleId: document.getElementById('new-vehicle-id').value.trim(),
    licensePlate: document.getElementById('new-license-plate').value.trim(),
    model: document.getElementById('new-model').value.trim(),
    batteryCapacityKWh: parseFloat(document.getElementById('new-capacity').value),
    currentSOC: parseInt(document.getElementById('new-soc').value),
    targetSOC: parseInt(document.getElementById('new-target-soc').value),
    currentRangeKM: Math.round(parseInt(document.getElementById('new-soc').value) * 3.3),
    status: document.getElementById('new-status').value,
    assignedStation: station ? station.name : "Hazratganj EV Superhub",
    stationId: stationId,
    currentChargingPowerKW: document.getElementById('new-status').value === 'charging' ? 45 : 0,
    departureDeadline: document.getElementById('new-deadline').value,
    priority: document.getElementById('new-priority').value,
    eta: "06:15 AM",
    startTime: "05:00 AM",
    safetyBuffer: "30 min",
    unmanagedCost: 450,
    lat: station ? station.lat + (Math.random() * 0.005) : 26.8467,
    lng: station ? station.lng + (Math.random() * 0.005) : 80.9462
  };

  fleetVehicles.unshift(newEV);
  closeAddVehicleModal();
  document.getElementById('add-vehicle-form').reset();
  renderAllViews();
  if (fleetMap) updateMapMarkers();
  alert(`Vehicle ${newEV.vehicleId} (${newEV.licensePlate}) added successfully!`);
}

// ================= POINT 3: DELETE VEHICLE CONFIRMATION =================
function openDeleteModal(vehicleId) {
  vehicleToDeleteId = vehicleId;
  document.getElementById('delete-vehicle-id-text').textContent = vehicleId;
  document.getElementById('delete-vehicle-modal').classList.remove('hidden');
}

function closeDeleteModal() {
  document.getElementById('delete-vehicle-modal').classList.add('hidden');
  vehicleToDeleteId = null;
}

function confirmDeleteVehicle() {
  if (!vehicleToDeleteId) return;
  fleetVehicles = fleetVehicles.filter(v => v.vehicleId !== vehicleToDeleteId);
  closeDeleteModal();
  renderAllViews();
  if (fleetMap) updateMapMarkers();
}

// ================= POINT 4: CSV UPLOAD & SAMPLE DOWNLOAD =================
function downloadSampleCSV() {
  const headers = "vehicleId,numberPlate,model,batteryCapacity,currentSOC,targetSOC,location,departureTime,priority,status\\n";
  const rows = "EV-010,UP32-EV-7722,Tata Nexon EV Max,40.5,35,90,Hazratganj,07:00 AM,High,charging\\nEV-011,UP32-EV-3311,MG ZS EV,50.3,55,85,Gomti Nagar,08:30 AM,Medium,idle";
  const blob = new Blob([headers + rows], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', 'voltflow_fleet_sample.csv');
  a.click();
}

function handleCSVUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    const text = evt.target.result;
    const lines = text.split(/\\r\\n|\\n/);
    let addedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.split(',');

      if (cols.length >= 8) {
        const newVehicle = {
          vehicleId: cols[0].trim(),
          licensePlate: cols[1].trim(),
          model: cols[2].trim(),
          batteryCapacityKWh: parseFloat(cols[3]) || 40.0,
          currentSOC: parseInt(cols[4]) || 30,
          targetSOC: parseInt(cols[5]) || 90,
          currentRangeKM: Math.round((parseInt(cols[4]) || 30) * 3.3),
          status: (cols[9] && cols[9].trim()) || "idle",
          assignedStation: cols[6].trim() || "Hazratganj EV Superhub",
          stationId: "CS-LKO-01",
          currentChargingPowerKW: 40,
          departureDeadline: `18 Aug 2026, ${cols[7].trim()}`,
          priority: cols[8] ? cols[8].trim() : "Medium",
          eta: "06:30 AM",
          startTime: "05:15 AM",
          safetyBuffer: "30 min",
          unmanagedCost: 400,
          lat: 26.8467 + (Math.random() * 0.02 - 0.01),
          lng: 80.9462 + (Math.random() * 0.02 - 0.01)
        };
        fleetVehicles.push(newVehicle);
        addedCount++;
      }
    }

    if (addedCount > 0) {
      renderAllViews();
      if (fleetMap) updateMapMarkers();
      alert(`Successfully imported ${addedCount} vehicles from CSV!`);
    } else {
      alert('CSV format invalid. Please download Sample CSV for format.');
    }
  };
  reader.readAsText(file);
}

// Vehicle Modal View
function openVehicleModal(id) {
  currentSelectedModalVehicleId = id;
  const v = fleetVehicles.find(item => item.vehicleId === id);
  if (!v) return;

  document.getElementById('modal-vehicle-id').textContent = v.vehicleId;
  document.getElementById('modal-vehicle-plate').textContent = `${v.licensePlate} • ${v.model}`;
  document.getElementById('modal-soc-text').textContent = `${v.currentSOC}%`;
  document.getElementById('modal-soc-bar').style.width = `${v.currentSOC}%`;
  document.getElementById('modal-target-soc-text').textContent = `Target: ${v.targetSOC}%`;
  document.getElementById('modal-capacity').textContent = `${v.batteryCapacityKWh} kWh`;
  document.getElementById('modal-range').textContent = `${v.currentRangeKM} km`;
  document.getElementById('modal-priority').innerHTML = getPriorityBadge(v.priority);
  document.getElementById('modal-station').textContent = v.assignedStation;
  document.getElementById('modal-power').textContent = `${v.currentChargingPowerKW} kW`;
  document.getElementById('modal-eta').textContent = v.eta;
  document.getElementById('modal-deadline').textContent = v.departureDeadline;

  document.getElementById('vehicle-details-modal').classList.remove('hidden');
  lucide.createIcons();
}

function updateVehicleModalDynamic(id) {
  const v = fleetVehicles.find(item => item.vehicleId === id);
  if (!v) return;
  const socText = document.getElementById('modal-soc-text');
  const socBar = document.getElementById('modal-soc-bar');
  const range = document.getElementById('modal-range');
  const power = document.getElementById('modal-power');
  const eta = document.getElementById('modal-eta');

  if (socText) socText.textContent = `${v.currentSOC}%`;
  if (socBar) socBar.style.width = `${v.currentSOC}%`;
  if (range) range.textContent = `${v.currentRangeKM} km`;
  if (power) power.textContent = `${v.currentChargingPowerKW} kW`;
  if (eta) eta.textContent = v.eta;
}

function closeVehicleModal() {
  currentSelectedModalVehicleId = null;
  document.getElementById('vehicle-details-modal').classList.add('hidden');
}

// Vehicle Table Filter
function filterVehicles() {
  const statusFilter = document.getElementById('vehicle-filter-status').value;
  const search = document.getElementById('vehicle-search').value.toLowerCase();

  const filtered = fleetVehicles.filter(v => {
    const matchesStatus = (statusFilter === 'all') || (v.status === statusFilter);
    const matchesSearch = v.vehicleId.toLowerCase().includes(search) || v.licensePlate.toLowerCase().includes(search) || v.model.toLowerCase().includes(search);
    return matchesStatus && matchesSearch;
  });

  renderVehiclesTable(filtered);
}

// Navigation & Sidebar
function switchTab(tabId) {
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.remove('text-blue-600', 'bg-blue-50/80');
    n.classList.add('text-slate-600');
  });

  const selectedPanel = document.getElementById(`panel-${tabId}`);
  const selectedNav = document.getElementById(`nav-${tabId}`);
  if (selectedPanel) selectedPanel.classList.remove('hidden');
  if (selectedNav) {
    selectedNav.classList.add('text-blue-600', 'bg-blue-50/80');
    selectedNav.classList.remove('text-slate-600');
  }

  const titles = {
    dashboard: 'Dashboard Overview',
    orchestration: 'Smart Orchestration Engine',
    vehicles: 'Fleet Registry & Telemetry',
    stations: 'Charging Stations & Pricing',
    schedule: 'Smart Schedules',
    analytics: 'Impact & Energy Analytics',
    alerts: 'Fleet Alerts',
    reports: 'Reports & Logs',
    users: 'Users & Access Control',
    settings: 'System Telematics & OCPP Settings'
  };
  document.getElementById('page-title').textContent = titles[tabId] || 'VoltFlow';
  closeSidebar();
  lucide.createIcons();

  if (tabId === 'dashboard' && fleetMap) {
    setTimeout(() => { fleetMap.invalidateSize(); }, 200);
  }
}

function toggleSidebar() {
  document.getElementById('app-sidebar').classList.toggle('-translate-x-full');
  document.getElementById('mobile-backdrop').classList.toggle('hidden');
}

function closeSidebar() {
  document.getElementById('app-sidebar').classList.add('-translate-x-full');
  document.getElementById('mobile-backdrop').classList.add('hidden');
}

// Leaflet Map & Markers
function initMap() {
  const mapElement = document.getElementById('fleet-map');
  if (!mapElement) return;

  fleetMap = L.map('fleet-map').setView([26.8467, 80.9462], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap'
  }).addTo(fleetMap);

  updateMapMarkers();
}

function updateMapMarkers() {
  if (!fleetMap) return;

  fleetStations.forEach(s => {
    L.circleMarker([s.lat, s.lng], {
      radius: 9,
      fillColor: '#2563eb',
      color: '#ffffff',
      weight: 2,
      fillOpacity: 0.9
    }).addTo(fleetMap).bindPopup(`<b>${s.name}</b><br>Load: ${s.currentLoadKW}/${s.totalCapacityKW} kW<br>Rate: ₹${s.currentPrice}/kWh`);
  });

  fleetVehicles.forEach(v => {
    L.circleMarker([v.lat, v.lng], {
      radius: 6,
      fillColor: v.priority === 'Critical' ? '#ef4444' : '#10b981',
      color: '#ffffff',
      weight: 2,
      fillOpacity: 0.9
    }).addTo(fleetMap).bindPopup(`<b>${v.vehicleId} (${v.licensePlate})</b><br>SOC: ${v.currentSOC}%<br>Status: ${v.status}`);
  });
}

// Orchestration Simulations
function triggerSmartOptimization() {
  runPipeline([
    { text: "Analyzing Battery SOC & Energy Demand...", pct: 15 },
    { text: "Reading Departure Deadlines & Dispatch Urgency...", pct: 35 },
    { text: "Comparing Station Prices (₹6 to ₹13/kWh)...", pct: 55 },
    { text: "Checking Grid Capacity & Safe Headroom (150 kW Limit)...", pct: 75 },
    { text: "Calculating Cost-Optimal Schedules & Power Modulation...", pct: 100 }
  ]);
}

function runLiveSimulation() {
  runPipeline([
    { text: "Loading fleet telemetry...", pct: 15 },
    { text: "Reading battery SOC...", pct: 30 },
    { text: "Comparing station tariffs (Peak vs Off-Peak)...", pct: 45 },
    { text: "Checking grid capacity...", pct: 60 },
    { text: "Checking departure deadlines...", pct: 75 },
    { text: "Calculating optimal schedule & minimum cost...", pct: 90 },
    { text: "OPTIMIZATION COMPLETE 🟢", pct: 100 }
  ]);
}

function runPipeline(steps) {
  const box = document.getElementById('sim-progress-box');
  const text = document.getElementById('sim-step-text');
  const bar = document.getElementById('sim-progress-bar');
  const pct = document.getElementById('sim-step-percent');
  const btn1 = document.getElementById('btn-smart-opt');
  const btn2 = document.getElementById('btn-live-sim');

  box.classList.remove('hidden');
  btn1.disabled = true;
  btn2.disabled = true;

  let i = 0;
  const timer = setInterval(() => {
    if (i < steps.length) {
      text.innerHTML = `<span class="w-2 h-2 rounded-full bg-blue-600 animate-ping mr-2"></span> ${steps[i].text}`;
      bar.style.width = `${steps[i].pct}%`;
      pct.textContent = `${steps[i].pct}%`;
      i++;
    } else {
      clearInterval(timer);
      setTimeout(() => {
        btn1.disabled = false;
        btn2.disabled = false;
        renderOrchestrationTable();
      }, 350);
    }
  }, 450);
}

// Charts
function initAllCharts() {
  const ctx1 = document.getElementById('dashboardLiveChart');
  if (ctx1) {
    new Chart(ctx1, {
      type: 'line',
      data: {
        labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
        datasets: [
          { label: 'Current Load (kW)', data: [65, 55, 105, 95, 70, 60, 50, 45, 80, 110, 90, 75], borderColor: '#2563eb', backgroundColor: 'rgba(37, 99, 235, 0.1)', fill: true, tension: 0.3 },
          { label: '150 kW Safe Limit', data: Array(12).fill(150), borderColor: '#f59e0b', borderDash: [5, 5], pointRadius: 0 }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  const ctx2 = document.getElementById('dashboardEnergyChart');
  if (ctx2) {
    new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: ['00-04', '04-08', '08-12', '12-16', '16-20', '20-24'],
        datasets: [
          { label: 'Off-Peak Energy (kWh)', data: [680, 850, 420, 310, 480, 680], backgroundColor: '#3b82f6' },
          { label: 'Peak Throttled (kWh)', data: [120, 240, 180, 90, 210, 150], backgroundColor: '#10b981' }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  const ctx3 = document.getElementById('analyticsComparisonChart');
  if (ctx3) {
    new Chart(ctx3, {
      type: 'line',
      data: {
        labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
        datasets: [
          { label: 'Without VoltFlow (Unmanaged Peak Overload)', data: [70, 60, 110, 140, 175, 160, 90, 85, 120, 185, 170, 110], borderColor: '#ef4444', borderWidth: 2, tension: 0.3 },
          { label: 'With VoltFlow (Cost-Optimized Peak Shaving)', data: [110, 125, 135, 120, 130, 115, 85, 80, 110, 135, 125, 115], borderColor: '#2563eb', backgroundColor: 'rgba(37, 99, 235, 0.15)', fill: true, borderWidth: 2.5, tension: 0.3 },
          { label: '150 kW Grid Limit', data: Array(12).fill(150), borderColor: '#f59e0b', borderDash: [6, 6], pointRadius: 0 }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  const ctx4 = document.getElementById('analyticsCostChart');
  if (ctx4) {
    new Chart(ctx4, {
      type: 'doughnut',
      data: {
        labels: ['Off-Peak Shifted (₹6-9/kWh)', 'Standard Daytime', 'Peak Avoided'],
        datasets: [{ data: [65, 25, 10], backgroundColor: ['#10b981', '#3b82f6', '#f59e0b'] }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  const ctx5 = document.getElementById('analyticsGreenChart');
  if (ctx5) {
    new Chart(ctx5, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{ label: 'CO₂ Avoided (kg)', data: [180, 210, 240, 195, 260, 220, 215], borderColor: '#10b981', tension: 0.3 }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
}
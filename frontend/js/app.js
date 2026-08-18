// VoltFlow Core Engine Controller — Separate Live Active State vs Persistent Historical Savings Engine

const DEMO_ACCOUNT_EMAIL = "admin@voltflow.io";

const BASE_STATIONS_CATALOG = [
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

// Initial Preset Fleet
const DEMO_PRESET_VEHICLES = [
  {
    vehicleId: "EV-002",
    licensePlate: "UP32-EV-9022",
    model: "Mahindra XUV400",
    batteryCapacityKWh: 39.4,
    currentSOC: 15,
    targetSOC: 90,
    currentRangeKM: 45,
    status: "charging",
    assignedStation: "Gomti Nagar Cyber Tower",
    stationId: "CS-LKO-02",
    assignedCharger: "Charger 01 (Fast 60kW)",
    currentChargingPowerKW: 60,
    departureDeadline: "30 min",
    eta: "05:05 AM",
    startTime: "04:15 AM",
    safetyBuffer: "10 min",
    energyDeliveredKWh: 8.2,
    lat: 26.8722,
    lng: 80.9984
  },
  {
    vehicleId: "EV-001",
    licensePlate: "UP32-EV-4101",
    model: "Tata Nexon EV Max",
    batteryCapacityKWh: 40.5,
    currentSOC: 35,
    targetSOC: 90,
    currentRangeKM: 115,
    status: "charging",
    assignedStation: "Gomti Nagar Cyber Tower",
    stationId: "CS-LKO-02",
    assignedCharger: "Charger 02 (Modulated 45kW)",
    currentChargingPowerKW: 45,
    departureDeadline: "1 hour",
    eta: "05:42 AM",
    startTime: "04:50 AM",
    safetyBuffer: "25 min",
    energyDeliveredKWh: 6.5,
    lat: 26.8467,
    lng: 80.9462
  },
  {
    vehicleId: "EV-005",
    licensePlate: "UP32-EV-3344",
    model: "Tata Tigor EV Express",
    batteryCapacityKWh: 26.0,
    currentSOC: 32,
    targetSOC: 85,
    currentRangeKM: 70,
    status: "charging",
    assignedStation: "Hazratganj EV Superhub",
    stationId: "CS-LKO-01",
    assignedCharger: "Charger 03 (Standard 35kW)",
    currentChargingPowerKW: 35,
    departureDeadline: "1.5 hours",
    eta: "05:25 AM",
    startTime: "04:30 AM",
    safetyBuffer: "30 min",
    energyDeliveredKWh: 4.1,
    lat: 26.8480,
    lng: 80.9490
  },
  {
    vehicleId: "EV-003",
    licensePlate: "UP32-EV-7788",
    model: "Tata Ace EV (Cargo)",
    batteryCapacityKWh: 21.3,
    currentSOC: 55,
    targetSOC: 95,
    currentRangeKM: 72,
    status: "queued",
    assignedStation: "Alambagh Transport Hub",
    stationId: "CS-LKO-03",
    assignedCharger: "Queue Position 1",
    currentChargingPowerKW: 0,
    departureDeadline: "3 hours",
    eta: "06:30 AM",
    startTime: "05:10 AM",
    safetyBuffer: "60 min",
    energyDeliveredKWh: 0,
    lat: 26.8142,
    lng: 80.9022
  },
  {
    vehicleId: "EV-006",
    licensePlate: "UP32-EV-8899",
    model: "Hyundai Kona Electric",
    batteryCapacityKWh: 39.2,
    currentSOC: 50,
    targetSOC: 85,
    currentRangeKM: 160,
    status: "queued",
    assignedStation: "Gomti Nagar Cyber Tower",
    stationId: "CS-LKO-02",
    assignedCharger: "Queue Position 2",
    currentChargingPowerKW: 0,
    departureDeadline: "3.5 hours",
    eta: "06:45 AM",
    startTime: "05:30 AM",
    safetyBuffer: "45 min",
    energyDeliveredKWh: 0,
    lat: 26.8740,
    lng: 80.9950
  },
  {
    vehicleId: "EV-007",
    licensePlate: "UP32-EV-6611",
    model: "Tata Nexon EV Prime",
    batteryCapacityKWh: 30.2,
    currentSOC: 60,
    targetSOC: 85,
    currentRangeKM: 130,
    status: "in-transit",
    assignedStation: "Hazratganj EV Superhub",
    stationId: "CS-LKO-01",
    assignedCharger: "En-Route Bay",
    currentChargingPowerKW: 0,
    departureDeadline: "4 hours",
    eta: "04:55 AM",
    startTime: "04:20 AM",
    safetyBuffer: "60 min",
    energyDeliveredKWh: 0,
    lat: 26.8380,
    lng: 80.9300
  },
  {
    vehicleId: "EV-004",
    licensePlate: "UP32-EV-1120",
    model: "MG ZS EV Long Range",
    batteryCapacityKWh: 50.3,
    currentSOC: 82,
    targetSOC: 90,
    currentRangeKM: 330,
    status: "idle",
    assignedStation: "Alambagh Transport Hub",
    stationId: "CS-LKO-03",
    assignedCharger: "Standby Bay",
    currentChargingPowerKW: 0,
    departureDeadline: "6 hours",
    eta: "--",
    startTime: "--",
    safetyBuffer: "120 min",
    energyDeliveredKWh: 0,
    lat: 26.8180,
    lng: 80.9050
  },
  {
    vehicleId: "EV-008",
    licensePlate: "UP32-EV-5522",
    model: "BYD E6 Commercial",
    batteryCapacityKWh: 71.7,
    currentSOC: 75,
    targetSOC: 95,
    currentRangeKM: 365,
    status: "idle",
    assignedStation: "Shaheed Path Express Hub",
    stationId: "CS-LKO-05",
    assignedCharger: "Standby Bay",
    currentChargingPowerKW: 0,
    departureDeadline: "8 hours",
    eta: "--",
    startTime: "--",
    safetyBuffer: "180 min",
    energyDeliveredKWh: 0,
    lat: 26.7922,
    lng: 80.9989
  }
];

const DEMO_PRESET_ALERTS = [
  {
    id: "ALT-01",
    severity: "critical",
    title: "Critical Battery Urgency Alert",
    message: "EV-002 at 15% SOC with 30 min departure. Auto-promoted to highest priority Charger 01 at Gomti Nagar Superhub.",
    actionTitle: "Allocated 60 kW Fast Power",
    power: "60 kW",
    target: "90%",
    rate: "₹10/kWh"
  },
  {
    id: "ALT-02",
    severity: "warning",
    title: "Grid Safe Load Governor Active",
    message: "Total substation demand managed safely below 150 kW cap.",
    actionTitle: "Queue Modulated",
    power: "Safe",
    target: "100%",
    rate: "₹10/kWh"
  }
];

// Active State
let currentUser = null;
let stationVehicles = [];
let fleetStations = JSON.parse(JSON.stringify(BASE_STATIONS_CATALOG));

let fleetMap = null;
let vehicleToDeleteId = null;
let currentSelectedModalVehicleId = null;
let dashboardLiveChartInstance = null;
let dashboardEnergyChartInstance = null;
let analyticsComparisonChartInstance = null;
let savingsTimelineChartInstance = null;

// ================= POINT 3, 4, 7, 8: SEPARATE PERSISTENT HISTORICAL SAVINGS ENGINE =================
function getHistoricalSavingsData() {
  const raw = localStorage.getItem('vf_persistent_historical_savings');
  if (raw) {
    return JSON.parse(raw);
  }
  // Default persistent baseline savings records (seeded with initial ₹1,240 base)
  const initialData = {
    totalCumulativeSavings: 1240,
    totalEnergyShiftedKWh: 1240,
    totalCompletedSessions: 480
  };
  localStorage.setItem('vf_persistent_historical_savings', JSON.stringify(initialData));
  return initialData;
}

function recordHistoricalSavings(addedSavingAmount, addedKWh) {
  const data = getHistoricalSavingsData();
  data.totalCumulativeSavings += (addedSavingAmount || 0);
  data.totalEnergyShiftedKWh += (addedKWh || 0);
  data.totalCompletedSessions += 1;
  localStorage.setItem('vf_persistent_historical_savings', JSON.stringify(data));
}

// ================= POINT 1: DUAL-FACTOR AUTOMATIC PRIORITY ENGINE =================
function parseDeadlineToMinutes(deadlineStr) {
  if (!deadlineStr) return 180;
  const lower = String(deadlineStr).toLowerCase().trim();
  
  if (lower.includes('min')) {
    const match = lower.match(/\d+/);
    return match ? parseInt(match[0]) : 30;
  }
  if (lower.includes('hour') || lower.includes('hr')) {
    const match = lower.match(/[\d.]+/);
    return match ? Math.round(parseFloat(match[0]) * 60) : 60;
  }
  if (lower.includes(':')) {
    return 45;
  }
  return 180;
}

function calculateAutoPriority(vehicle) {
  const soc = parseInt(vehicle.currentSOC) || 0;
  const target = parseInt(vehicle.targetSOC) || 90;
  const minutes = parseDeadlineToMinutes(vehicle.departureDeadline);

  if (soc >= target) {
    return 'Low';
  }

  // 1. CRITICAL: SOC <= 20% AND Departure <= 45 mins
  if (soc <= 20 && minutes <= 45) {
    return 'Critical';
  }
  // 2. HIGH: SOC 20-40% AND Departure <= 120 mins
  if ((soc <= 40 && minutes <= 120) || (soc <= 20 && minutes <= 90)) {
    return 'High';
  }
  // 3. MEDIUM: SOC 40-65% AND Departure <= 240 mins
  if ((soc <= 65 && minutes <= 240) || (soc <= 40 && minutes > 120)) {
    return 'Medium';
  }
  // 4. LOW: SOC > 65% OR Departure > 4 hrs
  return 'Low';
}

// ================= POINT 5 & 6: REAL-TIME COST & SAVINGS =================
function calculateChargingCost(vehicle) {
  const soc = parseInt(vehicle.currentSOC) || 0;
  const target = parseInt(vehicle.targetSOC) || 90;
  const capacity = parseFloat(vehicle.batteryCapacityKWh) || 40.0;
  
  const deficitSOC = Math.max(0, target - soc);
  const energyRequired = Math.max(0, (capacity * deficitSOC) / 100);

  if (energyRequired === 0 || soc >= target) {
    return {
      energyRequired: "0.0",
      pricePerKWh: 10,
      estimatedCost: 0,
      baselineCost: 0,
      estimatedSaving: 0,
      isComplete: true
    };
  }

  const station = fleetStations.find(s => s.id === vehicle.stationId) || fleetStations[0];
  const optimizedPrice = station ? (station.currentPrice || 10) : 10;
  const baselinePrice = 14;

  const estimatedCost = Math.round(energyRequired * optimizedPrice);
  const baselineCost = Math.round(energyRequired * baselinePrice);
  const estimatedSaving = Math.max(0, baselineCost - estimatedCost);

  return {
    energyRequired: energyRequired.toFixed(1),
    pricePerKWh: optimizedPrice,
    estimatedCost: estimatedCost,
    baselineCost: baselineCost,
    estimatedSaving: estimatedSaving,
    isComplete: false
  };
}

// ================= POINT 1, 2, 4: AUTONOMOUS QUEUE SORTING & STALE CHARGING GUARD =================
function updateChargingQueueAndChargers() {
  const container = document.getElementById('dynamic-charging-queue-container');
  const countBadge = document.getElementById('queue-count-badge');

  // Point 1: If 0 registered vehicles, reset everything cleanly to 0
  if (!stationVehicles || stationVehicles.length === 0) {
    if (container) container.innerHTML = `<div class="col-span-full py-4 text-center text-slate-400 text-xs font-medium">No vehicles registered in station.</div>`;
    if (countBadge) countBadge.textContent = "0 In Queue";
    return;
  }

  stationVehicles.forEach(v => {
    v.priority = calculateAutoPriority(v);
  });

  const priorityWeight = { 'Critical': 1, 'High': 2, 'Medium': 3, 'Low': 4 };
  
  stationVehicles.sort((a, b) => {
    const wA = priorityWeight[a.priority] || 4;
    const wB = priorityWeight[b.priority] || 4;
    if (wA !== wB) return wA - wB;

    const minA = parseDeadlineToMinutes(a.departureDeadline);
    const minB = parseDeadlineToMinutes(b.departureDeadline);
    if (minA !== minB) return minA - minB;

    return a.currentSOC - b.currentSOC;
  });

  let activeChargingGuns = 0;
  const maxSimultaneousGuns = 3;
  let queuePositionCounter = 1;

  stationVehicles.forEach(v => {
    const isFull = v.currentSOC >= v.targetSOC;

    if (isFull) {
      v.status = 'completed';
      v.currentChargingPowerKW = 0;
      v.assignedCharger = "Completed Bay";
      v.eta = "Completed ✅";
    } else if (v.status !== 'in-transit' && activeChargingGuns < maxSimultaneousGuns) {
      v.status = 'charging';
      activeChargingGuns++;
      if (v.priority === 'Critical') {
        v.currentChargingPowerKW = 60;
        v.assignedCharger = `Charger 01 (Fast 60kW)`;
      } else if (v.priority === 'High') {
        v.currentChargingPowerKW = 45;
        v.assignedCharger = `Charger 02 (Modulated 45kW)`;
      } else {
        v.currentChargingPowerKW = 35;
        v.assignedCharger = `Charger 03 (Standard 35kW)`;
      }
    } else if (v.status !== 'in-transit') {
      v.status = 'queued';
      v.currentChargingPowerKW = 0;
      v.assignedCharger = `Queue Position ${queuePositionCounter++}`;
    }
  });

  if (countBadge) {
    const waitingQueue = stationVehicles.filter(v => v.status === 'queued').length;
    countBadge.textContent = `${waitingQueue} In Queue`;
  }

  if (container) {
    const medals = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣'];
    const activeAndQueued = stationVehicles.filter(v => v.status === 'charging' || v.status === 'queued');

    if (activeAndQueued.length === 0) {
      container.innerHTML = `<div class="col-span-full py-4 text-center text-slate-400 text-xs font-medium">All vehicles charged. No queue active.</div>`;
      return;
    }

    container.innerHTML = activeAndQueued.slice(0, 4).map((v, idx) => {
      const medal = medals[idx] || `${idx + 1}️⃣`;
      
      let stateTag = "QUEUED";
      let stateBg = "bg-slate-100 text-slate-700";
      if (v.status === 'charging') {
        stateTag = idx === 0 ? "NOW CHARGING (1st)" : "NOW CHARGING";
        stateBg = "bg-blue-600 text-white animate-pulse";
      } else if (idx === 1 || idx === 2) {
        stateTag = `NEXT (${idx + 1}nd)`;
        stateBg = "bg-amber-500 text-white";
      }

      return `
        <div class="p-3 rounded-xl border ${v.priority === 'Critical' ? 'bg-rose-50/70 border-rose-200' : (v.priority === 'High' ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-50 border-slate-200')} shadow-sm">
          <div class="flex items-center justify-between">
            <span class="text-sm font-black">${medal} ${v.vehicleId}</span>
            <span class="px-2 py-0.5 rounded text-[9px] font-bold ${stateBg}">${stateTag}</span>
          </div>
          <div class="mt-2 flex items-center justify-between text-xs font-bold text-slate-700">
            <span>SOC: <strong class="text-blue-600">${v.currentSOC}%</strong></span>
            ${getPriorityBadge(v.priority)}
          </div>
          <div class="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span class="truncate pr-1">${v.assignedCharger}</span>
            <span class="font-bold text-slate-800 whitespace-nowrap">${v.currentChargingPowerKW > 0 ? v.currentChargingPowerKW + ' kW' : 'Waiting'}</span>
          </div>
        </div>
      `;
    }).join('');
  }
}

// ================= POINT 3 & 4: REAL-TIME CHARGING TELEMETRY LOOP =================
function startRealChargingSimulation() {
  setInterval(() => {
    if (!currentUser || !stationVehicles || stationVehicles.length === 0) return;

    let updated = false;

    stationVehicles.forEach(v => {
      if (v.status === 'charging') {
        if (v.currentSOC < v.targetSOC) {
          v.currentSOC += 1;
          v.currentRangeKM = Math.min(Math.round(v.currentSOC * 3.3), 450);
          v.energyDeliveredKWh = +( (v.energyDeliveredKWh || 0) + 0.4 ).toFixed(1);
          v.priority = calculateAutoPriority(v);
          updated = true;
        } else {
          // Vehicle Charging Complete: Record persistent historical savings!
          v.status = 'completed';
          v.currentChargingPowerKW = 0;
          v.eta = "Completed ✅";
          v.priority = "Low";
          
          const finalCostData = calculateChargingCost(v);
          recordHistoricalSavings(finalCostData.estimatedSaving, parseFloat(finalCostData.energyRequired));
          updated = true;
        }
      }
    });

    if (updated) {
      updateChargingQueueAndChargers();
      saveSharedStationFleet();
      renderAllViews();
      
      if (currentSelectedModalVehicleId) {
        updateVehicleModalDynamic(currentSelectedModalVehicleId);
      }
    }
  }, 3500);
}

// ================= POINT 1, 3, 5, 8: DASHBOARD METRICS CALCULATION =================
function updateDashboardKPIs() {
  const total = stationVehicles.length;

  // Point 1: Strict Active Live Metrics (Clean zero when no vehicles)
  const chargingVehicles = total > 0 ? stationVehicles.filter(v => v.status === 'charging') : [];
  const chargingCount = chargingVehicles.length;
  const transitCount = total > 0 ? stationVehicles.filter(v => v.status === 'in-transit').length : 0;
  const completedCount = total > 0 ? stationVehicles.filter(v => v.status === 'completed').length : 0;
  const queuedCount = total > 0 ? stationVehicles.filter(v => v.status === 'queued').length : 0;

  const totalSOC = total > 0 ? stationVehicles.reduce((acc, v) => acc + v.currentSOC, 0) : 0;
  const avgSOC = total > 0 ? (totalSOC / total).toFixed(1) : "0.0";

  const currentTotalLoadKW = total > 0 
    ? stationVehicles.reduce((acc, v) => acc + (v.currentChargingPowerKW || 0), 0) 
    : 0;
    
  const headroomKW = Math.max(0, 150 - currentTotalLoadKW);

  // Point 3, 5, 8: Persistent Historical Savings calculation (Never drops to 0 on vehicle delete!)
  const historicalData = getHistoricalSavingsData();
  const currentLiveSaving = total > 0 
    ? stationVehicles.reduce((acc, v) => acc + calculateChargingCost(v).estimatedSaving, 0) 
    : 0;
    
  const totalCombinedSavings = historicalData.totalCumulativeSavings + currentLiveSaving;

  // DOM Updates
  const headerLoad = document.getElementById('header-grid-load');
  if (headerLoad) headerLoad.textContent = currentTotalLoadKW;

  const dashLoad = document.getElementById('dash-current-load');
  if (dashLoad) dashLoad.textContent = `${currentTotalLoadKW} kW`;

  const dashHeadroom = document.getElementById('dash-headroom');
  if (dashHeadroom) dashHeadroom.textContent = `${headroomKW} kW`;

  const dashSubHeadroom = document.getElementById('dash-sub-headroom');
  if (dashSubHeadroom) dashSubHeadroom.textContent = `${headroomKW} kW (Safe)`;

  const dashOptCount = document.getElementById('dash-optimized-count');
  if (dashOptCount) dashOptCount.textContent = `${total} / ${total}`;

  const fleetCountEl = document.getElementById('dash-kpi-fleet-count');
  if (fleetCountEl) fleetCountEl.textContent = `${total} EVs`;

  const chargingNowEl = document.getElementById('dash-kpi-charging-now');
  if (chargingNowEl) {
    chargingNowEl.textContent = `${chargingCount} Active`;
  }

  const statusSub = document.getElementById('dash-kpi-status-sub');
  if (statusSub) {
    if (total === 0) {
      statusSub.textContent = `0 Charging • 0 Queued • 0 Transit`;
    } else {
      statusSub.textContent = `${chargingCount} Charging • ${queuedCount} Queued • ${transitCount} Transit`;
    }
  }

  const throttledSub = document.getElementById('dash-kpi-throttled-sub');
  if (throttledSub) {
    throttledSub.textContent = total > 0 ? `${currentTotalLoadKW} kW safe load` : `0 kW safe load`;
  }

  const avgSocEl = document.getElementById('dash-kpi-avg-soc');
  if (avgSocEl) avgSocEl.textContent = `${avgSOC}%`;

  // Point 8: Persistent Savings on Top Dashboard Card
  const savingsEl = document.getElementById('dash-kpi-savings');
  if (savingsEl) {
    savingsEl.textContent = `₹${totalCombinedSavings.toLocaleString()}`;
  }

  const impactSavingsEl = document.getElementById('impact-card-savings');
  if (impactSavingsEl) {
    impactSavingsEl.textContent = `₹${totalCombinedSavings.toLocaleString()} Saved`;
  }

  const emptyState = document.getElementById('dashboard-empty-state');
  const dataView = document.getElementById('dashboard-data-view');
  if (emptyState && dataView) {
    if (total === 0) {
      emptyState.classList.remove('hidden');
      dataView.classList.add('hidden');
    } else {
      emptyState.classList.add('hidden');
      dataView.classList.remove('hidden');
    }
  }

  updateBeforeAfterSection(currentTotalLoadKW);
}

function updateBeforeAfterSection(managedLoadKW) {
  const unmanagedLoad = stationVehicles.length > 0 
    ? stationVehicles.reduce((acc, v) => acc + (v.batteryCapacityKWh >= 40 ? 60 : 40), 0)
    : 0;

  const unmanagedLoadEl = document.getElementById('unmanaged-total-load');
  const managedLoadEl = document.getElementById('managed-total-load');
  const shavedPctEl = document.getElementById('managed-shaved-pct');
  const unmanagedTag = document.getElementById('unmanaged-grid-tag');

  if (unmanagedLoadEl) unmanagedLoadEl.textContent = `${unmanagedLoad} kW`;
  if (managedLoadEl) managedLoadEl.textContent = `${managedLoadKW} kW`;

  if (unmanagedTag) {
    if (unmanagedLoad > 150) {
      unmanagedTag.textContent = "🔴 GRID OVERLOAD";
      unmanagedTag.className = "bg-rose-600 text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full animate-pulse";
    } else {
      unmanagedTag.textContent = "🟢 GRID SAFE";
      unmanagedTag.className = "bg-emerald-600 text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-0.5 rounded-full";
    }
  }

  const shavedPct = unmanagedLoad > 0 ? (((unmanagedLoad - managedLoadKW) / unmanagedLoad) * 100).toFixed(1) : 0;
  if (shavedPctEl) shavedPctEl.textContent = `${shavedPct}% ↓`;

  const unmanagedList = document.getElementById('unmanaged-vehicles-list');
  const managedList = document.getElementById('managed-vehicles-list');

  if (unmanagedList) {
    if (stationVehicles.length === 0) {
      unmanagedList.innerHTML = `<div class="p-3 text-center text-rose-500 font-medium">No vehicles registered.</div>`;
    } else {
      unmanagedList.innerHTML = stationVehicles.slice(0, 3).map(v => `
        <div class="bg-white/90 p-2.5 rounded-xl flex items-center justify-between border border-rose-100 font-medium">
          <span>${v.vehicleId} (${v.assignedStation ? v.assignedStation.split(' ')[0] : 'Depot'})</span>
          <span class="font-bold text-rose-700">${v.batteryCapacityKWh >= 40 ? 60 : 40} kW (Unmanaged)</span>
        </div>
      `).join('');
    }
  }

  if (managedList) {
    if (stationVehicles.length === 0) {
      managedList.innerHTML = `<div class="p-3 text-center text-emerald-600 font-medium">No vehicles registered.</div>`;
    } else {
      managedList.innerHTML = stationVehicles.slice(0, 3).map(v => `
        <div class="bg-white/90 p-2.5 rounded-xl flex items-center justify-between border border-emerald-100 font-medium">
          <span>${v.vehicleId} • Dep: ${v.departureDeadline}</span>
          <span class="font-bold text-blue-600">${v.currentChargingPowerKW} kW (${v.assignedCharger ? v.assignedCharger.split(' ')[0] : 'Gun'})</span>
        </div>
      `).join('');
    }
  }
}

// ================= POINT 9: OPTIMAL DISPATCH MATRIX RENDERER =================
function renderOrchestrationTable() {
  const tbody = document.getElementById('orchestration-table-body');
  if (!tbody) return;

  if (stationVehicles.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" class="py-8 text-center text-slate-400 font-medium">No vehicles registered. Click "+ Add Vehicle" or "Upload CSV" to begin.</td></tr>`;
    return;
  }

  tbody.innerHTML = stationVehicles.map(v => {
    const costData = calculateChargingCost(v);
    
    const costText = costData.isComplete 
      ? '<span class="text-slate-400 font-medium">Full Battery</span>' 
      : `₹${costData.estimatedCost}`;
      
    const savingText = costData.isComplete 
      ? '<span class="text-slate-400 font-medium">No Top-Up</span>' 
      : `<span class="font-black text-emerald-600">+₹${costData.estimatedSaving}</span>`;

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
        <td class="py-3 px-4 font-black text-slate-800">${costText}</td>
        <td class="py-3 px-4">${savingText}</td>
        <td class="py-3 px-4 text-rose-600 font-semibold">${v.departureDeadline}</td>
        <td class="py-3 px-4 text-right">
          <button onclick="openVehicleModal('${v.vehicleId}')" class="text-blue-600 font-bold hover:underline">Details</button>
        </td>
      </tr>
    `;
  }).join('');
}

// ================= POINT 6, 8, 9, 10: SAVINGS FILTER & TIMELINE GRAPH =================
let currentSavingsFilter = "30days";

function handleSavingsDateFilterChange() {
  const filterVal = document.getElementById('savings-date-filter').value;
  currentSavingsFilter = filterVal;
  const customInputs = document.getElementById('custom-date-inputs');

  if (filterVal === 'custom') {
    customInputs.classList.remove('hidden');
  } else {
    customInputs.classList.add('hidden');
    updateSavingsAnalyticsView();
  }
}

function applyCustomDateSavings() {
  updateSavingsAnalyticsView();
}

function updateSavingsAnalyticsView() {
  const historicalData = getHistoricalSavingsData();
  const currentFleetSaving = stationVehicles.reduce((acc, v) => acc + calculateChargingCost(v).estimatedSaving, 0);
  const baseTotalSavings = historicalData.totalCumulativeSavings + currentFleetSaving;
  
  let multiplier = 1;
  let periodDays = 30;
  let title = "Charging Cost Savings — Last 30 Days";
  let chartLabels = [];
  let chartData = [];

  switch (currentSavingsFilter) {
    case 'today':
      multiplier = 1;
      periodDays = 1;
      title = "Charging Cost Savings — Today (18 Aug 2026)";
      chartLabels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
      chartData = [120, 180, 240, 160, 310, 280].map(v => Math.round(v * (baseTotalSavings / 1200)));
      break;
    case 'yesterday':
      multiplier = 0.95;
      periodDays = 1;
      title = "Charging Cost Savings — Yesterday";
      chartLabels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
      chartData = [110, 170, 220, 150, 290, 260].map(v => Math.round(v * (baseTotalSavings / 1200)));
      break;
    case '7days':
      multiplier = 7;
      periodDays = 7;
      title = "Charging Cost Savings — Last 7 Days";
      chartLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      chartData = [450, 520, 610, 480, 720, 680, 590].map(v => Math.round(v * (baseTotalSavings / 1000)));
      break;
    case '30days':
      multiplier = 30;
      periodDays = 30;
      title = "Charging Cost Savings — Last 30 Days";
      chartLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      chartData = [3400, 4200, 4800, 5250].map(v => Math.round(v * (baseTotalSavings / 800)));
      break;
    case '3months':
      multiplier = 90;
      periodDays = 90;
      title = "Charging Cost Savings — Last 3 Months";
      chartLabels = ['June 2026', 'July 2026', 'August 2026'];
      chartData = [14200, 16800, 18450].map(v => Math.round(v * (baseTotalSavings / 600)));
      break;
    case '6months':
      multiplier = 180;
      periodDays = 180;
      title = "Charging Cost Savings — Last 6 Months";
      chartLabels = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
      chartData = [11200, 13400, 15100, 16800, 17900, 18450].map(v => Math.round(v * (baseTotalSavings / 600)));
      break;
    case '1year':
      multiplier = 365;
      periodDays = 365;
      title = "Charging Cost Savings — Last 1 Year";
      chartLabels = ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025', 'Q1 2026', 'Q2 2026'];
      chartData = [28000, 34000, 42000, 48000, 54000, 62000].map(v => Math.round(v * (baseTotalSavings / 500)));
      break;
    default:
      multiplier = 15;
      periodDays = 15;
      title = "Charging Cost Savings — Custom Range";
      chartLabels = ['P1', 'P2', 'P3', 'P4'];
      chartData = [2100, 2800, 3400, 3900];
  }

  const calculatedTotalSavings = Math.max(1240, Math.round(baseTotalSavings * (multiplier / 2)));
  const calculatedEnergyCostSaved = Math.round(calculatedTotalSavings * 0.85);
  const avgDaily = periodDays > 0 ? Math.round(calculatedTotalSavings / periodDays) : 0;
  const sessionsCount = Math.max(480, historicalData.totalCompletedSessions + (stationVehicles.length * periodDays));

  const totalSavEl = document.getElementById('analytics-total-savings');
  const costSavedEl = document.getElementById('analytics-cost-saved');
  const avgDailyEl = document.getElementById('analytics-avg-daily');
  const sessionsEl = document.getElementById('analytics-sessions-count');
  const graphTitleEl = document.getElementById('savings-graph-title');

  if (totalSavEl) totalSavEl.textContent = `₹${calculatedTotalSavings.toLocaleString()}`;
  if (costSavedEl) costSavedEl.textContent = `₹${calculatedEnergyCostSaved.toLocaleString()}`;
  if (avgDailyEl) avgDailyEl.textContent = `₹${avgDaily.toLocaleString()}/day`;
  if (sessionsEl) sessionsEl.textContent = sessionsCount.toLocaleString();
  if (graphTitleEl) graphTitleEl.textContent = title;

  renderSavingsTimelineChart(chartLabels, chartData);
}

function renderSavingsTimelineChart(labels, data) {
  const ctx = document.getElementById('savingsTimelineChart');
  if (!ctx) return;

  if (savingsTimelineChartInstance) {
    savingsTimelineChartInstance.destroy();
  }

  savingsTimelineChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Cost Savings (₹)',
        data: data,
        backgroundColor: '#10b981',
        borderRadius: 8,
        barThickness: 28
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#f1f5f9' },
          ticks: { callback: value => '₹' + value }
        },
        x: { grid: { display: false } }
      }
    }
  });
}

// ================= POINT 1, 2, 10: SYNCHRONIZATION & STORAGE =================
function startGlobalClock() {
  function updateClock() {
    const now = new Date();
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const dateStr = now.toLocaleDateString('en-GB', options);
    const timeStr = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const dateEl = document.getElementById('global-dynamic-date');
    const timeEl = document.getElementById('global-dynamic-time');
    const dashDateEl = document.getElementById('dash-date-badge');

    if (dateEl) dateEl.textContent = dateStr;
    if (timeEl) timeEl.textContent = timeStr;
    if (dashDateEl) dashDateEl.textContent = dateStr;
  }
  updateClock();
  setInterval(updateClock, 1000);
}

function initCrossUserSync() {
  window.addEventListener('storage', (e) => {
    if (e.key === 'vf_shared_station_fleet_data' || e.key === 'vf_users_db' || e.key === 'vf_persistent_historical_savings') {
      loadSharedStationFleet();
      renderAllViews();
      if (fleetMap) updateMapMarkers();
    }
  });

  setInterval(() => {
    loadSharedStationFleet();
  }, 3500);
}

function loadSharedStationFleet() {
  const raw = localStorage.getItem('vf_shared_station_fleet_data');
  if (raw !== null) {
    stationVehicles = JSON.parse(raw);
  } else {
    stationVehicles = JSON.parse(JSON.stringify(DEMO_PRESET_VEHICLES));
    saveSharedStationFleet();
  }
}

function saveSharedStationFleet() {
  localStorage.setItem('vf_shared_station_fleet_data', JSON.stringify(stationVehicles));
}

// ================= CSV UPLOAD =================
function triggerCSVFileInput() {
  const fileInput = document.getElementById('global-csv-input');
  if (fileInput) {
    fileInput.value = '';
    fileInput.click();
  }
}

function downloadSampleCSV() {
  const headers = "vehicleId,numberPlate,model,batteryCapacity,currentSOC,targetSOC,location,departureTime,status\n";
  const rows = "EV-101,UP32-EV-7722,Tata Nexon EV Max,40.5,35,90,Hazratganj,1 hour,charging\nEV-102,UP32-EV-3311,MG ZS EV,50.3,55,85,Gomti Nagar,3.5 hours,idle\nEV-103,UP32-EV-8844,Mahindra XUV400,39.4,15,90,Charbagh,30 min,charging";
  const blob = new Blob([headers + rows], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.setAttribute('href', url);
  a.setAttribute('download', 'voltflow_sample_fleet.csv');
  a.click();
}

function handleCSVUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    const text = evt.target.result;
    const lines = text.split(/\r\n|\n/);
    let addedCount = 0;
    let duplicateErrors = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cols = line.split(',');

      if (cols.length >= 7) {
        const vId = cols[0].trim();
        const nPlate = cols[1].trim();

        const isDuplicate = stationVehicles.some(v => 
          v.vehicleId.toLowerCase() === vId.toLowerCase() || 
          v.licensePlate.toLowerCase() === nPlate.toLowerCase()
        );

        if (isDuplicate) {
          duplicateErrors.push(`${vId} (${nPlate})`);
          continue;
        }

        const soc = parseInt(cols[4]) || 30;
        const target = parseInt(cols[5]) || 90;
        const capacity = parseFloat(cols[3]) || 40.0;
        const deadline = cols[7] ? cols[7].trim() : "2 hours";

        const newVehicle = {
          vehicleId: vId,
          licensePlate: nPlate,
          model: cols[2].trim() || "EV Fleet Car",
          batteryCapacityKWh: capacity,
          currentSOC: soc,
          targetSOC: target,
          currentRangeKM: Math.round(soc * 3.3),
          status: (cols[8] && cols[8].trim()) || "queued",
          assignedStation: cols[6] ? cols[6].trim() : "Hazratganj EV Superhub",
          stationId: "CS-LKO-01",
          assignedCharger: "Queue",
          currentChargingPowerKW: 0,
          departureDeadline: deadline,
          priority: calculateAutoPriority({ currentSOC: soc, targetSOC: target, departureDeadline: deadline }),
          eta: "06:30 AM",
          startTime: "05:15 AM",
          safetyBuffer: "30 min",
          energyDeliveredKWh: 0,
          lat: 26.8467 + (Math.random() * 0.02 - 0.01),
          lng: 80.9462 + (Math.random() * 0.02 - 0.01)
        };

        stationVehicles.unshift(newVehicle);
        addedCount++;
      }
    }

    if (addedCount > 0) {
      updateChargingQueueAndChargers();
      saveSharedStationFleet();
      renderAllViews();
      if (fleetMap) updateMapMarkers();
      let msg = `Successfully imported ${addedCount} vehicles!`;
      if (duplicateErrors.length > 0) {
        msg += `\n\nBlocked duplicate vehicles:\n${duplicateErrors.join(', ')}`;
      }
      alert(msg);
    } else {
      if (duplicateErrors.length > 0) {
        alert(`Upload blocked: Vehicles already exist in the station fleet:\n${duplicateErrors.join(', ')}`);
      } else {
        alert('Invalid CSV format. Please use the required columns or download Sample CSV.');
      }
    }
  };
  reader.readAsText(file);
}

// ================= IN-PLACE OPTIMIZATION =================
function triggerSmartOptimization() {
  runPipeline([
    { text: "Analyzing Battery SOC & Required Energy Deficit...", pct: 15 },
    { text: "Calculating Automatic Urgency Scores & Departure Deadlines...", pct: 35 },
    { text: "Evaluating Multi-Station Tariffs & Off-Peak Shift Savings...", pct: 55 },
    { text: "Enforcing 150 kW Grid Substation Capacity Limits...", pct: 75 },
    { text: "Dispatching Optimal Power Allocations to Chargers...", pct: 100 }
  ], () => {
    updateChargingQueueAndChargers();
    saveSharedStationFleet();
    renderAllViews();
  });
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
  ], () => {
    updateChargingQueueAndChargers();
    saveSharedStationFleet();
    renderAllViews();
  });
}

function runPipeline(steps, onComplete) {
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
        if (onComplete) onComplete();
      }, 350);
    }
  }, 450);
}

// ================= POINT 1 & 2: VEHICLE ADD & DELETE HANDLERS =================
function openAddVehicleModal() {
  document.getElementById('add-vehicle-modal').classList.remove('hidden');
}

function closeAddVehicleModal() {
  document.getElementById('add-vehicle-modal').classList.add('hidden');
}

function handleCreateVehicle(e) {
  e.preventDefault();
  const vId = document.getElementById('new-vehicle-id').value.trim();
  const nPlate = document.getElementById('new-license-plate').value.trim();

  const isDuplicate = stationVehicles.some(v => 
    v.vehicleId.toLowerCase() === vId.toLowerCase() || 
    v.licensePlate.toLowerCase() === nPlate.toLowerCase()
  );

  if (isDuplicate) {
    alert(`Vehicle already registered at this station (ID: ${vId} or Plate: ${nPlate}). Duplicate vehicles are blocked.`);
    return;
  }

  const soc = parseInt(document.getElementById('new-soc').value);
  const target = parseInt(document.getElementById('new-target-soc').value);
  const deadline = document.getElementById('new-deadline').value.trim();
  const stationId = document.getElementById('new-station').value;
  const station = fleetStations.find(s => s.id === stationId);

  const autoPriority = calculateAutoPriority({ currentSOC: soc, targetSOC: target, departureDeadline: deadline });

  const newEV = {
    vehicleId: vId,
    licensePlate: nPlate,
    model: document.getElementById('new-model').value.trim(),
    batteryCapacityKWh: parseFloat(document.getElementById('new-capacity').value),
    currentSOC: soc,
    targetSOC: target,
    currentRangeKM: Math.round(soc * 3.3),
    status: document.getElementById('new-status').value,
    assignedStation: station ? station.name : "Hazratganj EV Superhub",
    stationId: stationId,
    assignedCharger: "Auto Queue",
    currentChargingPowerKW: 0,
    departureDeadline: deadline,
    priority: autoPriority,
    eta: "06:15 AM",
    startTime: "05:00 AM",
    safetyBuffer: "30 min",
    energyDeliveredKWh: 0,
    lat: station ? station.lat + (Math.random() * 0.005) : 26.8467,
    lng: station ? station.lng + (Math.random() * 0.005) : 80.9462
  };

  stationVehicles.unshift(newEV);
  updateChargingQueueAndChargers();
  saveSharedStationFleet();
  closeAddVehicleModal();
  document.getElementById('add-vehicle-form').reset();
  renderAllViews();
  if (fleetMap) updateMapMarkers();
  alert(`Vehicle ${newEV.vehicleId} registered successfully! Auto-Priority calculated: ${autoPriority}`);
}

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

  // Point 2: Remove vehicle from fleet state completely
  stationVehicles = stationVehicles.filter(v => v.vehicleId !== vehicleToDeleteId);
  
  // Clean up all active charging and power allocations
  updateChargingQueueAndChargers();
  saveSharedStationFleet();
  closeDeleteModal();
  renderAllViews();
  if (fleetMap) updateMapMarkers();
}

// ================= RENDER VIEWS =================
function renderAllViews() {
  updateDashboardKPIs();
  renderOrchestrationTable();
  renderVehiclesTable(stationVehicles);
  renderStationsGrid();
  renderStationComparisonTable();
  renderSchedulesTable();
  renderAlerts();
  renderUsersTable();
  updateChargingQueueAndChargers();
  updateSavingsAnalyticsView();
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

function renderVehiclesTable(vehicles) {
  const tbody = document.getElementById('vehicles-table-body');
  if (!tbody) return;

  if (vehicles.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="py-8 text-center text-slate-400 font-medium">Your fleet is empty. Click "+ Add Vehicle" or "Upload CSV" to begin.</td></tr>`;
    return;
  }

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

function renderSchedulesTable() {
  const tbody = document.getElementById('schedules-table-body');
  if (!tbody) return;

  if (stationVehicles.length === 0) {
    tbody.innerHTML = `<tr><td colspan="11" class="py-8 text-center text-slate-400 font-medium">No charging schedules generated. Add fleet vehicles to view.</td></tr>`;
    return;
  }

  tbody.innerHTML = stationVehicles.map(v => `
    <tr class="hover:bg-slate-50">
      <td class="py-3 px-4 font-bold text-slate-900">${v.vehicleId}</td>
      <td class="py-3 px-4 font-bold">${v.currentSOC}%</td>
      <td class="py-3 px-4 font-bold text-blue-600">${v.targetSOC}%</td>
      <td class="py-3 px-4 text-slate-600">${v.startTime || "05:00 AM"}</td>
      <td class="py-3 px-4 text-slate-800 font-semibold">${v.eta}</td>
      <td class="py-3 px-4 text-rose-600 font-semibold">${v.departureDeadline}</td>
      <td class="py-3 px-4 text-emerald-700 font-bold bg-emerald-50/50">${v.safetyBuffer || "30 min"}</td>
      <td class="py-3 px-4">${getPriorityBadge(v.priority)}</td>
      <td class="py-3 px-4 text-slate-700">${v.assignedStation}</td>
      <td class="py-3 px-4 font-bold text-blue-600">${v.currentChargingPowerKW} kW</td>
      <td class="py-3 px-4">${getStatusBadge(v.status)}</td>
    </tr>
  `).join('');
}

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

function renderAlerts() {
  const container = document.getElementById('panel-alerts');
  if (!container) return;

  container.innerHTML = DEMO_PRESET_ALERTS.map(a => `
    <div class="bg-white p-4 sm:p-5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center space-x-2">
          <h4 class="font-bold text-slate-900 text-sm">${a.title}</h4>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${a.severity === 'critical' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'}">${a.severity.toUpperCase()}</span>
        </div>
        <p class="text-xs text-slate-600 mt-1">${a.message}</p>
        <div class="mt-2 text-xs font-semibold text-slate-700">
          Action: <span class="text-blue-600 font-bold">"${a.actionTitle}"</span> • Target: <span class="font-bold">${a.target}</span> • Power: <span class="font-bold text-emerald-600">${a.power}</span>
        </div>
      </div>
      <button onclick="alert('Optimal charger configuration applied.')" class="touch-btn px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl whitespace-nowrap shadow-sm">
        APPLY RECOMMENDATION
      </button>
    </div>
  `).join('');
  lucide.createIcons();
}

function renderUsersTable() {
  const users = JSON.parse(localStorage.getItem('vf_users_db') || '[]');
  const tbody = document.getElementById('users-table-body');
  const onlineCountEl = document.getElementById('users-online-count');
  const totalCountEl = document.getElementById('users-total-count');
  const badgeEl = document.getElementById('sidebar-online-users-badge');

  if (totalCountEl) totalCountEl.textContent = `Total: ${users.length} Users`;

  const currentEmail = currentUser ? currentUser.email.toLowerCase() : "";
  let onlineCount = 0;

  if (tbody) {
    tbody.innerHTML = users.map(u => {
      const isOnline = (u.email.toLowerCase() === currentEmail);
      if (isOnline) onlineCount++;
      return `
        <tr class="hover:bg-slate-50 transition-colors">
          <td class="py-3 px-4 font-bold text-slate-900">${u.name}</td>
          <td class="py-3 px-4 text-slate-500 font-mono text-[11px]">${u.email}</td>
          <td class="py-3 px-4">
            <span class="px-2 py-0.5 rounded text-[10px] font-bold ${u.role === 'admin' || u.role === 'Admin' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'}">
              ${(u.role || 'Operator').toUpperCase()}
            </span>
          </td>
          <td class="py-3 px-4 text-slate-700 font-semibold">${u.fleetName || "Hazratganj EV Superhub"}</td>
          <td class="py-3 px-4 text-slate-500">${isOnline ? 'Just now' : '15 min ago'}</td>
          <td class="py-3 px-4 text-right">
            ${isOnline 
              ? '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center justify-end w-fit ml-auto"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>Online</span>'
              : '<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">⚪ Offline</span>'
            }
          </td>
        </tr>
      `;
    }).join('');
  }

  if (onlineCountEl) onlineCountEl.textContent = onlineCount;
  if (badgeEl) badgeEl.textContent = `${onlineCount} Online`;
}

// ================= MODAL =================
function openVehicleModal(id) {
  currentSelectedModalVehicleId = id;
  const v = stationVehicles.find(item => item.vehicleId === id);
  if (!v) return;

  const costData = calculateChargingCost(v);

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
  document.getElementById('modal-energy-delivered').textContent = `${v.energyDeliveredKWh || 12.4} kWh`;
  document.getElementById('modal-charging-saving').textContent = costData.isComplete ? "Full Battery" : `+₹${costData.estimatedSaving}`;

  document.getElementById('vehicle-details-modal').classList.remove('hidden');
  lucide.createIcons();
}

function updateVehicleModalDynamic(id) {
  const v = stationVehicles.find(item => item.vehicleId === id);
  if (!v) return;
  const costData = calculateChargingCost(v);

  const socText = document.getElementById('modal-soc-text');
  const socBar = document.getElementById('modal-soc-bar');
  const range = document.getElementById('modal-range');
  const power = document.getElementById('modal-power');
  const eta = document.getElementById('modal-eta');
  const energy = document.getElementById('modal-energy-delivered');
  const saving = document.getElementById('modal-charging-saving');

  if (socText) socText.textContent = `${v.currentSOC}%`;
  if (socBar) socBar.style.width = `${v.currentSOC}%`;
  if (range) range.textContent = `${v.currentRangeKM} km`;
  if (power) power.textContent = `${v.currentChargingPowerKW} kW`;
  if (eta) eta.textContent = v.eta;
  if (energy) energy.textContent = `${v.energyDeliveredKWh || 12.4} kWh`;
  if (saving) saving.textContent = costData.isComplete ? "Full Battery" : `+₹${costData.estimatedSaving}`;
}

function closeVehicleModal() {
  currentSelectedModalVehicleId = null;
  document.getElementById('vehicle-details-modal').classList.add('hidden');
}

function filterVehicles() {
  const statusFilter = document.getElementById('vehicle-filter-status').value;
  const search = document.getElementById('vehicle-search').value.toLowerCase();

  const filtered = stationVehicles.filter(v => {
    const matchesStatus = (statusFilter === 'all') || (v.status === statusFilter);
    const matchesSearch = v.vehicleId.toLowerCase().includes(search) || v.licensePlate.toLowerCase().includes(search) || v.model.toLowerCase().includes(search);
    return matchesStatus && matchesSearch;
  });

  renderVehiclesTable(filtered);
}

// ================= AUTH SESSION =================
function initUsersDatabase() {
  if (!localStorage.getItem('vf_users_db')) {
    const initialUsers = [
      {
        name: "Mayank Tiwari",
        email: DEMO_ACCOUNT_EMAIL,
        password: "adminpassword123",
        role: "Admin",
        fleetName: "Lucknow Central Cluster"
      },
      {
        name: "Rahul Verma",
        email: "rahul.operator@voltflow.io",
        password: "password123",
        role: "Operator",
        fleetName: "Hazratganj EV Superhub"
      },
      {
        name: "Amit Sharma",
        email: "amit.manager@voltflow.io",
        password: "password123",
        role: "Fleet Manager",
        fleetName: "Gomti Nagar Cyber Tower"
      }
    ];
    localStorage.setItem('vf_users_db', JSON.stringify(initialUsers));
  }
}

function checkAuthSession() {
  const session = localStorage.getItem('voltflow_session_user');
  const authModal = document.getElementById('auth-modal-container');

  if (session) {
    currentUser = JSON.parse(session);
    authModal.classList.add('hidden');
    loadSharedStationFleet();
    updateUserInterfaceHeaders();
    renderAllViews();
    initMap();
    initAllCharts();
  } else {
    currentUser = null;
    authModal.classList.remove('hidden');
  }
}

function toggleAuthView(view) {
  if (view === 'signup') {
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('signup-view').classList.remove('hidden');
  } else {
    document.getElementById('signup-view').classList.add('hidden');
    document.getElementById('login-view').classList.remove('hidden');
  }
  lucide.createIcons();
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const password = document.getElementById('login-password').value;

  const users = JSON.parse(localStorage.getItem('vf_users_db') || '[]');
  const matchedUser = users.find(u => u.email.toLowerCase() === email && u.password === password);

  if (matchedUser) {
    currentUser = matchedUser;
    localStorage.setItem('voltflow_session_user', JSON.stringify(matchedUser));
    document.getElementById('auth-modal-container').classList.add('hidden');
    loadSharedStationFleet();
    updateUserInterfaceHeaders();
    renderAllViews();
    initMap();
    initAllCharts();
  } else {
    alert('Invalid credentials. Check email & password or create an account.');
  }
}

function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim().toLowerCase();
  const role = document.getElementById('signup-role').value;
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-confirm-password').value;

  if (password !== confirmPassword) {
    alert('Passwords do not match. Please re-enter.');
    return;
  }

  const users = JSON.parse(localStorage.getItem('vf_users_db') || '[]');
  if (users.some(u => u.email.toLowerCase() === email)) {
    alert('An account with this email already exists. Please login.');
    return;
  }

  const newUser = {
    name: name,
    email: email,
    password: password,
    role: role,
    fleetName: "Lucknow Station Node"
  };

  users.push(newUser);
  localStorage.setItem('vf_users_db', JSON.stringify(users));

  currentUser = newUser;
  localStorage.setItem('voltflow_session_user', JSON.stringify(newUser));
  document.getElementById('auth-modal-container').classList.add('hidden');
  
  loadSharedStationFleet();
  updateUserInterfaceHeaders();
  renderAllViews();
  initMap();
  initAllCharts();
}

function handleLogout() {
  localStorage.removeItem('voltflow_session_user');
  currentUser = null;
  document.getElementById('login-form').reset();
  document.getElementById('signup-form').reset();
  toggleAuthView('login');
  document.getElementById('auth-modal-container').classList.remove('hidden');
  renderUsersTable();
}

function updateUserInterfaceHeaders() {
  if (!currentUser) return;
  const userNameEl = document.getElementById('sidebar-user-name');
  const userEmailEl = document.getElementById('sidebar-user-email');
  const userInitialsEl = document.getElementById('sidebar-avatar-initials');

  if (userNameEl) userNameEl.textContent = currentUser.name;
  if (userEmailEl) userEmailEl.textContent = currentUser.email;
  if (userInitialsEl) {
    const initials = currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase();
    userInitialsEl.textContent = initials.substring(0, 2) || 'VF';
  }
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
    analytics: 'Savings & Analytics',
    alerts: 'Fleet Alerts',
    reports: 'Reports & Logs',
    users: 'Users & Roles Management',
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

// Leaflet Map
function initMap() {
  const mapElement = document.getElementById('fleet-map');
  if (!mapElement || fleetMap) return;

  fleetMap = L.map('fleet-map').setView([26.8467, 80.9462], 12);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '© OpenStreetMap'
  }).addTo(fleetMap);

  updateMapMarkers();
}

function updateMapMarkers() {
  if (!fleetMap) return;

  fleetMap.eachLayer((layer) => {
    if (layer instanceof L.CircleMarker) {
      fleetMap.removeLayer(layer);
    }
  });

  fleetStations.forEach(s => {
    L.circleMarker([s.lat, s.lng], {
      radius: 9,
      fillColor: '#2563eb',
      color: '#ffffff',
      weight: 2,
      fillOpacity: 0.9
    }).addTo(fleetMap).bindPopup(`<b>${s.name}</b><br>Load: ${s.currentLoadKW}/${s.totalCapacityKW} kW<br>Rate: ₹${s.currentPrice}/kWh`);
  });

  stationVehicles.forEach(v => {
    L.circleMarker([v.lat, v.lng], {
      radius: 6,
      fillColor: v.priority === 'Critical' ? '#ef4444' : (v.priority === 'High' ? '#f59e0b' : '#10b981'),
      color: '#ffffff',
      weight: 2,
      fillOpacity: 0.9
    }).addTo(fleetMap).bindPopup(`<b>${v.vehicleId} (${v.licensePlate})</b><br>SOC: ${v.currentSOC}%<br>Status: ${v.status}<br>Priority: ${v.priority}`);
  });
}

// Charts
function initAllCharts() {
  const ctx1 = document.getElementById('dashboardLiveChart');
  if (ctx1 && !dashboardLiveChartInstance) {
    dashboardLiveChartInstance = new Chart(ctx1, {
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
  if (ctx2 && !dashboardEnergyChartInstance) {
    dashboardEnergyChartInstance = new Chart(ctx2, {
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
  if (ctx3 && !analyticsComparisonChartInstance) {
    analyticsComparisonChartInstance = new Chart(ctx3, {
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

// App Initialization
document.addEventListener('DOMContentLoaded', () => {
  initUsersDatabase();
  startGlobalClock();
  initCrossUserSync();
  checkAuthSession();
  lucide.createIcons();
  startRealChargingSimulation();
});
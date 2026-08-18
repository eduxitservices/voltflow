let activeVehicle = null;
let allVehicles = [];
let allStations = [];
let liveSimTimer = null;

// ================= AUTH MANAGEMENT =================
function checkAuth() {
  const token = localStorage.getItem('voltflow_token');
  const overlay = document.getElementById('authOverlay');
  const user = JSON.parse(localStorage.getItem('voltflow_user') || '{}');

  if (!token) {
    if (overlay) {
      overlay.style.display = 'flex';
      overlay.classList.remove('hidden');
    }
  } else {
    if (overlay) {
      overlay.style.display = 'none';
      overlay.classList.add('hidden');
    }
    if (user.name) {
      const nameEl = document.getElementById('navUserName');
      const profileNameEl = document.getElementById('userProfileName');
      const profileRoleEl = document.getElementById('userProfileRole');
      const avatarEl = document.getElementById('avatarInitials');

      if (nameEl) nameEl.innerText = user.name.split(' ')[0];
      if (profileNameEl) profileNameEl.innerText = user.name;
      if (profileRoleEl) profileRoleEl.innerText = user.role || 'Super Admin';
      if (avatarEl) avatarEl.innerText = user.name.split(' ').map(n=>n[0]).join('').substring(0,2);
    }
  }
}

function switchAuthTab(type) {
  const loginBtn = document.getElementById('tabLoginBtn');
  const regBtn = document.getElementById('tabRegisterBtn');
  const loginForm = document.getElementById('loginForm');
  const regForm = document.getElementById('registerForm');

  if (type === 'login') {
    if (loginBtn) loginBtn.classList.add('active');
    if (regBtn) regBtn.classList.remove('active');
    if (loginForm) loginForm.style.display = 'block';
    if (regForm) regForm.style.display = 'none';
  } else {
    if (regBtn) regBtn.classList.add('active');
    if (loginBtn) loginBtn.classList.remove('active');
    if (regForm) regForm.style.display = 'block';
    if (loginForm) loginForm.style.display = 'none';
  }
}

// Global Modal Manager
function openModal(htmlContent) {
  const modal = document.getElementById('globalModal');
  const windowEl = document.getElementById('modalWindowContent');
  windowEl.innerHTML = htmlContent;
  modal.classList.add('open');
}

function closeModal() {
  document.getElementById('globalModal').classList.remove('open');
}

// ================= LIVE TELEMETRY SIMULATION LOOP (Increments Charging Vehicles) =================
function startLiveTelemetryLoop() {
  if (liveSimTimer) clearInterval(liveSimTimer);

  liveSimTimer = setInterval(() => {
    let hasChanges = false;

    allVehicles.forEach(v => {
      if (v.status === 'Charging' && v.currentSOC < 100) {
        hasChanges = true;
        // Increment SOC by +0.3% to +0.5% every tick
        v.currentSOC = Number(Math.min(100, v.currentSOC + 0.4).toFixed(1));
        v.currentRange = Math.round((v.currentSOC / 100) * (v.batteryCapacity || 40.5) * 5.5);

        // Update Right Panel live if currently viewing this vehicle
        if (activeVehicle && activeVehicle._id === v._id) {
          const docSOC = document.getElementById('dockSOC');
          const docFill = document.getElementById('dockSOCFill');
          const docRange = document.getElementById('dockRange');

          if (docSOC) docSOC.innerText = `${Math.round(v.currentSOC)}%`;
          if (docFill) docFill.style.width = `${v.currentSOC}%`;
          if (docRange) docRange.innerText = `${v.currentRange} km`;
        }
      }
    });

    // If on vehicles list page, update table cells in place
    const tableRows = document.querySelectorAll('#vehiclesTable tbody tr');
    if (tableRows.length && hasChanges) {
      allVehicles.forEach((v, idx) => {
        const row = tableRows[idx];
        if (row && v.status === 'Charging') {
          const socSpan = row.querySelector('td:nth-child(4) span b');
          const socBar = row.querySelector('td:nth-child(4) div div');
          const rangeCell = row.querySelector('td:nth-child(5)');

          if (socSpan) socSpan.innerText = `${Math.round(v.currentSOC)}%`;
          if (socBar) socBar.style.width = `${v.currentSOC}%`;
          if (rangeCell) rangeCell.innerText = `${v.currentRange} km`;
        }
      });
    }
  }, 2500);
}

// ================= 1. DASHBOARD PAGE =================
async function loadDashboard() {
  const viewport = document.getElementById('viewport');
  const rightPanel = document.getElementById('rightDetailsPanel');
  if (window.innerWidth > 1100 && rightPanel) rightPanel.style.display = 'flex';
  
  if (viewport) {
    viewport.innerHTML = '<div style="text-align:center; padding: 40px; color:#64748B;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i><br><br>Syncing Lucknow EV telemetry...</div>';
  }

  try {
    const [overviewRes, vehiclesRes, stationsRes] = await Promise.all([
      api.getOverview(),
      api.getVehicles(),
      api.getStations()
    ]);

    const kpis = overviewRes.data.kpis;
    allVehicles = vehiclesRes.data || [];
    allStations = stationsRes.data || [];
    activeVehicle = allVehicles[0] || null;
    if (activeVehicle) window.activeDrawerVehicleId = activeVehicle._id;

    viewport.innerHTML = `
      <div class="kpi-grid">
        <div class="kpi-card">
          <div>
            <div class="kpi-label">Total Vehicles</div>
            <div class="kpi-number">${kpis.totalVehicles}</div>
            <div class="kpi-subtext green"><i class="fa-solid fa-arrow-up"></i> 3 from yesterday</div>
          </div>
          <div class="kpi-icon-pill" style="background: #EFF6FF; color: #2563EB;"><i class="fa-solid fa-car"></i></div>
        </div>

        <div class="kpi-card">
          <div>
            <div class="kpi-label">Charging Now</div>
            <div class="kpi-number">${kpis.chargingNow}</div>
            <div class="kpi-subtext muted">${Math.round((kpis.chargingNow / (kpis.totalVehicles || 1)) * 100)}% of fleet</div>
          </div>
          <div class="kpi-icon-pill pulse-charging" style="background: #ECFDF5; color: #10B981;"><i class="fa-solid fa-bolt"></i></div>
        </div>

        <div class="kpi-card">
          <div>
            <div class="kpi-label">Scheduled</div>
            <div class="kpi-number">${kpis.scheduled}</div>
            <div class="kpi-subtext muted">${Math.round((kpis.scheduled / (kpis.totalVehicles || 1)) * 100)}% of fleet</div>
          </div>
          <div class="kpi-icon-pill" style="background: #FFFBEB; color: #F59E0B;"><i class="fa-regular fa-calendar-check"></i></div>
        </div>

        <div class="kpi-card">
          <div>
            <div class="kpi-label">Total SoC (Avg)</div>
            <div class="kpi-number">${kpis.avgSOC}%</div>
            <div class="kpi-subtext green"><i class="fa-solid fa-arrow-up"></i> 5% from yesterday</div>
          </div>
          <div class="kpi-icon-pill" style="background: #EFF6FF; color: #2563EB; font-size:14px; font-weight:700;">9%</div>
        </div>
      </div>

      <div class="dash-middle-grid">
        <div class="fleet-map-container">
          <div class="map-card-header">
            <span>Fleet Overview (Lucknow Hub)</span>
            <div class="map-toolbar-stats">
              <span style="color:#10B981;"><i class="fa-solid fa-bolt"></i> ${kpis.chargingNow} Charging</span>
              <span style="color:#F59E0B;"><i class="fa-regular fa-clock"></i> ${kpis.scheduled} Sched</span>
              <span style="color:#64748B;"><i class="fa-solid fa-car"></i> ${kpis.idleVehicles} Idle</span>
            </div>
          </div>
          <div id="fleetMap" class="map-viewport"></div>
        </div>

        <div class="right-charts-stack">
          <div class="chart-card">
            <div class="chart-header">
              <div class="chart-title">Charging Load <span style="font-size:0.8rem; font-weight:400; color:#64748B;">(Real-time)</span></div>
              <div class="live-pill">Live <i class="fa-solid fa-chevron-down" style="font-size:9px;"></i></div>
            </div>
            <div class="canvas-wrapper">
              <canvas id="chargingLoadChart"></canvas>
            </div>
          </div>

          <div class="chart-card">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-size:0.8rem; color:#64748B; font-weight:600;">Energy Consumed Today</div>
                <div style="font-size:1.4rem; font-weight:700; margin: 4px 0;">${kpis.energyConsumedToday} kWh</div>
                <div style="font-size:0.75rem; color:#10B981; font-weight:600;"><i class="fa-solid fa-arrow-up"></i> 8% from yesterday</div>
              </div>
              <div style="width: 140px; height: 60px;">
                <canvas id="energySparkline"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      initMap(allVehicles, allStations);
      renderDashboardCharts();
      renderRightPanel(activeVehicle);
      startLiveTelemetryLoop();
    }, 50);

  } catch (err) {
    if (viewport) {
      viewport.innerHTML = '<div style="color:red; text-align:center; padding: 30px;">Error fetching fleet data from MongoDB.</div>';
    }
  }
}

// ================= FULL DIAGNOSTICS MODAL =================
function showFullDiagnostics(vehicleId) {
  const v = allVehicles.find(x => x._id === vehicleId) || activeVehicle;
  if (!v) return;

  const temp = (28.5 + (Math.random() * 4)).toFixed(1);
  const health = 97.4;
  const voltage = 384.2;
  const current = v.status === 'Charging' ? 57.2 : 0.0;
  const maxTempCell = 'Cell #18 (31.2°C)';
  const minTempCell = 'Cell #04 (27.8°C)';

  openModal(`
    <div class="modal-header">
      <div style="display:flex; align-items:center; gap:10px;">
        <div style="width:36px; height:36px; background:#EFF6FF; color:#2563EB; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:18px;">
          <i class="fa-solid fa-microchip"></i>
        </div>
        <div>
          <h3 style="font-size:1.15rem; font-weight:700;">${v.registrationNumber} — BMS Telemetry Diagnostics</h3>
          <div style="font-size:0.75rem; color:#64748B;">Battery Management System Live Inspection (${v.brand} ${v.model})</div>
        </div>
      </div>
      <i class="fa-solid fa-xmark" style="cursor:pointer; font-size:18px; color:#64748B;" onclick="closeModal()"></i>
    </div>

    <!-- Top Diagnostic KPIs -->
    <div class="diag-grid">
      <div class="diag-card">
        <div class="title"><i class="fa-solid fa-heart-pulse"></i> State of Health (SOH)</div>
        <div class="value" style="color:#10B981;">${health}%</div>
      </div>
      <div class="diag-card">
        <div class="title"><i class="fa-solid fa-temperature-half"></i> Pack Temperature</div>
        <div class="value">${temp} °C</div>
      </div>
      <div class="diag-card">
        <div class="title"><i class="fa-solid fa-bolt"></i> Pack Voltage</div>
        <div class="value">${voltage} V</div>
      </div>
      <div class="diag-card">
        <div class="title"><i class="fa-solid fa-plug-circle-bolt"></i> Live Current Draw</div>
        <div class="value">${current} A</div>
      </div>
      <div class="diag-card">
        <div class="title"><i class="fa-solid fa-battery-full"></i> Usable Capacity</div>
        <div class="value">${(v.batteryCapacity * 0.95).toFixed(1)} kWh</div>
      </div>
      <div class="diag-card">
        <div class="title"><i class="fa-solid fa-shield-halved"></i> Thermal Delta</div>
        <div class="value" style="color:#2563EB;">1.8 °C (Normal)</div>
      </div>
    </div>

    <!-- Cell Balance Overview -->
    <div class="chart-card" style="margin-bottom:16px; padding:14px;">
      <div style="font-size:0.85rem; font-weight:700; margin-bottom:8px; display:flex; justify-content:space-between;">
        <span>Cell Voltages Balance Matrix (96 Cells)</span>
        <span style="color:#10B981; font-size:0.75rem;"><i class="fa-solid fa-circle-check"></i> Balanced (Max Delta: 0.012V)</span>
      </div>
      <div style="display:grid; grid-template-columns:repeat(8, 1fr); gap:4px; margin-top:10px;">
        ${Array.from({length: 24}).map((_, i) => `
          <div style="background:#EFF6FF; border:1px solid #BFDBFE; border-radius:4px; padding:4px 2px; text-align:center; font-size:0.65rem; color:#1E40AF;">
            C${i+1}<br><b>3.99V</b>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Diagnostic Alerts / Status Logs -->
    <div class="chart-card" style="padding:14px;">
      <div style="font-size:0.85rem; font-weight:700; margin-bottom:8px;">BMS Diagnostic Log Feed</div>
      <div style="font-size:0.75rem; color:#334155; line-height:1.6;">
        <div><i class="fa-solid fa-check" style="color:#10B981;"></i> [OK] Insulation Resistance: <b>500 kΩ/V</b> (Pass)</div>
        <div><i class="fa-solid fa-check" style="color:#10B981;"></i> [OK] Contactor Main Positive/Negative: <b>Closed & Latched</b></div>
        <div><i class="fa-solid fa-check" style="color:#10B981;"></i> [OK] Max Cell Temp: <b>${maxTempCell}</b> | Min Cell Temp: <b>${minTempCell}</b></div>
        <div><i class="fa-solid fa-info-circle" style="color:#2563EB;"></i> [INFO] Active thermal cooling cycle engaged at Hazratganj Hub.</div>
      </div>
    </div>

    <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:18px;">
      <button class="btn-action-secondary" onclick="alert('Full CAN-bus telemetry dump exported.')"><i class="fa-solid fa-download"></i> Export Telemetry Log</button>
      <button class="btn-action-primary" onclick="closeModal()">Close Diagnostics</button>
    </div>
  `);
}

// ================= VEHICLES PAGE =================
async function loadVehiclesPage() {
  const viewport = document.getElementById('viewport');
  document.getElementById('rightDetailsPanel').style.display = 'none';

  const res = await api.getVehicles();
  allVehicles = res.data || [];

  viewport.innerHTML = `
    <div class="page-toolbar">
      <div>
        <h3 style="font-size:1.2rem; font-weight:700;">EV Fleet Vehicles</h3>
        <p style="color:#64748B; font-size:0.8rem;">Manage EV units, current battery SOC, and charging status in Lucknow</p>
      </div>
      <div class="toolbar-actions">
        <input type="text" placeholder="Search plate or model..." class="search-input-box" id="vehicleSearchInput" oninput="filterVehicleTable()" />
        <button class="btn-action-secondary" onclick="openCSVUploadModal()"><i class="fa-solid fa-file-csv"></i> Upload CSV</button>
        <button class="btn-action-primary" onclick="openAddVehicleModal()"><i class="fa-solid fa-plus"></i> Add Vehicle</button>
      </div>
    </div>

    <div class="data-table-container">
      <table class="data-table" id="vehiclesTable">
        <thead>
          <tr>
            <th>Vehicle ID</th>
            <th>Plate Number</th>
            <th>Brand / Model</th>
            <th>Battery SOC</th>
            <th>Range</th>
            <th>Location</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${allVehicles.map(v => `
            <tr>
              <td><b>${v.vehicleId}</b></td>
              <td>${v.registrationNumber}</td>
              <td>${v.brand} ${v.model}</td>
              <td>
                <div style="display:flex; align-items:center; gap:8px;">
                  <span><b>${Math.round(v.currentSOC)}%</b></span>
                  <div style="width:50px; height:6px; background:#E2E8F0; border-radius:4px; overflow:hidden;">
                    <div style="width:${v.currentSOC}%; height:100%; background:${v.currentSOC < 20 ? '#EF4444' : (v.currentSOC < 50 ? '#F59E0B' : '#10B981')};"></div>
                  </div>
                </div>
              </td>
              <td>${v.currentRange} km</td>
              <td>${v.location ? v.location.address : 'Lucknow'}</td>
              <td>
                <span style="padding:3px 8px; border-radius:6px; font-size:0.75rem; font-weight:700; background:${v.status === 'Charging' ? '#ECFDF5' : (v.status === 'Scheduled' ? '#FFFBEB' : '#F1F5F9')}; color:${v.status === 'Charging' ? '#10B981' : (v.status === 'Scheduled' ? '#F59E0B' : '#64748B')};">
                  ${v.status}
                </span>
              </td>
              <td>
                <button style="border:none; background:none; cursor:pointer; color:#2563EB; font-weight:600; margin-right:8px;" onclick="viewVehicleOnDrawer('${v._id}')"><i class="fa-solid fa-eye"></i></button>
                <button style="border:none; background:none; cursor:pointer; color:#10B981; font-weight:600; margin-right:8px;" title="Diagnostics" onclick="showFullDiagnostics('${v._id}')"><i class="fa-solid fa-microchip"></i></button>
                <button style="border:none; background:none; cursor:pointer; color:#EF4444;" onclick="deleteVehicleItem('${v._id}')"><i class="fa-solid fa-trash"></i></button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  startLiveTelemetryLoop();
}

function filterVehicleTable() {
  const query = document.getElementById('vehicleSearchInput').value.toLowerCase();
  const rows = document.querySelectorAll('#vehiclesTable tbody tr');
  rows.forEach(r => {
    r.style.display = r.innerText.toLowerCase().includes(query) ? '' : 'none';
  });
}

function openAddVehicleModal() {
  openModal(`
    <div class="modal-header">
      <h3>Add New EV Vehicle</h3>
      <i class="fa-solid fa-xmark" style="cursor:pointer;" onclick="closeModal()"></i>
    </div>
    <form id="addVehicleForm" onsubmit="submitNewVehicle(event)">
      <div class="form-group">
        <label>Registration Plate (e.g. UP32 XY 9988)</label>
        <input type="text" id="mvPlate" required placeholder="UP32 XY 9988" />
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div class="form-group">
          <label>Brand</label>
          <input type="text" id="mvBrand" required value="Tata" />
        </div>
        <div class="form-group">
          <label>Model</label>
          <input type="text" id="mvModel" required value="Nexon EV" />
        </div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div class="form-group">
          <label>Battery Capacity (kWh)</label>
          <input type="number" id="mvCapacity" required value="40.5" />
        </div>
        <div class="form-group">
          <label>Initial SOC (%)</label>
          <input type="number" id="mvSOC" required value="75" min="1" max="100" />
        </div>
      </div>
      <div class="form-group">
        <label>Lucknow Area Location</label>
        <input type="text" id="mvLocation" required value="Hazratganj, Lucknow" />
      </div>
      <button type="submit" class="btn-primary" style="margin-top:10px;">Register Vehicle in Database</button>
    </form>
  `);
}

async function submitNewVehicle(e) {
  e.preventDefault();
  const regNumber = document.getElementById('mvPlate').value;
  const brand = document.getElementById('mvBrand').value;
  const model = document.getElementById('mvModel').value;
  const cap = Number(document.getElementById('mvCapacity').value);
  const soc = Number(document.getElementById('mvSOC').value);
  const loc = document.getElementById('mvLocation').value;

  const payload = {
    vehicleId: `VF-UP-${Date.now().toString().slice(-4)}`,
    registrationNumber: regNumber,
    brand,
    model,
    batteryCapacity: cap,
    currentSOC: soc,
    currentRange: Math.round((soc / 100) * cap * 5.5),
    location: { lat: 26.8467 + (Math.random() * 0.05 - 0.025), lng: 80.9462 + (Math.random() * 0.05 - 0.025), address: loc },
    status: 'Idle',
    priorityLevel: 'Normal'
  };

  const res = await fetch('/api/vehicles', {
    method: 'POST',
    headers: api.headers(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (data.success) {
    closeModal();
    loadVehiclesPage();
  } else {
    alert(data.message || 'Error registering vehicle');
  }
}

// CSV Bulk Upload
function openCSVUploadModal() {
  openModal(`
    <div class="modal-header">
      <h3>Bulk Vehicle CSV Upload</h3>
      <i class="fa-solid fa-xmark" style="cursor:pointer;" onclick="closeModal()"></i>
    </div>
    <p style="font-size:0.8rem; color:#64748B; margin-bottom:12px;">Upload CSV with columns: <code>registrationNumber, brand, model, batteryCapacity, currentSOC, location</code></p>
    
    <div class="csv-drop-zone" onclick="document.getElementById('csvFileInput').click()">
      <i class="fa-solid fa-cloud-arrow-up" style="font-size:32px; color:#2563EB; margin-bottom:8px;"></i>
      <div style="font-weight:600; font-size:0.9rem;">Click or Drag & Drop CSV file here</div>
      <div style="font-size:0.75rem; color:#64748B;" id="csvFileNameDisplay">Accepts .csv files</div>
    </div>
    <input type="file" id="csvFileInput" accept=".csv" style="display:none;" onchange="handleCSVFileSelected(event)" />

    <button class="btn-primary" id="btnUploadParsedCSV" disabled onclick="executeBulkCSVImport()">Upload Fleet to Database</button>
  `);
}

let parsedCSVData = [];

function handleCSVFileSelected(event) {
  const file = event.target.files[0];
  if (!file) return;

  document.getElementById('csvFileNameDisplay').innerText = file.name;
  const reader = new FileReader();

  reader.onload = function(e) {
    const text = e.target.result;
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    if (lines.length < 2) return alert('Invalid CSV file.');

    const headers = lines[0].split(',').map(h => h.trim());
    parsedCSVData = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row = {};
      headers.forEach((h, idx) => { row[h] = values[idx] || ''; });
      if (row.registrationNumber) parsedCSVData.push(row);
    }

    if (parsedCSVData.length > 0) {
      const btn = document.getElementById('btnUploadParsedCSV');
      btn.disabled = false;
      btn.innerText = `Import ${parsedCSVData.length} Vehicles`;
    }
  };
  reader.readAsText(file);
}

async function executeBulkCSVImport() {
  if (!parsedCSVData.length) return;
  const res = await fetch('/api/vehicles/bulk', {
    method: 'POST',
    headers: api.headers(),
    body: JSON.stringify({ vehicles: parsedCSVData })
  });
  const data = await res.json();
  if (data.success) {
    alert(data.message);
    closeModal();
    loadVehiclesPage();
  } else {
    alert('Error: ' + data.message);
  }
}

async function deleteVehicleItem(id) {
  if (!confirm('Delete this vehicle?')) return;
  await fetch(`/api/vehicles/${id}`, { method: 'DELETE', headers: api.headers() });
  loadVehiclesPage();
}

function viewVehicleOnDrawer(id) {
  const v = allVehicles.find(x => x._id === id);
  if (v) {
    window.activeDrawerVehicleId = v._id;
    const panel = document.getElementById('rightDetailsPanel');
    if (panel) panel.style.display = 'flex';
    renderRightPanel(v);
  }
}

// ================= STATIONS PAGE =================
async function loadStationsPage() {
  const viewport = document.getElementById('viewport');
  document.getElementById('rightDetailsPanel').style.display = 'none';

  const res = await api.getStations();
  allStations = res.data || [];

  viewport.innerHTML = `
    <div class="page-toolbar">
      <div>
        <h3 style="font-size:1.2rem; font-weight:700;">Lucknow Charging Hubs</h3>
        <p style="color:#64748B; font-size:0.8rem;">Monitor real-time load, transformer capacity, and connector availability</p>
      </div>
      <div class="toolbar-actions">
        <button class="btn-action-primary" onclick="openAddStationModal()"><i class="fa-solid fa-plus"></i> Add Charging Station</button>
      </div>
    </div>

    <div class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Station ID</th>
            <th>Name</th>
            <th>Address</th>
            <th>Charger Type</th>
            <th>Connectors Available</th>
            <th>Grid Load / Capacity</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${allStations.map(s => `
            <tr>
              <td><b>${s.stationId}</b></td>
              <td>${s.name}</td>
              <td>${s.address}</td>
              <td>${s.chargerType}</td>
              <td><b>${s.availableConnectors} / ${s.totalConnectors}</b></td>
              <td>${s.currentLoad} kW / ${s.powerCapacity} kW</td>
              <td>
                <span style="padding:3px 8px; border-radius:6px; font-size:0.75rem; font-weight:700; background:${s.availableConnectors > 0 ? '#ECFDF5' : '#FEF2F2'}; color:${s.availableConnectors > 0 ? '#10B981' : '#EF4444'};">
                  ${s.availableConnectors > 0 ? 'Available' : 'Busy'}
                </span>
              </td>
              <td>
                <button style="border:none; background:none; color:#EF4444; cursor:pointer;" onclick="deleteStationItem('${s._id}')"><i class="fa-solid fa-trash"></i></button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function openAddStationModal() {
  openModal(`
    <div class="modal-header">
      <h3>Add New Charging Station</h3>
      <i class="fa-solid fa-xmark" style="cursor:pointer;" onclick="closeModal()"></i>
    </div>
    <form onsubmit="submitNewStation(event)">
      <div class="form-group">
        <label>Station Name</label>
        <input type="text" id="msName" required placeholder="Shaheed Path North Hub" />
      </div>
      <div class="form-group">
        <label>Address</label>
        <input type="text" id="msAddress" required placeholder="Amar Shaheed Path, Lucknow" />
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div class="form-group">
          <label>Total Connectors</label>
          <input type="number" id="msConnectors" required value="6" />
        </div>
        <div class="form-group">
          <label>Power Capacity (kW)</label>
          <input type="number" id="msPower" required value="120" />
        </div>
      </div>
      <button type="submit" class="btn-primary">Create Station</button>
    </form>
  `);
}

async function submitNewStation(e) {
  e.preventDefault();
  const name = document.getElementById('msName').value;
  const address = document.getElementById('msAddress').value;
  const total = Number(document.getElementById('msConnectors').value);
  const power = Number(document.getElementById('msPower').value);

  const payload = {
    stationId: `CS-LKO-${Date.now().toString().slice(-4)}`,
    name,
    address,
    location: { lat: 26.8467 + (Math.random() * 0.04 - 0.02), lng: 80.9462 + (Math.random() * 0.04 - 0.02) },
    totalConnectors: total,
    availableConnectors: total,
    powerCapacity: power,
    currentLoad: 0
  };

  const res = await fetch('/api/stations', {
    method: 'POST',
    headers: api.headers(),
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  if (data.success) {
    closeModal();
    loadStationsPage();
  }
}

async function deleteStationItem(id) {
  if (!confirm('Delete this charging station?')) return;
  await fetch(`/api/stations/${id}`, { method: 'DELETE', headers: api.headers() });
  loadStationsPage();
}

// ================= SCHEDULE PAGE =================
async function loadSchedulePage() {
  const viewport = document.getElementById('viewport');
  document.getElementById('rightDetailsPanel').style.display = 'none';

  const [schedRes, vehiclesRes, stationsRes] = await Promise.all([
    fetch('/api/schedules', { headers: api.headers() }).then(r => r.json()),
    api.getVehicles(),
    api.getStations()
  ]);

  allVehicles = vehiclesRes.data || [];
  allStations = stationsRes.data || [];

  viewport.innerHTML = `
    <div class="page-toolbar">
      <div>
        <h3 style="font-size:1.2rem; font-weight:700;">Charging Schedule</h3>
        <p style="color:#64748B; font-size:0.8rem;">Automated overnight charging & departure reservations</p>
      </div>
      <div class="toolbar-actions">
        <button class="btn-action-primary" onclick="openAddScheduleModal()"><i class="fa-solid fa-plus"></i> Schedule Charging</button>
      </div>
    </div>

    <div class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Station</th>
            <th>Start Time</th>
            <th>Target SOC</th>
            <th>Priority</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${(schedRes.data || []).map(sc => `
            <tr>
              <td><b>${sc.vehicle ? sc.vehicle.registrationNumber : 'Vehicle'}</b></td>
              <td>${sc.station ? sc.station.name : 'Hub'}</td>
              <td>${new Date(sc.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
              <td>${sc.targetSOC}%</td>
              <td><span style="font-weight:700; color:${sc.priority === 'Critical' ? '#EF4444' : '#2563EB'};">${sc.priority}</span></td>
              <td><span style="padding:2px 8px; border-radius:6px; background:#EFF6FF; color:#2563EB; font-weight:600; font-size:0.75rem;">${sc.status}</span></td>
            </tr>
          `).join('')}
          ${(!schedRes.data || schedRes.data.length === 0) ? `
            <tr><td colspan="6" style="text-align:center; color:#64748B; padding:24px;">No upcoming schedules set for today. Click "Schedule Charging" to allocate slots.</td></tr>
          ` : ''}
        </tbody>
      </table>
    </div>
  `;
}

function openAddScheduleModal() {
  openModal(`
    <div class="modal-header">
      <h3>Add Charging Schedule</h3>
      <i class="fa-solid fa-xmark" style="cursor:pointer;" onclick="closeModal()"></i>
    </div>
    <form onsubmit="submitNewSchedule(event)">
      <div class="form-group">
        <label>Select Vehicle</label>
        <select id="schVehicle">
          ${allVehicles.map(v => `<option value="${v._id}">${v.registrationNumber} (${v.brand} ${v.model} - ${Math.round(v.currentSOC)}%)</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>Select Charging Hub</label>
        <select id="schStation">
          ${allStations.map(s => `<option value="${s._id}">${s.name} (${s.address})</option>`).join('')}
        </select>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
        <div class="form-group">
          <label>Target SOC (%)</label>
          <input type="number" id="schTarget" value="90" required min="50" max="100" />
        </div>
        <div class="form-group">
          <label>Priority Tier</label>
          <select id="schPriority">
            <option value="Critical">Critical</option>
            <option value="High" selected>High</option>
            <option value="Medium">Medium</option>
          </select>
        </div>
      </div>
      <button type="submit" class="btn-primary">Reserve Charging Slot</button>
    </form>
  `);
}

async function submitNewSchedule(e) {
  e.preventDefault();
  const vehicle = document.getElementById('schVehicle').value;
  const station = document.getElementById('schStation').value;
  const targetSOC = Number(document.getElementById('schTarget').value);
  const priority = document.getElementById('schPriority').value;

  const res = await fetch('/api/schedules', {
    method: 'POST',
    headers: api.headers(),
    body: JSON.stringify({
      vehicle,
      station,
      startTime: new Date(Date.now() + 3600000),
      endTime: new Date(Date.now() + 7200000),
      targetSOC,
      priority
    })
  });
  const data = await res.json();
  if (data.success) {
    closeModal();
    loadSchedulePage();
  }
}

// ================= ORCHESTRATION PAGE =================
async function loadOrchestrationPage() {
  const viewport = document.getElementById('viewport');
  document.getElementById('rightDetailsPanel').style.display = 'none';

  const res = await api.getOrchestrationStatus();
  const config = res.data || { optimizationMode: 'Balanced', gridLimit: 150, targetSOC: 90 };

  viewport.innerHTML = `
    <div style="max-width: 650px; margin: 0 auto;">
      <div class="chart-card">
        <h3 style="font-size:1.2rem; margin-bottom: 8px;">Smart Charging Orchestration Engine</h3>
        <p style="color:var(--text-secondary); font-size:0.85rem; margin-bottom: 24px;">VoltFlow dynamically recalculates priority weights based on SOC urgency, departure time, and grid headroom.</p>

        <form id="orchestrationConfigForm">
          <div class="form-group">
            <label>Optimization Mode</label>
            <select id="optMode" style="padding:10px;">
              <option value="Balanced" ${config.optimizationMode === 'Balanced' ? 'selected' : ''}>Balanced (Cost + SOC)</option>
              <option value="Cost Optimized" ${config.optimizationMode === 'Cost Optimized' ? 'selected' : ''}>Cost Optimized (Tariff Minimization)</option>
              <option value="SOC Optimized" ${config.optimizationMode === 'SOC Optimized' ? 'selected' : ''}>SOC Optimized (Fast Turnaround)</option>
            </select>
          </div>

          <div class="form-group">
            <label>Sub-Station Grid Limit (kW): <b id="gridValLabel">${config.gridLimit} kW</b></label>
            <input type="range" min="50" max="400" step="10" value="${config.gridLimit}" id="gridSlider" oninput="document.getElementById('gridValLabel').innerText = this.value + ' kW'" />
          </div>

          <div class="form-group">
            <label>Target Fleet SOC Threshold (%)</label>
            <input type="number" id="optTargetSOC" value="${config.targetSOC}" min="60" max="100" />
          </div>

          <button type="submit" class="btn-primary" style="margin-top:14px;">Apply Orchestration Constraints</button>
        </form>
      </div>
    </div>
  `;

  document.getElementById('orchestrationConfigForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    await api.updateOrchestration({
      optimizationMode: document.getElementById('optMode').value,
      gridLimit: document.getElementById('gridSlider').value,
      targetSOC: document.getElementById('optTargetSOC').value
    });
    alert('Orchestrator constraints successfully synced to backend.');
  });
}

// ================= ANALYTICS & REPORTS =================
async function loadAnalyticsPage() {
  const viewport = document.getElementById('viewport');
  document.getElementById('rightDetailsPanel').style.display = 'none';

  viewport.innerHTML = `
    <div class="kpi-grid">
      <div class="kpi-card">
        <div>
          <div class="kpi-label">Total Energy Consumed</div>
          <div class="kpi-number">18,642 kWh</div>
          <div class="kpi-subtext green"><i class="fa-solid fa-arrow-up"></i> 12% vs last month</div>
        </div>
      </div>
      <div class="kpi-card">
        <div>
          <div class="kpi-label">Total Charging Cost</div>
          <div class="kpi-number">₹ 2,45,820</div>
          <div class="kpi-subtext green"><i class="fa-solid fa-arrow-up"></i> 9% vs last month</div>
        </div>
      </div>
      <div class="kpi-card">
        <div>
          <div class="kpi-label">Total Sessions</div>
          <div class="kpi-number">153</div>
          <div class="kpi-subtext green"><i class="fa-solid fa-arrow-up"></i> 11% vs last month</div>
        </div>
      </div>
      <div class="kpi-card">
        <div>
          <div class="kpi-label">Carbon Offset</div>
          <div class="kpi-number">14.2 Tons</div>
          <div class="kpi-subtext green">CO2 Saved</div>
        </div>
      </div>
    </div>

    <div class="chart-card">
      <div class="chart-title" style="margin-bottom:16px;">Daily Energy Consumption (Lucknow Grid)</div>
      <div style="height:280px;">
        <canvas id="analyticsBarChart"></canvas>
      </div>
    </div>
  `;

  setTimeout(() => {
    const ctx = document.getElementById('analyticsBarChart');
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['1 May', '5 May', '10 May', '15 May', '20 May', '25 May', '30 May'],
          datasets: [{
            label: 'Energy (kWh)',
            data: [450, 780, 620, 892, 710, 830, 690],
            backgroundColor: '#2563EB',
            borderRadius: 6
          }]
        },
        options: { responsive: true, maintainAspectRatio: false }
      });
    }
  }, 50);
}

async function loadReportsPage() {
  const viewport = document.getElementById('viewport');
  document.getElementById('rightDetailsPanel').style.display = 'none';

  viewport.innerHTML = `
    <div class="chart-card" style="max-width:600px; margin: 0 auto; text-align:center;">
      <i class="fa-solid fa-file-excel" style="font-size:40px; color:#10B981; margin-bottom:12px;"></i>
      <h3 style="margin-bottom:6px;">Export Fleet Telemetry Reports</h3>
      <p style="color:#64748B; font-size:0.85rem; margin-bottom:20px;">Download complete vehicle registry, charging cycles, and cost records in CSV format.</p>
      <button class="btn-primary" onclick="downloadFleetCSV()"><i class="fa-solid fa-download"></i> Download Lucknow Fleet CSV</button>
    </div>
  `;
}

function downloadFleetCSV() {
  let csv = 'vehicleId,registrationNumber,brand,model,batteryCapacity,currentSOC,currentRange,location,status\n';
  allVehicles.forEach(v => {
    csv += `${v.vehicleId},${v.registrationNumber},${v.brand},${v.model},${v.batteryCapacity},${Math.round(v.currentSOC)},${v.currentRange},"${v.location ? v.location.address : 'Lucknow'}",${v.status}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `VoltFlow_Lucknow_Fleet_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
}

// ================= ALERTS PAGE =================
async function loadAlertsPage() {
  const viewport = document.getElementById('viewport');
  document.getElementById('rightDetailsPanel').style.display = 'none';

  const res = await api.getAlerts();
  const alerts = res.data || [];

  viewport.innerHTML = `
    <div class="page-toolbar">
      <div>
        <h3 style="font-size:1.2rem; font-weight:700;">System Alerts & Notifications</h3>
        <p style="color:#64748B; font-size:0.8rem;">Critical grid anomalies, low battery warnings, and completed charging cycles</p>
      </div>
    </div>

    <div style="display:flex; flex-direction:column; gap:12px;">
      ${alerts.map(a => `
        <div class="chart-card" style="display:flex; justify-content:space-between; align-items:center; border-left:4px solid ${a.severity === 'Critical' ? '#EF4444' : '#F59E0B'};">
          <div>
            <div style="font-weight:700; font-size:0.95rem; margin-bottom:4px;">${a.title}</div>
            <div style="color:#64748B; font-size:0.85rem;">${a.message}</div>
            <div style="color:#94A3B8; font-size:0.75rem; margin-top:6px;">${new Date(a.createdAt).toLocaleString()}</div>
          </div>
          <button style="border:none; background:#F1F5F9; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:0.8rem; font-weight:600;" onclick="dismissAlert('${a._id}')">Acknowledge</button>
        </div>
      `).join('')}
      ${alerts.length === 0 ? '<div style="text-align:center; color:#64748B; padding:30px;">All clear. No active alerts on Lucknow grid.</div>' : ''}
    </div>
  `;
}

async function dismissAlert(id) {
  await fetch(`/api/alerts/${id}/read`, { method: 'PUT', headers: api.headers() });
  loadAlertsPage();
}

// ================= USERS & ROLES PAGE =================
async function loadUsersPage() {
  const viewport = document.getElementById('viewport');
  document.getElementById('rightDetailsPanel').style.display = 'none';

  const res = await fetch('/api/users', { headers: api.headers() }).then(r => r.json());
  const users = res.data || [];

  viewport.innerHTML = `
    <div class="page-toolbar">
      <div>
        <h3 style="font-size:1.2rem; font-weight:700;">Users & Fleet Roles</h3>
        <p style="color:#64748B; font-size:0.8rem;">Access control and operator roles for VoltFlow platform</p>
      </div>
    </div>

    <div class="data-table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Member Since</th>
          </tr>
        </thead>
        <tbody>
          ${users.map(u => `
            <tr>
              <td><b>${u.name}</b></td>
              <td>${u.email}</td>
              <td><span style="padding:2px 8px; border-radius:6px; background:#EFF6FF; color:#2563EB; font-weight:600; font-size:0.75rem;">${u.role}</span></td>
              <td><span style="color:#10B981; font-weight:600;">Active</span></td>
              <td>${new Date(u.createdAt).toLocaleDateString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// ================= RIGHT VEHICLE DETAILS PANEL =================
function renderRightPanel(v) {
  const panel = document.getElementById('rightPanelBody');
  if (!panel) return;
  if (!v) {
    panel.innerHTML = '<div style="color:#64748B; text-align:center; padding:20px;">Select a vehicle marker from map to inspect live telemetry.</div>';
    return;
  }

  activeVehicle = v;
  const isCharging = v.status === 'Charging';
  const stationName = v.chargingStation ? (v.chargingStation.name || 'Hazratganj EV Superhub') : 'Hazratganj EV Superhub';

  panel.innerHTML = `
    <div class="vehicle-hero-card">
      <div class="vehicle-img-badge ${isCharging ? 'pulse-charging' : ''}">
        <i class="fa-solid fa-car-side"></i>
      </div>
      <div>
        <div class="vehicle-plate-title">
          ${v.registrationNumber}
          <span class="vehicle-status-tag" style="background:${isCharging ? '#ECFDF5' : '#EFF6FF'}; color:${isCharging ? '#10B981' : '#2563EB'};">${v.status}</span>
        </div>
        <div class="vehicle-model-sub">${v.brand} ${v.model}</div>
      </div>
    </div>

    <div class="battery-progress-card">
      <div>
        <div style="font-size:0.75rem; color:#64748B;">Battery</div>
        <div style="font-size:1.1rem; font-weight:700;" id="dockSOC">${Math.round(v.currentSOC)}%</div>
        <div class="soc-bar-bg">
          <div class="soc-bar-fill" id="dockSOCFill" style="width: ${v.currentSOC}%;"></div>
        </div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:0.75rem; color:#64748B;">Range</div>
        <div style="font-size:1.1rem; font-weight:700;" id="dockRange">${v.currentRange} km</div>
      </div>
    </div>

    <div class="vehicle-stats-matrix">
      <div class="matrix-tile">
        <div class="matrix-label"><i class="fa-solid fa-charging-station"></i> Charging Station</div>
        <div class="matrix-val">${stationName}</div>
      </div>
      <div class="matrix-tile">
        <div class="matrix-label"><i class="fa-regular fa-clock"></i> Connected Since</div>
        <div class="matrix-val">09:15 AM</div>
      </div>
      <div class="matrix-tile">
        <div class="matrix-label"><i class="fa-solid fa-bolt"></i> Charging Power</div>
        <div class="matrix-val" id="dockPower">${v.currentChargingPower || (isCharging ? 22.0 : 0)} kW</div>
      </div>
      <div class="matrix-tile">
        <div class="matrix-label"><i class="fa-solid fa-battery-half"></i> Est. Full Charge</div>
        <div class="matrix-val">${isCharging ? '01:45 PM' : 'N/A'}</div>
      </div>
    </div>

    <!-- VIEW FULL DIAGNOSTICS BUTTON -->
    <button class="btn-primary" style="margin-bottom:20px;" onclick="showFullDiagnostics('${v._id}')">
      <i class="fa-solid fa-microchip" style="margin-right:6px;"></i> View Full Diagnostics
    </button>

    <div class="charging-history-section">
      <h4>
        <span>Recent Lucknow Hub History</span>
        <span style="color:#2563EB; font-size:0.78rem; cursor:pointer;" onclick="switchNav('analytics')">View All</span>
      </h4>

      <div class="history-item-row">
        <div>
          <div style="font-weight:600;">May 16, 2026</div>
          <div style="color:#64748B; font-size:0.72rem;">Hazratganj Superhub</div>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:600;">21.4 kWh</div>
          <div style="color:#64748B; font-size:0.72rem;">₹ 267.50</div>
        </div>
      </div>

      <div class="history-item-row">
        <div>
          <div style="font-weight:600;">May 15, 2026</div>
          <div style="color:#64748B; font-size:0.72rem;">Gomti Nagar Hub</div>
        </div>
        <div style="text-align:right;">
          <div style="font-weight:600;">17.8 kWh</div>
          <div style="color:#64748B; font-size:0.72rem;">₹ 222.50</div>
        </div>
      </div>
    </div>
  `;
}

function closeDetailsPanel() {
  const panel = document.getElementById('rightDetailsPanel');
  if (panel) panel.style.display = 'none';
}

function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

// Navigation Tabs Switcher (Desktop & Mobile)
function setupNavigation() {
  document.querySelectorAll('.nav-list .nav-item, .mobile-bottom-nav .mob-nav-item').forEach(el => {
    el.addEventListener('click', () => {
      document.querySelectorAll('.nav-list .nav-item, .mobile-bottom-nav .mob-nav-item').forEach(i => i.classList.remove('active'));
      const tab = el.dataset.tab;

      // Sync active state in both desktop and mobile nav
      document.querySelectorAll(`[data-tab="${tab}"]`).forEach(i => i.classList.add('active'));

      if (tab === 'dashboard') loadDashboard();
      else if (tab === 'vehicles') loadVehiclesPage();
      else if (tab === 'stations') loadStationsPage();
      else if (tab === 'schedule') loadSchedulePage();
      else if (tab === 'orchestration') loadOrchestrationPage();
      else if (tab === 'analytics') loadAnalyticsPage();
      else if (tab === 'alerts') loadAlertsPage();
      else if (tab === 'reports') loadReportsPage();
      else if (tab === 'users') loadUsersPage();
    });
  });
}

function switchNav(tabName) {
  const item = document.querySelector(`.nav-item[data-tab="${tabName}"]`) || document.querySelector(`.mob-nav-item[data-tab="${tabName}"]`);
  if (item) item.click();
}

// ================= DOM BOOTSTRAP =================
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();

  // Login Submit
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value.trim();

      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (data.success && data.token) {
          localStorage.setItem('voltflow_token', data.token);
          localStorage.setItem('voltflow_user', JSON.stringify(data.user));
          
          const overlay = document.getElementById('authOverlay');
          if (overlay) {
            overlay.style.display = 'none';
            overlay.classList.add('hidden');
          }
          
          checkAuth();
          await loadDashboard();
        } else {
          alert(data.message || 'Login failed');
        }
      } catch (err) {
        alert('Server connection error. Make sure backend is running.');
      }
    });
  }

  // Register Submit
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value.trim();
      const role = document.getElementById('regRole').value;

      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role })
        });
        const data = await res.json();

        if (data.success && data.token) {
          localStorage.setItem('voltflow_token', data.token);
          localStorage.setItem('voltflow_user', JSON.stringify(data.user));
          
          const overlay = document.getElementById('authOverlay');
          if (overlay) {
            overlay.style.display = 'none';
            overlay.classList.add('hidden');
          }
          
          checkAuth();
          await loadDashboard();
        } else {
          alert(data.message || 'Registration failed');
        }
      } catch (err) {
        alert('Server connection error');
      }
    });
  }

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('voltflow_token');
      localStorage.removeItem('voltflow_user');
      const overlay = document.getElementById('authOverlay');
      if (overlay) {
        overlay.style.display = 'flex';
        overlay.classList.remove('hidden');
      }
    });
  }

  // Initial Auth & Dashboard Run
  checkAuth();
  if (localStorage.getItem('voltflow_token')) {
    loadDashboard();
  }
});// VoltFlow Engine Controller - 18 August 2026 Lucknow Fleet

// Point 15: 5 Lucknow Hubs with Station-Wise Pricing Models
let fleetStations = [
  {
    id: "CS-LKO-01",
    name: "Hazratganj EV Superhub",
    location: "Hazratganj Metro Circle, Lucknow",
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
    location: "Alambagh Inter-State Bus Hub",
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

// Point 11: Real-world Diverse SOCs & Deadlines
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
    unmanagedCost: 620
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
    unmanagedCost: 405
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
    unmanagedCost: 380
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
    unmanagedCost: 0
  }
];

let fleetAlerts = [
  {
    id: "ALT-01",
    severity: "critical",
    title: "Critical Battery Alert",
    message: "EV-002 at 16% SOC near Gomti Nagar. Must charge before 05:15 AM departure.",
    actionTitle: "Reserve Gun #2 at Gomti Nagar Hub",
    power: "60 kW",
    target: "85%",
    rate: "₹10/kWh"
  }
];

document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  renderAllViews();
  initDashboardChart();
  initAnalyticsChart();
});

function renderAllViews() {
  renderOrchestrationTable();
  renderVehiclesTable();
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
  if (status === 'charging') return '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">⚡ Charging</span>';
  return '<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">💤 Standby</span>';
}

// Point 16, 17 & 19: Cost-Aware Charging Calculation Engine
function calculateChargingCost(vehicle) {
  const energyRequired = (vehicle.batteryCapacityKWh * (vehicle.targetSOC - vehicle.currentSOC)) / 100;
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

// 1. Render Cost-Aware Orchestration Table (Point 19)
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

// 2. Multi-Step Simulation Pipeline (Points 1, 4, 16)
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

// 3. Station Cost Comparison Table (Point 18)
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

// 4. Detailed Station Cards (Points 15, 20)
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
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Operational
          </span>
        </div>

        <!-- Pricing Breakdown Badges (Point 15) -->
        <div class="grid grid-cols-4 gap-1.5 my-3 bg-slate-50 p-2.5 rounded-xl text-center text-[10px]">
          <div><span class="text-slate-400 block">AC Rate</span><strong class="text-slate-800">₹${s.acPrice}</strong></div>
          <div><span class="text-slate-400 block">DC Fast</span><strong class="text-blue-600">₹${s.dcPrice}</strong></div>
          <div><span class="text-slate-400 block">Peak</span><strong class="text-rose-600">₹${s.peakPrice}</strong></div>
          <div><span class="text-slate-400 block">Off-Peak</span><strong class="text-emerald-600">₹${s.offPeakPrice}</strong></div>
        </div>

        <!-- Power & Utilization -->
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

// 5. Vehicles Table
function renderVehiclesTable() {
  const tbody = document.getElementById('vehicles-table-body');
  if (!tbody) return;
  tbody.innerHTML = fleetVehicles.map(v => `
    <tr class="hover:bg-slate-50">
      <td class="py-3 px-4 font-bold text-slate-900">${v.vehicleId}</td>
      <td class="py-3 px-4 font-semibold text-slate-700">${v.licensePlate}</td>
      <td class="py-3 px-4 text-slate-600">${v.model}</td>
      <td class="py-3 px-4">
        <div class="flex items-center space-x-2">
          <div class="w-14 bg-slate-200 h-2 rounded-full overflow-hidden">
            <div class="bg-blue-600 h-full" style="width: ${v.currentSOC}%"></div>
          </div>
          <span class="font-bold text-xs">${v.currentSOC}%</span>
        </div>
      </td>
      <td class="py-3 px-4 text-slate-700 font-semibold">${v.currentRangeKM} km</td>
      <td class="py-3 px-4">${getPriorityBadge(v.priority)}</td>
      <td class="py-3 px-4">${getStatusBadge(v.status)}</td>
      <td class="py-3 px-4 text-right">
        <button onclick="openVehicleModal('${v.vehicleId}')" class="touch-btn bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1 rounded-lg text-xs font-semibold">View Details</button>
      </td>
    </tr>
  `).join('');
}

// 6. Master Schedule (Point 6)
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

// 7. Actionable Alerts (Point 9)
function renderAlerts() {
  const container = document.getElementById('panel-alerts');
  if (!container) return;
  container.innerHTML = fleetAlerts.map(a => `
    <div class="bg-white p-4 sm:p-5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center space-x-2">
          <h4 class="font-bold text-slate-900 text-sm">${a.title}</h4>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">🔴 CRITICAL</span>
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
  alert(`Recommendation dispatched to Gomti Nagar OCPP hub for ${id}. Fast Gun #2 reserved at off-peak ₹10/kWh.`);
}

// 8. Vehicle Details Modal (Point 5, 21)
function openVehicleModal(id) {
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

function closeVehicleModal() {
  document.getElementById('vehicle-details-modal').classList.add('hidden');
}

// Navigation & Sidebar Handlers (Point 20)
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
    vehicles: 'Fleet Vehicles',
    stations: 'Hubs & Pricing Comparison',
    schedule: 'Smart Schedules',
    analytics: 'Impact & Energy Costs',
    alerts: 'Fleet Alerts'
  };
  document.getElementById('page-title').textContent = titles[tabId] || 'VoltFlow';
  closeSidebar();
  lucide.createIcons();
}

function toggleSidebar() {
  document.getElementById('app-sidebar').classList.toggle('-translate-x-full');
  document.getElementById('mobile-backdrop').classList.toggle('hidden');
}

function closeSidebar() {
  document.getElementById('app-sidebar').classList.add('-translate-x-full');
  document.getElementById('mobile-backdrop').classList.add('hidden');
}

// Charts (Point 8)
function initDashboardChart() {
  const ctx = document.getElementById('dashboardLiveChart');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
      datasets: [
        {
          label: 'Hazratganj Hub Load (kW)',
          data: [65, 55, 105, 95, 70, 60, 50, 45, 80, 110, 90, 75],
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          fill: true,
          tension: 0.3
        },
        {
          label: '150 kW Safe Limit',
          data: Array(12).fill(150),
          borderColor: '#f59e0b',
          borderDash: [5, 5],
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true, max: 180 } }
    }
  });
}

function initAnalyticsChart() {
  const ctx = document.getElementById('analyticsComparisonChart');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['00:00', '02:00', '04:00', '06:00', '08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'],
      datasets: [
        {
          label: 'Without VoltFlow (Unmanaged Peak Overload)',
          data: [70, 60, 110, 140, 175, 160, 90, 85, 120, 185, 170, 110],
          borderColor: '#ef4444',
          borderWidth: 2,
          tension: 0.3
        },
        {
          label: 'With VoltFlow (Cost-Optimized Peak Shaving)',
          data: [110, 125, 135, 120, 130, 115, 85, 80, 110, 135, 125, 115],
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.15)',
          fill: true,
          borderWidth: 2.5,
          tension: 0.3
        },
        {
          label: '150 kW Grid Limit',
          data: Array(12).fill(150),
          borderColor: '#f59e0b',
          borderDash: [6, 6],
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true, max: 200 } }
    }
  });
}
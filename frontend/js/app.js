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
});
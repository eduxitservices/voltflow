let mapInstance = null;
let mapMarkersGroup = null;

function initMap(vehicles, stations) {
  const mapElement = document.getElementById('fleetMap');
  if (!mapElement) return;

  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }

  // Centered on Lucknow Urban Hub (Hazratganj / Gomti Nagar)
  mapInstance = L.map('fleetMap', {
    zoomControl: false
  }).setView([26.8467, 80.9462], 12);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap'
  }).addTo(mapInstance);

  L.control.zoom({ position: 'bottomright' }).addTo(mapInstance);

  mapMarkersGroup = L.layerGroup().addTo(mapInstance);

  // Plot Stations
  stations.forEach(s => {
    const icon = L.divIcon({
      className: 'station-pin',
      html: `<div style="background:#2563EB; color:#FFF; width:28px; height:28px; border-radius:6px; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 10px rgba(37,99,235,0.4); font-size:12px;"><i class="fa-solid fa-charging-station"></i></div>`,
      iconSize: [28, 28]
    });
    L.marker([s.location.lat, s.location.lng], { icon })
      .bindPopup(`<b>${s.name}</b><br>${s.address}<br>Available: ${s.availableConnectors}/${s.totalConnectors}`)
      .addTo(mapMarkersGroup);
  });

  // Plot Vehicles
  vehicles.forEach(v => {
    let color = '#64748B'; // Idle
    if (v.status === 'Charging') color = '#10B981';
    if (v.status === 'Scheduled') color = '#F59E0B';

    const icon = L.divIcon({
      className: 'vehicle-pin',
      html: `<div style="background:${color}; color:#FFF; width:26px; height:26px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 8px rgba(0,0,0,0.25); font-size:11px; cursor:pointer;"><i class="fa-solid fa-car"></i></div>`,
      iconSize: [26, 26]
    });

    const marker = L.marker([v.location.lat, v.location.lng], { icon }).addTo(mapMarkersGroup);
    
    marker.on('click', () => {
      activeVehicle = v;
      document.getElementById('rightDetailsPanel').style.display = 'flex';
      renderRightPanel(v);
    });
  });
}
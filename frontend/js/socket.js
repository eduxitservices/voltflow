const socket = io();

socket.on('connect', () => {
  console.log('[Real-Time] Connected to VoltFlow telemetry stream');
});

socket.on('telemetry:update', (data) => {
  // Update live vehicle drawer metrics if currently selected
  const activeVehicleId = window.activeDrawerVehicleId;
  if (activeVehicleId && activeVehicleId === data.vehicleId) {
    const socEl = document.getElementById('drawerSOC');
    const rangeEl = document.getElementById('drawerRange');
    const costEl = document.getElementById('drawerCost');
    if (socEl) socEl.innerText = `${data.currentSOC}%`;
    if (rangeEl) rangeEl.innerText = `${data.currentRange} km`;
    if (costEl) costEl.innerText = `₹${data.cost}`;
  }
});
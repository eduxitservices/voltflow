let chargingLoadChartInstance = null;
let energySparklineInstance = null;

function renderDashboardCharts() {
  // 1. Charging Load Wave Chart (Matching Reference Curve)
  const ctxLoad = document.getElementById('chargingLoadChart');
  if (ctxLoad) {
    if (chargingLoadChartInstance) chargingLoadChartInstance.destroy();

    const gradient = ctxLoad.getContext('2d').createLinearGradient(0, 0, 0, 180);
    gradient.addColorStop(0, 'rgba(37, 99, 235, 0.25)');
    gradient.addColorStop(1, 'rgba(37, 99, 235, 0.0)');

    chargingLoadChartInstance = new Chart(ctxLoad, {
      type: 'line',
      data: {
        labels: ['12 AM', '3 AM', '6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM', '12 AM'],
        datasets: [{
          data: [25, 45, 52, 95, 142, 88, 132, 98, 120],
          borderColor: '#2563EB',
          borderWidth: 2.5,
          backgroundColor: gradient,
          fill: true,
          tension: 0.45,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#2563EB'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (item) => `${item.raw} kW`
            }
          }
        },
        scales: {
          y: {
            min: 0,
            max: 200,
            ticks: { stepSize: 50, color: '#94A3B8', font: { size: 10 } },
            grid: { color: '#F1F5F9' }
          },
          x: {
            ticks: { color: '#94A3B8', font: { size: 10 } },
            grid: { display: false }
          }
        }
      }
    });
  }

  // 2. Small Green Sparkline for Energy
  const ctxSpark = document.getElementById('energySparkline');
  if (ctxSpark) {
    if (energySparklineInstance) energySparklineInstance.destroy();

    energySparklineInstance = new Chart(ctxSpark, {
      type: 'line',
      data: {
        labels: [1,2,3,4,5,6,7,8,9,10],
        datasets: [{
          data: [12, 14, 11, 15, 13, 18, 16, 22, 19, 24],
          borderColor: '#10B981',
          borderWidth: 2,
          fill: false,
          tension: 0.4,
          pointRadius: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { display: false },
          y: { display: false }
        }
      }
    });
  }
}
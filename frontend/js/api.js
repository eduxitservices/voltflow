const API_BASE = '/api';

const api = {
  headers: () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('voltflow_token') || ''}`
  }),

  async getOverview() {
    const res = await fetch(`${API_BASE}/analytics/overview`, { headers: this.headers() });
    return res.json();
  },

  async getVehicles() {
    const res = await fetch(`${API_BASE}/vehicles`, { headers: this.headers() });
    return res.json();
  },

  async getVehicle(id) {
    const res = await fetch(`${API_BASE}/vehicles/${id}`, { headers: this.headers() });
    return res.json();
  },

  async getStations() {
    const res = await fetch(`${API_BASE}/stations`, { headers: this.headers() });
    return res.json();
  },

  async getOrchestrationStatus() {
    const res = await fetch(`${API_BASE}/orchestration/status`, { headers: this.headers() });
    return res.json();
  },

  async updateOrchestration(data) {
    const res = await fetch(`${API_BASE}/orchestration/configure`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getAlerts() {
    const res = await fetch(`${API_BASE}/alerts`, { headers: this.headers() });
    return res.json();
  }
};
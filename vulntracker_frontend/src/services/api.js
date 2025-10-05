const API_URL = 'http://localhost:5000/api';

export const api = {
  // Vendors
  getVendors: async () => {
    try {
      const response = await fetch(`${API_URL}/vendors`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Vendors data:', data); // Debug log
      return data;
    } catch (error) {
      console.error('Error fetching vendors:', error);
      throw error;
    }
  },

  createVendor: async (vendorData) => {
    const response = await fetch(`${API_URL}/vendors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vendorData)
    });
    return response.json();
  },

  // Software
  getSoftware: async () => {
    try {
      const response = await fetch(`${API_URL}/software`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Software data:', data); // Debug log
      return data;
    } catch (error) {
      console.error('Error fetching software:', error);
      throw error;
    }
  },

  createSoftware: async (softwareData) => {
    const response = await fetch(`${API_URL}/software`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(softwareData)
    });
    return response.json();
  },

  // Vulnerabilities
  getVulnerabilities: async () => {
    try {
      const response = await fetch(`${API_URL}/vulnerabilities`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Vulnerabilities data:', data); // Debug log
      return data;
    } catch (error) {
      console.error('Error fetching vulnerabilities:', error);
      throw error;
    }
  },

  createVulnerability: async (vulnData) => {
    const response = await fetch(`${API_URL}/vulnerabilities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vulnData)
    });
    return response.json();
  },

  linkVulnerabilityThreat: async (vulnId, threatId) => {
    const response = await fetch(`${API_URL}/vulnerabilities/${vulnId}/threats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ threat_id: threatId })
    });
    return response.json();
  },

  linkVulnerabilityPatch: async (vulnId, patchId) => {
    const response = await fetch(`${API_URL}/vulnerabilities/${vulnId}/patches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patch_id: patchId })
    });
    return response.json();
  },

  // Threats
  getThreats: async () => {
    const response = await fetch(`${API_URL}/threats`);
    return response.json();
  },

  getThreatTypes: async () => {
    const response = await fetch(`${API_URL}/threat-types`);
    return response.json();
  },

  createThreat: async (threatData) => {
    const response = await fetch(`${API_URL}/threats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(threatData)
    });
    return response.json();
  },

  // Patches
  getPatches: async () => {
    const response = await fetch(`${API_URL}/patches`);
    return response.json();
  },

  createPatch: async (patchData) => {
    const response = await fetch(`${API_URL}/patches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patchData)
    });
    return response.json();
  }
};
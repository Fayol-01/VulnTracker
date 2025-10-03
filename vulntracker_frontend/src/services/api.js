import { supabase } from './supabase';

const API_URL = 'http://localhost:5000/api';

const getAuthHeaders = async () => {
  const session = await supabase.auth.getSession();
  if (!session.data.session) {
    throw new Error('No active session');
  }
  return {
    'Authorization': `Bearer ${session.data.session.access_token}`,
    'Content-Type': 'application/json',
  };
};

export const api = {
  // Vendors
  getVendors: async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/vendors`, {
        headers: headers
      });
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
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/vendors`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(vendorData)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error creating vendor:', error);
      throw error;
    }
  },

  // Software
  getSoftware: async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/software`, {
        headers: headers
      });
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
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/software`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(softwareData)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error creating software:', error);
      throw error;
    }
  },

  // Vulnerabilities
  getVulnerabilities: async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/vulnerabilities`, {
        headers: headers
      });
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
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/vulnerabilities`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(vulnData)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error creating vulnerability:', error);
      throw error;
    }
  },

  linkVulnerabilityThreat: async (vulnId, threatId) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/vulnerabilities/${vulnId}/threats`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ threat_id: threatId })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error linking vulnerability to threat:', error);
      throw error;
    }
  },

  linkVulnerabilityPatch: async (vulnId, patchId) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/vulnerabilities/${vulnId}/patches`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ patch_id: patchId })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error linking vulnerability to patch:', error);
      throw error;
    }
  },

  // Threats
  getThreats: async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/threats`, {
        headers: headers
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching threats:', error);
      throw error;
    }
  },

  getThreatTypes: async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/threat-types`, {
        headers: headers
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching threat types:', error);
      throw error;
    }
  },

  createThreat: async (threatData) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/threats`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(threatData)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error creating threat:', error);
      throw error;
    }
  },

  // Patches
  getPatches: async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/patches`, {
        headers: headers
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching patches:', error);
      throw error;
    }
  },

  createPatch: async (patchData) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_URL}/patches`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(patchData)
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    } catch (error) {
      console.error('Error creating patch:', error);
      throw error;
    }
  }
};
import { supabase } from './supabase';

const API_URL = 'http://localhost:5000/api';

const getHeaders = async (requiresAuth = false) => {
  const baseHeaders = {
    'Content-Type': 'application/json'
  };

  if (requiresAuth) {
    const session = await supabase.auth.getSession();
    if (!session.data.session) {
      throw new Error('Authentication required for this operation');
    }
    return {
      ...baseHeaders,
      'Authorization': `Bearer ${session.data.session.access_token}`,
    };
  }

  return baseHeaders;
};

export const api = {
  // Vendors
  getVendors: async () => {
    try {
      const headers = await getHeaders();
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
      const headers = await getHeaders(true);
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
      const headers = await getHeaders();
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
      const headers = await getHeaders(true);
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

  deleteSoftware: async (id) => {
    try {
      const headers = await getHeaders(true);
      const response = await fetch(`${API_URL}/software/${id}`, {
        method: 'DELETE',
        headers: headers
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return true;
    } catch (error) {
      console.error('Error deleting software:', error);
      throw error;
    }
  },

  // Patches
  createPatch: async (patchData) => {
    try {
      const headers = await getHeaders(true);
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
  },

  deletePatch: async (id) => {
    try {
      const headers = await getHeaders(true);
      const response = await fetch(`${API_URL}/patches/${id}`, {
        method: 'DELETE',
        headers: headers
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return true;
    } catch (error) {
      console.error('Error deleting patch:', error);
      throw error;
    }
  },

  // Threats
  deleteThreat: async (id) => {
    try {
      const headers = await getHeaders(true);
      const response = await fetch(`${API_URL}/threats/${id}`, {
        method: 'DELETE',
        headers: headers
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return true;
    } catch (error) {
      console.error('Error deleting threat:', error);
      throw error;
    }
  },

  // Vulnerabilities
  getVulnerabilities: async () => {
    try {
      const headers = await getHeaders();
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
      const headers = await getHeaders(true);
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

  deleteVulnerability: async (vulnId) => {
    try {
      const headers = await getHeaders(true);
      const response = await fetch(`${API_URL}/vulnerabilities/${vulnId}`, {
        method: 'DELETE',
        headers: headers,
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return true;
    } catch (error) {
      console.error('Error deleting vulnerability:', error);
      throw error;
    }
  },

  linkVulnerabilityThreat: async (vulnId, threatId) => {
    try {
      const headers = await getHeaders(true);
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
      const headers = await getHeaders(true);
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
      const headers = await getHeaders();
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
      const headers = await getHeaders();
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
      const headers = await getHeaders(true);
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

  deleteThreat: async (id) => {
    try {
      const headers = await getHeaders(true);
      const response = await fetch(`${API_URL}/threats/${id}`, {
        method: 'DELETE',
        headers: headers
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return true;
    } catch (error) {
      console.error('Error deleting threat:', error);
      throw error;
    }
  },

  // Patches
  getPatches: async () => {
    try {
      const headers = await getHeaders();
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
      const headers = await getHeaders(true);
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
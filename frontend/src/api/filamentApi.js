import axios from 'axios';

const API_BASE_URL = '/api';

/**
 * Fetch all filaments with optional filtering and sorting
 * @param {Object} params - Query parameters { material, color, sort }
 * @returns {Promise<Array>} Array of filament objects
 */
export const listFilaments = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/filaments`, { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch filaments');
  }
};

/**
 * Fetch a single filament by ID
 * @param {number} id - Filament ID
 * @returns {Promise<Object>} Filament object
 */
export const getFilament = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/filaments/${id}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch filament');
  }
};

/**
 * Create a new filament
 * @param {Object} filamentData - Filament data
 * @returns {Promise<Object>} Created filament object
 */
export const createFilament = async (filamentData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/filaments`, filamentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to create filament');
  }
};

/**
 * Update an existing filament
 * @param {number} id - Filament ID
 * @param {Object} filamentData - Updated filament data
 * @returns {Promise<Object>} Updated filament object
 */
export const updateFilament = async (id, filamentData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/filaments/${id}`, filamentData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to update filament');
  }
};

/**
 * Delete a filament
 * @param {number} id - Filament ID
 * @returns {Promise<void>}
 */
export const deleteFilament = async (id) => {
  try {
    await axios.delete(`${API_BASE_URL}/filaments/${id}`);
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to delete filament');
  }
};

/**
 * Get usage history for a specific filament
 * @param {number} id - Filament ID
 * @returns {Promise<Array>} Array of usage log objects
 */
export const getFilamentUsage = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/filaments/${id}/usage`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to fetch usage history');
  }
};

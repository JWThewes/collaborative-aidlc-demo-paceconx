import axios from 'axios';

const API_BASE_URL = '/api';

/**
 * Create a new usage log entry
 * @param {Object} usageData - Usage data { filament_id, amount_used, print_name, used_at }
 * @returns {Promise<Object>} Created usage log object
 */
export const createUsage = async (usageData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/usage`, usageData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to create usage log');
  }
};

/**
 * Delete a usage log entry
 * @param {number} id - Usage log ID
 * @returns {Promise<void>}
 */
export const deleteUsage = async (id) => {
  try {
    await axios.delete(`${API_BASE_URL}/usage/${id}`);
  } catch (error) {
    throw new Error(error.response?.data?.error || 'Failed to delete usage log');
  }
};

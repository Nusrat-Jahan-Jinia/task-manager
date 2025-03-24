import { axiosInstance } from '../axios';

// Get the API base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000';
const API_URL = `${API_BASE_URL}/api/auth`;

// Register User
export const signUpUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/auth/register', userData);
    
    // Save Bearer Token to localStorage if it exists
    if (response.data.authorization?.token) {
      localStorage.setItem('token', response.data.authorization.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error) {
    console.error('Registration error details:', error.response?.data);
    throw error;
  }
};

// Login User
export const loginUser = async (userData) => {
  try {
    const response = await axiosInstance.post('/auth/login', userData);

    console.log('Login response received:', response.data);
    // Save Bearer Token to localStorage
    if (response.data.authorization?.token) {
      console.log('Saving token:', response.data.authorization.token);
      localStorage.setItem('token', response.data.authorization.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error) {
    console.error('Login error details:', error.response?.data);
    throw error;
  }
};

// Logout User
export const logoutUser = async () => {
  try {
    const response = await axiosInstance.post('/auth/logout', {});

    // Clear localStorage on logout
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    return response.data;
  } catch (error) {
    console.error('Logout error details:', error.response?.data);
    throw error;
  }
};

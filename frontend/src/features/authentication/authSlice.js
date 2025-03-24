import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { signUpUser, loginUser, logoutUser } from './authAPI';

const user = JSON.parse(localStorage.getItem('user'));
const token = localStorage.getItem('token');

console.log('Initial state - token:', token); // Debug log

const initialState = {
  user: user || null,
  token: token || null,
  isLoading: false,
  isError: false,
  errorMessage: '',
  isAuthenticated: !!token,
};

// Async Thunks
export const register = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try {
    const response = await signUpUser(userData);
    console.log('Registration response:', response); // Debug log
    return response;
  } catch (error) {
    console.log('Registration error:', error); // Debug log
    return thunkAPI.rejectWithValue(error.response?.data || 'Registration failed');
  }
});

export const login = createAsyncThunk('auth/login', async (userData, thunkAPI) => {
  try {
    const response = await loginUser(userData);
    return response;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || 'Login failed');
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
  try {
    return await logoutUser();
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response?.data || 'Logout failed');
  }
});

// Auth Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = '';
      })
      .addCase(register.fulfilled, (state, action) => {
        console.log('Register fulfilled - payload:', action.payload); // Debug log
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.authorization?.token;
        state.isAuthenticated = true;
        console.log('New state after register:', state); // Debug log
      })
      .addCase(register.rejected, (state, action) => {
        console.log('Register rejected - error:', action.payload); // Debug log
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload?.message || 'Registration failed';
      })
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.errorMessage = '';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.authorization?.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.errorMessage = action.payload?.message || 'Login failed';
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export default authSlice.reducer;

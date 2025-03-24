import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getTasks, createTask, updateTask, deleteTask } from './taskAPI';

// Async actions with Bearer Token
export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async () => {
  const response = await getTasks();
  console.log('API Response in Thunk:', response); // Debug log
  console.log('Response Status:', response?.status); // Debug log
  console.log('Response Tasks:', response?.tasks); // Debug log
  console.log('Response Tasks Data:', response?.tasks?.data); // Debug log
  if (response?.status === 'success' && response?.tasks?.data) {
    console.log('Returning tasks data:', response.tasks.data); // Debug log
    return response.tasks.data;
  }
  console.log('No valid tasks data found, returning empty array'); // Debug log
  return [];
});

export const addTask = createAsyncThunk('tasks/addTask', async (taskData) => {
  const response = await createTask(taskData);
  console.log('Add Task Response:', response); // Debug log
  // The new task should be in response.task or response.data
  if (response?.status === 'success') {
    return response.task || response.data;
  }
  return null;
});

export const editTask = createAsyncThunk('tasks/editTask', async ({ id, taskData }) => {
  const response = await updateTask(id, taskData);
  console.log('Edit Task Response:', response); // Debug log
  // The updated task should be in response.task or response.data
  if (response?.status === 'success') {
    return response.task || response.data;
  }
  return null;
});

export const removeTask = createAsyncThunk('tasks/removeTask', async (id) => {
  const response = await deleteTask(id);
  console.log('Delete Task Response:', response); // Debug log
  if (response?.status === 'success') {
    return id;
  }
  throw new Error('Failed to delete task');
});

// Task slice
const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        console.log('Fulfilled Payload:', action.payload); // Debug log
        state.isLoading = false;
        state.tasks = Array.isArray(action.payload) ? action.payload : [];
        console.log('Updated State:', state.tasks); // Debug log
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        console.log('Rejected Error:', action.error); // Debug log
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(addTask.fulfilled, (state, action) => {
        console.log('Add Task Fulfilled:', action.payload); // Debug log
        if (action.payload) {
          state.tasks.push(action.payload);
        }
      })
      .addCase(editTask.fulfilled, (state, action) => {
        console.log('Edit Task Fulfilled:', action.payload); // Debug log
        if (action.payload) {
          const index = state.tasks.findIndex((task) => task.id === action.payload.id);
          if (index !== -1) {
            state.tasks[index] = { ...state.tasks[index], ...action.payload };
          }
        }
      })
      .addCase(removeTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((task) => task.id !== action.payload);
      });
  },
});

export default taskSlice.reducer;

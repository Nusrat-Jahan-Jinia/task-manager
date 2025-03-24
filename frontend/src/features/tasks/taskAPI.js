import { axiosInstance } from '../axios';

// Get all tasks
export const getTasks = async () => {
  console.log('Fetching tasks...'); // Debug log
  const response = await axiosInstance.get('/tasks');
  console.log('Raw API Response:', response); // Debug log
  console.log('Response Data:', response.data); // Debug log
  console.log('Tasks Data:', response.data?.tasks?.data); // Debug log
  return response.data;
};

// Create a new task
export const createTask = async (taskData) => {
  console.log('Creating task:', taskData); // Debug log
  const response = await axiosInstance.post('/tasks', taskData);
  console.log('Create Task Response:', response); // Debug log
  return response.data; // The data is already unwrapped by axios
};

// Update a task
export const updateTask = async (taskId, taskData) => {
  console.log('Updating task:', taskId, taskData); // Debug log
  const response = await axiosInstance.put(`/tasks/${taskId}`, taskData);
  console.log('Update Task Response:', response); // Debug log
  return response.data; // The data is already unwrapped by axios
};

// Delete a task
export const deleteTask = async (taskId) => {
  console.log('Deleting task:', taskId); // Debug log
  const response = await axiosInstance.delete(`/tasks/${taskId}`);
  console.log('Delete Task Response:', response); // Debug log
  return response.data; // The data is already unwrapped by axios
};

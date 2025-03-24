import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, addTask, editTask, removeTask } from '../features/tasks/taskSlice';
import _ from 'lodash';
import { CiEdit } from 'react-icons/ci';
import { MdDelete } from 'react-icons/md';
import { FaSave } from 'react-icons/fa';
import { BsList, BsGrid, BsTable, BsPlus } from 'react-icons/bs';

const TaskList = () => {
  const dispatch = useDispatch();
  const { tasks, isLoading, error } = useSelector((state) => state.tasks);

  const [taskName, setTaskName] = useState('');
  const [taskDes, setTaskDes] = useState('');
  const [taskStatus, setTaskStatus] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDes, setEditDes] = useState('');
  const [editDate, setEditDate] = useState('');
  const [sortField, setSortField] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [taskNameError, setTaskNameError] = useState('');
  const [draggedTask, setDraggedTask] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban', 'list', 'table', 'grid'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineTasks, setOfflineTasks] = useState([]);

  // Add color palette array
  const cardColors = [
    'bg-blue-50 hover:bg-blue-100',
    'bg-green-50 hover:bg-green-100',
    'bg-purple-50 hover:bg-purple-100',
    'bg-pink-50 hover:bg-pink-100',
    'bg-yellow-50 hover:bg-yellow-100',
    'bg-indigo-50 hover:bg-indigo-100',
    'bg-orange-50 hover:bg-orange-100',
    'bg-teal-50 hover:bg-teal-100',
    'bg-cyan-50 hover:bg-cyan-100',
    'bg-rose-50 hover:bg-rose-100'
  ];

  // Function to get a consistent color for a task
  const getTaskColor = (taskId) => {
    const index = taskId % cardColors.length;
    return cardColors[index];
  };

  // Create a debounced search handler
  const debouncedSearch = useCallback(
    _.debounce((value) => {
      setSearchQuery(value);
    }, 500),
    []
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    debouncedSearch(value);
  };

  // Cleanup debounce on component unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  useEffect(() => {
    console.log('Dispatching fetchTasks'); // Debug log
    dispatch(fetchTasks());
  }, [dispatch]);

  // Add online/offline status handler
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Add console log for tasks state
  useEffect(() => {
    console.log('Current tasks state:', tasks); // Debug log
    if (tasks?.length > 0) {
      console.log('First task:', tasks[0]); // Debug log
    }
  }, [tasks]);

  const handleTaskNameChange = (e) => {
    const value = e.target.value;
    setTaskName(value);

    if (value.length > 10) {
      setTaskNameError('Task name cannot exceed 10 characters.');
    } else if (value.length >= 8) {
      setTaskNameError('Warning: Approaching character limit.');
    } else {
      setTaskNameError('');
    }
  };

  const handleAddTask = (e) => {
    e.preventDefault();

    if (taskName.length > 10) {
      setTaskNameError('Task name cannot exceed 10 characters.');
      return;
    }

    if (taskName.trim() && taskStatus && taskDueDate) {
      const newTask = {
        name: taskName,
        description: taskDes,
        status: taskStatus,
        due_date: taskDueDate,
        id: Date.now(), // Temporary ID for offline tasks
        isOffline: !isOnline
      };

      if (isOnline) {
        dispatch(addTask(newTask));
      } else {
        setOfflineTasks(prev => [...prev, newTask]);
      }

      setTaskName('');
      setTaskDes('');
      setTaskStatus('');
      setTaskDueDate('');
      setIsModalOpen(false);
    }
  };

  // Sync offline tasks when coming back online
  useEffect(() => {
    if (isOnline && offlineTasks.length > 0) {
      offlineTasks.forEach(task => {
        dispatch(addTask(task));
      });
      setOfflineTasks([]);
    }
  }, [isOnline, offlineTasks, dispatch]);

  const handleInlineEdit = (task, field) => {
    setEditId(task.id);
    setEditName(task.name);
    setEditDes(task.description);
    setEditDate(task.due_date);
    setEditingField(field);
  };

  const handleInlineUpdate = (task) => {
    if (editName.trim()) {
      dispatch(editTask({ 
        id: task.id, 
        taskData: { 
          name: editName, 
          description: editDes, 
          due_date: editDate 
        } 
      }));
      setEditId(null);
      setEditingField(null);
    }
  };

  const handleKeyDown = (e, task) => {
    if (e.key === 'Enter') {
      handleInlineUpdate(task);
    } else if (e.key === 'Escape') {
      setEditId(null);
      setEditingField(null);
    }
  };

  const handleDeleteTask = (id) => {
    dispatch(removeTask(id));
  };

  const handleSort = (field) => {
    setSortField(field);
  };

  // Modify filteredTasks to handle the tasks data structure
  const filteredTasks = [...(tasks || []), ...(offlineTasks || [])]
    .filter(task => {
      console.log('Filtering task:', task); // Debug log
      return (
        (filterStatus ? task.status === filterStatus : true) &&
        (filterDate ? new Date(task.due_date).toISOString().split('T')[0] === filterDate : true) &&
        (searchQuery
          ? task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description.toLowerCase().includes(searchQuery.toLowerCase())
          : true)
      );
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      if (sortField === 'due_date') {
        return new Date(a.due_date) - new Date(b.due_date);
      }
      return String(a[sortField]).localeCompare(String(b[sortField]));
    });

  console.log('Filtered tasks:', filteredTasks); // Debug log

  // Drag and Drop handlers
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== newStatus) {
      dispatch(editTask({ 
        id: draggedTask.id, 
        taskData: { ...draggedTask, status: newStatus } 
      }));
    }
    setDraggedTask(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  const renderTaskCard = (task) => (
    <div 
      key={task.id} 
      draggable
      onDragStart={(e) => handleDragStart(e, task)}
      onDragEnd={handleDragEnd}
      className={`border my-2 rounded-md ${getTaskColor(task.id)} p-4 transition cursor-move ${
        draggedTask?.id === task.id ? 'opacity-50' : ''
      }`}
    >
      <div className="flex flex-col gap-2">
        <span 
          className="font-medium cursor-pointer hover:bg-white/50 p-2 rounded"
          onClick={() => handleInlineEdit(task, 'name')}
        >
          {editId === task.id && editingField === 'name' ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, task)}
              onBlur={() => handleInlineUpdate(task)}
              className="border p-2 rounded w-full bg-white"
              maxLength="10"
              autoFocus
            />
          ) : (
            task.name
          )}
        </span>
        <span 
          className="text-sm text-gray-600 cursor-pointer hover:bg-white/50 p-2 rounded"
          onClick={() => handleInlineEdit(task, 'description')}
        >
          {editId === task.id && editingField === 'description' ? (
            <input
              type="text"
              value={editDes}
              onChange={(e) => setEditDes(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, task)}
              onBlur={() => handleInlineUpdate(task)}
              className="border p-2 rounded w-full bg-white"
              autoFocus
            />
          ) : (
            task.description
          )}
        </span>
        <span 
          className="text-sm cursor-pointer hover:bg-white/50 p-2 rounded"
          onClick={() => handleInlineEdit(task, 'date')}
        >
          {editId === task.id && editingField === 'date' ? (
            <input
              type="date"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, task)}
              onBlur={() => handleInlineUpdate(task)}
              className="border p-2 rounded w-full bg-white"
              autoFocus
            />
          ) : (
            new Date(task.due_date).toISOString().split('T')[0]
          )}
        </span>
        <div className="flex justify-between items-center mt-2">
          <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${
            task.status === 'To Do' ? 'bg-gray-500' : 
            task.status === 'In Progress' ? 'bg-yellow-500' : 'bg-green-500'
          }`}>
            {task.status}
          </span>
          <button
            onClick={() => handleDeleteTask(task.id)}
            className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
          >
            <MdDelete />
          </button>
        </div>
      </div>
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {filteredTasks.map(task => renderTaskCard(task))}
    </div>
  );

  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {filteredTasks.map(task => (
            <tr key={task.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <span 
                  className="cursor-pointer hover:bg-gray-50 p-2 rounded"
                  onClick={() => handleInlineEdit(task, 'name')}
                >
                  {editId === task.id && editingField === 'name' ? (
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, task)}
                      onBlur={() => handleInlineUpdate(task)}
                      className="border p-2 rounded w-full"
                      maxLength="10"
                      autoFocus
                    />
                  ) : (
                    task.name
                  )}
                </span>
              </td>
              <td className="px-6 py-4">
                <span 
                  className="cursor-pointer hover:bg-gray-50 p-2 rounded"
                  onClick={() => handleInlineEdit(task, 'description')}
                >
                  {editId === task.id && editingField === 'description' ? (
                    <input
                      type="text"
                      value={editDes}
                      onChange={(e) => setEditDes(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, task)}
                      onBlur={() => handleInlineUpdate(task)}
                      className="border p-2 rounded w-full"
                      autoFocus
                    />
                  ) : (
                    task.description
                  )}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span 
                  className="cursor-pointer hover:bg-gray-50 p-2 rounded"
                  onClick={() => handleInlineEdit(task, 'date')}
                >
                  {editId === task.id && editingField === 'date' ? (
                    <input
                      type="date"
                      value={editDate}
                      onChange={(e) => setEditDate(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, task)}
                      onBlur={() => handleInlineUpdate(task)}
                      className="border p-2 rounded w-full"
                      autoFocus
                    />
                  ) : (
                    new Date(task.due_date).toISOString().split('T')[0]
                  )}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${
                  task.status === 'To Do' ? 'bg-gray-500' : 
                  task.status === 'In Progress' ? 'bg-yellow-500' : 'bg-green-500'
                }`}>
                  {task.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition"
                >
                  <MdDelete />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredTasks.map(task => renderTaskCard(task))}
    </div>
  );

  const renderKanbanView = () => (
    <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 my-5 md:my-10 p-4">
      {/* To Do Column */}
      <div 
        data-status={'ToDo'} 
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'To Do')}
        className="bg-gray-50 rounded-lg p-4 min-h-[500px]"
      >
        <div className="mb-4 p-2 bg-gray-400 rounded-md">
          <span className="flex justify-center items-center font-semibold">To Do</span>
        </div>
        {filteredTasks
          .filter(task => task.status === 'To Do')
          .map(task => renderTaskCard(task))}
      </div>

      {/* In Progress Column */}
      <div 
        data-status={'InProgress'} 
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'In Progress')}
        className="bg-gray-50 rounded-lg p-4 min-h-[500px]"
      >
        <div className="mb-4 p-2 bg-yellow-400 rounded-md">
          <span className="flex justify-center items-center font-semibold">In Progress</span>
        </div>
        {filteredTasks
          .filter(task => task.status === 'In Progress')
          .map(task => renderTaskCard(task))}
      </div>

      {/* Done Column */}
      <div 
        data-status={'Done'} 
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, 'Done')}
        className="bg-gray-50 rounded-lg p-4 min-h-[500px]"
      >
        <div className="mb-4 p-2 bg-green-400 rounded-md">
          <span className="flex justify-center items-center font-semibold">Done</span>
        </div>
        {filteredTasks
          .filter(task => task.status === 'Done')
          .map(task => renderTaskCard(task))}
      </div>
    </div>
  );

  // error checking with more detailed logging
  if (isLoading) {
    console.log('Loading tasks...'); // Debug log
    return <p>Loading tasks...</p>;
  }
  if (error) {
    console.log('Error loading tasks:', error); // Debug log
    return <p>Error: {error}</p>;
  }

  // Add debug log before rendering
  console.log('Rendering tasks:', {
    total: filteredTasks.length,
    todo: filteredTasks.filter(t => t.status === 'To Do').length,
    inProgress: filteredTasks.filter(t => t.status === 'In Progress').length,
    done: filteredTasks.filter(t => t.status === 'Done').length
  });

  return (
    <>
      {!isOnline && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
          <p className="font-bold">Offline Mode</p>
          <p>You are currently offline. Changes will be synced when you're back online.</p>
        </div>
      )}
      <div className="flex flex-col md:flex-row container bg-white mt-10 mx-auto">
        <div className="w-full lg:mx-20 md:p-6 border mb-10 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Task List</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center space-x-2"
              >
                <BsPlus className="w-5 h-5" />
                <span>Add Task</span>
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-2 rounded ${viewMode === 'kanban' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                <BsGrid className="w-6 h-6" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                <BsGrid className="w-6 h-6" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                <BsList className="w-6 h-6" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded ${viewMode === 'table' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                <BsTable className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="p-2">
            <input
              type="text"
              placeholder="Search tasks by name or description..."
              onChange={handleSearchChange}
              className="mb-4 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          {/* Filters & Sorting */}
          <div className="flex justify-between mb-4 p-2">
            {/* Filter by Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded p-2"
            >
              <option value="">Filter by Status</option>
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>

            {/* Filter by Due Date */}
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="border border-gray-300 rounded p-2"
            />

            {/* Sorting Options */}
            <select
              value={sortField}
              onChange={(e) => handleSort(e.target.value)}
              className="border border-gray-300 rounded p-2"
            >
              <option value="">Sort By</option>
              <option value="name">Name</option>
              <option value="due_date">Due Date</option>
              <option value="status">Status</option>
            </select>
          </div>

          {/* View Content */}
          {viewMode === 'kanban' && renderKanbanView()}
          {viewMode === 'grid' && renderGridView()}
          {viewMode === 'list' && renderListView()}
          {viewMode === 'table' && renderTableView()}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-gray-800">Add New Task</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddTask} className="space-y-6">
              <div className="relative">
                <label className="block text-gray-700 font-semibold mb-2">Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={taskName}
                    onChange={handleTaskNameChange}
                    className={`w-full p-3 pr-12 border ${
                      taskNameError 
                        ? taskName.length > 10 
                          ? 'border-red-500' 
                          : 'border-yellow-500'
                        : 'border-gray-300'
                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition placeholder-gray-400`}
                    placeholder="Enter task name"
                    required
                    maxLength="10"
                  />
                  <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-sm ${
                    taskName.length > 10 
                      ? 'text-red-500' 
                      : taskName.length >= 8 
                        ? 'text-yellow-500' 
                        : 'text-gray-500'
                  }`}>
                    {taskName.length}/10
                  </div>
                </div>
                {taskNameError && (
                  <div className={`mt-1 flex items-center text-sm ${
                    taskName.length > 10 ? 'text-red-500' : 'text-yellow-500'
                  }`}>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {taskNameError}
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="block text-gray-700 font-semibold mb-2">Description</label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition placeholder-gray-400"
                  rows="4"
                  value={taskDes}
                  onChange={(e) => setTaskDes(e.target.value)}
                  placeholder="Enter task description"
                ></textarea>
              </div>

              <div className="relative">
                <label className="block text-gray-700 font-semibold mb-2">Status</label>
                <select
                  value={taskStatus}
                  onChange={(e) => setTaskStatus(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
                  required
                >
                  <option value="">Select Status</option>
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Done">Done</option>
                </select>
              </div>

              <div className="relative">
                <label className="block text-gray-700 font-semibold mb-2">Due Date</label>
                <input
                  type="date"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskList;

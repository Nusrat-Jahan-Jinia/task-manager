import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTasks, addTask, editTask, removeTask } from '../features/tasks/taskSlice';
import _ from 'lodash';
import { useDrag, useDrop } from 'react-dnd';
import { CiEdit } from 'react-icons/ci';
import { MdDelete } from 'react-icons/md';
import { FaSave } from 'react-icons/fa';

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
  const [dragTask, setDragTask] = useState(null);
  const [taskNameError, setTaskNameError] = useState('');

  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  const handleTaskNameChange = (e) => {
    const value = e.target.value;
    setTaskName(value);

    if (value.length > 10) {
      setTaskNameError('Task name cannot exceed 10 characters.');
    } else {
      setTaskNameError('');
    }
  };
  const handleAddTask = (e) => {
    e.preventDefault();

    if (taskName.trim() && taskStatus && taskDueDate) {
      dispatch(addTask({ name: taskName, description: taskDes, status: taskStatus, due_date: taskDueDate }));
      setTaskName('');
      setTaskDes('');
      setTaskStatus('');
      setTaskDueDate('');
    }
  };

  const handleEditTask = (task) => {
    setEditId(task.id);
    setEditName(task.name);
    setEditDes(task.description);
    setEditDate(task.due_date);
  };

  const handleUpdateTask = () => {
    if (editName.trim()) {
      dispatch(editTask({ id: editId, taskData: { name: editName, description: editDes, due_date: editDate } }));
      setEditId(null);
      setEditName('');
      setEditDes('');
      setEditDate('');
    }
  };

  const handleDeleteTask = (id) => {
    dispatch(removeTask(id));
  };

  const handleSort = (field) => {
    setSortField(field);
  };

  // Filter and Sort Logic
  const filteredTasks = tasks
    .filter(
      (task) =>
        (filterStatus ? task.status === filterStatus : true) &&
        (filterDate ? new Date(task.due_date).toISOString().split('T')[0] === filterDate : true) &&
        (searchQuery
          ? task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description.toLowerCase().includes(searchQuery.toLowerCase())
          : true)
    )
    .sort((a, b) => {
      if (sortField === 'name') return a.name.localeCompare(b.name);
      if (sortField === 'due_date') return new Date(a.due_date) - new Date(b.due_date);
      if (sortField === 'status') return a.status.localeCompare(b.status);
      return 0;
    });

  // drag & drop
  const handleDrag = (e, task) => {
    console.log('hello grag');
    setDragTask(task);
  };
  const handleDrop = (status) => {
    if (dragTask && dragTask.status !== status) {
      dispatch(editTask({ id: dragTask.id, taskData: { ...dragTask, status } }));
      setDragTask(null);
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };
  // error checking
  if (isLoading) return <p>Loading tasks...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
      <div className="flex flex-col md:flex-row container bg-white mt-10 mx-auto">
        <div className="w-full lg:mx-20 md:p-6 border mb-10 rounded-xl">
          <h2 className="text-3xl font-bold mb-6 text-center">Task List</h2>

          {/* Search Bar */}
          <div className="p-2">
            <input
              type="text"
              placeholder="Search tasks by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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

          {/* Task List */}
          <div className="container mx-auto flex place-content-between my-5 md:my-10 p-4 flex-col gap-20">
            <div data-status={'ToDo'} onDrop={() => handleDrop('To Do')} onDragOver={onDragOver} className="">
              <div className="mb-4 p-2 bg-gray-400 rounded-md justify-items-center">
                <span className="flex justify-items-center items-center">To Do</span>
              </div>

              {filteredTasks.length > 0 &&
                filteredTasks.map(
                  (task) =>
                    task.status === 'To Do' && (
                      <div key={task.id} className="border my-4 rounded-md hover:bg-gray-100 transition flex">
                        <div
                          onDrag={(e) => handleDrag(e, task)}
                          draggable
                          className="flex justify-between w-full bg-red-50"
                        >
                          <span className="py-3 px-4">
                            {editId === task.id ? (
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="border p-2 rounded w-full mr-2"
                                maxLength="10"
                              />
                            ) : (
                              <span>{task.name}</span>
                            )}
                          </span>
                          <span className="py-3 px-4 truncate w-80">
                            {editId === task.id ? (
                              <input
                                type="text"
                                value={editDes}
                                onChange={(e) => setEditDes(e.target.value)}
                                className="border p-2 rounded w-full mr-2"
                              />
                            ) : (
                              <span>{task.description}</span>
                            )}
                          </span>

                          <span className="py-3 px-4 text-center">
                            {editId === task.id ? (
                              <input
                                type="date"
                                value={editDate}
                                onChange={(e) => setEditDate(e.target.value)}
                                className="border p-2 rounded w-full mr-2"
                              />
                            ) : (
                              <span>{new Date(task.due_date).toISOString().split('T')[0]}</span>
                            )}
                          </span>
                          <span className="py-3 px-4 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-white text-xs font-semibold 
            ${
              task.status === 'To Do' ? 'bg-gray-500' : task.status === 'In Progress' ? 'bg-yellow-500' : 'bg-green-500'
            }`}
                            >
                              {task.status}
                            </span>
                          </span>

                          <span className="py-3 px-4 text-center space-x-2">
                            {editId === task.id ? (
                              <button
                                onClick={handleUpdateTask}
                                className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition"
                              >
                                <FaSave />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleEditTask(task)}
                                className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition"
                              >
                                <CiEdit />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="bg-red-500 text-white px-2 py-1 rounded"
                            >
                              <MdDelete />
                            </button>
                          </span>
                        </div>
                      </div>
                    )
                )}
            </div>
            <div
              data-status={'InProgress'}
              onDrop={() => handleDrop('In Progress')}
              onDragOver={onDragOver}
              className=""
            >
              <div className="mb-4 p-2 bg-yellow-200 rounded-md justify-items-center">
                <span className="flex justify-items-center items-center">In Progress</span>
              </div>
              {filteredTasks.length > 0 &&
                filteredTasks.map(
                  (task) =>
                    task.status === 'In Progress' && (
                      <div key={task.id} className="border my-4 rounded-md hover:bg-gray-100 transition flex">
                        <div
                          onDrag={(e) => handleDrag(e, task)}
                          draggable
                          className="flex justify-between w-full bg-red-50"
                        >
                          <span className="py-3 px-4">
                            {editId === task.id ? (
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="border p-2 rounded w-full mr-2"
                              />
                            ) : (
                              <span>{task.name}</span>
                            )}
                          </span>
                          {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
                          <span className="py-3 px-4 truncate w-80">
                            {editId === task.id ? (
                              <input
                                type="text"
                                value={editDes}
                                onChange={(e) => setEditDes(e.target.value)}
                                className="border p-2 rounded w-full mr-2"
                              />
                            ) : (
                              <span>{task.description}</span>
                            )}
                          </span>

                          <span className="py-3 px-4 text-center">
                            {editId === task.id ? (
                              <input
                                type="date"
                                value={editDate}
                                onChange={(e) => setEditDate(e.target.value)}
                                className="border p-2 rounded w-full mr-2"
                              />
                            ) : (
                              <span>{new Date(task.due_date).toISOString().split('T')[0]}</span>
                            )}
                          </span>
                          <span className="py-3 px-4 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-white text-xs font-semibold 
            ${
              task.status === 'To Do' ? 'bg-gray-500' : task.status === 'In Progress' ? 'bg-yellow-500' : 'bg-green-500'
            }`}
                            >
                              {task.status}
                            </span>
                          </span>

                          <span className="py-3 px-4 text-center space-x-2">
                            {editId === task.id ? (
                              <button
                                onClick={handleUpdateTask}
                                className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition"
                              >
                                <FaSave />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleEditTask(task)}
                                className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition"
                              >
                                <CiEdit />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="bg-red-500 text-white px-2 py-1 rounded"
                            >
                              <MdDelete />
                            </button>
                          </span>
                        </div>
                      </div>
                    )
                )}
            </div>
            <div data-status={'Done'} onDrop={() => handleDrop('Done')} onDragOver={onDragOver} className="">
              <div className="mb-4 p-2 bg-green-400 rounded-md justify-items-center">
                <span className="flex justify-items-center items-center">Done</span>
              </div>
              {filteredTasks.length > 0 &&
                filteredTasks.map(
                  (task) =>
                    task.status === 'Done' && (
                      <div key={task.id} className="border my-4 rounded-md hover:bg-gray-100 transition flex">
                        <div
                          onDrag={(e) => handleDrag(e, task)}
                          draggable
                          className="flex justify-between w-full bg-red-50"
                        >
                          <span className="py-3 px-4 flex">
                            {editId === task.id ? (
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="border p-2 rounded w-full mr-2"
                              />
                            ) : (
                              <span>{task.name}</span>
                            )}
                          </span>
                          <span className="py-3 px-4 truncate w-80 flex">
                            {editId === task.id ? (
                              <input
                                type="text"
                                value={editDes}
                                onChange={(e) => setEditDes(e.target.value)}
                                className="border p-2 rounded w-full mr-2"
                              />
                            ) : (
                              <span>{task.description}</span>
                            )}
                          </span>

                          <span className="py-3 px-4 text-center flex">
                            {editId === task.id ? (
                              <input
                                type="date"
                                value={editDate}
                                onChange={(e) => setEditDate(e.target.value)}
                                className="border p-2 rounded w-full mr-2"
                              />
                            ) : (
                              <span>{new Date(task.due_date).toISOString().split('T')[0]}</span>
                            )}
                          </span>
                          <span className="py-3 px-4 text-center flex">
                            <span
                              className={`px-3 py-1 rounded-full text-white text-xs font-semibold 
            ${
              task.status === 'To Do' ? 'bg-gray-500' : task.status === 'In Progress' ? 'bg-yellow-500' : 'bg-green-500'
            }`}
                            >
                              {task.status}
                            </span>
                          </span>

                          <span className="py-3 px-4 text-center space-x-2 flex justify-end">
                            {editId === task.id ? (
                              <button
                                onClick={handleUpdateTask}
                                className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition"
                              >
                                <FaSave />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleEditTask(task)}
                                className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition"
                              >
                                <CiEdit />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="bg-red-500 text-white px-2 py-1 rounded"
                            >
                              <MdDelete />
                            </button>
                          </span>
                        </div>
                      </div>
                    )
                )}
            </div>
          </div>
        </div>
      </div>
      <div className="container flex mx-auto my-6 pb-10">
        <div className="w-full lg:w-1/2 mx-3 md:mx-auto  pb-10 ">
          <form onSubmit={handleAddTask} className="border shadow-md space-y-6 bg-white p-8 rounded-xl mb-6">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Add New Task</h2>

            <div className="relative">
              <label className="block text-gray-700 font-semibold mb-2">Name</label>
              <input
                type="text"
                value={taskName}
                // onChange={(e) => setTaskName(e.target.value)}
                onChange={handleTaskNameChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition placeholder-gray-400"
                placeholder="Enter task name"
                required
                maxLength="10"
              />
              {taskNameError && <p className="text-red-500 text-sm mt-1">{taskNameError}</p>}
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

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-500 to-indigo-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-600 transition duration-300"
            >
              Add Task
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default TaskList;

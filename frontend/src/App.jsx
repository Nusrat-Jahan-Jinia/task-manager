import { Route, createBrowserRouter, createRoutesFromElements, RouterProvider } from 'react-router-dom';
import React from 'react';
import TasksPage from './pages/TaskList';
import MainLayout from './layouts/MainLayout';
import NotFoundPage from './pages/NotFound';
import Register from './pages/Register';
import Login from './pages/Login';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<MainLayout />}>
      <Route path="/tasks" element={<TasksPage />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  )
);
const App = () => {
  return (
    <>
      <RouterProvider router={router}>
        <div class="container mx-auto">
          <div className="text-5xl">App</div>
        </div>
      </RouterProvider>
    </>
  );
};

export default App;

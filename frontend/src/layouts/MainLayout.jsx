import React from "react";
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Footer from "../components/Footer";

function MainLayout() {
   const location = useLocation(); 
  return (
    <>
      <Navbar />
      {location.pathname === "/" && (
        <Hero
          title="Task Management Application"
          subtitle="Developed a task manager app with a ReactJS frontend, a laravel backend and mysql for data storage. The app will allow users to create, update, delete, filter, and search for tasks."
        />
      )}

      <Outlet />
      <Footer />
    </>
  );
}

export default MainLayout;

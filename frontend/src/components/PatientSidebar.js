"use client"; // Ensure this is a client-side component

import Link from "next/link";
import { usePathname } from "next/navigation"; // Detects current page
import { useEffect } from "react";
import "../styles/PatientSidebar.css"; // Import the CSS file (make sure it's a global stylesheet)

const PatientSidebar = () => {
  const pathname = usePathname(); // Get current route

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">Family Dental Surgery</span>
        <img src="/logo.png" alt="Dental Logo" className="sidebar-logo" />
      </div> 



      {/* Sidebar Menu */}
      <ul className="sidebar-menu">
          <li className={pathname === "/PatientDashboard" ? "active" : ""}>
            <Link href="/PatientDashboard">
            <img src="/dashboard_icon.png" alt="dashboard icon" className="dashboard-logo"/>  Dashboard</Link>
          </li>

           

          <li className={pathname === "/MyAppointments" ? "active" : ""}>
            <Link href="/MyAppointments">     
            <img src="/appointment_icon.png" alt="appointment icon" className="appointment-logo"/>  Appointments</Link>
          </li>

          <li className={pathname === "/DentistList" ? "active" : ""}>
            <Link href="/DentistList">    
            <img src="/dashboard_icon.png" alt="dashboard icon" className="dashboard-logo"/>  Dentist Availability</Link>
          </li>

          <li className={pathname === "/PatientQueueView" ? "active" : ""}>
            <Link href="/PatientQueueView">
            <img src="/patient_icon.png" alt="patient icon" className="patient-logo"/>Patient Queue</Link>
          </li>
          
        </ul>
    </aside>
  );
}

export default PatientSidebar;
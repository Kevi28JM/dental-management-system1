"use client"; // Ensure this is a client-side component

import Link from "next/link";
import { usePathname } from "next/navigation"; // Detects current page
import { useEffect } from "react";
import "../styles/AssistSidebar.css"; // Import the CSS file (make sure it's a global stylesheet)

const AssistSidebar = () => {
  const pathname = usePathname(); // Get current route

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">Family Dental Surgery</span>
        <img src="/logo.png" alt="Dental Logo" className="sidebar-logo" />
      </div> 

      {/* Sidebar Menu */}
      <ul className="sidebar-menu">
          <li className={pathname === "/dashboard" ? "active" : ""}>
            <Link href="/dashboard">
            <img src="/dashboard_icon.png" alt="dashboard icon" className="dashboard-logo"/>  Dashboard</Link>
          </li>
          <li className={pathname === "/patient-register" ? "active" : ""}>
            <Link href="/patient-register">
            <img src="/patient_icon.png" alt="patient icon" className="patient-logo"/>  Patient Register</Link>
          </li>
          <li className={pathname === "/AssistDentistList" ? "active" : ""}>
            <Link href="/AssistDentistList">     
            <img src="/appointment_icon.png" alt="appointment icon" className="appointment-logo"/>  Appointments</Link>
          </li>
          
          
        </ul>
    </aside>
  );
}

export default AssistSidebar;
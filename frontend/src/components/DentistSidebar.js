"use client"; // Ensure this is a client-side component

import Link from "next/link";
import { usePathname } from "next/navigation"; // Detects current page
import { useEffect } from "react";
import "../styles/DentistSidebar.css"; // Import the CSS file (make sure it's a global stylesheet)

const DentistSidebar = () => {
  const pathname = usePathname(); // Get current route

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-title">Family Dental Surgery</span>
        <img src="/logo.png" alt="Dental Logo" className="sidebar-logo" />
      </div> 

      {/* Sidebar Menu */}
      <ul className="sidebar-menu">
          <li className={pathname === "/DentistDashboard" ? "active" : ""}>
            <Link href="/DentistDashboard">
            <img src="/dashboard_icon.png" alt="dashboard icon" className="dashboard-logo"/>  Dashboard</Link>
          </li>

          <li className={pathname === "/DentistProfile" ? "active" : ""}>
            <Link href="/DentistProfile">
            <img src="/dashboard_icon.png" alt="dashboard icon" className="dashboard-logo"/>  Profile</Link>
          </li>

          <li className={pathname === "/DentistAvailability" ? "active" : ""}>
            <Link href="/DentistAvailability">    
            <img src="/dashboard_icon.png" alt="dashboard icon" className="dashboard-logo"/>  Dentist Availability</Link>
          </li>

           <li className={pathname === "/DentistViewAppointments" ? "active" : ""}>
            <Link href="/DentistViewAppointments">     
            <img src="/appointment_icon.png" alt="appointment icon" className="appointment-logo"/>  Appointments</Link>
          </li>

           <li className={pathname === "/appointment-report" ? "active" : ""}>
            <Link href="/appointment-report">     
            <img src="/appointment_icon.png" alt="appointment icon" className="appointment-logo"/>  Reports</Link>
          </li>
         {/*} <li className={pathname === "/patients" ? "active" : ""}>
            <Link href="/patient-register">
            <img src="/patient_icon.png" alt="patient icon" className="patient-logo"/>  Patient Register</Link>
          </li>
         
          <li className={pathname === "/inventory" ? "active" : ""}>
            <Link href="/inventory"> 
            <img src="/inventory_icon.png" alt="inventory icon" className="inventory-logo"/>  Inventory</Link>
          </li>
          */}
        </ul>
    </aside>
  );
}

export default DentistSidebar;
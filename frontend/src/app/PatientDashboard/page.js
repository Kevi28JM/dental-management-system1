"use client"; // Ensure this is a client-side component

import "@/styles/PatientDashboard.css";
import PatientSidebar from "@/components/PatientSidebar"; // Import the sidebar component
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Detects current page

 
   

    const DentistDashboard = () => {
        const router = useRouter();
        const pathname = usePathname(); // Get current route
        
     
        return (
          <div className="dashboard-container">
             <PatientSidebar/> {/* Sidebar component */}
            
           <main className="main-content">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="logo">
              <svg className="patient-svg" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
                {/* Simplified Patient Avatar */}
                <circle cx="250" cy="250" r="200" fill="#FFE4C4" stroke="#333" strokeWidth="6"/>
                <circle cx="180" cy="200" r="30" fill="white" stroke="#333" strokeWidth="4"/>
                <circle cx="320" cy="200" r="30" fill="white" stroke="#333" strokeWidth="4"/>
                <circle cx="180" cy="200" r="10" fill="#333"/>
                <circle cx="320" cy="200" r="10" fill="#333"/>
                <path d="M180 300 Q250 350 320 300" fill="none" stroke="#333" strokeWidth="6"/>
              </svg>
            </div>
            <div className="dashboard-title">
              <h1>Patient Dashboard</h1>
              <p>Your dental health overview</p>
            </div>
          </div>
        </header>
        
        <div className="cards-container">
          <div className="card patients-card">
            <div className="card-content">
              <div className="card-icon">📅</div>
              <div className="card-value">1</div>
              <div className="card-label">Upcoming Appointment</div>
            </div>
          </div>
          
          <div className="card appointments-card">
            <div className="card-content">
              <div className="card-icon">🦷</div>
              <div className="card-value">2</div>
              <div className="card-label">Completed Treatments</div>
            </div>
          </div>
          
          <div className="card revenue-card">
            <div className="card-content">
              <div className="card-icon">⏰</div>
              <div className="card-value">0</div>
              <div className="card-label">Active Reminders</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
export default DentistDashboard;

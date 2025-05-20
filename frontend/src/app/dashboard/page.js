"use client"; // Ensure this is a client-side component

import "@/styles/dashboard.css";
import AssistSidebar from "@/components/AssistSidebar"; // Import the sidebar component
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Detects current page

const AssistantDashboard = () => {
  const router = useRouter();
  const pathname = usePathname(); // Get current route
  
/*
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "Assistant") {
      router.push("/login"); // Redirect to login if not an assistant
    }
  }, []); */
  
  return (
    <div className="dashboard-container">
      <AssistSidebar />
      
      <main className="main-content">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="logo">
              <svg className="assistant-svg" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
                {/* Assistant Character */}
                {/* Face */}
                <ellipse cx="250" cy="250" rx="180" ry="200" fill="#FFE4C4" stroke="#333" strokeWidth="6"/>
                
                {/* Hair */}
                <path d="M100 200C100 100 170 60 250 60C330 60 400 100 400 200C400 220 390 240 380 260
                         C380 180 350 140 320 160C300 100 200 100 180 160C150 140 120 180 120 260
                         C110 240 100 220 100 200Z" fill="#4b5320" stroke="#333" strokeWidth="6"/>
                
                {/* Eyes */}
                <ellipse cx="180" cy="220" rx="25" ry="15" fill="white" stroke="#333" strokeWidth="4"/>
                <ellipse cx="320" cy="220" rx="25" ry="15" fill="white" stroke="#333" strokeWidth="4"/>
                <circle cx="180" cy="220" r="8" fill="#333"/>
                <circle cx="320" cy="220" r="8" fill="#333"/>
                
                {/* Eyebrows */}
                <path d="M150 190C160 185 190 185 200 190" fill="none" stroke="#333" strokeWidth="4"/>
                <path d="M300 190C310 185 340 185 350 190" fill="none" stroke="#333" strokeWidth="4"/>
                
                {/* Blush */}
                <ellipse cx="150" cy="270" rx="20" ry="10" fill="#FFB6C1" fillOpacity="0.6"/>
                <ellipse cx="350" cy="270" rx="20" ry="10" fill="#FFB6C1" fillOpacity="0.6"/>
                
                {/* Nose */}
                <path d="M245 220C250 240 255 260 250 280" fill="none" stroke="#333" strokeWidth="4"/>
                
                {/* Smile */}
                <path d="M180 320C200 350 300 350 320 320" fill="none" stroke="#333" strokeWidth="6"/>
                <path d="M180 320C200 335 300 335 320 320" fill="white" stroke="#333" strokeWidth="2"/>
                
                {/* Teeth */}
                <path d="M200 322L200 333M220 325L220 336M240 326L240 337M260 326L260 337M280 325L280 336M300 322L300 333" stroke="#333" strokeWidth="2"/>
                
                {/* Medical Scrubs */}
                <path d="M100 350C100 500 400 500 400 350" fill="#5e8c61" stroke="#333" strokeWidth="6"/>
                <path d="M150 350L350 350" stroke="#333" strokeWidth="6"/>
                
                {/* Collar */}
                <path d="M150 350C180 320 220 310 250 310C280 310 320 320 350 350" fill="#5e8c61" stroke="#333" strokeWidth="6"/>
                
                {/* Clipboard */}
                <rect x="300" y="380" width="60" height="80" rx="5" fill="white" stroke="#333" strokeWidth="4"/>
                <rect x="310" y="390" width="40" height="10" fill="#f72585" stroke="#333" strokeWidth="2"/>
                <line x1="310" y1="410" x2="350" y2="410" stroke="#333" strokeWidth="2"/>
                <line x1="310" y1="415" x2="350" y2="415" stroke="#333" strokeWidth="2"/>
                <line x1="310" y1="420" x2="350" y2="420" stroke="#333" strokeWidth="2"/>
                <line x1="310" y1="425" x2="350" y2="425" stroke="#333" strokeWidth="2"/>
                <line x1="310" y1="430" x2="350" y2="430" stroke="#333" strokeWidth="2"/>
                <line x1="310" y1="435" x2="350" y2="435" stroke="#333" strokeWidth="2"/>
                <line x1="310" y1="440" x2="350" y2="440" stroke="#333" strokeWidth="2"/>
              </svg>
            </div>
            <div className="dashboard-title">
              <h1>Assistant Dashboard</h1>
              <p>Welcome back!</p>
            </div>
          </div>
        </header>
        
        <div className="cards-container">
          <div className="card patients-card">
            <div className="card-content">
              <div className="card-icon">👥</div>
              <div className="card-value">7</div>
              <div className="card-label">Patients Today</div>
            </div>
          </div>
          
          <div className="card appointments-card">
            <div className="card-content">
              <div className="card-icon">📋</div>
              <div className="card-value">2</div>
              <div className="card-label">Patient Registrations</div>
            </div>
          </div>
          
          <div className="card appointments-card">
            <div className="card-content">
              <div className="card-icon">📅</div>
              <div className="card-value">7</div>
              <div className="card-label">Appointments Today</div>
               
            </div>
          </div>
         
        </div>
        
      
      </main>
    </div>
  );
};

 
export default AssistantDashboard;

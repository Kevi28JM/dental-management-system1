"use client"; // Ensure this is a client-side component  
import "@/styles/DentistDashboard.css"; 
import DentistSidebar from "@/components/DentistSidebar"; // Import the sidebar component 
import { useEffect } from "react"; 
import { useRouter } from "next/navigation"; 
import Link from "next/link"; 
import { usePathname } from "next/navigation"; // Detects current page             

const DentistDashboard = () => {
  const router = useRouter();
  const pathname = usePathname(); // Get current route                        
  
  return (
    <div className="dashboard-container">
      <DentistSidebar/> {/* Sidebar component */}
      
      <main className="main-content">
        <header className="dashboard-header">
          <div className="header-content">
            <div className="logo">
              <svg className="dentist-svg" viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
                {/* Female Dentist */}
                {/* Face */}
                <ellipse cx="250" cy="250" rx="180" ry="200" fill="#FFE4C4" stroke="#333" strokeWidth="6"/>
                
                {/* Hair */}
                <path d="M100 200C100 100 170 60 250 60C330 60 400 100 400 200C400 220 390 240 380 260
                         C380 180 350 140 320 160C300 100 200 100 180 160C150 140 120 180 120 260
                         C110 240 100 220 100 200Z" fill="#8B4513" stroke="#333" strokeWidth="6"/>
                
                {/* Eyes */}
                <ellipse cx="180" cy="220" rx="25" ry="15" fill="white" stroke="#333" strokeWidth="4"/>
                <ellipse cx="320" cy="220" rx="25" ry="15" fill="white" stroke="#333" strokeWidth="4"/>
                <circle cx="180" cy="220" r="8" fill="#333"/>
                <circle cx="320" cy="220" r="8" fill="#333"/>
                
                {/* Eyebrows */}
                <path d="M150 190C160 185 190 185 200 190" fill="none" stroke="#333" strokeWidth="4"/>
                <path d="M300 190C310 185 340 185 350 190" fill="none" stroke="#333" strokeWidth="4"/>
                
                {/* Eyelashes */}
                <path d="M155 210L145 205M165 205L155 200M190 205L200 200M205 210L215 205" stroke="#333" strokeWidth="2"/>
                <path d="M295 210L285 205M305 205L295 200M330 205L340 200M345 210L355 205" stroke="#333" strokeWidth="2"/>
                
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
                
                {/* Ears */}
                <path d="M70 230C60 210 70 190 90 180C95 200 95 220 90 240Z" fill="#FFE4C4" stroke="#333" strokeWidth="4"/>
                <path d="M430 230C440 210 430 190 410 180C405 200 405 220 410 240Z" fill="#FFE4C4" stroke="#333" strokeWidth="4"/>
                
                {/* Dental Coat */}
                <path d="M100 350C100 500 400 500 400 350" fill="#4cc9f0" stroke="#333" strokeWidth="6"/>
                <path d="M150 350L350 350" stroke="#333" strokeWidth="6"/>
                <path d="M200 350L200 420" stroke="#333" strokeWidth="6"/>
                <path d="M300 350L300 420" stroke="#333" strokeWidth="6"/>
                
                {/* Collar */}
                <path d="M150 350C180 320 220 310 250 310C280 310 320 320 350 350" fill="#4cc9f0" stroke="#333" strokeWidth="6"/>
                
                {/* Stethoscope */}
                <circle cx="170" cy="400" r="15" fill="#f72585" stroke="#333" strokeWidth="3"/>
                <path d="M170 400C180 380 200 360 220 340" fill="none" stroke="#f72585" strokeWidth="5"/>
                
                {/* Tooth Icon on Pocket */}
                <g transform="translate(250, 390) scale(0.4)">
                  <path d="M-25,-40 C-60,-40 -60,20 -40,40 C-20,60 -10,60 0,40 C10,60 20,60 40,40 C60,20 60,-40 25,-40 Z" fill="white" stroke="#333" strokeWidth="8"/>
                </g>
              </svg>
            </div>
            <div className="dashboard-title">
              <h1>Dentist Dashboard</h1>
              <p>Welcome back!  </p>
            </div>
          </div>
        </header>
        
        <div className="cards-container">
          <div className="card patients-card">
            <div className="card-content">
              <div className="card-icon">👥</div>
              <div className="card-value">36</div>
              <div className="card-label">Total Patients</div>
               
            </div>
          </div>
          
          <div className="card appointments-card">
            <div className="card-content">
              <div className="card-icon">📅</div>
              <div className="card-value">7</div>
              <div className="card-label">Appointments Today</div>
               
            </div>
          </div>
          
          <div className="card revenue-card">
            <div className="card-content">
              <div className="card-icon">🦷</div>
              <div className="card-value">72%</div>
              <div className="card-label">Treatment Completion</div>
               
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DentistDashboard;
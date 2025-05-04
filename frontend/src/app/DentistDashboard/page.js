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
                <h3>Welcome, Assistant</h3>
                 
              </header>
      
              <section className="dashboard-grid">
                <div className="calendar-section">
                  <h4>📅 August, 2020</h4>
                  {/* Calendar Placeholder */}
                  <div className="calendar-placeholder">Calendar</div>
                </div>
      
                <div className="tasks-section">
                  <h4>✅ Today’s Tasks</h4>
                  <ul>
                    <li>☑️ Working on Asla Project</li>
                     
                    
                  </ul>
                </div>
      
                <div className="notifications">
                  <h4>🔔 Notifications</h4>
                   
                </div>
      
                <div className="team-chat">
                   
                   
                </div>
              </section>
            </main>
          </div>
        );
      };

  

export default DentistDashboard;

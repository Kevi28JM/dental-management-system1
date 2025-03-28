"use client"; // Ensure this is a client-side component

import "@/styles/dashboard.css";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const AssistantDashboard = () => {
  const router = useRouter();
/*
  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== "Assistant") {
      router.push("/login"); // Redirect to login if not an assistant
    }
  }, []); */

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
      <div className="sidebar-header">
      <span className="sidebar-title">Family Dental Surgery</span>
      <img src="/logo.png" alt="Dental Logo" className="sidebar-logo" />
        
      </div> 
        <ul>
          <li>🏠 Home</li>
          <li>📁 Project</li>
          <li>📅 Calendar</li>
          <li>💬 Team Chat</li>
          <li>⚙️ Settings</li>
        </ul>
      </aside>

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
              <li>☑️ Team Meeting</li>
              <li>☑️ Doing Research</li>
            </ul>
          </div>

          <div className="notifications">
            <h4>🔔 Notifications</h4>
            <p>Emily assigned you a task.</p>
          </div>

          <div className="team-chat">
            <h4>💬 Team Chat</h4>
            <p>Hey, how’s the project going?</p>
          </div>
        </section>
      </main>
    </div>
  );
};
export default AssistantDashboard;

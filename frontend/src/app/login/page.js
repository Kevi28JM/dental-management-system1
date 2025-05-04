"use client";  // Make this a client-side component

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import Link from "next/link"; // Import Link from Next.js
import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/Login.css"; // Import custom styles
import { ToastContainer , toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const login = () => {
  const [role, setRole] = useState(""); // State to store selected role
  const [formData, setFormData] = useState({ patientId: "",email: "", password: "" }); // State for user input fields
  const router = useRouter(); // Next.js router for redirection

  // Handle input field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission for login
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission

    if (!role) {
      toast.warn("Please select a role.");
      return;
    }
    
    try {
      const payload = {
        role,
        password: formData.password,
        ...(role === "Patient" ? { patientId: formData.patientId } : { email: formData.email })
      };
      
      console.log("Login Payload:", payload);

      const response = await axios.post(`http://localhost:5000/api/users/login`, payload);

      if (response.data.success) {
        toast.success("Login successful! Redirecting...", { autoClose: 2000 });

        localStorage.setItem("user_id", response.data.user_id);

        setTimeout(() => {
          if (role === "Patient") {
            router.push("/patient-dashboard");
          } else if (role === "Assistant") {
            router.push("/dashboard");
          } else if (role === "Dentist") {
            router.push("/DentistDashboard");
          } else {
            toast.error("Unknown role. Cannot redirect.");
          }
        }, 2000);
      } else {
        toast.error("Invalid credentials. Please try again.");
      }
    } catch (error) {
      toast.error("Login failed. Check your credentials and try again.");
    }
  };

  return (
    <div className="login-container">
    <ToastContainer position="top-right" /> {/* Toast Notification Container */}

      <div className="login-card">
        <h3>Login</h3>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label fw-bold">Role</label>
            <select className="form-select" onChange={(e) => {
                setRole(e.target.value);
                setFormData({ patientId: "", email: "", password: "" }); // Reset fields
             }} 
             required
             >
              <option value="">Select Role</option>
              <option value="Assistant">Assistant</option>
              <option value="Dentist">Dentist</option>
              <option value="Patient">Patient</option>
            </select>
          </div>
          
          {/* Conditionally show phone or email */}
          {role === "Patient" ? (
          <div className="mb-3">
            <label className="form-label fw-bold">Patient ID</label>
            <input
              type="text"
              className="form-control"
              name="patientId"
              placeholder="Enter patient ID"
              value={formData.patientId}
              onChange={handleChange}
              required
            />
          </div>

        ) : role === "Assistant" || role === "Dentist" ? (
          <div className="mb-3">
              <label className="form-label fw-bold">Email</label>
              <input
                type="email"
                className="form-control"
                name="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          ) : null}
            
            {/* Role selection */}

{/* Show password only after role is selected */}
{role && (
  <div className="mb-3">
    <label className="form-label fw-bold">Password</label>
    <input
      type="password"
      className="form-control"
      name="password"
      placeholder="Enter password"
      value={formData.password}
      onChange={handleChange}
      required
    />
  </div>
)}

          {/* Login button */}
          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>

        {/* Signup link for new users */}
        <p className="mt-3">
          Don't have an account?{" "}
          <Link href="/signup">Sign Up</Link> {/* Use Next.js Link */}
        </p>
      </div>
    </div>
  );
};

export default login;

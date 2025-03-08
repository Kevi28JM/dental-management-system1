"use client";  // Make this a client-side component

import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; // Import useRouter for navigation
import Link from "next/link"; // Import Link from Next.js
import "bootstrap/dist/css/bootstrap.min.css";
import "@/styles/Login.css"; // Import custom styles
import { ToastContainer } from 'react-toastify';


const login = () => {
  const [role, setRole] = useState(""); // State to store selected role
  const [formData, setFormData] = useState({ phone: "", password: "" }); // State for user input
  const router = useRouter(); // Next.js router for redirection

  // Handle input field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission for login
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default form submission
    try {
      const response = await axios.post(`/api/login`, { role, ...formData });

      if (response.data.success) {
        alert("Login successful!");
        router.push("/dashboard"); // Redirect to the dashboard after login
      } else {
        alert("Invalid credentials. Please try again.");
      }
    } catch (error) {
      alert("Error logging in. Please check your credentials.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h3>Login</h3>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label fw-bold">Role</label>
            <select className="form-select" onChange={(e) => setRole(e.target.value)} required>
              <option value="">Select Role</option>
              <option value="Assistant">Assistant</option>
              <option value="Dentist">Dentist</option>
              <option value="Patient">Patient</option>
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label fw-bold">Phone Number</label>
            <input
              type="text"
              className="form-control"
              name="phone"
              placeholder="Enter phone number"
              onChange={handleChange}
              required
            />
          </div>

          {/* Password input field */}
          <div className="mb-3">
            <label className="form-label fw-bold">Password</label>
            <input
              type="password"
              className="form-control"
              name="password"
              placeholder="Enter password"
              onChange={handleChange}
              required
            />
          </div>

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

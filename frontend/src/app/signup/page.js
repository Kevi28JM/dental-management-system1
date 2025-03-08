// Add this line at the top of your page.js file
"use client"; // Ensures this component runs on the client-side

import { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import Link from "next/link"; // Use next/link for routing in Next.js
import "@/styles/Signup.css";  // Import custom styles
import { ToastContainer } from 'react-toastify';

const signup = () => {
  // State for user role and form data
  const [role, setRole] = useState("");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", password: "" });
  const [accountExists, setAccountExists] = useState(null);

  // Handle input field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle signup process
  const handleSignup = async (e) => {
    e.preventDefault();

    // New Patient (Temporary Account) - No password required
    if (role === "New Patient (Temporary Account)") {
      try {
        await axios.post("/api/patients/temporary-register", {
          name: formData.name,
          phone: formData.phone,// Only phone is required
          email: formData.email || "", // Send an empty string if email is not provided
          });
        alert("Temporary account created! You can now book an appointment.");
      } catch (error) {
        alert("Error creating temporary account.");
      }
    // Existing Patient - Account Verification
    } else if (role === "Patient" && accountExists) {
      try {
        await axios.post("/api/patients/set-password", {
          phone: formData.phone, // Use phone as primary identifier
          password: formData.password,
        });
        alert("Account setup completed! You can now log in.");
      } catch (error) {
        alert("Error setting password.");
      }
    } 
    // General Signup Process
    else {
      try {
        await axios.post("/api/signup", formData);
        alert("Account created successfully!");
      } catch (error) {
        alert("Error signing up.");
      }
    }
  };

  // Find Existing Account (Patients)
  const handleFindAccount = async () => {
    try {
      const response = await axios.post("/api/patients/verify-registered", { phone: formData.phone });
      if (response.data.exists) {
        setAccountExists(true);
        alert("Account found! Please create a password.");
      } else {
        setAccountExists(false);
        alert("No registered account found. Please visit the clinic to get registered.");
      }
    } catch (error) {
      alert("Error verifying account.");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h3>Sign Up</h3>
        <form onSubmit={handleSignup}>
          {/* Role Selection */}
          <div className="mb-3">
            <label className="form-label fw-bold">Role</label>
            <select className="form-select" onChange={(e) => setRole(e.target.value)} required>
              <option value="">Select Role</option>
              <option value="Assistant">Assistant</option>
              <option value="Dentist">Dentist</option>
              <option value="Patient">Patient</option>
              <option value="New Patient (Temporary Account)">New Patient (Temporary Account)</option>
            </select>
          </div>

          {/* Show fields based on role */}
          {role && (
            <>
            {/* Full Name */}
              <div className="mb-3">
                <label className="form-label fw-bold">Full Name</label>
                <input type="text" className="form-control" name="name" placeholder="Enter your name" onChange={handleChange} required />
              </div>
              
              {/* Phone Number (Required) */}
              <div className="mb-3">
                <label className="form-label fw-bold">Telephone Number</label>
                <input type="text" className="form-control" name="phone" placeholder="Enter telephone number" onChange={handleChange} required />
              </div>

              {/* Email (Optional) */}
              <div className="mb-3">
                <label className="form-label fw-bold">Email (Optional)</label>
                <input type="email" className="form-control" name="email" placeholder="Enter email (If available)" onChange={handleChange} />
              </div>
             
            </>
          )}

          {/* Find My Account for Existing Patients */}
          {role === "Patient" && (
            <div className="mb-3">
              <button type="button" className="btn btn-secondary w-100" onClick={handleFindAccount}>
                Find My Account
              </button>
            </div>
          )}

          {/* Password Field (Only for registered patients who found their account) */}
          {role === "Patient" && accountExists && (
            <div className="mb-3">
              <label className="form-label fw-bold">Create Password</label>
              <input type="password" className="form-control" name="password" placeholder="Create a password" onChange={handleChange} required />
            </div>
          )}

          {/* Password Field (For all roles except temporary patients) */}
          {role !== "New Patient (Temporary Account)" && role !== "" && (
            <div className="mb-3">
              <label className="form-label fw-bold">Password</label>
              <input type="password" className="form-control" name="password" placeholder="Enter password" onChange={handleChange} required />
            </div>
          )}

          {/* Signup Button */}
          <button type="submit" className="btn btn-primary w-100">Sign Up</button>
        </form>

        {/* Login Link (Only for Assistant, Dentist, and Patient) */}
        {role && role !== "New Patient (Temporary Account)" && (
          <p className="login-link mt-3 text-center">
          Already have an account? <Link href="/login" className="fw-bold text-primary">Login here</Link>
           </p>

        )}
      </div>
    </div>
  );
};

export default signup;

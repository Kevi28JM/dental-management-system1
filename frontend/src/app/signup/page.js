// Add this line at the top of your page.js file
"use client"; // Ensures this component runs on the client-side

import { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import Link from "next/link"; // Use next/link for routing in Next.js
import "@/styles/Signup.css";  // Import custom styles
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const signup = () => {
  // State for user role and form data
  const [role, setRole] = useState("");
  const [formData, setFormData] = useState({ 
    name: "", 
    phone: "",
    email: "", 
    password: "" 
  });
  const [accountExists, setAccountExists] = useState(null);

  // Handle input field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

 //validating form data
  const validateForm = () => {
    if (!role){
      toast.error("Please select a role");
      return false
    }
    if (!formData.name.trim()){
      toast.error("Name is required");
      return false;
    }
    if(!formData.phone){
      toast.error("Phone number is required");  
      return false;
    }
    if(!/^\d{10}$/.test(formData.phone)){
      toast.error("Phone number must be 10 digits");
      return false;
    }
     
    if(formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)){
      toast.error("Invalid email address");
      return false;
    }
    if(!formData.password){
      toast.error("Password is required");
      return false;
    }
    if(role === "Patient" && accountExists && !formData.password){
      toast.error("Password is required");
      return false;
    }
   /* if(role === "Patient" && !accountExists){
      toast.error("Please find your account first");
      return false;
    }*/
    /*if(role !== "New Patient (Temporary Account)" && formData.password.length < 8){
      toast.error("Password must be at least 8 characters");
      return false;
    }*/

      if (!formData.password || formData.password.length < 8) {
        toast.error("Password must be at least 8 characters");
        return false;
      }

    //additional validation for dentist and assistant passwords
    if(role === "Dentist" && !formData.password.startsWith("DENT")){
      toast.error("Dentist password must start with 'DENT'");
      return false;
    }
    if(role === "Assistant" && !formData.password.startsWith("ASST")){
      toast.error("Assistant password must start with 'ASST'");
      return false;
    }
    return true;
  };
  // Handle signup process
  const handleSignup = async (e) => {
    e.preventDefault();

  // ✅ Log the phone number before validation
  console.log("Phone input:", formData.phone);

    if(!validateForm()){
      console.log("Validation failed, signup request not sent.");
      return;   //validate form before proceeding
    }

    /*
    // New Patient (Temporary Account) - No password required
    try {
      if (role === "New Patient (Temporary Account)") {
         await axios.post("/api/patients/temporary-register", {
          name: formData.name,
          phone: formData.phone,// Only phone is required
          email: formData.email || "", // Send an empty string if email is not provided
          });
        toast.success("Temporary account created! You can now book an appointment.");
      } else if (role === "Patient" && accountExists) {
      // Existing Patient - Account Verification set password
        await axios.post("/api/patients/set-password", {
          phone: formData.phone, // Use phone as primary identifier
          password: formData.password,
        });
        toast.success("Account setup completed! You can now log in.");
      } else {  */
       
      
    // General Signup Process for Assistant ,Dentist and patients
    try {
      const response = await axios.post("http://localhost:5000/api/users/signup", { role, ...formData });
      if (response.status === 201) {
        toast.success("Signup successful! You can now log in.");
        console.log("Signup success:", response.data);
      } else {
        toast.error("Signup failed. Please try again.");
        console.error("Unexpected response:", response);
      }
    } catch (error) {
      console.error("Signup error:", error.response ? error.response.data : error);
      toast.error(error.response?.data?.message || "Signup failed. Please try again.");
    }
  };

  // Function to check if a patient already has an account
  const handleFindAccount = async () => {
    if (role !== "Patient") return; // Prevent running for other roles
    try {
      const response = await axios.post("/api/patients/verify-registered", { phone: formData.phone });
      if (response.data.exists) {
        setAccountExists(true);
        toast.info("Account found! Please create a password.");
      } else {
        setAccountExists(false);
        toast.error("No registered account found. Please visit the clinic to get registered.");
      }
    } catch (error) {
      toast.error("Error verifying account.");
    }
  };

  return (
    <div className="signup-container">
    <ToastContainer />
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
            {/* <option value="New Patient (Temporary Account)">New Patient (Temporary Account)</option>*/}
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

              {/* Email  */}
              <div className="mb-3">
                <label className="form-label fw-bold">Email</label>
                <input type="email" className="form-control" name="email" placeholder="Enter email " onChange={handleChange} required/>
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

          {/* Password Field  */}
          {role !== "New Patient (Temporary Account)" && role !== "" && (
            <div className="mb-3">
              <label className="form-label fw-bold">Password</label>
              <input type="password" className="form-control" name="password" placeholder="Enter password" onChange={handleChange} required />
            </div>
          )}

          {/* Signup Button */}
          <button type="submit" className="btn btn-primary w-100">Sign Up</button>
        </form>

        {/* Login Link  for Assistant, Dentist, and Patient */}
        <p className="login-link mt-3 text-center">
          Already have an account? <Link href="/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default signup;

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
  const [step, setStep] = useState(1); // Step 1: Verify, Step 2: Complete Registration
  const [formData, setFormData] = useState({ 
    name: "", 
    phone: "",
    email: "", 
    password: "",
    tempPassword: "",
    patientId: "" 
  });
  //const [accountExists, setAccountExists] = useState(null);
  

    // ✅ Log the current step on each render
    console.log("Current step:", step);

  // Handle input field changes
  const handleChange = (e) => {
    console.log("Field changed:", e.target.name, "Value:", e.target.value);
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVerifyTempPatient = async () => {
    console.log("Initiating temporary password verification...");
    console.log("Payload being sent:", {
      patientId: formData.patientId,
      tempPassword: formData.tempPassword,
    });

    try {
      const response = await axios.post("http://localhost:5000/api/users/verify-temp", {
        patientId: formData.patientId,
        tempPassword: formData.tempPassword,
      });

      console.log("Server response:", response);

      if (response.status === 200) {
        console.log("Verification successful. Proceeding to next step.");
        toast.success("Verified! Please complete your registration.");
        setStep(2);
        console.log("Step set to:", 2);
      } else {
        console.log("Verification failed. Status code:", response.status);
        toast.error("Verification failed.");
      }
    } catch (error) {
      console.log("Error during verification:", error);
      toast.error(error.response?.data?.message || "Verification failed.");
    }
  };


  // ✅ Log the current step on each render
  console.log("Current step:", step);

 //validating form data
  const validateForm = () => {
    if (!role){
      toast.error("Please select a role");
      return false
    }

    if (role === "Patient" && step === 1) {
      if (!formData.patientId || !formData.tempPassword) {
        toast.error("Patient ID and Temporary Password are required");
        return false;
      }
      return true; // Skip other validations for step 1
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
    if(role === "Patient"  && !formData.password){
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
       
     
  // ✅ Normalize role to lowercase
  const normalizedRole = role.toLowerCase(); 

    // General Signup Process for Assistant ,Dentist and patients
    try {
      const response = await axios.post("http://localhost:5000/api/users/signup", { role:normalizedRole, ...formData });
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


  // ✅ Log the current step on each render
  console.log("Current step:", step);

  {/*// Function to check if a patient already has an account
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
  */}

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

          {/* Show fields only if a role is selected */}
          {role && (
           <>
          {/* Conditional Fields for Patients */}
          {role === "Patient" && step === 1 && (
            <>
              <div className="mb-3">
                <label className="form-label fw-bold">Patient ID</label>
                <input type="text" className="form-control" name="patientId" placeholder="Enter your Patient ID" onChange={handleChange} required />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Temporary Password</label>
                <input type="password" className="form-control" name="tempPassword" placeholder="Enter temporary password" onChange={handleChange} required />
              </div>

              <button type="button" className="btn btn-secondary w-100" onClick={handleVerifyTempPatient}>
                Verify Account
              </button>
            </>
          )}

          {/* Step 2 for Patient OR any step for Dentist/Assistant */}
          {((role !== "Patient") || (role === "Patient" && step === 2)) && (
            <>
              <div className="mb-3">
                <label className="form-label fw-bold">Full Name</label>
                <input type="text" className="form-control" name="name" placeholder="Enter your name" onChange={handleChange} required />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Email</label>
                <input type="email" className="form-control" name="email" placeholder="Enter email" onChange={handleChange} required />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Phone Number</label>
                <input type="text" className="form-control" name="phone" placeholder="Enter phone number" onChange={handleChange} required />
              </div>

              <div className="mb-3">
                <label className="form-label fw-bold">Password</label>
                <input type="password" className="form-control" name="password" placeholder="Create a password" onChange={handleChange} required />
              </div>
           

           

          {/* Signup Button */}
          <button type="submit" className="btn btn-primary w-100">Sign Up</button>
          </>
          )}
          </>
          )}
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

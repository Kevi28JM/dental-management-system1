"use client"; // Ensure this is a client-side component
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "@/styles/DentistProfile.css"; 
import DentistSidebar from "@/components/DentistSidebar";
 // Import custom styles
 import { useAuth } from "@/context/AuthContext";  // Import useAuth

function DentistProfile() {  
  const { authData } = useAuth();   // Get user context → { user_id, token, role, patient_id }
  const user_id = authData?.user_id;// Extract user_id safely

  const [dentistId, setDentistId] = useState(null); // Store dentistId from backend

  const [form, setForm] = useState({
    name: '',
    specialization: '',
     });

  
  const [isEditing, setIsEditing] = useState(false); // Toggle between View and Edit mode

  console.log("🔹 useAuth() → user:", authData);
  console.log("🔹 Extracted user_id:", user_id);

  // Fetch profile details when user_id is available
  useEffect(() => {
    if (user_id) {
      console.log("Loaded user_id from context:", user_id);
      getUserDetails(user_id);
      getDentistSpecialization(user_id);
     } else {
      console.warn("⚠️ user_id not found in context yet.");
    }
  }, [user_id]);  // Run effect when user_id changes

  
  
  // Fetch profile details from backend using user_id
  const getUserDetails = async (user_id) => {
    console.log("Fetching user details for user_id:", user_id);  // ✅ Log the input
    try {
      const response = await axios.get(`http://localhost:5000/api/dentist/users/${user_id}`);
       console.log("API Response:", response.data);  // ✅ Log the full API response

      if (response.data.success && response.data.profile) {
        console.log("Profile data found:", response.data.profile);  // ✅ Log the profile data
        setForm((prev) => {
        const updatedForm = { ...prev, name: response.data.profile.name };
        console.log("Updated form state:", updatedForm);  // ✅ Log the new form state
        return updatedForm;
      });
    } else {
      console.warn("No profile data found or success flag is false.");  // ✅ Warn if no valid data
    }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  // Fetch specialization from dentists table
  const getDentistSpecialization = async (user_id) => {
    console.log("📡 Calling getDentistSpecialization() for user_id:", user_id);
    try {
      const response = await axios.get(`http://localhost:5000/api/dentist/profile/${user_id}`);
      console.log("🟢 API Response (getDentistSpecialization):", response.data);
      if (response.data.success && response.data.profile) {
        setForm((prev) => {
          const updatedForm = { ...prev, specialization: response.data.profile.specialization };
          console.log("📝 Updated form (after specialization):", updatedForm);
          return updatedForm;
        });
      } else {
        console.log("⚠️ No specialization found in dentist profile.");
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
      // Profile not found → show message instead of error
      console.log("No specialization found yet.");
      
      }else {
      // Other errors ( network issues)
      console.error("Error fetching specialization:", error);
    }
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    setForm({ ...form, specialization:  e.target.value });
     console.log("🖊️ Specialization input changed:", e.target.value);
  };

  // Save profile (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user_id) {
        alert("User ID not found. Please log in again.");
        return;
      }
      console.log("📤 Submitting specialization with user_id:", user_id);
      console.log("📤 Specialization value:", form.specialization);


      try {
        // Send form + user_id to backend
        const response = await axios.post("http://localhost:5000/api/dentist/add", { 
          user_id ,
          specialization: form.specialization,
        });
  
        if (response.data.success) {
          const dentistIdFromResponse = response.data.dentistId;  // backend must send dentistId in response
          setDentistId(dentistIdFromResponse);  // update state
          console.log("✅ Saved dentistId:", dentistIdFromResponse);
  
          alert("Specialization saved successfully!");
          setIsEditing(false); // Switch to View mode after save
          //window.location.href = "/DentistAvailability"; 
         
          // Refresh latest specialization after save
          getDentistSpecialization(user_id);

        } else {
          alert("Failed to save profile.");
        }
      } catch (error) {
        console.error("Error saving specialization:", error);
        alert("Error saving specialization. Please try again.");
      }
    };

  return (
    <div className="dentist-profile-container">
      <DentistSidebar /> {/* Sidebar component */}
      <h2 className="form-title">Dentist Profile</h2>

      <div className="profile-card">
        {/* Profile icon */}
        <div className="profile-icon">
          <img src="/dentistProfile.png" alt="Profile Icon" /> {/* You can replace this image */}
        </div>


     {/* Show either the form (edit mode) OR profile details (view mode) */}
       {isEditing ? ( 
      <form onSubmit={handleSubmit} className="dentist-form">
        
        <div className="form-group">
          <label>Specialization</label>
          <input name="specialization" value={form.specialization} onChange={handleChange} required />
        </div>

         

        <button type="submit" className="submit-btn">Save Specialization</button>
        <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
          </form>
       

    ) : (
      <div className="profile-details">
            <p><strong>Name:</strong> {form.name}</p>
            <p><strong>Specialization:</strong> {form.specialization}</p> 

            <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit Specialization</button>
          </div>
        )}
    </div>
    </div>
  );
}

export default DentistProfile;

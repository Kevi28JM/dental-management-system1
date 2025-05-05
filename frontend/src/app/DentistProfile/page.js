"use client"; // Ensure this is a client-side component
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "@/styles/DentistProfile.css"; 
 // Import custom styles

function DentistProfile() {  // userId comes from login session
  const [user_id, setUser_id] = useState(null);  // Store user ID from login 
  const [dentistId, setDentistId] = useState(null); // Store dentistId from backend

  const [form, setForm] = useState({
    name: '',
    specialization: '',
    phone: '',
    email: '',
  });

  
  const [isEditing, setIsEditing] = useState(false); // Toggle between View and Edit mode

  // Fetch user_id and existing profile details (if any)
  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");  // adjust key if different
    const storedDentistId = localStorage.getItem("dentistId");

    console.log('Loaded user_id from localStorage:', storedUserId);
    setUser_id(storedUserId);

    if (storedUserId) {
      fetchDentistProfile(storedUserId);
    }

    if (storedDentistId) {
      setDentistId(storedDentistId);
    }

  }, []);

  
  // Fetch profile details from backend using user_id
  const fetchDentistProfile = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/dentist/profile/${userId}`);
      if (response.data.success && response.data.profile) {
        setForm({
          name: response.data.profile.name,
          specialization: response.data.profile.specialization,
          phone: response.data.profile.phone,
          email: response.data.profile.email,
        });
      }
    } catch (error) {
      console.error('Error fetching dentist profile:', error);
    }
  };

  // Handle form field changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Save profile (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user_id) {
        alert('User ID not found. Please log in again.');
        return;
      }
      console.log('Submitting with user_id:', user_id);

      try {
        // Send form + user_id to backend
        const response = await axios.post('http://localhost:5000/api/dentist/add', { ...form, user_id });
  
        if (response.data.success) {
          const dentistId = response.data.dentistId;  // backend must send dentistId in response
          localStorage.setItem("dentistId", dentistId);  // save dentistId locally
          setDentistId(dentistId);  // update state
  
          alert('Profile saved successfully!');
          setIsEditing(false); // Switch to View mode after save
          //window.location.href = "/DentistAvailability";  // go to availability page
        } else {
          alert('Failed to save profile.');
        }
      } catch (error) {
        console.error('Error saving profile:', error);
        alert('Error saving profile. Please try again.');
      }
    };

  return (
    <div className="dentist-profile-container">
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
          <label>Full Name</label>
          <input name="name" value={form.name} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Specialization</label>
          <input name="specialization" value={form.specialization} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </div>

        <button type="submit" className="submit-btn">Save Profile</button>
        <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
          </form>
       

    ) : (
      <div className="profile-details">
            <p><strong>Name:</strong> {form.name}</p>
            <p><strong>Specialization:</strong> {form.specialization}</p>
            <p><strong>Phone:</strong> {form.phone}</p>
            <p><strong>Email:</strong> {form.email}</p>

            <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
          </div>
        )}
    </div>
    </div>
  );
}

export default DentistProfile;

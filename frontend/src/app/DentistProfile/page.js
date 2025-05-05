"use client"; // Ensure this is a client-side component
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "@/styles/DentistProfile.css"; 
 // Import custom styles

function DentistProfile() {  // userId comes from login session
  const [user_id, setUser_id] = useState(null);  
  const [form, setForm] = useState({
    name: '',
    specialization: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    const storedUserId = localStorage.getItem("user_id");  // adjust key if different
    console.log('Loaded user_id from localStorage:', storedUserId);
    setUser_id(storedUserId);
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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
  
          alert('Profile saved successfully!');
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
      </form>
    </div>
  );
}

export default DentistProfile;

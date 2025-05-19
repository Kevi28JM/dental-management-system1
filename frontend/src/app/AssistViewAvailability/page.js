"use client";
import React, { useEffect, useState } from "react";
import db from "@/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";// Import useAuth
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import AssistSidebar from "@/components/AssistSidebar"; // Import the sidebar component
import "@/styles/AssistViewAvailability.css"; // Import your CSS file

const AssistViewAvailability = () => {
  console.log("ViewAvailability component mounted!");

  const searchParams = useSearchParams();
  const selectedDentistId = Number(searchParams.get('dentistId'));  // ✅ get from URL
  console.log("Selected Dentist ID from URL:", selectedDentistId,  typeof selectedDentistId);

  const router = useRouter(); // ✅ For navigation

  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch available sessions on page load
  useEffect(() => {
    const fetchAvailabilities = async () => {
      console.log("Fetching availabilities...");

      if (!selectedDentistId) {
        console.warn("No dentistId provided in URL. Clearing availabilities.");
        setAvailabilities([]);
        setLoading(false);
        return;
        }

        setLoading(true);
      try {
        const q = query(
          collection(db, "availabilities"),
          where("status", "==", "available"),
          where("dentistId", "==", selectedDentistId)
        );
        console.log("Firestore query created:", q);

        const querySnapshot = await getDocs(q);
        console.log(`Found ${querySnapshot.size} availabilities`);
        const results = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Sort by date (ascending)
        const sortedResults = [...results].sort((a, b) => new Date(a.date) - new Date(b.date));
        console.log("Availabilities fetched:", results);

        setAvailabilities(sortedResults);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching availabilities:", error);
        alert("Error loading availabilities");
        setLoading(false);
      }
    };

    console.log("Component mounted or selectedDentistId changed. Triggering fetchAvailabilities...");
    fetchAvailabilities();
  }, [selectedDentistId]);// Refetch when dentist is changed

    // ✅ Handle booking: redirect to BookAppointmentPage with availabilityId
       const handleBook = (availabilityId) => {
       console.log(`Redirecting to BookAppointmentPage with availabilityId: ${availabilityId}`);

       

       router.push(`/AssistBookAppointmentPage?availabilityId=${availabilityId}`);
    };

  return (
    <div className="page-container">
      <AssistSidebar />
      <div className="content-container">
       <h2>Available Appointments</h2>

      {loading ? (
        <p>Loading...</p>
      ) : availabilities.length === 0 ? (
        <p>No available sessions for this dentist.</p>
      ) : (
        <div className="table-container">
        <table className="availability-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Start Time</th>
              <th>Max Appointments</th>
              <th>Active Appointments</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {availabilities.map(avail => {
              const availableSlots = avail.maxAppointments - avail.activeAppointments;
              console.log(`Rendering availability: ${avail.id} — Available Slots: ${availableSlots}`);
              return (
                <tr key={avail.id}> 
                  <td>{avail.date}</td>
                  <td>{avail.startTime}</td>
                  <td>{avail.maxAppointments}</td>
                   <td>{avail.activeAppointments}</td>
                  <td>
                    <button
                      disabled={availableSlots <= 0}
                      onClick={() => handleBook(avail.id)}//pass only id
                    >
                      {availableSlots > 0 ? "Book" : "Full"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      )}
      </div>
    </div>

  );
};

export default AssistViewAvailability;

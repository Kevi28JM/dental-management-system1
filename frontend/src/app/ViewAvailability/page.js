"use client";
import React, { useEffect, useState } from "react";
import db from "@/firebase";
import { collection, query, where, getDocs, doc, updateDoc, increment, addDoc, serverTimestamp } from "firebase/firestore";

const ViewAvailability = () => {
  const [availabilities, setAvailabilities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch available slots on page load
  useEffect(() => {
    const fetchAvailabilities = async () => {
      try {
        const q = query(
          collection(db, "availabilities"),
          where("status", "==", "available")
        );

        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setAvailabilities(results);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching availabilities:", error);
        alert("Error loading availabilities");
        setLoading(false);
      }
    };

    fetchAvailabilities();
  }, []);

  const handleBook = async (avail) => {
    const confirm = window.confirm(`Book appointment on ${avail.date} at ${avail.startTime}?`);
    if (!confirm) return;

    const patientId = localStorage.getItem("patientId");
    if (!patientId) {
      alert("Please log in as a patient to book.");
      return;
    }

    const availableSlots = avail.maxAppointments - avail.activeAppointments;
    if (availableSlots <= 0) {
      alert("This slot is already full.");
      return;
    }

    try {
      // 1. Add appointment
      await addDoc(collection(db, "appointments"), {
        patientId,
        dentistId: avail.dentistId,
        date: avail.date,
        startTime: avail.startTime,
        createdAt: serverTimestamp(),
      });

      // 2. Increment activeAppointments
      const availabilityRef = doc(db, "availabilities", avail.id);
      await updateDoc(availabilityRef, {
        activeAppointments: increment(1),
      });

      alert("Appointment booked successfully!");

      // 3. Refresh availabilities list after booking
      setAvailabilities(prev =>
        prev.map(a =>
          a.id === avail.id
            ? { ...a, activeAppointments: a.activeAppointments + 1 }
            : a
        )
      );
    } catch (err) {
      console.error(err);
      alert("Error booking appointment");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Available Appointments</h2>

      {loading ? (
        <p>Loading...</p>
      ) : availabilities.length === 0 ? (
        <p>No available slots.</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Dentist ID</th>
              <th>Date</th>
              <th>Start Time</th>
              <th>Max Appointments</th>
              <th>Available Slots</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {availabilities.map(avail => {
              const availableSlots = avail.maxAppointments - avail.activeAppointments;
              return (
                <tr key={avail.id}>
                  <td>{avail.dentistId}</td>
                  <td>{avail.date}</td>
                  <td>{avail.startTime}</td>
                  <td>{avail.maxAppointments}</td>
                  <td>{availableSlots}</td>
                  <td>
                    <button
                      disabled={availableSlots <= 0}
                      onClick={() => handleBook(avail)}
                    >
                      {availableSlots > 0 ? "Book" : "Full"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ViewAvailability;

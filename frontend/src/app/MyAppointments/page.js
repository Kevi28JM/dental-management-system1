"use client";
import React, { useEffect, useState } from "react";
import db from "@/firebase";
import { collection, query, where, getDocs,  deleteDoc,
 doc,} from "firebase/firestore";
 

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      const patientId = localStorage.getItem("patientId");
      if (!patientId) {
        alert("Please log in as a patient to view appointments.");
        window.location.href = "/PatientLogin"; // Or wherever your login page is
        return;
      }

      try {
        const q = query(
          collection(db, "appointments"),
          where("patientId", "==", patientId)
        );
        const querySnapshot = await getDocs(q);
        const now = new Date();
      const upcomingAppointments = [];

      for (const docSnap of querySnapshot.docs) {
        const data = docSnap.data();
        const appointmentDateTime = new Date(`${data.date}T${data.startTime}`);

        if (appointmentDateTime >= now) {
          upcomingAppointments.push({ id: docSnap.id, ...data });
        } else {
          // 🗑️ Delete past appointment from Firestore
          await deleteDoc(doc(db, "appointments", docSnap.id));
        }
      }

      setAppointments(upcomingAppointments);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching appointments:", err);
      alert("Error loading appointments");
      setLoading(false);
    }
  };

  fetchAppointments();
}, []);

const fetchTreatments = async (patientId) => {
  try {
    const res = await fetch(`http://localhost:5000/api/treatments/by-patient/${patientId}`);
    if (!res.ok) throw new Error("Failed to fetch treatments");

    const treatmentData = await res.json();
    setTreatments(treatmentData);
  } catch (err) {
    console.error("Error fetching treatments:", err);
    alert("Error loading treatments");
  } finally {
    setLoading(false);
  }
};


  return (
    <div style={{ padding: "20px" }}>
      <h2>My Appointments</h2>

      {loading ? (
        <p>Loading...</p>
      ) : appointments.length === 0 ? (
        <p>No appointments booked yet.</p>
      ) : (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Dentist ID</th>
              <th>Date</th>
              <th>Start Time</th>
              <th>Booked On</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(appt => (
              <tr key={appt.id}>
                <td>{appt.dentistId}</td>
                <td>{appt.date}</td>
                <td>{appt.startTime}</td>
                <td>{appt.createdAt ? new Date(appt.createdAt.seconds * 1000).toLocaleString() : "N/A"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default MyAppointments;

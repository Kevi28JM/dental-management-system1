"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import db from "@/firebase"; // Adjust the import based on your project structure
import axios from "axios";
import "@/styles/dentistAppointments.css";
import { useRouter } from "next/navigation";

function DentistAppointments() {
  const [date, setDate] = useState("");
  const [appointments, setAppointments] = useState([]);
  
  const router = useRouter();

  useEffect(() => {
    if (!date) return;

    const q = query(collection(db, "appointments"), where("date", "==", date));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAppointments(data);
    });

    return () => unsubscribe();
  }, [date]);



  return (
    <div className="dentist-view">
      <h2>Dentist Appointment View</h2>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      <div className="appointments-list">
        {appointments.map((app) => (
          <div key={app.id} className="appointment-card">
            <p><strong>Time:</strong> {app.time}</p>
            <p><strong>Patient ID:</strong> {app.patientId}</p>
            <p><strong>Status:</strong> {app.status}</p>
            <button
              onClick={() =>
                router.push(`/TreatPatient?patientId=${app.patientId}&appointmentId=${app.id}`)
              }
            >
              View & Treat
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}

export default DentistAppointments;

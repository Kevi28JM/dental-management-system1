"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  getDocs,
  limit,
} from "firebase/firestore";
import db from "@/firebase";
import "@/styles/PatientQueueView.css";
import { useAuth } from "@/context/AuthContext";

function PatientQueueView() {
  const [date, setDate] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [dentistId, setDentistId] = useState(null);
  const [patientAppointmentId, setPatientAppointmentId] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

    const { authData } = useAuth();
    const patientId = authData.patient_id;

  // Step 1: Find patient's appointment and extract dentistId
  useEffect(() => {
    if (!date || !patientId) return;

    const fetchPatientAppointment = async () => {
        console.log("📅 Fetching appointment for patient:", patientId, "on", date);

      const q = query(
        collection(db, "appointments"),
        where("date", "==", date),
        where("patientId", "==", patientId),
        limit(1)
      );
      const snapshot = await getDocs(q);
      console.log("📥 Patient appointment snapshot size:", snapshot.size);

      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        const appData = doc.data();
        console.log("✅ Found patient's appointment:", appData);

        setDentistId(appData.dentistId);
        setPatientAppointmentId(doc.id);
        setStatusMessage("");
      } else {
        console.warn("⚠️ No appointment found for this patient on the selected date.");
        setAppointments([]);
        setDentistId(null);
        setPatientAppointmentId(null);
        setStatusMessage("You have no appointment on this date.");
      }
    };

    fetchPatientAppointment();
  }, [date, patientId]);

  // Step 2: Load all appointments for this dentist and date
  useEffect(() => {
    if (!dentistId || !date) return;

     console.log("📡 Subscribing to appointment queue for dentist:", dentistId, "on", date);

    const q = query(
      collection(db, "appointments"),
      where("date", "==", date),
      where("dentistId", "==", dentistId)
      
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log("🦷 Appointment queue updated:", data);
      setAppointments(data);
    });

    return () => {
      console.log("🔌 Unsubscribing from queue updates");
      unsubscribe();
    };
  }, [dentistId, date]);


  return (
    <div className="patient-view">
      <h2>My Appointment Queue</h2>
      <input
        type="date"
        value={date}
        onChange={(e) => {
          setDate(e.target.value);
          setStatusMessage("");
          console.log("📆 Date selected:", e.target.value);
        }}
      />

      {statusMessage && <p>{statusMessage}</p>}

      {appointments.length > 0 && (
        <div className="appointments-list">
          {appointments.map((app, index) => (
            <div
              key={app.id}
              className={`appointment-card ${
                app.id === patientAppointmentId ? "highlight" : ""
              }`}
            >
              <p><strong>Queue No:</strong> {index + 1}</p>
              <p><strong>Time:</strong> {app.time}</p>
              <p><strong>Status:</strong> {app.status}</p>
              {app.id === patientAppointmentId && (
                <p className="you">👉 Your appointment</p>
              )}
              {app.status === "Ongoing" && (
                <p className="ongoing">🦷 Currently being treated</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


export default PatientQueueView;

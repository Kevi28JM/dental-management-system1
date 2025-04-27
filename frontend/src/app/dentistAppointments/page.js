// DentistAppointments.js
"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import db from "../firebase";
import axios from "axios";
import "../styles/dentistAppointments.css";

function dentistAppointments() {
  const [date, setDate] = useState("");
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [patientDetails, setPatientDetails] = useState(null);
  const [notes, setNotes] = useState("");
  const [prescription, setPrescription] = useState("");

  useEffect(() => {
    if (!date) return;

    const q = query(collection(db, "appointments"), where("date", "==", date));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAppointments(data);
    });

    return () => unsubscribe();
  }, [date]);

  const handleViewPatient = async (patientId) => {
    const res = await axios.get(`http://localhost:5000/api/patients/${patientId}`);
    setPatientDetails(res.data);
  };

  const handleSaveTreatment = async () => {
    if (!selectedAppointment) return;
    await axios.post("http://localhost:5000/api/treatments", {
      patientId: selectedAppointment.patientId,
      date: selectedAppointment.date,
      time: selectedAppointment.time,
      notes,
      prescription,
    });
    alert("Treatment info saved."); 
    setNotes("");
    setPrescription("");
    setSelectedAppointment(null);
    setPatientDetails(null);
  };

  return (
    <div className="dentist-view">
      <h2>Dentist Appointment View</h2>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

      {appointments.map((app) => (
        <div key={app.id} className="appointment-card">
          <p><strong>Time:</strong> {app.time}</p>
          <p><strong>Patient ID:</strong> {app.patientId}</p>
          <p><strong>Status:</strong> {app.status}</p>
          <button onClick={() => {
            setSelectedAppointment(app);
            handleViewPatient(app.patientId);
          }}>
            View Details
          </button>
        </div>
      ))}

      {selectedAppointment && patientDetails && (
        <div className="treatment-form">
          <h3>Treatment for {patientDetails.full_name || selectedAppointment.patientId}</h3>
          <p><strong>Phone:</strong> {patientDetails.phone}</p>
          <p><strong>Gender:</strong> {patientDetails.gender}</p>
          <textarea
            placeholder="Treatment Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <textarea
            placeholder="Prescription"
            value={prescription}
            onChange={(e) => setPrescription(e.target.value)}
          />
          <button onClick={handleSaveTreatment}>Save Treatment</button>
        </div>
      )}
    </div>
  );
}

export default dentistAppointments;

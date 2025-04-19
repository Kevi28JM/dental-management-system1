"use client"; // Ensure this is a client-side component

import { collection, addDoc } from "firebase/firestore";
import db from "../firebase"; // Make sure this is correct
import { useState } from "react";

function BookAppointment() {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [patientId, setPatientId] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "appointments"), {
        patientId,
        date,
        time,
        createdBy: "patient",
        status: "pending",
      });
      alert("Appointment booked successfully!");
    } catch (error) {
      console.error("Error adding appointment:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Patient ID"
        value={patientId}
        onChange={(e) => setPatientId(e.target.value)}
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <input
        type="time"
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />
      <button type="submit">Book Appointment</button>
    </form>
  );
}

export default BookAppointment;

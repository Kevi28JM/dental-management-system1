"use client"; 
import React, { useState, useEffect} from "react";
import DatePicker from "react-datepicker";
 
import db from "@/firebase";
import { collection, addDoc } from "firebase/firestore";

const DentistAvailability = ({ userId }) => {
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState("");
  const [maxAppointments, setMaxAppointments] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, "availabilities"), {
        dentistId: String(userId),
        date: date.toISOString().split("T")[0], // yyyy-mm-dd
        startTime,
        maxAppointments: Number(maxAppointments),
        activeAppointments: 0,
        status: "available",
        //createdAt: timestamp(),
      });

      alert("Availability marked successfully!");
      setStartTime("");
      setMaxAppointments(1);
      setDate(new Date());
    } catch (error) {
      console.error("Error adding availability:", error);
      alert("Failed to mark availability.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Mark Availability</h3>

      <label>Date:</label><br/>
      <DatePicker selected={date} onChange={(d) => setDate(d)} dateFormat="yyyy-MM-dd" /><br/><br/>

      <label>Start Time (e.g. 10:00 AM):</label><br/>
      <input
        type="text"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
        placeholder="10:00 AM"
        required
      /><br/><br/>

      <label>Max Appointments:</label><br/>
      <input
        type="number"
        min="1"
        value={maxAppointments}
        onChange={(e) => setMaxAppointments(e.target.value)}
        required
      /><br/><br/>

      <button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Mark Availability"}
      </button>
    </form>
  );
};

export default DentistAvailability;

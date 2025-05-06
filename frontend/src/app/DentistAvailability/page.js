"use client"; 
import React, { useState, useEffect} from "react";
import DatePicker from "react-datepicker";
 
import db from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const DentistAvailability = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState("");
  const [maxAppointments, setMaxAppointments] = useState(1);

  const [dentistId, setDentistId] = useState(null);

  // Check dentistId on page load
  useEffect(() => {
    const storedDentistId = localStorage.getItem("dentistId");
    setDentistId(storedDentistId);

    if (!storedDentistId || storedDentistId === "null" || storedDentistId.trim() === "") {
      alert("Please complete your profile before marking availability.");
      window.location.href = "/DentistProfile";
    }
  }, []);

  const handleSaveAvailability = async () => {
    const storedDentistId = localStorage.getItem("dentistId");

     // Ensure dentistId exists before saving
     if (!storedDentistId || storedDentistId === "null" || storedDentistId.trim() === "") {
      alert("Please complete your profile before marking availability.");
      window.location.href = "/DentistProfile";
      return;
    }

    try {
      await addDoc(collection(db, "availabilities"), {
        dentistId: storedDentistId,
        date: selectedDate.toISOString().split("T")[0], // yyyy-mm-dd
        startTime,
        maxAppointments: parseInt(maxAppointments),
        activeAppointments: 0,
        status: "available",
        createdAt: serverTimestamp(),
      });

      alert("Availability saved successfully!");
    } catch (error) {
      console.error("Error adding availability:", error);
      alert("Error saving availability");
    }
  };
  

  return (
    <div>
      <h2>Mark Availability</h2>
      <DatePicker selected={selectedDate} onChange={(date) => setSelectedDate(date)} />
      <input
         type="time"
         value={startTime}
         onChange={(e) => setStartTime(e.target.value)}
         required
        />
      <input type="number" placeholder="Max Appointments" value={maxAppointments} onChange={(e) => setMaxAppointments(e.target.value)} />
      <button onClick={handleSaveAvailability}>Save Availability</button>
    </div>
  );
};

export default DentistAvailability;

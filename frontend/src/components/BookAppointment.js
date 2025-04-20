"use client";

import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import db from "../firebase";
import "../styles/BookAppointment.css";

function BookAppointment() {
  const [date, setDate] = useState("");
  const [patientId, setPatientId] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [bookedTimes, setBookedTimes] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [myLatestBooking, setMyLatestBooking] = useState("");

  useEffect(() => {
    if (!date) return;

    const fetchData = async () => {
      try {
        const q = query(collection(db, "appointments"), where("date", "==", date));
        const snapshot = await getDocs(q);
        const booked = snapshot.docs.map(doc => doc.data().time);
        setBookedTimes(booked);

        const hoursDoc = doc(db, "workingHours", date);
        const hoursSnap = await getDoc(hoursDoc);

        let start = "17:00";
        let end = "19:00";

        if (hoursSnap.exists()) {
          const data = hoursSnap.data();
          start = data.startTime;
          end = data.endTime;
        } else {
          const defaultSnap = await getDoc(doc(db, "workingHours", "default"));
          if (defaultSnap.exists()) {
            const data = defaultSnap.data();
            start = data.startTime;
            end = data.endTime;
          }
        }

        const slots = generateSlotsFromRange(start, end);
        setAvailableSlots(slots);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [date]);

  const generateSlotsFromRange = (start, end) => {
    const slots = [];
    let [h, m] = start.split(":").map(Number);
    let [eh, em] = end.split(":").map(Number);
    let totalMinutes = h * 60 + m;
    const endMinutes = eh * 60 + em;

    while (totalMinutes < endMinutes) {
      const hour = String(Math.floor(totalMinutes / 60)).padStart(2, "0");
      const min = String(totalMinutes % 60).padStart(2, "0");
      slots.push(`${hour}:${min}`);
      totalMinutes += 30;
    }
    return slots;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !selectedTime || !patientId.trim()) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      //// Check if the patient already booked on this date
    const existingQuery = query(
      collection(db, "appointments"),
      where("date", "==", date),
      where("patientId", "==", patientId)
    );
    const existingSnap = await getDocs(existingQuery);

    if (!existingSnap.empty) {
      alert("You have already booked an appointment for this date.");
      return;
    }

    // Proceed to book
      await addDoc(collection(db, "appointments"), {
        patientId,
        date,
        time: selectedTime,
        createdBy: "patient",
        status: "pending",
      });

      alert("Appointment booked successfully!");

      // Reset form
      setPatientId("");
      setSelectedTime("");
      setMyLatestBooking(`${date}-${selectedTime}`); // save last booked time and date

      // Refresh booked times
      const q = query(collection(db, "appointments"), where("date", "==", date));
      const snapshot = await getDocs(q);
      const booked = snapshot.docs.map(doc => doc.data().time);
      setBookedTimes(booked);
    } catch (err) {
      console.error("Error booking appointment:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="appointment-form">
      <h3>Book Appointment</h3>

      <input
        type="text"
        placeholder="Patient ID"
        value={patientId}
        onChange={(e) => setPatientId(e.target.value)}
        required
      />

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />

      {date && availableSlots.length > 0 && (
        <div className="time-slot-grid">
          {availableSlots.map((slot) => {
            const isBooked = bookedTimes.includes(slot);
            const isSelected = selectedTime === slot;
            const isMyBooking = myLatestBooking === `${date}-${slot}`;

            return (
              <button
                type="button"
                key={slot}
                className={`slot-btn ${isMyBooking ? "my-booking" : ""} ${isBooked ? "booked" : ""} ${isSelected ? "selected" : ""}`}
                onClick={() => {
                  if (isBooked) return;
                  setSelectedTime(selectedTime === slot ? "" : slot);
                }}
                disabled={isBooked}
              >
                {slot}
              </button>
            );
          })}
        </div>
      )}

      <button type="submit" className="submit-btn">Book Appointment</button>
    </form>
  );
}

export default BookAppointment;

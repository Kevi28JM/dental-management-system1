"use client";

import { useState, useEffect } from "react";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import db from "../firebase";
import "../styles/SetWorkingHours.css"; // Import the CSS file

function SetWorkingHours() {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("17:00");
  const [endTime, setEndTime] = useState("19:00");
  const [workingHours, setWorkingHours] = useState([]);

  const timeSlots = generateTimeSlots();

  async function fetchWorkingHours() {
    const colRef = collection(db, "workingHours");
    const snap = await getDocs(colRef);
    const data = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setWorkingHours(data);
  }

  useEffect(() => {
    fetchWorkingHours();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const docRef = date
      ? doc(db, "workingHours", date)
      : doc(db, "workingHours", "default");

    try {
      await setDoc(docRef, { startTime, endTime });
      alert("Working hours updated!");
      fetchWorkingHours();

    // Reset form fields
    setDate("");
    setStartTime("17:00");
    setEndTime("19:00");

    } catch (err) {
      console.error("Error updating hours:", err);
    }
  };

  return (
    <div className="working-hours-container">
      <h2 className="title">Set Working Hours</h2>
      <form onSubmit={handleSubmit} className="working-hours-form">
        <table>
          <tbody>
            <tr>
              <td>Date (optional):</td>
              <td>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="form-control"
                />
              </td>
            </tr>
            <tr>
              <td>Start Time:</td>
              <td>
                <select
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="form-control"
                >
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {formatTime(time)}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
            <tr>
              <td>End Time:</td>
              <td>
                <select
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="form-control"
                >
                  {timeSlots.map((time) => (
                    <option key={time} value={time}>
                      {formatTime(time)}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          </tbody>
        </table>
        <button type="submit" className="btn btn-primary save-btn">
          Save
        </button>
      </form>

      <h3 className="mt-4">Current Working Hours</h3>
      <table className="table table-bordered table-striped">
        <thead>
          <tr>
            <th>Date</th>
            <th>Start</th>
            <th>End</th>
          </tr>
        </thead>
        <tbody>
          {workingHours.map((wh) => (
            <tr key={wh.id}>
              <td>{wh.id === "default" ? "Default" : wh.id}</td>
              <td>{formatTime(wh.startTime)}</td>
              <td>{formatTime(wh.endTime)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SetWorkingHours;

// Helper to create 30-min time slots
function generateTimeSlots(startHour = 6, endHour = 20) {
  const slots = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let min of [0, 30]) {
      const h = hour.toString().padStart(2, "0");
      const m = min.toString().padStart(2, "0");
      slots.push(`${h}:${m}`);
    }
  }
  return slots;
}

// Helper to format to AM/PM
function formatTime(timeStr) {
  const [hour, minute] = timeStr.split(":");
  const h = parseInt(hour, 10);
  const ampm = h >= 12 ? "PM" : "AM";
  const formattedHour = h % 12 === 0 ? 12 : h % 12;
  return `${formattedHour}:${minute} ${ampm}`;
}

"use client"; 
import React, { useState, useEffect} from "react";
import DatePicker from "react-datepicker";
import axios from "axios";
import db from "@/firebase";

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from 'next/navigation';


const DentistAvailability = () => {
  const { authData } = useAuth(); // Get user_id from context
  const user_id = authData.user_id;
  const router = useRouter();     // ✅ Initialize router
  console.log("AuthContext user_id:", user_id);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState("");
  const [maxAppointments, setMaxAppointments] = useState(1);
  const [dentistId, setDentistId] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Optional: prevent UI until check done

  // Check dentistId on page load using user_id
  useEffect(() => {
    const checkDentistId = async () => {
      console.log("Checking dentist profile for user_id:", user_id);
      try {
        const response = await axios.get(`http://localhost:5000/api/dentist/byUser/${user_id}`);
        console.log("API response for dentist profile:", response.data);
        const data = response.data;

        if (data.success && data.dentistId) {
          console.log("Dentist profile found. dentistId:", data.dentistId);
          setDentistId(data.dentistId);
        } else {
          console.warn("Dentist profile not complete or not found.");
          alert("Please complete your profile before marking availability.");
          router.push("/DentistProfile");  // ✅ Use router push 
        }
      } catch (error) {
        console.error("Error checking dentist profile:", error);
        alert("Error checking profile. Please try again.");
        router.push("/DentistProfile");  // ✅ Use router push
      } finally {
        setIsLoading(false);
        console.log("Finished checking dentist profile.");
      }
    };

    if (user_id) {
      checkDentistId();
     } else {
      console.warn("user_id is not available yet.");
    }
  }, [user_id, router]);  // ✅ Add router to dependencies

  const handleSaveAvailability = async () => {
    console.log("Saving availability... dentistId:", dentistId);
    if (!dentistId) {
      console.warn("DentistId not available. Redirecting to profile page.");
      alert("Please complete your profile before marking availability.");
      router.push("/DentistProfile");  // ✅ Use router push
      return;
    }

    const availabilityData = {
      dentistId: dentistId,
      date: selectedDate.toISOString().split("T")[0],
      startTime,
      maxAppointments: parseInt(maxAppointments),
      activeAppointments: 0,
      status: "available",
      createdAt: serverTimestamp(),
    };

    console.log("Availability data to save:", availabilityData);

    try {
      await addDoc(collection(db, "availabilities"), availabilityData);
      console.log("Availability saved successfully!");
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
      <input
        type="number"
        placeholder="Max Appointments"
        value={maxAppointments}
        onChange={(e) => setMaxAppointments(e.target.value)}
      />
      <button onClick={handleSaveAvailability}>Save Availability</button>
    </div>
  );
};

export default DentistAvailability;

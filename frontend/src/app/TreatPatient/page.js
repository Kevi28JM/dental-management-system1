"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { collection, query, where, onSnapshot } from "firebase/firestore";
import db from "@/firebase"; // Adjust the import based on your project structure
import axios from "axios";
import "@/styles/treatPatient.css";

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function TreatPatient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const patientId = searchParams.get('patientId');
  const appointmentId = searchParams.get('appointmentId');


    const [patientDetails, setPatientDetails] = useState(null);
    const [pastTreatments, setPastTreatments] = useState([]);
    const [currentAppointment, setCurrentAppointment] = useState(null);  // You can remove this if not needed
    const [treatmentNotes, setTreatmentNotes] = useState("");
    const [prescription, setPrescription] = useState("");


    // Fetch patient details + full treatment history
  useEffect(() => {
    if (!patientId) return;

    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/dentist/patient-full-details/${patientId}`);
        setPatientDetails(res.data.patientDetails);
        setPastTreatments(res.data.treatmentsHistory || []);

      } catch (err) {
        console.error("Error fetching patient full details:", err);
      }
    };

    fetchData();
  }, [patientId]);


  

  const handleSaveTreatment = async () => {
   {/*if (!currentAppointment) {
      alert("Current appointment info is missing.");
      return;
    }*/}

    try {
      await axios.post("http://localhost:5000/api/dentist/appointments/treatments", {
        patientId: patientDetails.id,
        date: currentAppointment.date, // Saving according to the appointment
        time_slot: currentAppointment.time, // Saving according to the appointment
        treatments: treatmentNotes,
        prescription: prescription,
        total_cost: 0, // Assuming no cost for now, adjust as needed
        is_multisession: 0, // Assuming normal treatment for now, adjust as needed
      });

      alert("Treatment info saved successfully.");
      setTreatmentNotes("");
      setPrescription("");
      setCurrentAppointment(null); // Reset current appointment after saving

      router.back(); // Go back to previous page after saving
    } catch (err) {
      console.error("Error saving treatment:", err);
      alert("Failed to save treatment.");
    }
  };


  function calculateAge(dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
  


  if (!patientDetails) {
    return <p>Loading patient info...</p>;
  }

  return (
    <div className="treat-patient-page">
      <h2>Treatment for {patientDetails.full_name}</h2>

      <section className="patient-info">
        <h3>Patient Details</h3>
        <p><strong>Patient ID:</strong> {patientDetails.id}</p>
        <p><strong>Full Name:</strong> {patientDetails.firstName} {patientDetails.lastName}</p>
        <p><strong>Phone:</strong> {patientDetails.phone}</p>
        <p><strong>Gender:</strong> {patientDetails.gender}</p>
        <p><strong>Age:</strong> {calculateAge(patientDetails.dob)}</p> {/* Use age calculation */}
        <p><strong>Address:</strong> {patientDetails.address}</p>
        <p><strong>Email:</strong> {patientDetails.email}</p>
      </section>

      <section className="past-treatments">
        <h3>Past Treatments</h3>
        {pastTreatments.length === 0 ? (
          <p>No previous treatments.</p>
        ) : (
          pastTreatments.map((treat, index) => (
            <div key={index} className="past-treatment-card">
              <p><strong>Date:</strong> {treat.date}</p>
              <p><strong>Treatment:</strong> {treat.treatments}</p>
              <p><strong>Prescription:</strong> {treat.prescription}</p>
            </div>
          ))
        )}
      </section>

      <section className="new-treatment">
        <h3>Record New Treatment</h3>
        <textarea
          placeholder="Treatment Notes"
          value={treatmentNotes}
          onChange={(e) => setTreatmentNotes(e.target.value)}
        />
        <textarea
          placeholder="Prescription"
          value={prescription}
          onChange={(e) => setPrescription(e.target.value)}
        />

        <button onClick={handleSaveTreatment}>Save Treatment</button>
      </section>
    </div>
  );
}

export default TreatPatient;
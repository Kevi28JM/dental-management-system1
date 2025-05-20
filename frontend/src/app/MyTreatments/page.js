"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import PatientSidebar from "@/components/PatientSidebar";
import "@/styles/MyTreatments.css";

const PastTreatments = () => {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTreatments = async () => {
      const patientId = localStorage.getItem("patientId");
      if (!patientId) {
        alert("Please log in as a patient to view treatments.");
        window.location.href = "/PatientLogin";
        return;
      }

      try {
        const res = await axios.get(`http://localhost:5000/api/treatments/by-patient/${patientId}`
        );

        console.log("API response:", res.data); // Debug line

        // Fix: Check if the response contains treatments
        if (Array.isArray(res.data.treatments)) {
          setTreatments(res.data.treatments);
        } else {
          console.warn("Unexpected format:", res.data);
          setTreatments([]);
        }
      } catch (err) {
        console.error("Error fetching treatments:", err);
        alert("Failed to load treatments.");
        setTreatments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTreatments();
  }, []);

  return (
    <div className="past-treatments-view">
      <PatientSidebar />
      <div className="past-treatments-content">
        <h2>My Past Treatments</h2>
        {loading ? (
          <p>Loading...</p>
        ) : treatments.length === 0 ? (
          <p>No past treatments found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Session ID</th>
                <th>Treatment Type</th>
                <th>Date</th>
                <th>Notes</th>
                <th>Payment (Rs.)</th>
              </tr>
            </thead>
            <tbody>
              {treatments.map((treatment) => (
                <tr key={treatment.treatmentId}>
                  <td>{treatment.sessionId}</td>
                  <td>{treatment.treatmentType}</td>
                  <td>{treatment.treatmentDate}</td>
                  <td>{treatment.treatmentNotes || "—"}</td>
                  <td>{parseFloat(treatment.payment).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PastTreatments;

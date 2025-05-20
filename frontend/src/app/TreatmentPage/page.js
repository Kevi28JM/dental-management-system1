"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import "@/styles/TreatmentPage.css";

const TreatmentPage = () => {
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  const [patient, setPatient] = useState(null);
  const [treatments, setTreatments] = useState([]);
  const [sessionId, setSessionId] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [payment, setPayment] = useState('');
  const [loading, setLoading] = useState(true);
  const [addingTreatment, setAddingTreatment] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [latestTreatment, setLatestTreatment] = useState(null);

  useEffect(() => {
    const fetchTreatmentData = async () => {
      if (!appointmentId) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/treatments/treatment-data/${appointmentId}`);
        setPatient(res.data.patient);
        setTreatments(res.data.treatments);
      } catch (err) {
        console.error("Failed to fetch treatment data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTreatmentData();
  }, [appointmentId]);

  const handleAddTreatment = async () => {
    if (!sessionId || !description || payment === '') {
      alert("Please fill all required fields");
      return;
    }

    try {
      setAddingTreatment(true);
      const res = await axios.post(`http://localhost:5000/api/treatments/${appointmentId}`, {
        sessionId, description, notes, payment
      });

      const newTreatment = res.data;
      setTreatments([newTreatment, ...treatments]);
      setLatestTreatment(newTreatment); // Store the latest treatment for receipt
      
      // Reset form fields
      setSessionId('');
      setDescription('');
      setNotes('');
      setPayment('');
      
      // Close the form modal and open receipt modal
      setIsModalOpen(false);
      setIsReceiptModalOpen(true);
    } catch (err) {
      console.error("Error adding treatment", err);
      alert("Failed to add treatment");
    } finally {
      setAddingTreatment(false);
    }
  };

  if (loading) return <div>Loading treatment data...</div>;

  return (
    <>
      <div className="treatment-container">
        <h2 className="main-title">Treatment Details</h2>

        <section className="patient-section">
          <h3>Patient Information</h3>
          <div className="patient-details">
            <p><strong>Name:</strong> {patient.firstName} {patient.lastName}</p>
            <p><strong>ID:</strong> {patient.id}</p>
            <p><strong>Age:</strong> {new Date().getFullYear() - new Date(patient.dob).getFullYear()}</p>
            <p><strong>Gender:</strong> {patient.gender}</p>
          </div>
        </section>

        <div className="button-wrapper">
          <button className="add-treatment-btn" onClick={() => setIsModalOpen(true)}>+ Add Treatment</button>
        </div>

        <section className="history-section">
          <h3>Treatment History</h3>
          {treatments.length === 0 ? (
            <p className="no-treatments">No previous treatments found.</p>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Treatment Type</th>
                    <th>Session ID</th>
                    <th>Date</th>
                    <th>Notes</th>
                    <th>Payment (Rs)</th>
                  </tr>
                </thead>
                <tbody>
                  {treatments.map((treatment, idx) => (
                    <tr key={treatment.treatmentId || idx}>
                      <td>{treatment.treatmentType}</td>
                      <td>{treatment.sessionId}</td>
                      <td>{new Date(treatment.treatmentDate).toLocaleDateString()}</td>
                      <td>{treatment.treatmentNotes || '-'}</td>
                      <td>{treatment.payment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Add Treatment Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add New Treatment</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleAddTreatment(); }}>
              <label>Treatment Type<span className="required">*</span></label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              /> 

              <label>Session ID<span className="required">*</span></label>
              <input
                type="text"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                required
              />

              <label>Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />

              <label>Payment (Rs)<span className="required">*</span></label>
              <input
                type="number"
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
                required
              />

              <div className="modal-buttons">
                <button type="submit" disabled={addingTreatment}>
                  {addingTreatment ? "Adding..." : "Submit"}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {isReceiptModalOpen && latestTreatment && patient && (
        <div className="modal-overlay">
          <div className="modal-content receipt-modal">
            <h3>Treatment Receipt</h3>
            <div className="receipt-details">
              <div className="receipt-header">
                <h4>Dental Clinic Receipt</h4>
                <p>Date: {new Date(latestTreatment.treatmentDate).toLocaleDateString()}</p>
              </div>
              
              <div className="patient-info">
                <h5>Patient Information</h5>
                <p><strong>Name:</strong> {patient.firstName} {patient.lastName}</p>
                <p><strong>Patient ID:</strong> {patient.id}</p>
                <p><strong>Age:</strong> {new Date().getFullYear() - new Date(patient.dob).getFullYear()}</p>
              </div>
              
              <div className="treatment-info">
                <h5>Treatment Details</h5>
                <p><strong>Session ID:</strong> {latestTreatment.sessionId}</p>
                <p><strong>Treatment Type:</strong> {latestTreatment.treatmentType}</p>
                <p><strong>Notes:</strong> {latestTreatment.treatmentNotes || 'N/A'}</p>
                <p><strong>Payment Amount:</strong> Rs. {latestTreatment.payment}</p>
              </div>
              
              <div className="receipt-footer">
                <p>Thank you for choosing our clinic!</p>
                <p>For any queries, please contact: 012-3456789</p>
              </div>
            </div>
            
            <div className="modal-buttons">
              <button onClick={() => setIsReceiptModalOpen(false)}>Close</button>
              <button onClick={() => window.print()}>Print Receipt</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TreatmentPage;
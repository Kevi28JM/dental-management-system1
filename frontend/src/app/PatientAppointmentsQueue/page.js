"use client";
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "@/styles/PatientAppointmentsQueue.css"; // (optional styling)

const PatientAppointmentsQueue = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Helper to get today's date in YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const fetchAppointments = async () => {
    try {
      const today = getTodayDate();
      const response = await axios.get(`/api/appointments/byDate/${today}`); // Adjust route as per your backend

      if (response.data.success) {
        setAppointments(response.data.appointments);
      } else {
        setAppointments([]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Today's Appointment Queue</h3>

      {loading ? (
        <p>Loading appointments...</p>
      ) : appointments.length === 0 ? (
        <p>No appointments found for today.</p>
      ) : (
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>Appointment No</th>
              <th>Dentist</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((apt, index) => (
              <tr
                key={apt.appointmentId}
                className={apt.status === 'in_progress' ? 'table-warning' : ''}
              >
                <td>{index + 1}</td>
                <td>{apt.dentistName}</td>
                <td>{apt.date}</td>
                <td>
                  {apt.status === 'in_progress' ? (
                    <span className="badge bg-warning text-dark">In Progress</span>
                  ) : (
                    <span className="badge bg-secondary">Waiting</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PatientAppointmentsQueue;

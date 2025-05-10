'use client';
import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import db from '@/firebase';
import { toast } from 'react-toastify';
import axios from 'axios';

function DentistViewAppointments() {
  const [dentistId, setDentistId] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inProgressAppointments, setInProgressAppointments] = useState([]); // store IDs in progress

  // Helper to get today's date in YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  // Get dentistId + set today's date on load
  useEffect(() => {
    const storedDentistId = localStorage.getItem('dentistId');
    if (storedDentistId) {
      setDentistId(storedDentistId);
      const today = getTodayDate();
      setSelectedDate(today);
    } else {
      toast.error('Dentist not logged in');
    }
  }, []);

  // Auto-fetch appointments when dentistId and selectedDate are ready
  useEffect(() => {
    if (dentistId && selectedDate) {
      fetchAppointments();
    }
  }, [dentistId, selectedDate]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const appointmentsRef = collection(db, 'appointments');
      const q = query(
        appointmentsRef,
        where('dentistId', '==', dentistId),
        where('date', '==', selectedDate)
      );
      const querySnapshot = await getDocs(q);

      const fetchedAppointments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAppointments(fetchedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

    // ---- BUTTON ACTIONS ----

  const handleAdd = async (appointment) => {
    try {
      // Example SQL API endpoint — adjust as per your Node.js backend route
      const response = await axios.post('http://localhost:5000/api/appointments/add', {
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        dentistId: appointment.dentistId,
        date: appointment.date,
      });

      if (response.status === 200) {
        toast.success('Appointment moved to SQL (In Progress)');
        setInProgressAppointments(prev => [...prev, appointment.id]);
      } else {
        toast.error('Failed to add to SQL');
      }
    } catch (error) {
      console.error('Error adding to SQL:', error);
      toast.error('Error adding to SQL');
    }
  };

  const handleRemove = async (appointmentId) => {
    try {
      await deleteDoc(doc(db, 'appointments', appointmentId));
      toast.success('Appointment removed');
      setAppointments(prev => prev.filter(app => app.id !== appointmentId));
    } catch (error) {
      console.error('Error removing appointment:', error);
      toast.error('Failed to remove appointment');
    }
  };

  const handleTreat = (appointmentId) => {
    toast.info(`Open treatment form for ${appointmentId}`);
    // You can redirect or open modal here later
  };

  const handlePrescription = (appointmentId) => {
    toast.info(`Open prescription form for ${appointmentId}`);
    // You can redirect or open modal here later
  };

  const handleTreatmentComplete = async (appointmentId) => {
    try {
      await deleteDoc(doc(db, 'appointments', appointmentId));
      toast.success('Treatment saved and appointment removed');
      setAppointments(prev => prev.filter(app => app.id !== appointmentId));
    } catch (error) {
      console.error('Error removing after treatment:', error);
      toast.error('Failed to remove after treatment');
    }
  };



  return (
    <div style={{ padding: '20px' }}>
      <h2>View Your Appointments</h2>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ marginRight: '10px' }}><strong>Select Date:</strong></label>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          style={{ padding: '5px', marginRight: '10px' }}
        />
        <button
          onClick={fetchAppointments}
          style={{
            padding: '6px 15px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p>Loading appointments...</p>
      ) : appointments.length === 0 ? (
        <p>No appointments found for {selectedDate}.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={tableCellStyle}>Patient ID</th>
              <th style={tableCellStyle}>Patient No</th>
              <th style={tableCellStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(appointment => {
              const inProgress = inProgressAppointments.includes(appointment.id);
              return (
                <tr
                  key={appointment.id}
                  style={{
                    backgroundColor: inProgress ? '#ffeeba' : 'white',
                  }}
                >
                  <td style={tableCellStyle}>{appointment.patientId}</td>
                  <td style={tableCellStyle}>{appointment.patientNumber}</td>
                  <td style={tableCellStyle}>
                    {!inProgress ? (
                      <>
                        <button
                          onClick={() => handleAdd(appointment)}
                          style={btnStyle('blue')}
                        >Add</button>{' '}
                        <button
                          onClick={() => handleRemove(appointment.id)}
                          style={btnStyle('red')}
                        >Remove</button>
                      </>
                    ) : (
                      <>
                        <span style={{ marginRight: '8px', fontWeight: 'bold', color: '#856404' }}>In Progress</span>
                        <button
                          onClick={() => handleTreat(appointment.id)}
                          style={btnStyle('green')}
                        >Treat</button>{' '}
                        <button
                          onClick={() => handlePrescription(appointment.id)}
                          style={btnStyle('purple')}
                        >Presc.</button>{' '}
                        <button
                          onClick={() => handleTreatmentComplete(appointment.id)}
                          style={btnStyle('gray')}
                        >Finish</button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

const tableCellStyle = {
  border: '1px solid #ccc',
  padding: '8px',
  textAlign: 'center',
};

const btnStyle = (color) => {
  const colors = {
    blue: '#007bff',
    red: '#dc3545',
    green: '#28a745',
    purple: '#6f42c1',
    gray: '#6c757d',
  };
  return {
    padding: '5px 10px',
    backgroundColor: colors[color],
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    marginRight: '4px',
  };
};

export default DentistViewAppointments;

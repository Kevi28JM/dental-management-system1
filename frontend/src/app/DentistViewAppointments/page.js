'use client';
import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import db from '@/firebase';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';// Import useRouter for navigation
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import "@/styles/DentistViewAppointments.css"; // Import your CSS file
import DentistSidebar from '@/components/DentistSidebar';

function DentistViewAppointments() {
  const router = useRouter(); // Initialize router for navigation
  const { authData } = useAuth(); // Get auth data from context
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

   // Set today's date on load
  useEffect(() => {
    const today = getTodayDate();
    setSelectedDate(today);
  }, []);

   // Fetch dentistId from SQL using userId
  const fetchDentistIdFromSQL = async (user_id) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/dentist/byUser/${user_id}`);
      if (res.status === 200 && res.data.dentistId) {
        setDentistId(res.data.dentistId);
        console.log('Fetched dentistId from SQL:', res.data.dentistId);
      } else {
        console.error('Dentist not found in SQL for userId:', user_id);
        toast.error('Dentist record not found');
      }
    } catch (error) {
      console.error('Error fetching dentistId from SQL:', error);
      toast.error('Failed to fetch dentistId');
    }
  };

  // On authData.user_id change → fetch dentistId
  useEffect(() => {
    if (authData?.user_id) {
      fetchDentistIdFromSQL(authData.user_id);
    }
  }, [authData]);

  // Auto-fetch appointments when dentistId and selectedDate are ready
  useEffect(() => {
    if (dentistId && selectedDate) {
      fetchAppointments();
    }
  }, [dentistId, selectedDate]);

  const fetchAppointments = async () => {
   console.log('Fetching appointments for dentistId:', dentistId, 'and date:', selectedDate);
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

      console.log('Fetched appointments:', fetchedAppointments);
      setAppointments(fetchedAppointments);

       // ✅ Set inProgress IDs again based on Firestore data
    const inProgressIds = fetchedAppointments
      .filter(app => app.status === "inProgress")
      .map(app => app.id);
    setInProgressAppointments(inProgressIds);

    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

    // ---- BUTTON ACTIONS ----

  
  const handleAdd = async (appointment) => {
    console.log('Adding appointment to SQL:', appointment);
    try {
      // Check if the appointment already exists in SQL
      const checkResponse = await axios.get(`http://localhost:5000/api/appointments/check/${appointment.id}`);

      if (checkResponse.data.exists) {
        console.log('Appointment already exists in SQL:', appointment.id);
        toast.error('Appointment already exists for this patient on this date.');
        return;
      }

      // If no existing appointment, proceed to add
      const response = await axios.post('http://localhost:5000/api/appointments/add', {
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        dentistId: appointment.dentistId,
        date: appointment.date,
      });

      if (response.status === 200) {
        console.log('Successfully added appointment to SQL');

        // ✅ Mark status in Firestore
            try {
        const appointmentRef = doc(db, "appointments", appointment.id);
        await updateDoc(appointmentRef, { status: "inProgress" });
        console.log("Firestore status updated to inProgress for:", appointment.id);
      } catch (err) {
        console.error("Error updating Firestore status:", err);
        toast.error("Failed to update Firestore status");
      }


        toast.success("Appointment moved to SQL (In Progress)");
        setInProgressAppointments(prev => [...prev, appointment.id]);
      } else {
        console.error('Failed response while adding to SQL:', response);
        toast.error("Failed to add to SQL");
      }
    } catch (error) {
      console.error("Error adding to SQL:", error);
      toast.error("Error adding to SQL");
    }
  };

// Remove appointment from Firestore
  const handleRemove = async (appointmentId) => {
    console.log('Removing appointment:', appointmentId);
    try {
      await deleteDoc(doc(db, "appointments", appointmentId));
      toast.success("Appointment removed");
      setAppointments(prev => prev.filter(app => app.id !== appointmentId));
    } catch (error) {
      console.error("Error removing appointment:", error);
      toast.error("Failed to remove appointment");
    }
  };

  //handle tratment and prescription
  const handleTreat = (appointmentId) => {
  console.log(`Treat button clicked for appointmentId: ${appointmentId}`);
  const targetUrl = `/TreatmentPage?appointmentId=${appointmentId}`;
  console.log(`Navigating to: ${targetUrl}`);
  router.push(targetUrl);
};


  const handlePrescription = (appointmentId) => {
    console.log('Opening prescription form for:', appointmentId);
    toast.info(`Open prescription form for ${appointmentId}`);
    // You can redirect or open modal here later
  };

  const handleTreatmentComplete = async (appointmentId) => {
    console.log('Completing treatment and removing appointment:', appointmentId);
    try {
      await deleteDoc(doc(db, 'appointments', appointmentId));
      toast.success("Treatment saved and appointment removed");
      setAppointments(prev => prev.filter(app => app.id !== appointmentId));
    } catch (error) {
      console.error("Error removing after treatment:", error);
      toast.error("Failed to remove after treatment");
    }
  };



  return (
    <div className="appointments-page">
    <DentistSidebar /> 
    <main className="appointments-content">
      <h2>View Your Appointments</h2>

      <div className="date-selector">
        <label><strong>Select Date:</strong></label>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
        />
        <button onClick={fetchAppointments}>Refresh</button>
      </div>

      {loading ? (
        <p>Loading appointments...</p>
      ) : appointments.length === 0 ? (
        <p>No appointments found for {selectedDate}.</p>
      ) : (
        <table className="appointments-table">
          <thead>
            <tr>
              <th>Patient ID</th>
              <th>Patient No</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(appointment => {
              const inProgress = inProgressAppointments.includes(appointment.id);
              return (
                <tr key={appointment.id} className={inProgress ? "in-progress-row" : ''}>
                  <td>{appointment.patientId}</td>
                  <td>{appointment.patientNumber}</td>
                  <td>
                    {!inProgress ? (
                      <>
                        <button className="blue-btn" onClick={() => handleAdd(appointment)}>Add</button>
                        <button className="red-btn" onClick={() => handleRemove(appointment.id)}>Remove</button>
                      </>
                    ) : (
                      <>
                        <span className="in-progress-text">Ongoing treatment</span>
                        <button className="green-btn" onClick={() => handleTreat(appointment.id)}>Treat</button>
                         
                        <button className="gray-btn" onClick={() => handleTreatmentComplete(appointment.id)}>Finish</button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </main>
    </div>
  );
}

 

export default DentistViewAppointments;

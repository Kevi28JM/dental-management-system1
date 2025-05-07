'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, collection, addDoc,deleteDoc } from 'firebase/firestore';
import db from '@/firebase';
import { toast } from 'react-toastify';

function BookAppointmentPage() {
  const searchParams = useSearchParams();
  const availabilityId = searchParams.get('availabilityId');
  const router = useRouter();

  const [session, setSession] = useState(null);
  const [patientId, setPatientId] = useState(null);
  const [dentistId, setDentistId] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState(null);  // Track if booking is done

  // 1️⃣ Get patientId from localStorage
  useEffect(() => {
    const storedPatientId = localStorage.getItem("patientId");
    if (storedPatientId) {
      setPatientId(storedPatientId);
    } else {
      toast.error("Patient not logged in");
    }

    const storedBookingId = localStorage.getItem("bookingId");
    if (storedBookingId) {
      setBookingId(storedBookingId);
    }

    const storedDentistId = localStorage.getItem('dentistId');
    if (storedDentistId) {
      setDentistId(storedDentistId);
    } else {
      toast.error('Dentist information missing');
    }
  }, []);

  // 2️⃣ Fetch availability session data from Firebase
  useEffect(() => {
    const fetchSession = async () => {
      if (!availabilityId) return;

      try {
        const docRef = doc(db, 'availabilities', availabilityId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setSession({ id: docSnap.id, ...docSnap.data() });
        } else {
          toast.error('Session not found');
        }
      } catch (error) {
        console.error('Error fetching session:', error);
        toast.error('Failed to fetch session data');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [availabilityId]);


    // Confirm booking
    const handleConfirmBooking = async () => {
    
    const storedPatientId = localStorage.getItem('patientId'); 
    if (!patientId || !session) {
      toast.error('Missing patient or session information');
      return;
    }

    if (session.activeAppointments >= session.maxAppointments) {
      toast.error('No available slots left');
      return;
    }

    try {
      // 3️⃣ Calculate patient number (next number in line)
      const patientNumber = session.activeAppointments + 1;

      // 4️⃣ Save booking in 'appointments' collection
      const bookingRef = await addDoc(collection(db, 'appointments'), {
        availabilityId: session.id,
        dentistId: dentistId, 
        patientId: patientId,
        date: session.date,
        startTime: session.startTime,
        patientNumber: patientNumber,
        status: 'booked',
        createdAt: new Date(),
      });

      console.log('Appointment booked with ID:', bookingRef.id);
      setBookingId(bookingRef.id);
      localStorage.setItem('bookingId', bookingRef.id); // Store bookingId

      // 5️⃣ Auto-increment activeAppointments in availabilities
      const sessionRef = doc(db, 'availabilities', session.id);
      await updateDoc(sessionRef, {
        activeAppointments: patientNumber,
      });

      toast.success('Appointment booked successfully!');
        

    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment');
    }
  };

  // 4️⃣ Cancel Booking
  const handleCancelBooking = async () => {
    const confirmCancel = window.confirm('Are you sure you want to cancel your booking?');
    if (!confirmCancel) return;

    try {
      if (!bookingId) {
        toast.error('No booking to cancel');
        return;
      }

      await deleteDoc(doc(db, 'appointments', bookingId));
      console.log('Booking cancelled with ID:', bookingId);

      // Decrement activeAppointments
      const sessionRef = doc(db, 'availabilities', session.id);
      await updateDoc(sessionRef, {
        activeAppointments: Math.max(0, session.activeAppointments - 1),
      });

      toast.success('Appointment cancelled successfully');

      // Clear bookingId (state + localStorage)
      setBookingId(null);
      localStorage.removeItem('bookingId');

      // Refresh session data
      setSession(prev => ({
        ...prev,
        activeAppointments: Math.max(0, prev.activeAppointments - 1),
      }));

    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  // 5️⃣ UI Rendering
  if (loading) {
    return <p>Loading session details...</p>;
  }

  if (!session) {
    return <p>Session not found</p>;
  }

  return (
    <div>
      <h2>Confirm Your Appointment</h2>

      <div style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '15px' }}>
        <p><strong>Date:</strong> {session.date}</p>
        <p><strong>Start Time:</strong> {session.startTime}</p>
        <p><strong>Maximum Appointments:</strong> {session.maxAppointments}</p>
        <p><strong>Current Appointments:</strong> {session.activeAppointments}</p>
        <p><strong>Your Patient Number:</strong> {session.activeAppointments + (bookingId ? 0 : 1)}</p>
        <p><strong>Status:</strong> {session.status}</p>
      </div>

      {bookingId ? (
        <button
          onClick={handleCancelBooking}
          style={{
            backgroundColor: 'red',
            color: 'white',
            padding: '10px 20px',
            marginRight: '10px',
            cursor: 'pointer',
          }}
        >
          Cancel Booking
        </button>
      ) : (
        <button
          onClick={handleConfirmBooking}
          disabled={session.activeAppointments >= session.maxAppointments}
          style={{
            backgroundColor: session.activeAppointments < session.maxAppointments ? 'green' : 'grey',
            color: 'white',
            padding: '10px 20px',
            marginRight: '10px',
            cursor: session.activeAppointments < session.maxAppointments ? 'pointer' : 'not-allowed',
          }}
        >
          Confirm Booking
        </button>
      )}

      <button
        onClick={() => router.push('/PatientDashboard')}
        style={{
          backgroundColor: '#555',
          color: 'white',
          padding: '10px 20px',
          cursor: 'pointer',
        }}
      >
        Cancel
      </button>
    </div>
  );
}

export default BookAppointmentPage;

'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, collection, addDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore';
import db from '@/firebase';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';
import AssistSidebar from '@/components/AssistSidebar';
import "@/styles/AssistBookAppointmentPage.css";

function AssistBookAppointmentPage() {
  const searchParams = useSearchParams();
  const availabilityId = searchParams.get('availabilityId');
  const router = useRouter();

  const [session, setSession] = useState(null);
  const [patientId, setPatientId] = useState('');
  const [existingBooking, setExistingBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingBooking, setCheckingBooking] = useState(false);

  // Fetch availability session data from Firebase
  useEffect(() => {
    const fetchSession = async () => {
      if (!availabilityId) {
        console.warn('[fetchSession] No availabilityId in URL.');
        return;
      }
      
      try {
        const docRef = doc(db, 'availabilities', availabilityId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const sessionData = { id: docSnap.id, ...docSnap.data() };
          setSession(sessionData);
        } else {
          toast.error('Session not found');
        }
      } catch (error) {
        toast.error('Failed to fetch session data');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [availabilityId]);

  // Check for existing booking when patientId changes
  useEffect(() => {
    const checkBooking = async () => {
      if (!patientId || !availabilityId) {
        setExistingBooking(null);
        return;
      }

      setCheckingBooking(true);
      try {
        const q = query(
          collection(db, 'appointments'),
          where('patientId', '==', patientId),
          where('availabilityId', '==', availabilityId)
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const booking = querySnapshot.docs[0];
          const bookingData = { id: booking.id, ...booking.data() };
          setExistingBooking(bookingData);
        } else {
          setExistingBooking(null);
        }
      } catch (error) {
        console.error('Error checking existing booking:', error);
        setExistingBooking(null);
      } finally {
        setCheckingBooking(false);
      }
    };

    // Add debounce to prevent too many queries
    const timer = setTimeout(() => {
      checkBooking();
    }, 500);

    return () => clearTimeout(timer);
  }, [patientId, availabilityId]);

  const handlePatientIdChange = (e) => {
    setPatientId(e.target.value.trim());
  };

  const handleConfirmBooking = async () => {
    if (!patientId || !session) {
      toast.error('Please enter a valid Patient ID');
      return;
    }

    if (existingBooking) {
      toast.error('This patient has already booked this session');
      return;
    }

    if (session.activeAppointments >= session.maxAppointments) {
      toast.error('No available appointments left');
      return;
    }

    try {
      const patientNumber = session.activeAppointments + 1;
      
      const bookingRef = await addDoc(collection(db, 'appointments'), {
        availabilityId: session.id,
        dentistId: session.dentistId, 
        patientId: patientId,
        date: session.date,
        startTime: session.startTime,
        patientNumber: patientNumber,
        status: 'booked',
        createdAt: new Date(),
      });

      await updateDoc(doc(db, 'availabilities', session.id), {
        activeAppointments: patientNumber,
      });

      setSession(prev => ({
        ...prev,
        activeAppointments: patientNumber,
      }));

      setExistingBooking({
        id: bookingRef.id,
        availabilityId: session.id,
        dentistId: session.dentistId,
        patientId: patientId,
        date: session.date,
        startTime: session.startTime,
        patientNumber: patientNumber,
        status: 'booked',
      });

      toast.success(`Appointment booked for Patient ID: ${patientId}`);
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment');
    }
  };

  const handleCancelBooking = async () => {
    if (!existingBooking) return;

    const confirmCancel = window.confirm('Are you sure you want to cancel this booking?');
    if (!confirmCancel) return;

    try {
      await deleteDoc(doc(db, 'appointments', existingBooking.id));
      await updateDoc(doc(db, 'availabilities', session.id), {
        activeAppointments: Math.max(0, session.activeAppointments - 1),
      });

      setSession(prev => ({
        ...prev,
        activeAppointments: Math.max(0, prev.activeAppointments - 1),
      }));

      setExistingBooking(null);
      toast.success('Appointment cancelled successfully');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel appointment');
    }
  };

  if (loading) return <p>Loading session details...</p>;
  if (!session) return <p>Session not found</p>;

  const isFull = session.activeAppointments >= session.maxAppointments;
  const canBook = !isFull && patientId && !existingBooking && !checkingBooking;

  return (
    <div className="book-appointment-page">
      <AssistSidebar />
      <div className="book-appointment-content">
        <h2>Assistant Booking Portal</h2>

        <div className="session-card">
          <p><strong>Date:</strong> {session.date}</p>
          <p><strong>Start Time:</strong> {session.startTime}</p>
          <p><strong>Maximum Appointments:</strong> {session.maxAppointments}</p>
          <p><strong>Current Appointments:</strong> {session.activeAppointments}</p>
        </div>

        <div className="form-group">
          <label>Enter Patient ID:</label>
          <input
            type="text"
            value={patientId}
            onChange={handlePatientIdChange}
            placeholder="Enter Patient ID"
          />
        </div>

        <div className="button-group">
          <button
            className={`btn ${isFull ? 'btn-full' : 'btn-confirm'} ${!canBook ? 'disabled' : ''}`}
            onClick={handleConfirmBooking}
            disabled={!canBook}
          >
            {isFull ? 'Session Full' : 'Confirm Booking'}
          </button>
          <button className="btn btn-back" onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </button>
        </div>

        {existingBooking && (
        <div className="existing-booking">
          <div className="existing-booking-message">
            <p><strong>⚠️ Existing Booking Found</strong></p>
            <p>Patient ID: {existingBooking.patientId}</p>
            <p>Appointment Date: {existingBooking.date}</p>
          </div>
          <button className="btn btn-cancel" onClick={handleCancelBooking}>
            Cancel Booking
          </button>
        </div>
      )}
      </div>
    </div>
  );
}

export default AssistBookAppointmentPage;
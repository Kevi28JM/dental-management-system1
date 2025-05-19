'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, collection, addDoc,deleteDoc,  query, where, getDocs  } from 'firebase/firestore';
import db from '@/firebase';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';// Import useAuth
import PatientSidebar from '@/components/PatientSidebar';
import "@/styles/BookAppointmentPage.css"; // Import your CSS file

function BookAppointmentPage() {
  const searchParams = useSearchParams();
  const availabilityId = searchParams.get('availabilityId');
  const router = useRouter();
  const { authData } = useAuth();

  const [session, setSession] = useState(null);
  const [existingBooking, setExistingBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  
 

  // 1️⃣ Fetch availability session data from Firebase
  useEffect(() => {
    const fetchSession = async () => {
      if (!availabilityId){
        console.warn('[fetchSession] No availabilityId in URL.');
        return;
      }
      
      try {
        console.log("Trying to fetch availabilityId:", availabilityId);
        const docRef = doc(db, 'availabilities', availabilityId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const sessionData = { id: docSnap.id, ...docSnap.data() };
          console.log('[fetchSession] Session data fetched:', sessionData);
          setSession(sessionData);
        } else {
          console.warn('[fetchSession] Session not found for availabilityId:', availabilityId);
          toast.error('Session not found');
        }
      } catch (error) {
        console.error('[fetchSession] Error fetching session:', error);
        toast.error('Failed to fetch session data');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [availabilityId]);

  
  // 2️⃣ Check if patient has already booked for this session
  useEffect(() => {
    const fetchExistingBooking = async () => {
      console.log('[fetchExistingBooking] authData:', authData);
      if (!authData.patient_id || !availabilityId) {
        console.warn('[fetchExistingBooking] Missing patient_id or availabilityId');
        return;
      }

      try {
         console.log('[fetchExistingBooking] Checking bookings for patient_id:', authData.patient_id, 'and availabilityId:', availabilityId);
        const q = query(
          collection(db, 'appointments'),
          where('patientId', '==', authData.patient_id),
          where('availabilityId', '==', availabilityId)
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const booking = querySnapshot.docs[0];
          const bookingData = { id: booking.id, ...booking.data() };
          console.log('[fetchExistingBooking] Existing booking found:', bookingData);
          setExistingBooking(bookingData);
       } else {
          console.log('[fetchExistingBooking] No existing booking found');
        }
      } catch (error) {
        console.error('[fetchExistingBooking] Error checking existing booking:', error);
      }
    };

    fetchExistingBooking();
  }, [authData.patient_id, availabilityId]);



    // 3️⃣ Confirm booking
    const handleConfirmBooking = async () => {
       console.log('[handleConfirmBooking] authData:', authData);
       console.log('[handleConfirmBooking] session:', session);

    if (!authData.patient_id || !authData.user_id || !session) {
      toast.error('Missing patient or session information');
      console.error('[handleConfirmBooking] ❌ Missing data - patient_id:', authData.patient_id, 'user_id:', authData.user_id, 'session:', session);
      return;
    }

    if (session.activeAppointments >= session.maxAppointments) {
      toast.error('No available appointments left');
      console.warn('[handleConfirmBooking] Session is full.');
      return;
    }

    if (existingBooking) {
      toast.error('You have already booked this session');
       console.warn('[handleConfirmBooking] Patient has already booked.');
      return;
    }

    try {
      // 4️⃣ Calculate patient number (next number in line)
      const patientNumber = session.activeAppointments + 1;
      console.log('[handleConfirmBooking] Booking patient number:', patientNumber);

      //5️⃣ Save booking in 'appointments' collection
      const bookingRef = await addDoc(collection(db, 'appointments'), {
        availabilityId: session.id,
        dentistId: session.dentistId, 
        patientId: authData.patient_id,
        date: session.date,
        startTime: session.startTime,
        patientNumber: patientNumber,
        status: 'booked',
        createdAt: new Date(),
      });
      console.log('[handleConfirmBooking] ✅ Appointment booked with ID:', bookingRef.id);

      console.log('Appointment booked with ID:', bookingRef.id);
      
       

      //  Auto-increment activeAppointments in availabilities
      const sessionRef = doc(db, 'availabilities', session.id);
      await updateDoc(sessionRef, {
        activeAppointments: patientNumber,
      });
      console.log('[handleConfirmBooking] Session activeAppointments updated to:', patientNumber);


      toast.success('Appointment booked successfully!');
      setExistingBooking({
        id: bookingRef.id,
        availabilityId: session.id,
        dentistId: session.dentistId,
        patientId: authData.patient_id,
        date: session.date,
        startTime: session.startTime,
        patientNumber: patientNumber,
        status: 'booked',
      });

       // Refresh session count
      setSession((prev) => ({
        ...prev,
        activeAppointments: patientNumber,
      }));

    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error('Failed to book appointment');
    }
  };

  //  Cancel Booking
  const handleCancelBooking = async () => {
    const confirmCancel = window.confirm('Are you sure you want to cancel your booking?');
    if (!confirmCancel) return;

    if (!existingBooking) {
      toast.error('No booking to cancel');
      return;
    }

     try {
      console.log('[handleCancelBooking] Cancelling booking with ID:', existingBooking.id);
      await deleteDoc(doc(db, 'appointments', existingBooking.id));

      const sessionRef = doc(db, 'availabilities', session.id);
      await updateDoc(sessionRef, {
        activeAppointments: Math.max(0, session.activeAppointments - 1),
      });
      console.log('[handleCancelBooking] Updated session activeAppointments after cancel');


      toast.success('Appointment cancelled successfully');
      setExistingBooking(null);

      // Refresh session count
      setSession((prev) => ({
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

  const isFull = session.activeAppointments >= session.maxAppointments;

  return (
    <div className="book-appointment-page">
      <PatientSidebar />
      <div className="book-appointment-content">
        <h2>Confirm Your Appointment</h2>

        <div className="session-card">
          <p><strong>Date:</strong> {session.date}</p>
          <p><strong>Start Time:</strong> {session.startTime}</p>
          <p><strong>Maximum Appointments:</strong> {session.maxAppointments}</p>
          <p><strong>Current Appointments:</strong> {session.activeAppointments}</p>
          <p><strong>Your Patient Number:</strong> {session.activeAppointments + (existingBooking ? 0 : 1)}</p>
          <p><strong>Status:</strong> {session.status}</p>
        </div>

        <div className="button-group">
          {existingBooking ? (
            <button className="btn cancel-btn" onClick={handleCancelBooking}>Cancel Booking</button>
          ) : (
            <button
              className="btn confirm-btn"
              onClick={handleConfirmBooking}
              disabled={isFull}
            >
              {isFull ? 'Session Full' : 'Confirm Booking'}
            </button>
          )}
          <button className="btn back-btn" onClick={() => router.push('/PatientDashboard')}>Back to Dashboard</button>
        </div>
      </div>
    </div>
  );
}

export default BookAppointmentPage;

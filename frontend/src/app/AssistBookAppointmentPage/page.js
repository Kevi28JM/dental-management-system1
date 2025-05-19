'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc, collection, addDoc,deleteDoc,  query, where, getDocs  } from 'firebase/firestore';
import db from '@/firebase';
import { toast } from 'react-toastify';
import { useAuth } from '@/context/AuthContext';// Import useAuth
import AssistSidebar from '@/components/AssistSidebar';
import "@/styles/AssistBookAppointmentPage.css"; // Import your CSS file

function AssistBookAppointmentPage() {
  const searchParams = useSearchParams();
  const availabilityId = searchParams.get('availabilityId');
  const router = useRouter();


  const [session, setSession] = useState(null);
  const [patientId, setPatientId] = useState('');
  //const [pid, setPid] = useState('');

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
  
    const checkExistingBooking = async (idToCheck) => {
        //if (!patientIdToCheck || !availabilityId) return null;

        try { 
        const q = query(
          collection(db, 'appointments'),
          where('patientId', '==', idToCheck),
          where('availabilityId', '==', availabilityId)
        );

        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const booking = querySnapshot.docs[0];
          const bookingData = { id: booking.id, ...booking.data() };
          console.log('[checkExistingBooking] Existing booking found:', bookingData);
          setExistingBooking(bookingData);
          return bookingData;
       } else {
          console.log('[checkExistingBooking] No existing booking found');
          setExistingBooking(null);
          return null;  // No booking found
        }
      } catch (error) {
        console.error('[checkExistingBooking] Error checking existing booking:', error);
        return null;  // No booking found
      }
    };

   // Trigger check when patient ID changes
  useEffect(() => {
    const fetchBooking = async () => {
      const booking = await checkExistingBooking(patientId);
      setExistingBooking(booking);
    };

    if (patientId) {
      fetchBooking();
    }
  }, [patientId, availabilityId]);

  // 🔹 Handle patient ID change
  const handlePatientIdChange = (e) => {
    const value = e.target.value;
    setPatientId(value);
    setExistingBooking(null);
  };


    // 3️⃣ Confirm booking
    const handleConfirmBooking = async () => {
         if (!patientId || !session) {
            toast.error('Please enter a valid Patient ID');
            return;
    }
     //await checkExistingBooking(patientId); // Update existingBooking state
     // Wait for booking check and get result
  const booking = await checkExistingBooking(patientId);
   if (booking) {
      toast.error('This patient has already booked this session');
      return;
    }

    if (session.activeAppointments >= session.maxAppointments) {
      toast.error('No available appointments left');
      console.warn('[handleConfirmBooking] Session is full.');
      return;
    }

    if (existingBooking) {
      toast.error('This patient has already booked this session');
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
        patientId: patientId,
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
      console.log(' Session activeAppointments updated to:', patientNumber);


      toast.success('Appointment booked for Patient ID: ${patientId}');
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
      setPatientId('');
      setExistingBooking(null);

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
    if (!existingBooking) {
      toast.error('No booking to cancel for this patient ID');
      return;
    }

    const confirmCancel = window.confirm('Are you sure you want to cancel this booking?');
    if (!confirmCancel) return;

    
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

   {/* const handlePatientIdChange = (e) => {
    setPatientId(e.target.value);
    setExistingBooking(null); // Reset previous booking info
  };
  */}

  const handleCheckBooking = () => {
    if (patientId) {
      checkExistingBooking(patientId);
    }
  };
 
 
  // 5️⃣ UI Rendering
  if (loading) return <p>Loading session details...</p>;
  if (!session) return <p>Session not found</p>;

  const isFull = session.activeAppointments >= session.maxAppointments;


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
          <button className="btn check-btn" onClick={handleCheckBooking}>Check Existing Booking</button>
        </div>


       {existingBooking && (
          <div className="existing-booking">
            <p><strong>Booking already exists for Patient ID:</strong> {existingBooking.patientId}</p>
            <p><strong>Patient Number:</strong> {existingBooking.patientNumber}</p>
            <button className="btn cancel-btn" onClick={handleCancelBooking}>Cancel Booking</button>
          </div>
        )}

        {!existingBooking && (
          <div className="button-group">
            <button
              className="btn confirm-btn"
              onClick={handleConfirmBooking}
              disabled={isFull || !patientId}
            >
              {isFull ? 'Session Full' : 'Confirm Booking'}
            </button>
             </div>
          )}
          <button className="btn back-btn" onClick={() => router.push('/dashboard')}>Back to Dashboard</button>
        </div>
      </div>
     
  );
}

export default AssistBookAppointmentPage;

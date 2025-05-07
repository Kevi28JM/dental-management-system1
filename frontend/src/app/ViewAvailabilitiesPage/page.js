'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { collection, query, where, getDocs } from 'firebase/firestore';
import db from '@/firebase';
import { toast } from 'react-toastify';

function ViewAvailabilitiesPage() {
  const searchParams = useSearchParams();
  const dentistId = searchParams.get('dentistId');
  const router = useRouter();
  const [availabilities, setAvailabilities] = useState([]);

  // Fetch availabilities for selected dentist
  useEffect(() => {
    const fetchAvailabilities = async () => {
      if (!dentistId) {
        toast.error('Dentist not found in URL');
        return;
      }

      // Store dentistId in localStorage
      localStorage.setItem('selectedDentistId', dentistId);
      
      try {
        const q = query(
          collection(db, 'availabilities'),
          where('dentistId', '==', dentistId)
        );

        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAvailabilities(data);
      } catch (error) {
        console.error('Error fetching availabilities:', error);
        toast.error('Failed to load availabilities');
      }
    };

    fetchAvailabilities();
  }, [dentistId]);


  // Handle booking: redirect to BookAppointmentPage with availabilityId
  const handleBook = (sessionId) => {
    router.push(`/BookAppointmentPage?availabilityId=${sessionId}`);

  };

   

  return (
    <div>
      <h2>Available Sessions</h2>

      {availabilities.length === 0 ? (
        <p>No available sessions found.</p>
      ) : (
        availabilities.map((session) => (
          <div
            key={session.id}
            style={{
              border: '1px solid #ccc',
              borderRadius: '5px',
              padding: '15px',
              marginBottom: '15px',
              boxShadow: '2px 2px 5px rgba(0,0,0,0.1)',
            }}
          >
            <p><strong>Date:</strong> {session.date}</p>
            <p><strong>Start Time:</strong> {session.startTime}</p>
            <p><strong>Max Appointments:</strong> {session.maxAppointments}</p>
            <p><strong>Active Appointments:</strong> {session.activeAppointments}</p>
            <p><strong>Status:</strong> {session.status}</p>

            <button
              onClick={() => handleBook(session.id)}
              disabled={session.status !== 'available'}
              style={{
                backgroundColor: session.status === 'available' ? 'green' : 'grey',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: session.status === 'available' ? 'pointer' : 'not-allowed',
              }}
            >
              {session.status === 'available' ? 'Book' : 'Unavailable'}
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default ViewAvailabilitiesPage;

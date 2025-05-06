'use client';  // required if we use useRouter

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

 function DentistListPage() {
  const [dentists, setDentists] = useState([]);
  const router = useRouter();

  const fetchDentists = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/dentist/dentists');
      console.log('API Response:', response.data);

      if (Array.isArray(response.data.dentists)) {
        setDentists(response.data.dentists);
        toast.success('Dentists data loaded successfully!');
      } else {
        console.error('Unexpected response format:', response.data);
        setDentists([]);
        toast.error('Failed to load dentists. Unexpected response format.');
      }
    } catch (error) {
      console.error('Error fetching dentists:', error);
      setDentists([]);
      toast.error(error.response?.data?.message || 'Error fetching dentists. Please try again.');
    }
  };

  useEffect(() => {
    fetchDentists();
  }, []);

  const handleChannel = (dentistId) => {
    router.push(`/ViewAvailabilitiesPage?dentistId=${dentistId}`);
  };

  return (
    <div>
      <h1>Available Dentists</h1>
      {dentists.map((dentist) => (
        <div key={dentist.dentist_id} style={{ border: '1px solid #ccc', padding: '10px', margin: '10px' }}>
          <h3>{dentist.name}</h3>
          <p>{dentist.specialization}</p>
          <button onClick={() => handleChannel(dentist.dentist_id)} style={{ backgroundColor: 'red', color: 'white' }}>
            Channel
          </button>
        </div>
      ))}
    </div>
  );
}

export default DentistListPage;
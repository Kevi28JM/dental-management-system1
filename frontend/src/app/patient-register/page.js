"use client"; // Ensure this is a client-side component
 import axios from "axios";
 import {useState, useEffect} from "react";
 import "@/styles/patient-register.css"; // Import custom styles
 import "@/styles/dashboard.css"; // Import custom styles
 import AssistSidebar from "@/components/AssistSidebar"; // Import the sidebar component
 import { toast, ToastContainer } from 'react-toastify';
 import 'react-toastify/dist/ReactToastify.css';

 const PatientManagement = () => {
    const [patients, setPatients] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [newPatient, setNewPatient] = useState({
      firstName: "",
      lastName: "",
      dob: "",
      gender: "",
      phone: "",
      email: "",
      address: "",
    });
  
    useEffect(() => {
      fetchPatients();
    }, []);
  
    const fetchPatients = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/patients/");
        
        console.log("API Response:", response.data); // Debugging line
      
        if (Array.isArray(response.data.patients)) {
          setPatients(response.data.patients);
          toast.success("Patients data loaded successfully!");
        } else {
          console.error("Unexpected response format:", response.data);
          setPatients([]); // Prevent errors
          toast.error("Failed to load patients. Unexpected response format.");
        }
      } catch (error) {
        console.error("Error fetching patients:", error);
        setPatients([]);
        toast.error(error.response?.data?.message || "Error fetching patients. Please try again.");
      }
      
    };
    
  
    const handleSearch = (e) => {
      setSearchQuery(e.target.value);
    };
  
    const filteredPatients = patients.filter((patient) =>
      `${patient.firstName} ${patient.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  
    const handleInputChange = (e) => {
      setNewPatient({ ...newPatient, [e.target.name]: e.target.value });
    };
  
    
    const handleRegisterPatient = async (e) => {
      e.preventDefault();
      try {
        const response = await axios.post("http://localhost:5000/api/patients/add", newPatient);
      
        if (response.status === 201) {
          toast.success("Patient registered successfully!");
          setShowModal(false);
          fetchPatients();
        } else {
          toast.error("Error registering patient: " + response.data.message);
        }
      } catch (error) {
        console.error("Registration Error:", error);
        toast.error(error.response?.data?.message || "Server error! Try again later.");
      }
      
    };
  
    return (
      <div className="patient-register-container">
      <AssistSidebar/> {/* Sidebar component */}

      {/* Main Content */}
      <div className="patient-management-container">
        <h2>Patient Management</h2>
        <input
          type="text"
          placeholder="Search patients..."
          value={searchQuery}
          onChange={handleSearch}
        />
        <table>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>DOB</th>
              <th>Gender</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => (
              <tr key={patient.id}>
                <td>{patient.firstName}</td>
                <td>{patient.lastName}</td>
                <td>{patient.dob}</td>
                <td>{patient.gender}</td>
                <td>{patient.phone}</td>
                <td>{patient.email}</td>
                <td>{patient.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button className="add-btn" onClick={() => setShowModal(true)}>
          ➕ Add Patient
        </button>

        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <h3>Register New Patient</h3>
              <form onSubmit={handleRegisterPatient}>
                <input type="text" name="firstName" placeholder="First Name" onChange={handleInputChange} required />
                <input type="text" name="lastName" placeholder="Last Name" onChange={handleInputChange} required />
                <input type="date" name="dob" onChange={handleInputChange} required />
                <select name="gender" onChange={handleInputChange} required>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
                <input type="text" name="phone" placeholder="Phone Number" onChange={handleInputChange} required />
                <input type="email" name="email" placeholder="Email" onChange={handleInputChange} required />
                <textarea name="address" placeholder="Address" onChange={handleInputChange} required />
                <button type="submit">Register</button>
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
              </form>
            </div>
          </div>
        )}
      </div>
      </div>
    );
  };
  
  export default PatientManagement;
  

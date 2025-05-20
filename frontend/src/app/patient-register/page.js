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
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

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
    
    // Handle search input change
    // This function filters the patients based on the search query entered by the user.
    const handleSearch = (e) => {
      setSearchQuery(e.target.value);
    };
  
    const filteredPatients = patients.filter((patient) =>
      `${patient.firstName} ${patient.lastName}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    );
  
    // Handle input change for new patient registration
    const handleInputChange = (e) => {
      setNewPatient({ ...newPatient, [e.target.name]: e.target.value });
    };
  

    // Handle input change for editing patient details
    const handleEditChange = (e) => {
      setSelectedPatient({ ...selectedPatient, [e.target.name]: e.target.value });
    };



  const validatePatient = (patientData) => {
  const { firstName, lastName, dob, gender, phone, email, address } = patientData;

  // Name validation (allows letters, spaces, hyphens, and apostrophes)
  const nameRegex = /^[a-zA-ZÀ-ÿ' -]+$/;
  
  if (!firstName.trim()) return "First name is required.";
  if (!nameRegex.test(firstName)) return "First name contains invalid characters.";
  
  if (!lastName.trim()) return "Last name is required.";
  if (!nameRegex.test(lastName)) return "Last name contains invalid characters.";

  // Date validation
  if (!dob) return "Date of birth is required.";
  const birthDate = new Date(dob);
  const today = new Date();
  
  if (birthDate > today) return "Date of birth cannot be in the future.";

  // Gender validation
  if (!gender) return "Gender is required.";

  // Phone validation (international format support)
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  if (!phone.trim()) return "Phone number is required.";
  if (!phoneRegex.test(phone.trim())) return "Please enter a valid phone number.";

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) return "Email is required.";
  if (!emailRegex.test(email.trim())) return "Please enter a valid email address.";

  // Address validation
  if (!address.trim()) return "Address is required.";

  return null; // All good
};


    // Handle form submission for registering a new patient
    const handleRegisterPatient = async (e) => {
      e.preventDefault();

       const error = validatePatient(newPatient);
          if (error) {
          toast.error(error);
          return;
  }

      try {
        const response = await axios.post("http://localhost:5000/api/patients/add", newPatient);
      
        if (response.status === 201) {
          const { tempPassword } = response.data;

          toast.success("Patient registered successfully!");

          // Show the temp password in a popup or alert (shown only once)
        alert(`Temporary password for patient: ${tempPassword}`);
      
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

      const handleEditPatient = (patient) => {
        setSelectedPatient(patient);
        setShowEditModal(true);
  };


  const validateEditPatient = (patientData) => {
  const { firstName, lastName, dob, gender, phone, email, address } = patientData;

  // Name validation (allows letters, spaces, hyphens, and apostrophes)
  const nameRegex = /^[a-zA-ZÀ-ÿ' -]+$/;
  
  if (!firstName?.trim()) return "First name is required.";
  if (!nameRegex.test(firstName)) return "First name contains invalid characters.";
  
  if (!lastName?.trim()) return "Last name is required.";
  if (!nameRegex.test(lastName)) return "Last name contains invalid characters.";

  // Date validation
  if (!dob) return "Date of birth is required.";
  const birthDate = new Date(dob);
  const today = new Date();
  
  if (birthDate > today) return "Date of birth cannot be in the future.";

  // Gender validation
  if (!gender) return "Gender is required.";

  // Phone validation
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  if (!phone?.trim()) return "Phone number is required.";
  if (!phoneRegex.test(phone.trim())) return "Please enter a valid phone number.";

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email?.trim()) return "Email is required.";
  if (!emailRegex.test(email.trim())) return "Please enter a valid email address.";

  // Address validation
  if (!address?.trim()) return "Address is required.";

  return null; // All good
};

  const handleUpdatePatient = async () => {

   if (!selectedPatient) {
    toast.error("No patient selected for update.");
    return;
  }

  const error = validateEditPatient(selectedPatient);
  if (error) {
    toast.error(error);
    return;
  }

    try {
      await axios.put(`http://localhost:5000/api/patients/update/${selectedPatient.id}`, selectedPatient);
      toast.success("Patient updated successfully!");
      setShowEditModal(false);
      fetchPatients();
    } catch (error) {
      console.error("Update Error:", error);
      toast.error("Failed to update patient.");
    }
  };
  
    return (
      <div className="patient-register-container">
      <ToastContainer /> 
      <AssistSidebar/> {/* Sidebar component */}

      {/* Main Content */}
      <div className="patient-management-container">
        <h2>Patient Management</h2>

        <div className="top-section">
        <input
          type="text"
          placeholder="Search patients..."
          value={searchQuery}
          onChange={handleSearch}
          className="search-bar"
        />

        <button className="add-btn" onClick={() => setShowModal(true)}>
          ➕ Add Patient
        </button>
        </div>

        <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>DOB</th>
              <th>Gender</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
           

          <tbody className="table-body">
            {filteredPatients.map((patient) => (
              <tr key={patient.id}>
                <td>{patient.id}</td>
                <td>{patient.firstName}</td>
                <td>{patient.lastName}</td>
                <td>{patient.dob}</td>
                <td>{patient.gender}</td>
                <td>{patient.phone}</td>
                <td>{patient.email}</td>
                <td>{patient.address}</td>
                <td>
                    <button className="edit-btn" onClick={() => handleEditPatient(patient)}>✏️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

      {showModal && (
  <div className="modal fade show d-block" tabIndex="-1" role="dialog">
    <div className="modal-dialog modal-sm" role="document">
      <div className="modal-content p-3">
        <div className="modal-header py-2">
          <h5 className="modal-title">Register Patient</h5>
          {/*<button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>*/}
        </div>
        <form onSubmit={handleRegisterPatient} className="modal-body p-2">
          {/* First Name */}
          <div className="row align-items-center mb-2">
            <label htmlFor="firstName" className="col-4 col-form-label small">First Name</label>
            <div className="col-8">
              <input
                type="text"
                className="form-control form-control-sm"
                id="firstName"
                name="firstName"
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Last Name */}
          <div className="row align-items-center mb-2">
            <label htmlFor="lastName" className="col-4 col-form-label small">Last Name</label>
            <div className="col-8">
              <input
                type="text"
                className="form-control form-control-sm"
                id="lastName"
                name="lastName"
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div className="row align-items-center mb-2">
            <label htmlFor="dob" className="col-4 col-form-label small">Date of Birth</label>
            <div className="col-8">
              <input
                type="date"
                className="form-control form-control-sm"
                id="dob"
                name="dob"
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Gender */}
          <div className="row align-items-center mb-2">
            <label htmlFor="gender" className="col-4 col-form-label small">Gender</label>
            <div className="col-8">
              <select
                className="form-select form-select-sm"
                id="gender"
                name="gender"
                onChange={handleInputChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          {/* Phone Number */}
          <div className="row align-items-center mb-2">
            <label htmlFor="phone" className="col-4 col-form-label small">Phone</label>
            <div className="col-8">
              <input
                type="text"
                className="form-control form-control-sm"
                id="phone"
                name="phone"
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="row align-items-center mb-2">
            <label htmlFor="email" className="col-4 col-form-label small">Email</label>
            <div className="col-8">
              <input
                type="email"
                className="form-control form-control-sm"
                id="email"
                name="email"
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Address */}
          <div className="row align-items-start mb-3">
            <label htmlFor="address" className="col-4 col-form-label small pt-1">Address</label>
            <div className="col-8">
              <textarea
                className="form-control form-control-sm"
                id="address"
                name="address"
                onChange={handleInputChange}
                required
                rows={2}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-end gap-2">
            <button type="submit" className="btn btn-sm btn-primary">Register</button>
            <button type="button" className="btn btn-sm btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}




        {showEditModal && selectedPatient && (
  <div className="modal fade show d-block" tabIndex="-1" role="dialog">
    <div className="modal-dialog modal-sm" role="document">
      <div className="modal-content p-3">
        <div className="modal-header py-2">
          <h5 className="modal-title">Edit Patient</h5>
        </div>
        <div className="modal-body p-2">
          {/* First Name */}
          <div className="row align-items-center mb-2">
            <label htmlFor="editFirstName" className="col-4 col-form-label small">First Name</label>
            <div className="col-8">
              <input
                type="text"
                className="form-control form-control-sm"
                id="editFirstName"
                name="firstName"
                value={selectedPatient.firstName}
                onChange={handleEditChange}
                required
              />
            </div>
          </div>

          {/* Last Name */}
          <div className="row align-items-center mb-2">
            <label htmlFor="editLastName" className="col-4 col-form-label small">Last Name</label>
            <div className="col-8">
              <input
                type="text"
                className="form-control form-control-sm"
                id="editLastName"
                name="lastName"
                value={selectedPatient.lastName}
                onChange={handleEditChange}
                required
              />
            </div>
          </div>

          {/* Date of Birth */}
          <div className="row align-items-center mb-2">
            <label htmlFor="editDob" className="col-4 col-form-label small">Date of Birth</label>
            <div className="col-8">
              <input
                type="date"
                className="form-control form-control-sm"
                id="editDob"
                name="dob"
                value={selectedPatient.dob}
                onChange={handleEditChange}
                required
              />
            </div>
          </div>

          {/* Gender */}
          <div className="row align-items-center mb-2">
            <label htmlFor="editGender" className="col-4 col-form-label small">Gender</label>
            <div className="col-8">
              <select
                className="form-select form-select-sm"
                id="editGender"
                name="gender"
                value={selectedPatient.gender}
                onChange={handleEditChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Phone Number */}
          <div className="row align-items-center mb-2">
            <label htmlFor="editPhone" className="col-4 col-form-label small">Phone</label>
            <div className="col-8">
              <input
                type="text"
                className="form-control form-control-sm"
                id="editPhone"
                name="phone"
                value={selectedPatient.phone}
                onChange={handleEditChange}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="row align-items-center mb-2">
            <label htmlFor="editEmail" className="col-4 col-form-label small">Email</label>
            <div className="col-8">
              <input
                type="email"
                className="form-control form-control-sm"
                id="editEmail"
                name="email"
                value={selectedPatient.email}
                onChange={handleEditChange}
                required
              />
            </div>
          </div>

          {/* Address */}
          <div className="row align-items-start mb-3">
            <label htmlFor="editAddress" className="col-4 col-form-label small pt-1">Address</label>
            <div className="col-8">
              <textarea
                className="form-control form-control-sm"
                id="editAddress"
                name="address"
                value={selectedPatient.address}
                onChange={handleEditChange}
                required
                rows={2}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="d-flex justify-content-end gap-2">
  <button 
  type="button" 
  className="btn btn-sm" 
  style={{ backgroundColor: '#28a745', color: 'white' }}
  onClick={handleUpdatePatient}
>
  Update
</button>
  <button 
    type="button" 
    className="btn btn-sm btn-secondary" 
    onClick={() => setShowEditModal(false)}
  >
    Cancel
  </button>
</div>
        </div>
      </div>
    </div>
  </div>
)}


        </div>
       </div>
       
    );
  };
  
  export default PatientManagement;
  

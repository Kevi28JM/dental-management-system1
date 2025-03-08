//import styles from '../styles/HomePage.css'; // Adjust the CSS module path if necessary
import HomePage from '../app/HomePage/page' // Import the HomePage component from the app directory (adjust the path if needed)
//import { metadata } from "../app/metaData"; // ✅ Import metadata separately
import { ToastContainer } from 'react-toastify';// Import the ToastContainer from react-toastify for displaying toast notifications


// Define the Home component
export default function Home() {
  return (
    <div>
    {/* ToastContainer is used to display notifications/toasts across the application */}
      <ToastContainer />
      {/* Render the HomePage component */}
      <HomePage />
       </div>
  );
}
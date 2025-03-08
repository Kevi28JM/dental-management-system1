//import styles from '../styles/HomePage.css'; // Adjust the CSS module path if necessary
import HomePage from '../app/HomePage/page' // Adjust the path based on your structure
//import { metadata } from "../app/metaData"; // ✅ Import metadata separately
import { ToastContainer } from 'react-toastify';



export default function Home() {
  return (
    <div>
      <ToastContainer />
      <HomePage />
       </div>
  );
}
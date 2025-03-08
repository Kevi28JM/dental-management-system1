import NavBar from "@/components/NavBar";  // Import NavBar component from the components directory
import "@/styles/HomePage.css";  // Import CSS for styling the HomePage component

// Define the HomePage component
const HomePage = () => {
  return (
    <>
    {/* Render the NavBar component at the top of the page */}
      <NavBar />
      {/* Main content section */}
      <div className="home-page">
      {/* Page title */}
        <h1>Welcome to Family Dental Surgery</h1>
        <p>Your smile, our priority!</p>
      </div>
    </>
  );
};

export default HomePage;// Export the HomePage component to be used in the application

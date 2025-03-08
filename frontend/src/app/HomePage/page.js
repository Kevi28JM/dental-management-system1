import NavBar from "@/components/NavBar";  // Import NavBar
import "@/styles/HomePage.css";  // Import CSS for styling

const HomePage = () => {
  return (
    <>
      <NavBar />
      <div className="home-page">
        <h1>Welcome to Family Dental Surgery</h1>
        <p>Your smile, our priority!</p>
      </div>
    </>
  );
};

export default HomePage;

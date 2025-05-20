import NavBar from "@/components/NavBar";  // Import NavBar component from the components directory
import "@/styles/HomePage.css";  // Import CSS for styling the HomePage component

 

const HomePage = () => {
   return (
    <>
      <NavBar />
      <div className="home-page">
        <div className="hero-content">
          <div className="clinic-title-container">
 
            <h1>Family Dental Surgery</h1>
          </div>
          <p className="tagline">Your smile, our priority!</p>
          <div className="cta-buttons">
           
             
          </div>
        </div>
        <div className="features-container">
          <div className="feature-card">
            <div className="feature-icon">🦷</div>
            <h3>Expert Care</h3>
            <p>Our certified dentists provide top-quality dental treatments</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💺</div>
            <h3>Comfortable Environment</h3>
            <p>Modern facilities designed for your comfort and relaxation</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⏱️</div>
            <h3>Flexible Scheduling</h3>
            <p>We work around your busy schedule with extended hours</p>
          </div>
        </div>
      </div>
    </>
  );
};


 
export default HomePage;// Export the HomePage component to be used in the application

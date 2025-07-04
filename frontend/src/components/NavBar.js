import React from "react";
import Link from "next/link"; // Use next/link for routing
import "../styles/NavBar.css"; // Import the CSS file (make sure it's a global stylesheet)

const NavBar = () => {
  return (
    <nav className="navbar">
      <div className="logo">Family Dental Surgery</div>
      
      <ul className="nav-links">
        <li><Link href="/">Home</Link></li>
        
        <li><Link href="/signup">Sign Up</Link></li>
        
      </ul>
    </nav>
  );
};

export default NavBar;

"use client"; // ✅ Mark as a client component

import "bootstrap/dist/css/bootstrap.min.css";// ✅ Correct Bootstrap import
import "react-toastify/dist/ReactToastify.css"; // Import Toastify CSS
import { ToastContainer } from "react-toastify"; // Import ToastContainer
import { useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";




import "./globals.css"; //Ensure this file exists

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

//react component that wraps the entire app
export default function RootLayout({ children }) {

  useEffect(() => {
    import("bootstrap/dist/js/bootstrap.bundle.min.js")
      .then(() => console.log("Bootstrap JS loaded"))
      .catch((err) => console.error("Error loading Bootstrap", err));
  }, []);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
        <ToastContainer position="top-right" autoClose={5000} />
      </body>
    </html>
  );
}
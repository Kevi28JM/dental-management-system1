'use client';
import React, { useEffect, useState } from 'react';
import '@/styles/AppointmentReport.css'; // Importing the CSS file
import DentistSidebar from '@/components/DentistSidebar';

const AppointmentReport = () => {
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/api/reports/appointment-report")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setReport(data.data);
        } else {
          setError(data.message);
        }
      })
      .catch(() => setError("Something went wrong"));
  }, []);

  const formatDate = (isoDate) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(isoDate).toLocaleDateString('en-US', options);
  };

  if (error) return <div className="error-message">Error: {error}</div>;
  if (!report) return <div className="loading-message">Loading...</div>;

  return (
    <div className="report-container">
    <DentistSidebar />
    <div className='report-content'>
      <h1 className="report-title">Appointment Revenue Report</h1>

      <div className="table-container">
        <table className="appointment-table">
          <thead>
            <tr>
              <th>Appointment ID</th>
              <th>Date</th>
              <th>Payment (Rs)</th>
            </tr>
          </thead>
          <tbody>
            {report.report.map((row, index) => (
              <tr key={index}>
                <td>{row.appointmentId}</td>
                <td>{formatDate(row.date)}</td>
                <td className="amount-cell">{row.payment.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="summary-box">
        <p>Total Appointments: <strong>{report.totalAppointments}</strong></p>
        <p>Total Revenue: <strong>Rs {report.totalRevenue.toFixed(2)}</strong></p>
      </div>
      </div>
    </div>
  );
};

export default AppointmentReport;

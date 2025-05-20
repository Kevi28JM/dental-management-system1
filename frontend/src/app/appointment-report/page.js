'use client';
import React, { useEffect, useState } from 'react';

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
      .catch(err => setError("Something went wrong"));
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!report) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Appointment Revenue Report</h1>
      <table className="table-auto border w-full">
        <thead>
          <tr>
            <th className="border px-4 py-2">Appointment ID</th>
            <th className="border px-4 py-2">Date</th>
            <th className="border px-4 py-2">Payment (Rs)</th>
          </tr>
        </thead>
        <tbody>
          {report.report.map((row, index) => (
            <tr key={index}>
              <td className="border px-4 py-2">{row.appointmentId}</td>
              <td className="border px-4 py-2">{row.date}</td>
              <td className="border px-4 py-2">{row.payment.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 font-semibold">
        Total Appointments: {report.totalAppointments} <br />
        Total Revenue: Rs {report.totalRevenue.toFixed(2)}
      </div>
    </div>
  );
};

export default AppointmentReport;

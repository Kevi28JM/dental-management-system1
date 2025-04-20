import BookAppointment from "@/components/BookAppointment";
import "@/styles/bookPage.css";

function bookPage() {
  return (
    <div className="book-container">
      <h1>Book an Appointment</h1>
      <BookAppointment />
    </div>
  );
}

export default bookPage;
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import BookingPage from "./pages/BookingPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BookingPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
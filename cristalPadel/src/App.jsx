import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import BookingPage from "./pages/BookingPage.jsx";
import AdminPage from "./pages/AdminPage.jsx";
import TurnsPage from "./pages/TurnsPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SettingsPage from "./pages/SettingsPage.jsx";
import TournamentPage from "./pages/TournamentPage.jsx";
import PendingBookingPage from "./pages/PendingBookingPage.jsx";
import AdminTournamentsPage from "./pages/AdminTournamentsPage.jsx";
import AdminTournamentNewPage from "./pages/AdminTournamentNewPage.jsx";
import AdminTournamentDetailPage from "./pages/AdminTournamentDetailPage.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";
import { getActiveTournament } from "./api/tournaments.js";

export default function App() {
  const [activeTournament, setActiveTournament] = useState(null);

  useEffect(() => {
    async function loadActiveTournament() {
      try {
        const data = await getActiveTournament();
        setActiveTournament(data.tournament || null);
      } catch (error) {
        console.error("active tournament nav error:", error);
        setActiveTournament(null);
      }
    }

    loadActiveTournament();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Público */}
        <Route path="/" element={<BookingPage activeTournament={activeTournament} />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/torneo" element={<TournamentPage />} />
        <Route path="/reserva/:id/pendiente" element={<PendingBookingPage />} />

        {/* Admin protegido + layout */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminPage />} />
          <Route path="turnos" element={<TurnsPage />} />
          <Route path="torneos" element={<AdminTournamentsPage />} />
          <Route path="torneos/nuevo" element={<AdminTournamentNewPage />} />
          <Route path="torneos/:id" element={<AdminTournamentDetailPage />} />
          <Route path="ajustes" element={<SettingsPage />} />
        </Route>

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

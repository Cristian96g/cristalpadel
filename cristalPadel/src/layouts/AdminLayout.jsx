import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import AdminHeader from "../components/AdminHeader.jsx";
import AdminBottomNav from "../components/AdminBottomNav.jsx";
import { getMe } from "../api/auth.js";
import { socket } from "../lib/socket.js";

function formatDateNice(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);

  const dias = [
    "domingo",
    "lunes",
    "martes",
    "miércoles",
    "jueves",
    "viernes",
    "sábado",
  ];

  const diaSemana = dias[date.getDay()];
  const dia = String(date.getDate()).padStart(2, "0");
  const mes = String(date.getMonth() + 1).padStart(2, "0");

  return `${diaSemana} ${dia}/${mes}`;
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const [adminInfo, setAdminInfo] = useState({
    name: "",
    lastName: "",
  });

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function loadAdminInfo() {
      try {
        const data = await getMe();
        setAdminInfo({
          name: data.user?.name || "",
          lastName: data.user?.lastName || "",
        });
      } catch (error) {
        console.error("admin layout user error:", error);
      }
    }

    loadAdminInfo();
  }, []);

  useEffect(() => {
    function handleBookingCreated(payload) {
      setNotifications((prev) => [
        {
          id: `created-${payload.bookingId}-${Date.now()}`,
          type: "created",
          message: `Nueva reserva para el ${formatDateNice(payload.date)} a las ${payload.startTime} · Cancha ${payload.court}`,
          payload,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      setUnreadCount((prev) => prev + 1);
    }

    function handleBookingCancelled(payload) {
      setNotifications((prev) => [
        {
          id: `cancelled-${payload.bookingId}-${Date.now()}`,
          type: "cancelled",
          message: `Reserva cancelada para el ${formatDateNice(payload.date)} a las ${payload.startTime} · Cancha ${payload.court}`,
          payload,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      setUnreadCount((prev) => prev + 1);
    }

    socket.on("booking:created", handleBookingCreated);
    socket.on("booking:cancelled", handleBookingCancelled);

    return () => {
      socket.off("booking:created", handleBookingCreated);
      socket.off("booking:cancelled", handleBookingCancelled);
    };
  }, []);

  function handleNotificationClick(notification) {
    if (!notification?.payload) return;

    navigate("/admin", {
      state: {
        notificationDate: notification.payload.date,
        bookingId: notification.payload.bookingId,
      },
    });
  }

  const currentNav = useMemo(() => {
    if (location.pathname.startsWith("/admin/turnos")) return "turnos";
    if (location.pathname.startsWith("/admin/ajustes")) return "ajustes";
    return "reservas";
  }, [location.pathname]);

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 pb-32">
      <AdminHeader
        unreadCount={unreadCount}
        notifications={notifications}
        onOpenNotifications={() => setUnreadCount(0)}
        onNotificationClick={handleNotificationClick}
        adminName={adminInfo.name}
        adminLastName={adminInfo.lastName}
      />

      <Outlet />

      <AdminBottomNav current={currentNav} />
    </div>
  );
}
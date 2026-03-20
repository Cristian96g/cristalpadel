import { useEffect, useState } from "react";
import { getAvailability } from "../api/availability.js";

export default function useAvailability(date) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      const json = await getAvailability(date);
      setData(json);
    } catch (e) {
      setData(null);
      setError(e.message || "Error cargando disponibilidad");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  return { data, loading, error, refresh };
}
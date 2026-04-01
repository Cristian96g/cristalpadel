import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client.js";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem("token", data.token);
      navigate("/admin");
    } catch (err) {
      setError(err?.data?.message || "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      <header className="sticky top-0 z-20 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto flex w-full max-w-md items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="7" cy="17" r="3" />
                <circle cx="17" cy="7" r="3" />
                <path d="M10 17h4a3 3 0 0 0 3-3V10" />
              </svg>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Club Padel Pro
              </p>
              <h1 className="text-xl font-extrabold tracking-tight">
                Acceso administrador
              </h1>
            </div>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 21a8 8 0 1 0-16 0" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-76px)] w-full max-w-md flex-col px-4 py-6">
        <section className="rounded-[28px] bg-gradient-to-b from-primary/10 to-transparent px-4 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Panel de control
          </p>
          <h2 className="mt-2 text-4xl font-extrabold leading-tight">
            Ingresá para administrar reservas
          </h2>
          <p className="mt-3 max-w-sm text-sm text-slate-600 dark:text-slate-300">
            Gestioná turnos, creá turnos fijos y controlá la actividad del club
            desde una sola vista.
          </p>
        </section>

        <section className="mt-4 rounded-[28px] border border-primary/10 bg-white/80 dark:bg-slate-950/70 p-5 shadow-xl shadow-slate-900/10 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                Correo
              </label>
              <input
                id="email"
                type="email"
                placeholder="admin@club.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 px-4 py-3 text-slate-900 dark:text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 px-4 py-3 text-slate-900 dark:text-white outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-primary py-3.5 text-base font-bold text-white shadow-lg shadow-primary/20 transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Ingresando..." : "Ingresar al panel"}
            </button>
          </form>

          <div className="mt-5 rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 px-4 py-3">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
              Acceso
            </p>
            <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
              Exclusivo para administración del club.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
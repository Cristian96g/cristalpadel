import { useEffect, useState } from "react";
import { getMe, updateMe, changePassword } from "../api/auth.js";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [profileMsg, setProfileMsg] = useState("");
  const [profileError, setProfileError] = useState("");

  const [passwordMsg, setPasswordMsg] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    lastName: "",
    email: "",
  });

  const [originalProfile, setOriginalProfile] = useState({
    name: "",
    lastName: "",
    email: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    async function loadMe() {
      try {
        const data = await getMe();

        const userData = {
          name: data.user?.name || "",
          lastName: data.user?.lastName || "",
          email: data.user?.email || "",
        };

        setProfile(userData);
        setOriginalProfile(userData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadMe();
  }, []);

  function updateProfileField(field, value) {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }

  function updatePasswordField(field, value) {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleCancelProfileEdit() {
    setProfile(originalProfile);
    setProfileMsg("");
    setProfileError("");
    setIsEditingProfile(false);
  }

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg("");
    setProfileError("");

    try {
      const data = await updateMe(profile);

      const updated = {
        name: data.user?.name || "",
        lastName: data.user?.lastName || "",
        email: data.user?.email || "",
      };

      setProfile(updated);
      setOriginalProfile(updated);
      setProfileMsg("Datos actualizados correctamente");
      setIsEditingProfile(false);
    } catch (err) {
      setProfileError(err?.data?.message || "Error al actualizar");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setPasswordError("");
    setPasswordMsg("");

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordError("Completá todos los campos");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return;
    }

    setSavingPassword(true);

    try {
      const data = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordMsg(data.message || "Contraseña actualizada");

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => {
        setPasswordModalOpen(false);
        setPasswordMsg("");
      }, 1200);
    } catch (err) {
      setPasswordError(err?.data?.message || "Error");
    } finally {
      setSavingPassword(false);
    }
  }

  function closePasswordModal() {
    setPasswordModalOpen(false);
    setPasswordError("");
    setPasswordMsg("");
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  }

  const inputBase =
    "w-full rounded-2xl border px-4 py-3 outline-none transition-colors";
  const inputActive =
    "border-slate-700 bg-slate-950 text-white placeholder:text-slate-500 focus:border-primary";
  const inputReadOnly =
    "border-slate-800 bg-slate-900/70 text-slate-400";

  return (
    <div>
      <div className="px-4 py-6 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="flex flex-col gap-1">
          <p className="text-primary text-sm font-semibold tracking-wider uppercase">
            Configuración
          </p>
          <h1 className="text-slate-900 dark:text-slate-100 text-3xl font-extrabold tracking-tight">
            Ajustes del admin
          </h1>
        </div>
      </div>

      <div className="px-4 space-y-4">
        <section className="rounded-[28px] border border-slate-800 bg-slate-900/95 p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-white text-lg font-bold">Perfil</h2>

            {!isEditingProfile && !loading && (
              <button
                type="button"
                onClick={() => setIsEditingProfile(true)}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-500/70 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <span
                  className="material-symbols-outlined text-[18px] notranslate"
                  translate="no"
                >
                  edit
                </span>
                Editar
              </button>
            )}
          </div>

          {loading ? (
            <p className="text-sm text-slate-400">Cargando datos...</p>
          ) : (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-white">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    disabled={!isEditingProfile}
                    onChange={(e) => updateProfileField("name", e.target.value)}
                    className={`${inputBase} ${
                      isEditingProfile ? inputActive : inputReadOnly
                    }`}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-white">
                    Apellido
                  </label>
                  <input
                    type="text"
                    value={profile.lastName}
                    disabled={!isEditingProfile}
                    onChange={(e) =>
                      updateProfileField("lastName", e.target.value)
                    }
                    className={`${inputBase} ${
                      isEditingProfile ? inputActive : inputReadOnly
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-white">
                  Correo
                </label>
                <input
                  type="email"
                  value={profile.email}
                  disabled={!isEditingProfile}
                  onChange={(e) => updateProfileField("email", e.target.value)}
                  className={`${inputBase} ${
                    isEditingProfile ? inputActive : inputReadOnly
                  }`}
                />
              </div>

              {profileMsg ? (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                  {profileMsg}
                </div>
              ) : null}

              {profileError ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {profileError}
                </div>
              ) : null}

              {isEditingProfile && (
                <div className="space-y-3 pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="w-full rounded-2xl bg-primary px-4 py-3.5 text-base font-bold text-white transition hover:opacity-95 disabled:opacity-60"
                  >
                    {savingProfile ? "Guardando..." : "Guardar cambios"}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelProfileEdit}
                    className="w-full rounded-2xl border border-slate-700 px-4 py-3.5 text-base font-semibold text-white transition hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </form>
          )}
        </section>

        <section className="rounded-[28px] border border-slate-800 bg-slate-900/95 p-5 shadow-sm">
          <h2 className="mb-2 text-white text-lg font-bold">Seguridad</h2>
          <p className="mb-4 text-sm text-slate-400">
            Actualizá tu contraseña de acceso al panel.
          </p>

          <button
            type="button"
            onClick={() => setPasswordModalOpen(true)}
            className="w-full rounded-2xl bg-primary px-4 py-3.5 text-base font-bold text-white transition hover:opacity-95"
          >
            Cambiar contraseña
          </button>
        </section>
      </div>

      {passwordModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[28px] border border-slate-800 bg-slate-900 p-5 shadow-2xl">
            <div className="mb-5">
              <h3 className="text-xl font-bold text-white">
                Cambiar contraseña
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Ingresá tu contraseña actual y definí una nueva.
              </p>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-white">
                  Contraseña actual
                </label>
                <input
                  type="password"
                  placeholder="Ingresá tu contraseña actual"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    updatePasswordField("currentPassword", e.target.value)
                  }
                  className={`${inputBase} ${inputActive}`}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-white">
                  Nueva contraseña
                </label>
                <input
                  type="password"
                  placeholder="Ingresá la nueva contraseña"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    updatePasswordField("newPassword", e.target.value)
                  }
                  className={`${inputBase} ${inputActive}`}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-white">
                  Confirmar nueva contraseña
                </label>
                <input
                  type="password"
                  placeholder="Repetí la nueva contraseña"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    updatePasswordField("confirmPassword", e.target.value)
                  }
                  className={`${inputBase} ${inputActive}`}
                />
              </div>

              {passwordMsg ? (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                  {passwordMsg}
                </div>
              ) : null}

              {passwordError ? (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {passwordError}
                </div>
              ) : null}

              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="w-full rounded-2xl bg-primary px-4 py-3.5 text-base font-bold text-white transition hover:opacity-95 disabled:opacity-60"
                >
                  {savingPassword ? "Guardando..." : "Guardar contraseña"}
                </button>

                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="w-full rounded-2xl border border-slate-700 px-4 py-3.5 text-base font-semibold text-white transition hover:bg-slate-800"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
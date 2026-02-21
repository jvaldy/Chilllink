import { useEffect, useState } from "react";
import { getProfile, patchProfile } from "./profileService";
import "./ProfileModal.css";

export default function ProfileModal({ onClose }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [ok, setOk] = useState(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    birthDate: "",
    phone: "",
    city: "",
    country: "",
    bio: "",
  });

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    setError(null);
    setOk(null);

    getProfile()
      .then((data) => {
        if (!mounted) return;

        const safe = data ?? {};
        setForm({
          firstName: safe.firstName ?? "",
          lastName: safe.lastName ?? "",
          birthDate: safe.birthDate ?? "",
          phone: safe.phone ?? "",
          city: safe.city ?? "",
          country: safe.country ?? "",
          bio: safe.bio ?? "",
        });
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e.message);
      })
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const setField = (key) => (e) => {
    setOk(null);
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setOk(null);

    try {
      const payload = {
        firstName: form.firstName.trim() || null,
        lastName: form.lastName.trim() || null,
        birthDate: form.birthDate || null,
        phone: form.phone.trim() || null,
        city: form.city.trim() || null,
        country: form.country.trim() || null,
        bio: form.bio.trim() || null,
      };

      const updated = await patchProfile(payload);

      setForm({
        firstName: updated?.firstName ?? form.firstName,
        lastName: updated?.lastName ?? form.lastName,
        birthDate: updated?.birthDate ?? form.birthDate,
        phone: updated?.phone ?? form.phone,
        city: updated?.city ?? form.city,
        country: updated?.country ?? form.country,
        bio: updated?.bio ?? form.bio,
      });

      setOk("Sauvegardé");
    } catch (e2) {
      setError(e2.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div className="profile-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="profile-modal-header">
          <div>
            <div className="profile-modal-title">Profil</div>
            <div className="profile-modal-subtitle">Infos annexes liées à ton compte</div>
          </div>

          <button className="profile-modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {loading ? (
          <div className="profile-modal-body">Chargement…</div>
        ) : (
          <form className="profile-modal-body" onSubmit={save}>
            {error && <div className="profile-alert error">{error}</div>}
            {ok && <div className="profile-alert ok">{ok}</div>}

            <div className="profile-grid">
              <div className="profile-field">
                <label>Prénom</label>
                <input value={form.firstName} onChange={setField("firstName")} />
              </div>

              <div className="profile-field">
                <label>Nom</label>
                <input value={form.lastName} onChange={setField("lastName")} />
              </div>

              <div className="profile-field">
                <label>Date de naissance</label>
                <input type="date" value={form.birthDate} onChange={setField("birthDate")} />
              </div>

              <div className="profile-field">
                <label>Téléphone</label>
                <input value={form.phone} onChange={setField("phone")} />
              </div>

              <div className="profile-field">
                <label>Ville</label>
                <input value={form.city} onChange={setField("city")} />
              </div>

              <div className="profile-field">
                <label>Pays</label>
                <input value={form.country} onChange={setField("country")} />
              </div>

              <div className="profile-field full">
                <label>Bio</label>
                <textarea rows={4} value={form.bio} onChange={setField("bio")} />
              </div>
            </div>

            <div className="profile-actions">
              <button type="button" className="btn-secondary" onClick={onClose}>
                Fermer
              </button>

              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? "Sauvegarde…" : "Sauvegarder"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
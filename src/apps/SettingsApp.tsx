import { useState } from "react";
import { clearServiceSettings, DEFAULT_SERVICE_SETTINGS, saveServiceSettings, type ServiceSettings } from "../serviceConfig";

type SettingsAppProps = {
  settings: ServiceSettings;
  onSettingsChange: (settings: ServiceSettings) => void;
};

export default function SettingsApp({ settings, onSettingsChange }: SettingsAppProps) {
  const [form, setForm] = useState<ServiceSettings>(settings);
  const [message, setMessage] = useState("");

  function updateField(field: keyof ServiceSettings, value: string) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  function saveSettings(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextSettings = {
      schemaConverterApiUrl: form.schemaConverterApiUrl.trim(),
      discoSheetApiUrl: form.discoSheetApiUrl.trim(),
    };

    saveServiceSettings(nextSettings);
    onSettingsChange(nextSettings);
    setMessage("Settings saved. Service pages will use these URLs immediately.");
  }

  function resetSettings() {
    clearServiceSettings();
    setForm(DEFAULT_SERVICE_SETTINGS);
    onSettingsChange(DEFAULT_SERVICE_SETTINGS);
    setMessage("Settings reset to .env defaults.");
  }

  return (
    <section className="lp-card" style={styles.card}>
      <p style={styles.kicker}>Workspace</p>
      <h1 style={styles.title}>Settings</h1>
      <p style={styles.subtitle}>
        These values override the service URLs loaded from `.env` for this browser. Update `.env` when you need permanent defaults for every environment.
      </p>

      <form onSubmit={saveSettings} style={styles.form}>
        <label style={styles.label}>
          SchemaConverter API URL
          <input
            className="lp-input"
            style={styles.input}
            value={form.schemaConverterApiUrl}
            onChange={(event) => updateField("schemaConverterApiUrl", event.target.value)}
            placeholder={DEFAULT_SERVICE_SETTINGS.schemaConverterApiUrl}
          />
        </label>

        <label style={styles.label}>
          discoSheet API URL
          <input
            className="lp-input"
            style={styles.input}
            value={form.discoSheetApiUrl}
            onChange={(event) => updateField("discoSheetApiUrl", event.target.value)}
            placeholder={DEFAULT_SERVICE_SETTINGS.discoSheetApiUrl}
          />
        </label>

        <div style={styles.actions}>
          <button className="lp-button lp-button-primary" type="submit" style={styles.primaryButton}>Save Settings</button>
          <button className="lp-button lp-button-secondary" type="button" style={styles.secondaryButton} onClick={resetSettings}>Reset to .env Defaults</button>
        </div>
      </form>

      {message && <p style={styles.status}>{message}</p>}
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: { border: "1px solid #E2E8F0", borderRadius: "16px", background: "#FFFFFF", padding: "1.5rem", boxShadow: "0 16px 40px rgba(15, 23, 42, 0.06)", maxWidth: "760px" },
  kicker: { margin: 0, color: "#0F8F87", fontSize: "0.72rem", fontWeight: 850, letterSpacing: "0.09em", textTransform: "uppercase" },
  title: { margin: "0.25rem 0 0", color: "#102A2A", fontSize: "2.15rem", letterSpacing: "-0.035em", fontWeight: 800 },
  subtitle: { margin: "0.75rem 0 0", color: "#64748B", lineHeight: 1.6 },
  form: { display: "grid", gap: "1rem", marginTop: "1.5rem" },
  label: { display: "grid", gap: "0.48rem", color: "#334155", fontSize: "0.88rem", fontWeight: 700 },
  input: { width: "100%", boxSizing: "border-box", border: "1px solid #CBD5E1", borderRadius: "12px", background: "#FFFFFF", color: "#102A2A", padding: "0.78rem 0.9rem", font: "inherit", minHeight: "46px", outline: "none", transition: "border-color 160ms ease, box-shadow 160ms ease" },
  actions: { display: "flex", gap: "0.75rem", justifyContent: "flex-end", flexWrap: "wrap" },
  primaryButton: { border: "1px solid #0F8F87", borderRadius: "12px", background: "#0F8F87", color: "#FFFFFF", cursor: "pointer", font: "inherit", fontWeight: 800, padding: "0.76rem 1.05rem", minHeight: "46px" },
  secondaryButton: { border: "1px solid #CBD5E1", borderRadius: "12px", background: "#F8FAFC", color: "#334155", cursor: "pointer", font: "inherit", fontWeight: 800, padding: "0.76rem 1.05rem", minHeight: "46px" },
  status: { margin: "1rem 0 0", border: "1px solid #A7F3D0", borderRadius: "12px", background: "#ECFDF5", color: "#047857", padding: "0.75rem 0.9rem", fontWeight: 750 },
};

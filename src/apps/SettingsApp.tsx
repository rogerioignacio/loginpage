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
    <section style={styles.card}>
      <p style={styles.kicker}>Workspace</p>
      <h1 style={styles.title}>Settings</h1>
      <p style={styles.subtitle}>
        These values override the service URLs loaded from `.env` for this browser. Update `.env` when you need permanent defaults for every environment.
      </p>

      <form onSubmit={saveSettings} style={styles.form}>
        <label style={styles.label}>
          SchemaConverter API URL
          <input
            style={styles.input}
            value={form.schemaConverterApiUrl}
            onChange={(event) => updateField("schemaConverterApiUrl", event.target.value)}
            placeholder={DEFAULT_SERVICE_SETTINGS.schemaConverterApiUrl}
          />
        </label>

        <label style={styles.label}>
          discoSheet API URL
          <input
            style={styles.input}
            value={form.discoSheetApiUrl}
            onChange={(event) => updateField("discoSheetApiUrl", event.target.value)}
            placeholder={DEFAULT_SERVICE_SETTINGS.discoSheetApiUrl}
          />
        </label>

        <div style={styles.actions}>
          <button type="submit" style={styles.primaryButton}>Save Settings</button>
          <button type="button" style={styles.secondaryButton} onClick={resetSettings}>Reset to .env Defaults</button>
        </div>
      </form>

      {message && <p style={styles.status}>{message}</p>}
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: { border: "1px solid #1E293B", borderRadius: "18px", background: "#0F172A", padding: "1.5rem", boxShadow: "0 24px 60px rgba(0, 0, 0, 0.22)", maxWidth: "760px" },
  kicker: { margin: 0, color: "#60A5FA", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" },
  title: { margin: "0.25rem 0 0", color: "#FFFFFF", fontSize: "2.25rem", letterSpacing: "-0.03em" },
  subtitle: { margin: "0.75rem 0 0", color: "#94A3B8", lineHeight: 1.6 },
  form: { display: "grid", gap: "1rem", marginTop: "1.5rem" },
  label: { display: "grid", gap: "0.45rem", color: "#CBD5E1", fontSize: "0.88rem", fontWeight: 700 },
  input: { width: "100%", boxSizing: "border-box", border: "1px solid #334155", borderRadius: "12px", background: "#020617", color: "#F8FAFC", padding: "0.72rem 0.85rem", font: "inherit" },
  actions: { display: "flex", gap: "0.75rem", justifyContent: "flex-end", flexWrap: "wrap" },
  primaryButton: { border: "1px solid rgba(96, 165, 250, 0.45)", borderRadius: "12px", background: "#2563EB", color: "#FFFFFF", cursor: "pointer", font: "inherit", fontWeight: 800, padding: "0.72rem 1rem" },
  secondaryButton: { border: "1px solid #334155", borderRadius: "12px", background: "#1E293B", color: "#E2E8F0", cursor: "pointer", font: "inherit", fontWeight: 800, padding: "0.72rem 1rem" },
  status: { margin: "1rem 0 0", border: "1px solid rgba(34, 197, 94, 0.2)", borderRadius: "12px", background: "rgba(34, 197, 94, 0.12)", color: "#86EFAC", padding: "0.75rem 0.9rem", fontWeight: 800 },
};

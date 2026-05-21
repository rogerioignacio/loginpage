import { useState } from "react";

type DiscoSheetEntry = {
  id: string;
  customerName: string;
  initiativeName: string;
  salesMotion: string;
  contactRole: string;
  valueDrivers: string;
  timeline: string;
  currentState: string;
  futureState: string;
  requiredCapabilities: string;
  otherKeyInformation: string;
  createdAt: string;
};

type DiscoSheetForm = Omit<DiscoSheetEntry, "id" | "createdAt">;

type Status = {
  type: "idle" | "loading" | "success" | "error";
  message: string;
};

const initialForm: DiscoSheetForm = {
  customerName: "",
  initiativeName: "",
  salesMotion: "",
  contactRole: "",
  valueDrivers: "",
  timeline: "",
  currentState: "",
  futureState: "",
  requiredCapabilities: "",
  otherKeyInformation: "",
};

const salesMotionOptions = ["select", "replace", "launch", "migrate"];

const discoveryGuidelines = [
  {
    title: "Account name",
    content: "The name of the organization",
  },
  {
    title: "Application | Project | Initiative Name",
    content: `What is the name of the specific application we're discussing with the customer? Remember, the sales motion is determined at the opportunity level, not the account level
What does the application do?
What is the priority of the success of the application to the business?
How important is the application to customers' perception of the business as a whole?
Who is the primary audience for the application?
How do those users actually use the application?
What are they doing as they interact with it?
How do those users typically learn to use it?
How would the customer describe the value of the application to these focus users?
What type(s) of data are customers providing as they interact with the application?
Who else uses the application (externally)?
How do those users actually use the application?
What are they doing as they interact with it?
How do those users typically learn to use it?
How would the customer describe the value of the application to these adjacent users?
What type(s) of data do these users add to the app or consume from it?
How do the interactions of these users with the app benefit the target customer?
How is the application used internally?
How do those users actually use the application?
What are they doing as they interact with it?
How do those users typically learn to use it?
How is the data used by the organization?
Why is the data important?
Who generates the reports the business uses?
How does the data ultimately benefit their target external customers?
How does the data benefit internal customers?
Who is ultimately responsible for the success or failure of the application?
Which team builds the application?
What process do they use? (waterfall | agile)
How long are their release cycles | sprints?
Have they ever missed a release date?
If yes, what impact did it have?
If yes, what have they done to make sure it doesn't happen again?
If no, what could potentially cause them to miss it in the future?`,
  },
  {
    title: "Sales Motion",
    content: `Be precise with the questions you ask - there are only two:
1. Is <application name> in development or in production?
2. Has MongoDB been chosen as the data platform for <application name>?

Do not simply ask, "are you using MongoDB?"`,
  },
  {
    title: "Name of person we're meeting with & role",
    content: `We want to understand the individual's role with respect to <application name> - beware the trap of just accepting the individual's title.
Are they leading the team for <application name?> (If not, what's the name of the person who is? What's their position in the org chart?)
Who do they report to?
Who reports to them?
How long have they been in the role?
Is this the first time they've done a role like this?
If yes, what set of circumstances would give them total confidence they're on the right track with <application name>?
If no, what lessons have they learned from doing this before that they want to repeat? That they want to avoid?`,
  },
  {
    title: "Why do Anything (Value Driver)?",
    content: `We need to understand:
What the business reason is | was for creating the application in the first place? and
Why has the business decided that now is the right time to take action?

We don't need them to exactly say one of the value drivers we note as belonging to the customer during Command of the Message; however, we've found that these typically fall into one or more of the following categories:

Compete and make money = Maximize competitive advantage to drive growth
Save money = Lower TCO
Ensure the safety of data and the business = Reduce risk for mission critical applications
Drive development velocity and reduce operational overhead = Accelerate time to value`,
  },
  {
    title: "Timeline/Deadline/ Milestone Date?",
    content: `No date, no deal.

For Select and Launch motions, we need to find out the exact go live date the customer is targeting.
What if they could get there faster?

For Replace and Migrate motions, we need to find out the compelling event that is driving the urgency to take action.
We also must establish the date beyond which failing to change will cause tangible damage to the application or to the business`,
  },
  {
    title: "Current State",
    content: `See if any of these apply or hunt for more.

- Disconnected, isolated systems holding incomplete data about the same entities.
- Incapable of capturing cross-sell/up-sell opportunities due to missing information.
- Reporting challenges as no single system provides an aggregated view.
- Legacy systems without built in HA suffer planned / unplanned downtime.
- Enterprises have already tried and failed to deliver using legacy technology.`,
  },
  {
    title: "Future State",
    content: `Do NOT look for a Future State that is a negation of the current state. Look for an ideal state.

- Single version of the truth leveraged for existing as well as new applications.
- Quicker go-to-market for applications requiring integrated data`,
  },
];

export default function DiscoSheetApp({ apiBaseUrl }: { apiBaseUrl: string }) {
  const [form, setForm] = useState<DiscoSheetForm>(initialForm);
  const [saveStatus, setSaveStatus] = useState<Status>({ type: "idle", message: "" });
  const [customerName, setCustomerName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchStatus, setSearchStatus] = useState<Status>({ type: "idle", message: "" });
  const [entries, setEntries] = useState<DiscoSheetEntry[]>([]);

  function updateField(field: keyof DiscoSheetForm, value: string) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  async function saveEntry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveStatus({ type: "loading", message: "Saving discovery sheet..." });

    try {
      const response = await fetch(`${apiBaseUrl}/api/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to save discovery sheet");
      }

      setForm(initialForm);
      setSaveStatus({ type: "success", message: "Discovery sheet saved successfully." });
    } catch (error) {
      setSaveStatus({ type: "error", message: error instanceof Error ? error.message : "Unable to save discovery sheet" });
    }
  }

  async function searchEntries(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();

    if (customerName.trim()) params.set("customerName", customerName.trim());
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    setSearchStatus({ type: "loading", message: "Searching registries..." });

    try {
      const response = await fetch(`${apiBaseUrl}/api/entries/search?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to search registries");
      }

      setEntries(data.entries);
      setSearchStatus({
        type: "success",
        message: data.entries.length === 1 ? "1 registry found." : `${data.entries.length} registries found.`,
      });
    } catch (error) {
      setEntries([]);
      setSearchStatus({ type: "error", message: error instanceof Error ? error.message : "Unable to search registries" });
    }
  }

  function clearSearch() {
    setCustomerName("");
    setStartDate("");
    setEndDate("");
    setEntries([]);
    setSearchStatus({ type: "idle", message: "" });
  }

  return (
    <div style={styles.shell}>
      <header style={styles.header}>
        <div>
          <p style={styles.kicker}>discoSheet</p>
          <h1 style={styles.title}>Discovery Sheet</h1>
          <p style={styles.subtitle}>Capture and retrieve discovery registries directly from your secure workspace.</p>
        </div>
      </header>

      <section style={styles.card}>
        <div style={styles.sectionHeader}>
          <div>
            <p style={styles.kicker}>Search</p>
            <h2 style={styles.sectionTitle}>Search Discovery Sheet Registries</h2>
          </div>
        </div>
        <form onSubmit={searchEntries} style={styles.searchGrid}>
          <label style={styles.label}>
            Customer Name
            <input style={styles.input} value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="Full or partial customer name" />
          </label>
          <label style={styles.label}>
            Start Date
            <input style={styles.input} type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
          </label>
          <label style={styles.label}>
            End Date
            <input style={styles.input} type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
          </label>
          <div style={styles.actions}>
            <button type="submit" style={styles.primaryButton}>Search Registries</button>
            <button type="button" style={styles.secondaryButton} onClick={clearSearch}>Clear Search</button>
          </div>
        </form>
        {searchStatus.message && <p style={{ ...styles.status, ...styles[searchStatus.type] }}>{searchStatus.message}</p>}
        <div style={styles.resultsGrid}>
          {entries.map((entry) => (
            <article key={entry.id} style={styles.resultCard}>
              <h3 style={styles.resultTitle}>{entry.customerName || "Unnamed customer"}</h3>
              <p style={styles.resultMeta}>{entry.initiativeName || "No initiative name"} | {new Date(entry.createdAt).toLocaleString()}</p>
              <dl style={styles.resultDetails}>
                <Detail label="Sales Motion" value={entry.salesMotion} />
                <Detail label="Contact / Role" value={entry.contactRole} />
                <Detail label="Value Drivers" value={entry.valueDrivers} />
                <Detail label="Timeline" value={entry.timeline} />
                <Detail label="Current State" value={entry.currentState} />
                <Detail label="Future State" value={entry.futureState} />
                <Detail label="Required Capabilities" value={entry.requiredCapabilities} />
                <Detail label="Other Key Information" value={entry.otherKeyInformation} />
              </dl>
            </article>
          ))}
        </div>
      </section>

      <form onSubmit={saveEntry} style={styles.card}>
        <div style={styles.sectionHeader}>
          <div>
            <p style={styles.kicker}>Table 1</p>
            <h2 style={styles.sectionTitle}>Project Overview</h2>
          </div>
        </div>
        <div style={styles.gridTwo}>
          <TextField label="Customer Name" value={form.customerName} onChange={(value) => updateField("customerName", value)} />
          <TextField label="Application | Project | Initiative Name" value={form.initiativeName} onChange={(value) => updateField("initiativeName", value)} />
          <label style={styles.label}>
            Circle Sales Motion
            <div style={styles.radioGroup}>
              {salesMotionOptions.map((option) => (
                <label key={option} style={styles.radioLabel}>
                  <input type="radio" name="salesMotion" value={option} checked={form.salesMotion === option} onChange={(event) => updateField("salesMotion", event.target.value)} />
                  {option[0].toUpperCase() + option.slice(1)}
                </label>
              ))}
            </div>
          </label>
          <TextField label="Name of person we're meeting with & role" value={form.contactRole} onChange={(value) => updateField("contactRole", value)} />
        </div>

        <div style={styles.sectionHeader}>
          <div>
            <p style={styles.kicker}>Table 2</p>
            <h2 style={styles.sectionTitle}>Drivers & Timelines</h2>
          </div>
        </div>
        <div style={styles.gridTwo}>
          <TextField label="Why do Anything (Value Drivers)?" value={form.valueDrivers} onChange={(value) => updateField("valueDrivers", value)} />
          <TextArea label="Timeline/Deadline/Milestone Date? Why?" value={form.timeline} onChange={(value) => updateField("timeline", value)} />
        </div>

        <div style={styles.sectionHeader}>
          <div>
            <p style={styles.kicker}>Table 3</p>
            <h2 style={styles.sectionTitle}>Architecture & State</h2>
          </div>
        </div>
        <div style={styles.gridTwo}>
          <TextArea label="Current State (people, process, technology)" value={form.currentState} onChange={(value) => updateField("currentState", value)} />
          <TextArea label="Future State" value={form.futureState} onChange={(value) => updateField("futureState", value)} />
          <TextArea label="Required Capabilities (people, process, technology)" value={form.requiredCapabilities} onChange={(value) => updateField("requiredCapabilities", value)} />
          <TextArea label="Other Key Information (people, timelines, competing priorities, etc.)" value={form.otherKeyInformation} onChange={(value) => updateField("otherKeyInformation", value)} />
        </div>

        <div style={styles.formFooter}>
          <button type="submit" style={styles.primaryButton}>Save Discovery Sheet</button>
        </div>
        {saveStatus.message && <p style={{ ...styles.status, ...styles[saveStatus.type] }}>{saveStatus.message}</p>}
      </form>

      <section style={styles.card}>
        <div style={styles.sectionHeader}>
          <div>
            <p style={styles.kicker}>Guidelines</p>
            <h2 style={styles.sectionTitle}>Discovery Framework & Guidelines</h2>
          </div>
        </div>
        <div style={styles.accordionList}>
          {discoveryGuidelines.map((item) => (
            <details key={item.title} style={styles.accordionItem}>
              <summary style={styles.accordionSummary}>{item.title}</summary>
              <div style={styles.accordionContent}>{item.content}</div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label style={styles.label}>
      {label}
      <input style={styles.input} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label style={styles.label}>
      {label}
      <textarea style={{ ...styles.input, ...styles.textarea }} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <dt style={styles.detailLabel}>{label}</dt>
      <dd style={styles.detailValue}>{value}</dd>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: { display: "grid", gap: "1.25rem" },
  header: { display: "flex", justifyContent: "space-between", gap: "1rem", alignItems: "flex-start" },
  kicker: { margin: 0, color: "#60A5FA", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" },
  title: { margin: "0.25rem 0 0", color: "#FFFFFF", fontSize: "2.25rem", letterSpacing: "-0.03em" },
  subtitle: { margin: "0.5rem 0 0", color: "#94A3B8" },
  card: { border: "1px solid #1E293B", borderRadius: "18px", background: "#0F172A", padding: "1.25rem", boxShadow: "0 24px 60px rgba(0, 0, 0, 0.22)" },
  sectionHeader: { display: "flex", justifyContent: "space-between", gap: "1rem", margin: "0.25rem 0 1rem" },
  sectionTitle: { margin: "0.15rem 0 0", color: "#F8FAFC", fontSize: "1.35rem", letterSpacing: "-0.02em" },
  searchGrid: { display: "grid", gridTemplateColumns: "minmax(220px, 2fr) repeat(2, minmax(160px, 1fr))", gap: "0.9rem", alignItems: "end" },
  gridTwo: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "1rem", marginBottom: "1.5rem" },
  label: { display: "grid", gap: "0.45rem", color: "#CBD5E1", fontSize: "0.88rem", fontWeight: 700 },
  input: { width: "100%", boxSizing: "border-box", border: "1px solid #334155", borderRadius: "12px", background: "#020617", color: "#F8FAFC", padding: "0.72rem 0.85rem", font: "inherit" },
  textarea: { minHeight: "150px", resize: "vertical" },
  radioGroup: { display: "flex", flexWrap: "wrap", gap: "0.85rem", minHeight: "42px", alignItems: "center" },
  radioLabel: { display: "inline-flex", alignItems: "center", gap: "0.35rem", color: "#CBD5E1", fontWeight: 600 },
  actions: { display: "flex", gap: "0.75rem", gridColumn: "1 / -1", justifyContent: "flex-end" },
  formFooter: { display: "flex", justifyContent: "flex-end" },
  primaryButton: { border: "1px solid rgba(96, 165, 250, 0.45)", borderRadius: "12px", background: "#2563EB", color: "#FFFFFF", cursor: "pointer", font: "inherit", fontWeight: 800, padding: "0.72rem 1rem" },
  secondaryButton: { border: "1px solid #334155", borderRadius: "12px", background: "#1E293B", color: "#E2E8F0", cursor: "pointer", font: "inherit", fontWeight: 800, padding: "0.72rem 1rem" },
  status: { margin: "1rem 0 0", borderRadius: "12px", padding: "0.75rem 0.9rem", fontWeight: 800 },
  idle: {},
  loading: { background: "rgba(250, 204, 21, 0.12)", color: "#FACC15", border: "1px solid rgba(250, 204, 21, 0.2)" },
  success: { background: "rgba(34, 197, 94, 0.12)", color: "#86EFAC", border: "1px solid rgba(34, 197, 94, 0.2)" },
  error: { background: "rgba(248, 113, 113, 0.12)", color: "#FCA5A5", border: "1px solid rgba(248, 113, 113, 0.2)" },
  resultsGrid: { display: "grid", gap: "0.9rem", marginTop: "1rem" },
  resultCard: { border: "1px solid #1E293B", borderRadius: "14px", background: "#020617", padding: "1rem" },
  resultTitle: { margin: 0, color: "#FFFFFF", fontSize: "1.1rem" },
  resultMeta: { margin: "0.25rem 0 0", color: "#94A3B8", fontSize: "0.88rem" },
  resultDetails: { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "0.85rem", margin: "1rem 0 0" },
  detailLabel: { color: "#60A5FA", fontSize: "0.72rem", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.08em" },
  detailValue: { margin: "0.2rem 0 0", color: "#E2E8F0", whiteSpace: "pre-wrap", overflowWrap: "anywhere" },
  accordionList: { display: "grid", gap: "0.55rem" },
  accordionItem: { border: "1px solid #1E293B", borderRadius: "12px", background: "#020617", overflow: "hidden" },
  accordionSummary: { color: "#F8FAFC", cursor: "pointer", fontWeight: 800, padding: "0.85rem 1rem" },
  accordionContent: { borderTop: "1px solid #1E293B", color: "#CBD5E1", lineHeight: 1.65, padding: "1rem", whiteSpace: "pre-wrap" },
};

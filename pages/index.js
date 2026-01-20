import { useEffect, useState } from "react";

export default function MemoryDashboard() {
  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    if (!BACKEND_URL) {
      setError("Backend URL not configured.");
      setLoading(false);
      return;
    }

    fetch(`${BACKEND_URL}/memory`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Backend response not OK");
        }
        return res.json();
      })
      .then((data) => {
        setMemory(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load memory from backend.");
        setLoading(false);
      });
  }, [BACKEND_URL]);

  const forgetMemory = (category, payload) => {
  fetch(`${BACKEND_URL}/forget`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ category, ...payload })
  })
  .then(res => res.json())
  .then(() => {
    // Refresh memory after deletion
    fetch(`${BACKEND_URL}/memory`)
      .then(res => res.json())
      .then(data => setMemory(data));
  });
};

  if (loading) {
    return <p style={{ padding: "2rem" }}>Loading memory…</p>;
  }

  if (error) {
    return (
      <main style={{ padding: "2rem", fontFamily: "Arial" }}>
        <h1>🧠 JARVIS Memory Dashboard</h1>
        <p>{error}</p>
      </main>
    );
  }

  if (!memory) {
    return (
      <main style={{ padding: "2rem", fontFamily: "Arial" }}>
        <h1>🧠 JARVIS Memory Dashboard</h1>
        <p>No memory available.</p>
      </main>
    );
  }

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>🧠 JARVIS Memory Dashboard</h1>

      <Section
        title="Profile"
        data={memory.profile || {}}
        category="profile"
        onForget={forgetMemory}
      />

      <Section
        title="Preferences"
        data={memory.preferences || {}}
        category="preferences"
        onForget={forgetMemory}
      />

      <NotesSection
  notes={memory.notes}
  onForget={forgetMemory}
/>
    </main>
  );
}

function Section({ title, data, category, onForget }) {
  const keys = Object.keys(data || {});

  return (
    <section style={{ marginBottom: "2rem" }}>
      <h2>{title}</h2>
      {keys.length === 0 && <p>None</p>}
      <ul>
        {keys.map((key) => (
          <li key={key} style={{ marginBottom: "0.5rem" }}>
            <strong>{key}</strong>: {String(data[key])}
            <button
              onClick={() => onForget(category, { key })}
              style={{ marginLeft: "1rem" }}
            >
              Forget
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function NotesSection({ notes = [], onForget }) {
  return (
    <section>
      <h2>Notes</h2>
      {notes.length === 0 && <p>No notes stored.</p>}
      <ul>
        {notes.map((note, index) => (
          <li key={index} style={{ marginBottom: "1rem" }}>
            {note.content}
            <br />
            <small>Saved at: {note.saved_at}</small>
            <br />
            <button 
              onClick={() => onForget("notes", { index })}
              style={{ marginTop: "0.3rem" }}
            >
              Forget
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
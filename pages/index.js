import { useEffect, useState } from "react";

export default function MemoryDashboard() {
  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Function to forget a memory item
  const forgetMemory = (category, payload) => {
    fetch(`${BACKEND_URL}/forget`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        category,
        ...payload
      })
    })
      .then(res => res.json())
      .then(() => {
        // Refresh memory after deletion
        fetch(`${BACKEND_URL}/memory`)
          .then(res => res.json())
          .then(data => setMemory(data));
      });
  };

  // Load memory on page load
  useEffect(() => {
    fetch(`${BACKEND_URL}/memory`)
      .then(res => {
        if (!res.ok) throw new Error("Backend response not OK");
        return res.json();
      })
      .then(data => {
        setMemory(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load memory:", err);
        setMemory(null);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading memory…</p>;
  if (!memory) return (
    <main style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>🧠 JARVIS Memory Dashboard</h1>
      <p>Unable to load memory. Backend may be offline.</p>
    </main>
  );

  return (
    <main style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>🧠 JARVIS Memory Dashboard</h1>

      <Section
        title="Profile"
        data={memory.profile}
        category="profile"
        onForget={forgetMemory}
      />

      <Section
        title="Preferences"
        data={memory.preferences}
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

// Section component for Profile and Preferences
function Section({ title, data, category, onForget }) {
  return (
    <section style={{ marginBottom: "2rem" }}>
      <h2>{title}</h2>
      {Object.keys(data).length === 0 && <p>None</p>}
      <ul>
        {Object.entries(data).map(([key, value]) => (
          <li key={key} style={{ marginBottom: "0.5rem" }}>
            <strong>{key}</strong>: {value}{" "}
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

// Notes section with relevance scores
function NotesSection({ notes = [], onForget }) {
  return (
    <section>
      <h2>Notes</h2>
      {notes.length === 0 && <p>No notes stored.</p>}
      <ul>
        {notes.map((note, index) => (
          <li key={index} style={{ marginBottom: "1rem" }}>
            <strong>Score:</strong> {note.score || 0} | {note.content}
            <br />
            <small>Saved at: {note.saved_at}</small>
            <br />
            <button onClick={() => onForget("notes", { index })}>
              Forget
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

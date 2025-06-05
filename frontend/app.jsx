import React, { useEffect, useState } from "react";
import { backend } from "declarations/backend";

export default function App() {
  const [content, setContent] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async () => {
    const result = await backend.getAllSuggestions();
    const sorted = result.sort((a, b) => Number(b.createdAt) - Number(a.createdAt));
    setSuggestions(sorted);
  };

  const submitSuggestion = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    await backend.addSuggestion(content);
    setContent("");
    await fetchSuggestions();
    setLoading(false);
  };

  const handleVote = async (id, isLike) => {
    await backend.voteSuggestion(id, isLike);
    await fetchSuggestions();
  };

  const timeAgo = (timestamp) => {
    const now = Date.now();
    const diffSec = Math.floor((now - Number(timestamp) / 1_000_000) / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  };

  useEffect(() => {
    fetchSuggestions();
  }, []);

  return (
    <div className="container">
      <div className="header">
      <div className="logo">🕊️</div>
      <h1>WhisprBox</h1>
      <p className="subtitle">Leave your thoughts. Whisper your mind. No login required.</p>
    </div>
      <form onSubmit={submitSuggestion}>
        <textarea
          value={content}
          placeholder="Write your suggestion here..."
          onChange={(e) => setContent(e.target.value)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Mengirim..." : "Kirim Saran"}
        </button>
      </form>

      <div style={{ marginTop: "30px" }}>
        <h2>Daftar Saran</h2>
        {suggestions.length === 0 ? (
          <p>Belum ada saran.</p>
        ) : (
          suggestions.map((sug) => (
            <div key={sug.id} className="suggestion">
              <p>{sug.content}</p>
              <small>{timeAgo(sug.createdAt)}</small>
              <div className="vote-buttons">
                <button onClick={() => handleVote(sug.id, true)}>
                  👍 {Number(sug.likes)}
                </button>
                <button onClick={() => handleVote(sug.id, false)}>
                  👎 {Number(sug.dislikes)}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

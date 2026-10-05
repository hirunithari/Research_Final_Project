import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SyncLoader } from "react-spinners";
import { useTranslation } from "react-i18next";
import { FaHandPaper, FaTimesCircle, FaCheckCircle } from "react-icons/fa";
import { StaticSignData } from "../../Data/StaticSignData";
import "./sign-sentence-builder.css";

const FLASK_URL = "http://localhost:5000";

// letter → sign image lookup
const signMap = {};
StaticSignData.forEach(item => {
  signMap[item.name.toUpperCase()] = item.signImage;
});

function LetterChip({ letter }) {
  const img = signMap[letter.toUpperCase()];
  return (
    <div className="ssb-letter-chip">
      {img
        ? <img className="ssb-letter-img" src={img} alt={letter} />
        : <div className="ssb-letter-missing">{letter.toUpperCase()}</div>
      }
      <span className="ssb-letter-label">{letter.toUpperCase()}</span>
    </div>
  );
}

function WordCard({ word, selected, onClick }) {
  const letters = word.toUpperCase().replace(/[^A-Z]/g, "").split("");
  return (
    <div
      className={`ssb-word-card ${selected ? "selected" : ""}`}
      onClick={onClick}
      title={selected ? "Click to deselect" : "Click to add to sentence"}
    >
      <div className="ssb-word-label">{word}</div>
      <div className="ssb-word-letters">
        {letters.length > 0
          ? letters.map((l, i) => <LetterChip key={i} letter={l} />)
          : <span className="ssb-no-sign">—</span>
        }
      </div>
      <div className="ssb-word-badge">{selected ? "✓ Added" : "+ Add"}</div>
    </div>
  );
}

function FinalSignCard({ word }) {
  const letters = word.toUpperCase().replace(/[^A-Z]/g, "").split("");
  return (
    <div className="ssb-final-card">
      <div className="ssb-final-word">{word}</div>
      <div className="ssb-final-letters">
        {letters.map((l, i) => <LetterChip key={i} letter={l} />)}
      </div>
    </div>
  );
}

export default function SignSentenceBuilder() {
  const { t } = useTranslation("common");

  const [sentence, setSentence]       = useState("");
  const [wordCards, setWordCards]     = useState([]);   // words returned from API
  const [selected, setSelected]       = useState([]);   // words in sentence strip (ordered)
  const [isLoading, setIsLoading]     = useState(false);
  const [showResult, setShowResult]   = useState(false);
  const [confirmedWords, setConfirmedWords] = useState([]);

  // Step 1 — call /typeSentence
  const handleGetWords = async () => {
    const trimmed = sentence.trim();
    if (!trimmed) { toast.error("Please type a sentence first."); return; }
    setIsLoading(true);
    setWordCards([]);
    setSelected([]);
    setShowResult(false);
    try {
      const res = await axios.post(`${FLASK_URL}/typeSentence`, { sentence: trimmed });
      const words = res.data.useful_words || [];
      if (words.length === 0) { toast.warning("No words returned."); }
      setWordCards(words);
      toast.success("Sign cards ready — tap to build your sentence!");
    } catch {
      toast.error("Could not reach the server. Is Flask running?");
    } finally {
      setIsLoading(false);
    }
  };

  // Step 4 — toggle word into sentence strip
  const toggleWord = (word) => {
    setSelected(prev => {
      const idx = prev.indexOf(word);
      if (idx === -1) return [...prev, word];
      return prev.filter(w => w !== word);
    });
    setShowResult(false);
  };

  const removeFromStrip = (idx) => {
    setSelected(prev => prev.filter((_, i) => i !== idx));
    setShowResult(false);
  };

  const clearStrip = () => { setSelected([]); setShowResult(false); };

  // Step 6 — confirm and show sign output
  const handleConfirm = () => {
    if (selected.length === 0) { toast.error("Select at least one word."); return; }
    setConfirmedWords([...selected]);
    setShowResult(true);
  };

  const outputSentence = selected.join(" ");

  return (
    <div className="ssb-page">
      <ToastContainer position="bottom-center" theme="colored" autoClose={2000} />
      <div className="ssb-container">

        {/* Breadcrumb */}
        <div className="ssb-breadcrumb">
          <Link to="/dashboard">{t("dashboard")}</Link>
          <span className="ssb-breadcrumb-sep">›</span>
          <Link to="/textSign">{t("textToSign")}</Link>
          <span className="ssb-breadcrumb-sep">›</span>
          <span className="ssb-breadcrumb-current">Sign Sentence Builder</span>
        </div>

        {/* Hero */}
        <div className="ssb-hero">
          <div className="ssb-hero-icon"><FaHandPaper /></div>
          <div>
            <div className="ssb-hero-title">Sign Sentence Builder</div>
            <div className="ssb-hero-sub">
              Type a sentence → pick sign cards → build your message
            </div>
          </div>
        </div>

        {/* Step 1 — Type sentence */}
        <div className="ssb-section">
          <div className="ssb-section-title">
            <span className="ssb-step-num">1</span> Type Your Sentence
          </div>
          <div className="ssb-type-row">
            <input
              className="ssb-input"
              type="text"
              placeholder='e.g. "stop left right go"'
              value={sentence}
              onChange={e => setSentence(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleGetWords()}
            />
            <button className="ssb-btn-primary" onClick={handleGetWords} disabled={isLoading}>
              {isLoading ? <SyncLoader size={6} color="#fff" /> : "Get Sign Cards"}
            </button>
          </div>
        </div>

        {/* Step 2 — Word sign cards */}
        {wordCards.length > 0 && (
          <div className="ssb-section">
            <div className="ssb-section-title">
              <span className="ssb-step-num">2</span>
              Select Sign Cards&nbsp;
              <span className="ssb-hint">— tap a card to add/remove it from your sentence</span>
            </div>
            <div className="ssb-cards-grid">
              {wordCards.map(word => (
                <WordCard
                  key={word}
                  word={word}
                  selected={selected.includes(word)}
                  onClick={() => toggleWord(word)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Step 3 — Sentence strip */}
        {wordCards.length > 0 && (
          <div className="ssb-section">
            <div className="ssb-section-title">
              <span className="ssb-step-num">3</span> Your Sentence Strip
            </div>
            <div className="ssb-strip-wrapper">
              {selected.length === 0 ? (
                <div className="ssb-strip-empty">Tap cards above to build your sentence here</div>
              ) : (
                <div className="ssb-strip">
                  {selected.map((word, idx) => (
                    <div key={idx} className="ssb-strip-chip">
                      <span className="ssb-strip-word">{word}</span>
                      <button
                        className="ssb-strip-remove"
                        onClick={() => removeFromStrip(idx)}
                        title="Remove"
                      >
                        <FaTimesCircle />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {selected.length > 0 && (
                <div className="ssb-strip-output">
                  <span className="ssb-output-label">Output sentence:</span>
                  <span className="ssb-output-text">"{outputSentence}"</span>
                </div>
              )}

              <div className="ssb-strip-actions">
                {selected.length > 0 && (
                  <>
                    <button className="ssb-btn-secondary" onClick={clearStrip}>
                      Clear All
                    </button>
                    <button className="ssb-btn-confirm" onClick={handleConfirm}>
                      <FaCheckCircle /> Show Sign Animation
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 4 — Final sign output */}
        {showResult && confirmedWords.length > 0 && (
          <div className="ssb-section">
            <div className="ssb-section-title">
              <span className="ssb-step-num">4</span> Sign Language Output
              <span className="ssb-hint"> — finger-spelled signs for each word</span>
            </div>
            <div className="ssb-final-sentence-bar">
              <span className="ssb-final-sentence-label">Confirmed sentence:</span>
              <span className="ssb-final-sentence-text">"{confirmedWords.join(" ")}"</span>
            </div>
            <div className="ssb-final-cards">
              {confirmedWords.map((word, idx) => (
                <FinalSignCard key={idx} word={word} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

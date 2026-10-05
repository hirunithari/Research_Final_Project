import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaHandPaper, FaBackspace, FaEraser, FaCopy, FaCheck } from "react-icons/fa";
import { StaticSignData } from "../../Data/StaticSignData";
import "./sign-to-word.css";

export default function SignToWord() {
  const { t } = useTranslation("common");
  const [word, setWord] = useState("");
  const [copied, setCopied] = useState(false);

  const addLetter = (letter) => {
    setWord(prev => prev + letter);
    setCopied(false);
  };

  const backspace = () => {
    setWord(prev => prev.slice(0, -1));
    setCopied(false);
  };

  const addSpace = () => {
    setWord(prev => prev + " ");
    setCopied(false);
  };

  const clear = () => {
    setWord("");
    setCopied(false);
  };

  const copy = () => {
    if (!word.trim()) return;
    navigator.clipboard.writeText(word.trim()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const letters = word.split("").map((ch, i) => ({ ch, i }));

  return (
    <div className="stw-page">
      <div className="stw-container">

        {/* Breadcrumb */}
        <div className="stw-breadcrumb">
          <Link to="/dashboard">{t("dashboard")}</Link>
          <span className="stw-sep">›</span>
          <Link to="/textSign">{t("textToSign")}</Link>
          <span className="stw-sep">›</span>
          <span className="stw-current">Sign to Word</span>
        </div>

        {/* Hero */}
        <div className="stw-hero">
          {/*<div className="stw-hero-icon"><FaHandPaper /></div>*/}
          <div>
            <div className="stw-hero-title"><b>WELCOME SIGN TO WORD</b></div>
            <div className="stw-hero-sub">
            </div>
          </div>
        </div>

        {/* Word display */}
        <div className="stw-section">
          <div className="stw-section-title">
            <span className="stw-step">1</span> Your Word
          </div>

          <div className="stw-word-display">
            {letters.length === 0 ? (
              <span className="stw-word-placeholder">show your words </span>
            ) : (
              letters.map(({ ch, i }) => (
                <span key={i} className={ch === " " ? "stw-space-char" : "stw-letter-char"}>
                  {ch === " " ? "·" : ch.toUpperCase()}
                </span>
              ))
            )}
          </div>

         <div className="stw-controls">
            <button className="stw-ctrl-btn danger" onClick={backspace} disabled={word.length === 0} title="Backspace">
              <FaBackspace /> Backspace
            </button>
            {/*<button className="stw-ctrl-btn space" onClick={addSpace} title="Add space">
              Space
            </button>*/}
            <button className="stw-ctrl-btn secondary" onClick={clear} disabled={word.length === 0} title="Clear">
              <FaEraser /> Clear
            </button>
            <button
              className={`stw-ctrl-btn ${copied ? "copied" : "primary"}`}
              onClick={copy}
              disabled={!word.trim()}
              title="Copy"
            >
              {copied ? <><FaCheck /> Copied!</> : <><FaCopy /> Copy</>}
            </button>
          </div>
        </div>

        {/* Sign image grid */}
        <div className="stw-section">
          <div className="stw-section-title">
            <span className="stw-step">2</span> Click below sign
            <span className="stw-hint">  </span>
          </div>
          <div className="stw-sign-grid">
            {StaticSignData.map((item) => (
              <button
                key={item.id}
                className="stw-sign-card"
                onClick={() => addLetter(item.name)}
                title={`Add letter ${item.name}`}
              >
                <img src={item.signImage} alt={item.name} className="stw-sign-img" />
                <span className="stw-sign-label">{item.name}</span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

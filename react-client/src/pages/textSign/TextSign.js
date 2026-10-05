import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { SyncLoader } from "react-spinners";
import { useTranslation } from "react-i18next";
<<<<<<< HEAD
import { FaFont, FaUpload, FaHandPaper } from "react-icons/fa";
=======
import { FaFont, FaUpload } from "react-icons/fa";
>>>>>>> eb53dfd910c3a99e0e13928afec640eab2bab240
import { StaticSignData } from "../../Data/StaticSignData";
import { SinhalaToEnglish } from "../../Data/EnglishToSinhala";
import "./text-sign.css";

const FLASK_URL = "http://localhost:5000";

// Build letter → sign image map from StaticSignData
const signMap = {};
StaticSignData.forEach(item => { signMap[item.name.toUpperCase()] = item.signImage; });

// Detect Sinhala characters (Unicode range U+0D80–U+0DFF)
const isSinhalaWord = (word) => /[\u0D80-\u0DFF]/.test(word);

// Layer 2: MyMemory REST API (si → en)
const translateViaMymemory = async (word) => {
  try {
    const res = await axios.get(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=si|en`,
      { timeout: 5000 }
    );
    const translated = res.data?.responseData?.translatedText;
    if (translated && translated !== word && !translated.startsWith('[')) {
      return translated.toLowerCase().trim();
    }
    return null;
  } catch {
    return null;
  }
};

// 3-Layer translation for a single word
const translateWord = async (word) => {
  const sinhala = isSinhalaWord(word);
  if (!sinhala) {
    return { original: word, english: word.toLowerCase(), isSinhala: false };
  }
  // Layer 1: local dictionary
  const local = SinhalaToEnglish[word];
  if (local) {
    return { original: word, english: local.toLowerCase(), isSinhala: true, layer: 1 };
  }
  // Layer 2: MyMemory API
  const api = await translateViaMymemory(word);
  if (api) {
    return { original: word, english: api, isSinhala: true, layer: 2 };
  }
  // Layer 3: show original as-is
  return { original: word, english: word, isSinhala: true, layer: 3 };
};

// SignCard component
function SignCard({ card }) {
  const { original, english, isSinhala, layer } = card;
  const isTranslated = isSinhala && english !== original;
  const letters = english.toUpperCase().replace(/[^A-Z]/g, '').split('').filter(Boolean);

  return (
    <div className={`ts2-sign-card ${isSinhala ? 'sinhala' : ''}`}>
      <div className="ts2-sign-card-title">{original}</div>
      {isTranslated && (
        <div className="ts2-sign-card-translated">
          {layer === 1 ? '📖' : layer === 2 ? '🌐' : ''} → {english}
        </div>
      )}
      <div className="ts2-letter-row">
        {letters.length > 0 ? letters.map((letter, i) => (
          <div className="ts2-letter-item" key={i}>
            {signMap[letter]
              ? <img className="ts2-letter-img" src={signMap[letter]} alt={letter} />
              : <div className="ts2-letter-missing">{letter}</div>
            }
            <div className="ts2-letter-label">{letter}</div>
          </div>
        )) : (
          <div className="ts2-no-signs">No sign data available</div>
        )}
      </div>
    </div>
  );
}

export default function TextSign() {
  const { t } = useTranslation("common");
  const [signCards, setSignCards] = useState([]);
  const [file, setFile] = useState(null);
  const [isFileLoading, setIsFileLoading] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  const processWords = async (words) => {
    if (!words || words.length === 0) return;
    setIsTranslating(true);
    try {
      const results = await Promise.all(words.map(translateWord));
      setSignCards(results);
    } finally {
      setIsTranslating(false);
    }
  };

  const getPdfUsefulWords = async () => {
    try {
      const res = await axios.get(`${FLASK_URL}/pdfScan`);
      toast.success(t("PDFScanSuccessful"));
      processWords(res.data.useful_words);
    } catch {
      toast.error(t("PDFScanError"));
    }
  };

  const handleSelectFile = (e) => setFile(e.target.files[0]);

  const handleUploadFile = async () => {
    if (!file) { toast.error(t("Pleaseuploadafile")); return; }
    setIsFileLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      await axios.post(`${FLASK_URL}/upload`, formData);
      setIsFileLoading(false);
      toast.success(t("FileUploadSuccessful"));
      getPdfUsefulWords();
    } catch {
      setIsFileLoading(false);
      toast.error(t("FileUploadError"));
    }
  };

  return (
    <div className="ts2-page">
      <ToastContainer position="bottom-center" theme="colored" autoClose={2000} />
      <div className="ts2-container">

        <div className="ts2-breadcrumb">
          <Link to="/dashboard">{t("dashboard")}</Link>
          <span className="ts2-breadcrumb-sep">›</span>
          <span className="ts2-breadcrumb-current">{t("textToSign")}</span>
        </div>

        <div className="ts2-hero">
          <div className="ts2-hero-icon"><FaFont /></div>
          <div>
            <div className="ts2-hero-title">{t("textToSign")}</div>
            <div className="ts2-hero-sub">{t("textToSignDescription")}</div>
          </div>
        </div>

        {/* Link to reverse flow */}
        <div style={{ marginBottom: "1.5rem" }}>
          <Link
            to="/sign-sentence-builder"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.6rem 1.2rem",
              background: "linear-gradient(135deg,#764ba2,#667eea)",
              color: "#fff",
              borderRadius: "12px",
              fontWeight: 600,
              fontSize: "0.9rem",
              textDecoration: "none",
              boxShadow: "0 4px 12px rgba(102,126,234,0.3)",
            }}
          >
            <FaHandPaper /> Try Sign Sentence Builder (reverse flow)
          </Link>
        </div>

        <div className="ts2-grid">

          {/* ── Upload card ── */}
          <div className="ts2-card">
            <div className="ts2-card-header">
              <FaUpload /> {t("UploadFile")}
            </div>
            <div className="ts2-card-body">
              <div className="ts2-input-panel">
                <div className="ts2-file-row">
                  <input
                    type="file"
                    onChange={handleSelectFile}
                    className="ts2-file-input"
                    accept=".pdf"
                  />
                  <button className="ts2-btn-convert" onClick={handleUploadFile}>
                    {t("convertToSign")}
                  </button>
                </div>
                {isFileLoading && (
                  <div className="ts2-loader">
                    <SyncLoader loading={isFileLoading} color="#667eea" size={8} />
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="ts2-legend">
                <div className="ts2-legend-item">
                  <span className="ts2-legend-dot purple" />
                  {t("tsLegendEnglish", "English words")}
                </div>
                <div className="ts2-legend-item">
                  <span className="ts2-legend-dot amber" />
                  {t("tsLegendSinhala", "Sinhala words (translated)")}
                </div>
              </div>
            </div>
          </div>

          {/* ── Results card ── */}
          <div className="ts2-card">
            <div className="ts2-card-header success">
              🤟 {t("tsSignResults", "Sign Language Output")}
            </div>
            <div className="ts2-card-body">
              {isTranslating ? (
                <div className="ts2-translating">
                  <SyncLoader loading color="#667eea" size={8} />
                  <div className="ts2-translating-text">
                    {t("tsTranslating", "Translating & loading signs...")}
                  </div>
                </div>
              ) : signCards.length > 0 ? (
                <div className="ts2-sign-cards">
                  {signCards.map((card, idx) => (
                    <SignCard key={idx} card={card} />
                  ))}
                </div>
              ) : (
                <div className="ts2-empty">
                  <div className="ts2-empty-icon">🤟</div>
                  <div className="ts2-empty-text">
                    {t("tsResultsEmpty", "Sign language cards will appear here after you upload a PDF.")}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

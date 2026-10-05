import React from "react";
import { useTranslation } from "react-i18next";

export default function Speech({ onSubmit, transcript, listening, resetTranscript, startListening, stopListening }) {

  const { t } = useTranslation("common");

  return (
    <div className="mb-3">
      <p className="fs-5 fw-bold">{t("microphone")}: {listening ? t("on") : t("off")}</p>
      <div className="d-flex justify-content-evenly">
        <button className="btn-success btn-sm" onClick={startListening}>
        {t("start")}
        </button>
        <button
          className="btn-danger btn-sm"
          onClick={stopListening}
        >
          {t("stop")}
        </button>
        <button
          className="btn-warning btn-sm text-white"
          onClick={resetTranscript}
        >
          {t("reset")}
        </button>
      </div>
      <div className="input-group mb-3 mt-3">
        <textarea
          readOnly={true}
          type="text"
          className="form-control"
          placeholder= {t("saySomething")}
          value={transcript}
        />
      </div>
      <button className="btn btn-success" onClick={onSubmit}>{t("convertToSign")}</button>
    </div>
  );
}

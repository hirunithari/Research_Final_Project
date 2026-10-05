import React from "react";
import { useTranslation } from "react-i18next";

export default function FileUpload({ handleSelectFile, handleUploadFile }) {
  const { t } = useTranslation("common");

  return (
    <div className="input-group mb-3">
      <input
        type="file"
        onChange={handleSelectFile}
        className="form-control"
        id="inputGroupFile02"
      />
      <label className="input-group-text" onClick={handleUploadFile}>
        {t("convertToSign")}
      </label>
    </div>
  );
}

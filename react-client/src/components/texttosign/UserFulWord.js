import React from 'react';
import { useTranslation } from 'react-i18next';

export default function UserFulWord( { usefulWords } ) {

  const { t } = useTranslation("common");

  return (
      <>
    {usefulWords.length > 0 ? (
        <ul className="list-group">
          {usefulWords.map((word) => (
            <li
              className="list-group-item d-flex justify-content-between align-items-center fs-4 fw-bold"
              key={word}
            >
              {word}
              <span
                className="badge bg-primary rounded-circle"
                style={{ cursor: "pointer" }}
              >
                <img
                  src="https://img.icons8.com/ios-glyphs/20/000000/play--v1.png"
                  alt="playIcon"
                />
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div class="alert alert-primary" role="alert">
          {t("PleaseClickUploadFileOrVoiceRecording")}
        </div>
      )}

        </>
  )
}

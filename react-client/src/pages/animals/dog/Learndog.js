import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DogModel from "../../../components/animals/dog/Dogmodel";
import DogSignlanguage from "../../../components/animals/dog/Dogsignlanguage";
import { FaDog, FaArrowLeft, FaPlay } from "react-icons/fa";
import "../animals.css";

export default function LearnDog() {
    const { t } = useTranslation("common");
    const navigate = useNavigate();

    return (
        <div className="an-page">
            <div className="an-container">

                {/* Breadcrumb */}
                <div className="an-breadcrumb">
                    <Link to="/dashboard-animals">{t("DynamicSign")}</Link>
                    <span className="an-breadcrumb-sep">›</span>
                    <span className="an-breadcrumb-current"><FaDog style={{ marginRight: 4 }} />{t("learnDog")}</span>
                </div>

                {/* 2-column grid */}
                <div className="an-learn-grid">

                    {/* Left: 3D Model */}
                    <div className="an-card">
                        <div className="an-card-header">
                            <FaDog /> {t("learnDog")}
                        </div>
                        <div className="an-card-body">
                            <div className="an-model-box">
                                <DogModel />
                            </div>
                        </div>
                    </div>

                    {/* Right: Sign language video */}
                    <div className="an-card">
                        <div className="an-card-header accent">
                            🎬 {t("signLanguageVideo")}
                        </div>
                        <div className="an-card-body">
                            <div className="an-video-box">
                                <DogSignlanguage />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="an-actions">
                    <button className="an-btn-outline" onClick={() => navigate("/dashboard-animals")}>
                        <FaArrowLeft /> {t("backToDashboard")}
                    </button>
                    <button className="an-btn-primary" onClick={() => navigate("/practise-dog")}>
                        <FaPlay /> {t("startPractice")}
                    </button>
                </div>

            </div>
        </div>
    );
}

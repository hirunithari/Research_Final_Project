import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import CatModel from "../../../components/animals/cat/Catmodel";
import CatSignlanguage from "../../../components/animals/cat/Catsignlanguage";
import { FaCat, FaArrowLeft, FaPlay } from "react-icons/fa";
import "../animals.css";

export default function LearnCat() {
    const { t } = useTranslation("common");
    const navigate = useNavigate();

    return (
        <div className="an-page">
            <div className="an-container">

                {/* Breadcrumb */}
                <div className="an-breadcrumb">
                    <Link to="/dashboard-animals">{t("DynamicSign")}</Link>
                    <span className="an-breadcrumb-sep">›</span>
                    <span className="an-breadcrumb-current"><FaCat style={{ marginRight: 4 }} />{t("learnCat")}</span>
                </div>

                {/* 2-column grid */}
                <div className="an-learn-grid">

                    {/* Left: 3D Model */}
                    <div className="an-card">
                        <div className="an-card-header">
                            <FaCat /> {t("learnCat")}
                        </div>
                        <div className="an-card-body">
                            <div className="an-model-box">
                                <CatModel />
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
                                <CatSignlanguage />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="an-actions">
                    <button className="an-btn-outline" onClick={() => navigate("/dashboard-animals")}>
                        <FaArrowLeft /> {t("backToDashboard")}
                    </button>
                    <button className="an-btn-primary" onClick={() => navigate("/practise-cat")}>
                        <FaPlay /> {t("startPractice")}
                    </button>
                </div>

            </div>
        </div>
    );
}

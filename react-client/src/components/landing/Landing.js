import React from "react";
import "./landing.css";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaPlay, FaRocket, FaUsers, FaAward, FaArrowRight } from "react-icons/fa";
import network from "../../images/network.png";

export default function Landing() {
  const { t } = useTranslation("common");

  return (
    <>
      {/* Enhanced Hero Section */}
      <section className="hero-section">
        {/* Background Elements */}
        <div className="hero-background">
          <div className="floating-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
            <div className="shape shape-4"></div>
          </div>
          <div className="gradient-overlay"></div>
        </div>

        <div className="container">
          <div className="row align-items-center min-vh-100">
            <div className="col-lg-6 col-md-12 hero-content">
              {/* Badge */}
              <div className="hero-badge">
                <FaRocket className="badge-icon" />
                <span>{t("aiPoweredLearning")}</span>
              </div>

              {/* Main Heading */}
              <h1 className="hero-title">
                <span className="title-line-1">{t("ELearning")}</span>
                <span className="title-line-2">{t("Platform")}</span>
              </h1>

              {/* Subtitle */}
              <h2 className="hero-subtitle">
                {t("WelcometothefutureofClassroom")}
              </h2>

              {/* Description */}
              <p className="hero-description">
                {t("empoweringIndividuals")}
              </p>

              {/* CTA Buttons */}
              <div className="hero-actions">
                <Link to="/home" className="btn btn-primary hero-btn">
                  <span>{t("Exploreteachingservice")}</span>
                  <FaArrowRight className="btn-icon" />
                </Link>
                <button className="btn btn-outline hero-btn-outline">
                  <FaPlay className="btn-icon" />
                  <span>{t("watchDemo")}</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="trust-indicators">
                <div className="trust-item">
                  <FaAward className="trust-icon" />
                  <span>{t("trustedByEducators")}</span>
                </div>
                <div className="trust-item">
                  <FaUsers className="trust-icon" />
                  <span>{t("communityDriven")}</span>
                </div>
              </div>
            </div>

            <div className="col-lg-6 col-md-12 hero-visual">
              {/* Main Image */}
              <div className="hero-image-container">
                <img
                  src={network}
                  alt="AI Learning Platform"
                  className="hero-main-image"
                />
                
                {/* Floating Elements */}
                <div className="floating-element floating-card-1">
                  <div className="floating-card">
                    <FaUsers className="card-icon" />
                    <div className="card-content">
                      <div className="card-title">{t("liveLearning")}</div>
                      <div className="card-subtitle">{t("realTimeFeedback")}</div>
                    </div>
                  </div>
                </div>

                <div className="floating-element floating-card-2">
                  <div className="floating-card">
                    <FaRocket className="card-icon" />
                    <div className="card-content">
                      <div className="card-title">{t("aiPowered")}</div>
                      <div className="card-subtitle">{t("smartRecognition")}</div>
                    </div>
                  </div>
                </div>

                <div className="floating-element floating-card-3">
                  <div className="floating-card">
                    <FaAward className="card-icon" />
                    <div className="card-content">
                      <div className="card-title">{t("certified")}</div>
                      <div className="card-subtitle">{t("expertApproved")}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator">
          <div className="scroll-text">{t("scrollToExplore")}</div>
          <div className="scroll-arrow"></div>
        </div>
      </section>

      {/* Content Section */}
      <section className="content-section">
        <div className="container">
          <div className="row align-items-center justify-content-center">
            <div className="col-lg-6 col-md-12 mb-5 mb-lg-0">
              <img
                src="https://c.tenor.com/xv9zebVwMMcAAAAC/no-yes.gif"
                alt="Interactive Learning"
                style={{ maxWidth: "100%", height: "auto" }}
              />
            </div>
            <div className="col-lg-6 col-md-12">
              <h1 className="fw-bold">
                {t("welcome")}
              </h1>
              <br />
              <h2>
                <span className="font-link-2">
                  {t("BESTSIGNLANGUAGE")}
                </span>
                <br /> 
                <span style={{ color: "var(--text-secondary)", fontSize: "1.5rem" }}>
                  {t("ELearningplatform")}
                </span>
              </h2>
              <p className="mt-4">
                {t("joinThousandsLearners")}
              </p>
              <Link to="/home">
                <button className="btn btn-primary">
                  {t("Getstarted")}
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

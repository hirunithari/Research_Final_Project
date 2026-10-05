import React from "react";
import './dashboard.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DashboardDetails } from '../../../Data/StaticSignDashboardData';
import { FaGraduationCap, FaGamepad, FaTrophy } from 'react-icons/fa';

export default function StaticSignDashboard() {
  const { t } = useTranslation("common");

  const staticSignServices = [
    {
      id: 1,
      title: "Learn",
      description: t('learnStaticSignDescription'),
      image: DashboardDetails[0]?.image || "images/sign-language.jpg",
      link: DashboardDetails[0]?.link || "/learn-static-sign",
      icon: <FaGraduationCap />
    },
    {
      id: 2,
      title: "Practice",
      description: t('practiceStaticSignDescription'),
      image: DashboardDetails[1]?.image || "images/sign-language.jpg",
      link: DashboardDetails[1]?.link || "/static-sign-game",
      icon: <FaGamepad />
    },
    {
      id: 3,
      title: "Leaderboard",
      description: t('leaderboardDescription'),
      image: DashboardDetails[2]?.image || "images/sign-language.jpg",
      link: DashboardDetails[2]?.link || "/leaderboard",
      icon: <FaTrophy />
    }
  ];

  return (
    <div className="static-signs-dashboard">
      <div className="static-signs-header">
        <h1>
          <span className="theme-text">{t("Static")}</span> Sign
        </h1>
        <hr />
      </div>
      <div className="static-signs-grid">
        {staticSignServices.map((service) => (
          <div className="static-sign-card" key={service.id}>
            <div className="static-sign-card-image">
              <img src={service.image} alt={service.title} />
            </div>
            <div className="static-sign-card-body">
              <h3 className="static-sign-card-title">
                {service.icon}
                <span className="ms-2">{t(service.title)}</span>
              </h3>
              <p className="static-sign-card-text">{service.description}</p>
              <div className="static-sign-card-action">
                <Link to={service.link}>
                  <button className="btn btn-outline-primary">
                    <span>
                      {t("LearnMore")} {">>"}
                    </span>
                  </button>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React from 'react';
import './dashboard.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DashboardDetails } from '../../Data/DashboardData';
import { FaSignLanguage, FaTrafficLight, FaChartLine, FaFont, FaPaw } from 'react-icons/fa';

export default function Dashboard() {

    const { t } = useTranslation("common");

    const serviceIcons = {
        1: <FaFont />,        // Text to Sign
        2: <FaPaw />,         // Animal Signs
        3: <FaSignLanguage />, // Static Signs
        4: <FaTrafficLight />, // Traffic Signs
        5: <FaChartLine />     // Guardian Dashboard
    };

    const serviceDescriptions = {
        1: t('textToSignDescription'),
        2: t('animalsDescription'),
        3: t('staticSignsDescription'),
        4: t('trafficSignsDescription'),
        5: t('guardianDashboardDescription'),
    };

    return (
        <div className="container-fluid services-container">
            {/* Floating Background Shapes */}
            <div className="floating-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
                <div className="shape shape-4"></div>
            </div>

            <div className="services-header">
                <h1 className="text-center display-4 fw-bold mb-3">
                    <span className="theme-text">{t("Services")}</span>
                </h1>
                <hr className="mx-auto mb-5 w-25" />
            </div>

            <div className="services-grid">
                {DashboardDetails
                    .map((detail) => (
                        <div className="service-card-wrapper" key={detail.id}>
                            <div className="card service-card shadow-lg">
                                <div className="card-image-container">
                                    <img src={detail.image} alt={detail.title} className="card-img-top" />
                                    <div className="card-icon-overlay">
                                        {serviceIcons[detail.id]}
                                    </div>
                                </div>
                                <div className="card-body d-flex flex-column">
                                    <h3 className="card-title text-center mb-3">
                                        {serviceIcons[detail.id]}
                                        <span className="ms-2">{t(detail.title)}</span>
                                    </h3>
                                    <hr className="mx-auto w-50 mb-3" />
                                    <p className="card-text flex-grow-1">
                                        {serviceDescriptions[detail.id]}
                                    </p>
                                    <div className="card-action mt-auto">
                                        <Link to={detail.link}>
                                            <button className='btn btn-primary btn-lg w-100'>
                                                <span>{t("LearnMore")} →</span>
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChatbotDashboardDetails } from '../../Data/ChatbotDashboardData.js';
import { FaPalette, FaRobot } from 'react-icons/fa';
import './BotTeach.css';

export default function BotTeach() {
    const { t } = useTranslation("common");

    const botTeachServices = [
        {
            id: 1,
            title: "Learn Colors",
            description: t('learnColorsDescription'),
            image: ChatbotDashboardDetails[0]?.image || "images/sign-language.jpg",
            link: ChatbotDashboardDetails[0]?.link || "/learnColor",
            icon: <FaPalette />
        },
        {
            id: 2,
            title: "ChatBot",
            description: t('chatbotDescription'),
            image: ChatbotDashboardDetails[1]?.image || "images/sign-language.jpg",
            link: ChatbotDashboardDetails[1]?.link || "/chatbot",
            icon: <FaRobot />
        }
    ];

    return (
        <div className="bot-teach-dashboard">
            <div className="bot-teach-header">
                <h1>
                    <span className="theme-text">{t("ChatBot")}</span> Teach
                </h1>
                <hr />
            </div>
            <div className="bot-teach-grid">
                {botTeachServices.map((service) => (
                    <div className="bot-teach-card" key={service.id}>
                        <div className="bot-teach-card-image">
                            <img src={service.image} alt={service.title} />
                        </div>
                        <div className="bot-teach-card-body">
                            <h3 className="bot-teach-card-title">
                                {service.icon}
                                <span className="ms-2">{t(service.title)}</span>
                            </h3>
                            <p className="bot-teach-card-text">{service.description}</p>
                            <div className="bot-teach-card-action">
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
    )
}

import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaCat, FaDog, FaCrown, FaPaw, FaHorse, FaFish } from 'react-icons/fa';
import './Dashboard-animals.css';

export default function DashboardAnimals() {

    const { t } = useTranslation("common");
    let navigate = useNavigate();
    const routeLearnCat = () => {
        let path = `/learn-cat`;
        navigate(path);
    }
    const routeLearnDog = () => {
        let path = `/learn-dog`;
        navigate(path);
    }
    const routeLearnLion = () => {
        let path = `/learn-lion`;
        navigate(path);
    }
    const routeLearnCow = () => {
        let path = `/learn-cow`;
        navigate(path);
    }

    const animals = [
        {
            id: 1,
            name: t("learnCat"),
            description: t("learnAnimalDesc", { animal: "cat" }),
            image: "images/sign-language.jpg",
            icon: <FaCat />,
            onClick: routeLearnCat,
            available: true
        },
        {
            id: 2,
            name: t("learnDog"),
            description: t("learnAnimalDesc", { animal: "dog" }),
            image: "images/sign-language.jpg",
            icon: <FaDog />,
            onClick: routeLearnDog,
            available: true
        },
        {
            id: 3,
            name: t("learnLion"),
            description: t("learnAnimalDesc", { animal: "lion" }),
            image: "images/sign-language.jpg",
            icon: <FaCrown />,
            onClick: routeLearnLion,
            available: true
        },
        {
            id: 4,
            name: t("learnCow"),
            description: t("learnAnimalDesc", { animal: "cow" }),
            image: "images/sign-language.jpg",
            icon: <FaPaw />,
            onClick: routeLearnCow,
            available: true
        },
        {
            id: 5,
            name: t("learnHorse"),
            description: t("learnAnimalDesc", { animal: "horse" }),
            image: "images/sign-language.jpg",
            icon: <FaHorse />,
            onClick: null,
            available: false
        },
        {
            id: 6,
            name: t("learnFish"),
            description: t("learnAnimalDesc", { animal: "fish" }),
            image: "images/sign-language.jpg",
            icon: <FaFish />,
            onClick: null,
            available: false
        }
    ];

    return (
        <div className="animals-dashboard">
            <div className="animals-header">
                <h1>{t("chooseSignLanguage")}</h1>
            </div>
            <div className="animals-grid">
                {animals.map((animal) => (
                    <div 
                        key={animal.id}
                        className={`animal-card ${!animal.available ? 'coming-soon' : ''}`}
                        onClick={animal.available ? animal.onClick : undefined}
                    >
                        <div className="animal-card-image">
                            <img src={animal.image} alt={animal.name} />
                        </div>
                        <div className="animal-card-body">
                            <h5 className="animal-card-title">
                                {animal.icon}
                                <span className="ms-2">{animal.name}</span>
                            </h5>
                            <p className="animal-card-text">{animal.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

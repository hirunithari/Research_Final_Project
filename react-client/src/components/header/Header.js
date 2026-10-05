import React, { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import { FaChild, FaUser, FaSignOutAlt, FaBars, FaTimes, FaChevronDown } from "react-icons/fa";
import { auth } from '../../firebase';
import { signOut } from 'firebase/auth';
<<<<<<< HEAD
import { useNavigate, Link, useLocation } from 'react-router-dom'; 
=======
import { useNavigate, Link, useLocation } from 'react-router-dom';
>>>>>>> eb53dfd910c3a99e0e13928afec640eab2bab240
import { onAuthStateChanged } from 'firebase/auth';
import "./header.css";

const NAV_ITEMS = [
<<<<<<< HEAD
  // { label: "Home", to: "/home" },
=======
  { label: "Home", to: "/home" },
>>>>>>> eb53dfd910c3a99e0e13928afec640eab2bab240
  {
    label: "Static Signs",
    children: [
      { label: "Dashboard", to: "/static-sign-dashboard" },
      { label: "Learn Letters", to: "/learn-static-sign" },
      { label: "Sign Game", to: "/static-sign-game" },
      { label: "Leaderboard", to: "/leaderboard" },
    ],
  },
  {
    label: "Animal Signs",
    children: [
      { label: "Dashboard", to: "/dashboard-animals" },
      { label: "Cat", to: "/learn-cat" },
      { label: "Dog", to: "/learn-dog" },
      { label: "Lion", to: "/learn-lion" },
      { label: "Cow", to: "/learn-cow" },
    ],
  },
  { label: "Traffic Signs", to: "/traffic-signs" },
<<<<<<< HEAD
  { label: "Text to Sign", to: "/textSign" },
=======
  { label: "Colors", to: "/learnColor" },
  { label: "Text to Sign", to: "/textSign" },
  { label: "Chatbot", to: "/chatbot" },
>>>>>>> eb53dfd910c3a99e0e13928afec640eab2bab240
  { label: "Guardian", to: "/guardian-dashboard" },
];

export default function Header() {
  const { i18n } = useTranslation("common");
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const navRef = useRef(null);

  useEffect(() => {
    const currentLanguage = localStorage.getItem("i18nextLng") || "si";
    i18next.changeLanguage(currentLanguage);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLanguageChange = (e) => {
    i18n.changeLanguage(e.target.value);
    localStorage.setItem("i18nextLng", e.target.value);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout Error:', error.message);
    }
  };

  const isActive = (to) => location.pathname === to;
  const isGroupActive = (children) => children?.some(c => location.pathname === c.to);

  return (
    <section className={`navbar-section ${isScrolled ? 'scrolled' : ''}`}>
      <div className="nav-inner">

        {/* Brand */}
        <Link className="navbar-brand" to="/">
          Silent Scholars <FaChild />
        </Link>

        {/* Desktop nav links */}
        {isLoggedIn && (
          <nav className="nav-links" ref={navRef}>
            {NAV_ITEMS.map((item) =>
              item.children ? (
                <div
                  key={item.label}
                  className={`nav-dropdown ${isGroupActive(item.children) ? 'active' : ''} ${openDropdown === item.label ? 'open' : ''}`}
                  onMouseEnter={() => setOpenDropdown(item.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    className="nav-link-btn"
                    onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                  >
                    {item.label} <FaChevronDown className="nav-chevron" />
                  </button>
                  <div className="nav-dropdown-menu">
                    {item.children.map((child) => (
                      <Link
                        key={child.to}
                        to={child.to}
                        className={`nav-dropdown-item ${isActive(child.to) ? 'active' : ''}`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`nav-link-btn ${isActive(item.to) ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              )
            )}
          </nav>
        )}

        {/* Right side */}
        <div className="nav-right">
          <select
            className="form-select"
            value={localStorage.getItem("i18nextLng") || "si"}
            onChange={handleLanguageChange}
          >
<<<<<<< HEAD
            { <option value="en">English</option> }
=======
            <option value="en">English</option>
>>>>>>> eb53dfd910c3a99e0e13928afec640eab2bab240
            <option value="si">Sinhala</option>
          </select>

          {isLoggedIn && (
            <>
              <Link className="btn btn-outline-light" to="/profile-settings">
                <FaUser /> Profile
              </Link>
              <button className="btn btn-danger" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
<<<<<<< HEAD
              
=======
>>>>>>> eb53dfd910c3a99e0e13928afec640eab2bab240
            </>
          )}

          {/* Mobile hamburger */}
          {isLoggedIn && (
            <button className="nav-hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <FaTimes /> : <FaBars />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {isLoggedIn && mobileOpen && (
        <div className="nav-mobile">
          {NAV_ITEMS.map((item) =>
            item.children ? (
              <div key={item.label} className="nav-mobile-group">
                <button
                  className="nav-mobile-group-btn"
                  onClick={() => setOpenDropdown(openDropdown === item.label ? null : item.label)}
                >
                  {item.label} <FaChevronDown className={`nav-chevron ${openDropdown === item.label ? 'rotated' : ''}`} />
                </button>
                {openDropdown === item.label && (
                  <div className="nav-mobile-children">
                    {item.children.map((child) => (
                      <Link
                        key={child.to}
                        to={child.to}
                        className={`nav-mobile-item ${isActive(child.to) ? 'active' : ''}`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-mobile-item ${isActive(item.to) ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            )
          )}
        </div>
      )}
    </section>
  );
}

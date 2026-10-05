import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import './footer.css';

const Footer = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription:', email);
    setEmail('');
    // You can add toast notification here
  };

  return (
    <footer className="modern-footer">
      {/* Social Media Section */}
      <section className="social-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <p className="social-text">{t('Follow Us') || 'Follow us on social media'}</p>
            </div>
            <div className="col-lg-6">
              <div className="social-links">
                <a href="#" className="social-link" aria-label="Facebook">
                  <FaFacebook />
                </a>
                <a href="#" className="social-link" aria-label="Twitter">
                  <FaTwitter />
                </a>
                <a href="#" className="social-link" aria-label="Instagram">
                  <FaInstagram />
                </a>
                <a href="#" className="social-link" aria-label="LinkedIn">
                  <FaLinkedin />
                </a>
                <a href="#" className="social-link" aria-label="WhatsApp">
                  <FaWhatsapp />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Footer */}
      <section className="footer-content">
        <div className="container">
          <div className="row">
            {/* Company Info */}
            <div className="col-lg-4 col-md-6 mb-4">
              <div className="footer-section">
                <h1 className="footer-brand">Silent Scholars</h1>
                <p className="footer-description">
                  {t('empoweringIndividuals')}
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="col-lg-2 col-md-6 mb-4">
              <div className="footer-section">
                <h5>{t('quickLinks')}</h5>
                <ul className="footer-links">
                  <li><Link to="/home">{t('home')}</Link></li>
                  <li><Link to="/dashboard">{t('dashboard')}</Link></li>
                  <li><Link to="/traffic-signs">{t('trafficSigns')}</Link></li>
                  <li><Link to="/static-signs">{t('staticSigns')}</Link></li>
                  <li><Link to="/guardian-dashboard">{t('guardianDashboard')}</Link></li>
                </ul>
              </div>
            </div>

            {/* Services */}
            <div className="col-lg-2 col-md-6 mb-4">
              <div className="footer-section">
                <h5>{t('Services')}</h5>
                <ul className="footer-links">
                  <li><Link to="/traffic-signs">{t('trafficSignLearning')}</Link></li>
                  <li><Link to="/static-signs">{t('staticSignPractice')}</Link></li>
                  <li><Link to="/chatbot">{t('aiChatbot')}</Link></li>
                  <li><Link to="/guardian-dashboard">{t('progressTracking')}</Link></li>
                  <li><Link to="/profile-settings">{t('profileManagement')}</Link></li>
                </ul>
              </div>
            </div>

            {/* Contact Info */}
            <div className="col-lg-2 col-md-6 mb-4">
              <div className="footer-section">
                <h5>{t('contact')}</h5>
                <ul className="contact-info">
                  <li>
                    <FaMapMarkerAlt className="icon" />
                    <span>{t('colomboSriLanka')}</span>
                  </li>
                  <li>
                    <FaPhone className="icon" />
                    <span>+94 11 234 5678</span>
                  </li>
                  <li>
                    <FaEnvelope className="icon" />
                    <span>info@silentscholars.com</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Newsletter */}
            <div className="col-lg-2 col-md-6 mb-4">
              <div className="footer-section">
                <h5>{t('newsletter')}</h5>
                <p style={{ color: "var(--text-light)", fontSize: "0.9rem", marginBottom: "1rem" }}>
                  {t('stayUpdated')}
                </p>
                <form className="newsletter-form" onSubmit={handleNewsletterSubmit}>
                  <input
                    type="email"
                    className="newsletter-input"
                    placeholder={t('enterEmail')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button type="submit" className="newsletter-btn">
                    {t('subscribe')}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Footer */}
      <section className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p className="copyright">
              {t('copyright')}
            </p>
            <ul className="footer-bottom-links">
              <li><Link to="/privacy">{t('privacyPolicy')}</Link></li>
              <li><Link to="/terms">{t('termsOfService')}</Link></li>
              <li><Link to="/support">{t('support')}</Link></li>
              <li><Link to="/about">{t('aboutUs')}</Link></li>
            </ul>
          </div>
        </div>
      </section>
    </footer>
  );
}

export default Footer;

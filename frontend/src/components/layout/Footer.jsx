import { Link } from 'react-router-dom';
import './ModernLayout.css';

const Footer = () => {
    return (
        <footer className="modern-footer">
            <div className="footer-top">
                <div className="footer-container">
                    <div className="footer-grid">
                        
                        {/* Brand Column */}
                        <div className="footer-brand-col">
                            <Link to="/" className="footer-logo">
                                <div className="logo-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                        <line x1="16" y1="2" x2="16" y2="6" />
                                        <line x1="8" y1="2" x2="8" y2="6" />
                                        <line x1="3" y1="10" x2="21" y2="10" />
                                    </svg>
                                </div>
                                <span className="logo-text">EventMatrix</span>
                            </Link>
                            <p className="footer-description">
                                The ultimate Smart Campus event management platform. Discover, register, and manage campus events with seamless efficiency and modern convenience.
                            </p>
                            <div className="social-links">
                                <a href="#" aria-label="Twitter">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                                </a>
                                <a href="#" aria-label="GitHub">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
                                </a>
                                <a href="#" aria-label="LinkedIn">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                                </a>
                            </div>
                        </div>

                        {/* Links Columns */}
                        <div className="footer-links-col">
                            <h4 className="footer-heading">Platform</h4>
                            <ul>
                                <li><Link to="/feed">Browse Events</Link></li>
                                <li><Link to="/">Dashboard</Link></li>
                                <li><Link to="/create">Host an Event</Link></li>
                                <li><Link to="/calendar">Calendar View</Link></li>
                            </ul>
                        </div>

                        <div className="footer-links-col">
                            <h4 className="footer-heading">Resources</h4>
                            <ul>
                                <li><Link to="/help">Help Center</Link></li>
                                <li><Link to="/guidelines">Event Guidelines</Link></li>
                                <li><Link to="/faq">FAQ</Link></li>
                                <li><Link to="/contact">Contact Support</Link></li>
                            </ul>
                        </div>

                        <div className="footer-links-col">
                            <h4 className="footer-heading">Legal</h4>
                            <ul>
                                <li><Link to="/privacy">Privacy Policy</Link></li>
                                <li><Link to="/terms">Terms of Service</Link></li>
                                <li><Link to="/cookies">Cookie Policy</Link></li>
                            </ul>
                        </div>
                        
                    </div>
                </div>
            </div>
            
            <div className="footer-bottom">
                <div className="footer-container">
                    <div className="footer-bottom-content">
                        <p>&copy; {new Date().getFullYear()} EventMatrix Platform. All rights reserved.</p>
                        <div className="footer-badges">
                            <span className="footer-badge">SmartCampus Initiative</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

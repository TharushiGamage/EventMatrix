import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './ModernLayout.css';

const Header = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    // Handle scroll effect for glassmorphism
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location]);

    return (
        <header className={`modern-header ${scrolled ? 'header-scrolled' : ''}`}>
            <div className="header-container">
                {/* Logo */}
                <Link to="/" className="header-logo">
                    <div className="logo-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                            <path d="M8 14h.01" />
                            <path d="M12 14h.01" />
                            <path d="M16 14h.01" />
                            <path d="M8 18h.01" />
                            <path d="M12 18h.01" />
                            <path d="M16 18h.01" />
                        </svg>
                    </div>
                    <span className="logo-text">EventMatrix</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="header-nav-desktop">
                    <Link to="/" className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}>Dashboard</Link>
                    <Link to="/feed" className={location.pathname.includes('/feed') ? 'nav-link active' : 'nav-link'}>Browse Events</Link>
                    <Link to="/about" className={location.pathname === '/about' ? 'nav-link active' : 'nav-link'}>About Us</Link>
                </nav>

                {/* Right Actions */}
                <div className="header-actions">
                    <button className="btn-icon" aria-label="Notifications">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        <span className="notification-badge"></span>
                    </button>
                    
                    <div className="user-profile-menu">
                        <div className="avatar">
                            <span className="avatar-initial">T</span>
                        </div>
                        <div className="user-info">
                            <span className="user-name">Thilina</span>
                            <span className="user-role">Student</span>
                        </div>
                        <svg className="dropdown-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 12 15 18 9" />
                        </svg>
                    </div>

                    {/* Mobile Menu Toggle */}
                    <button 
                        className="mobile-menu-btn" 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle Menu"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {mobileMenuOpen ? (
                                <>
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </>
                            ) : (
                                <>
                                    <line x1="3" y1="12" x2="21" y2="12" />
                                    <line x1="3" y1="6" x2="21" y2="6" />
                                    <line x1="3" y1="18" x2="21" y2="18" />
                                </>
                            )}
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Dropdown */}
            <div className={`mobile-nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
                <nav className="mobile-nav-links">
                    <Link to="/" className={location.pathname === '/' ? 'mobile-link active' : 'mobile-link'}>Dashboard</Link>
                    <Link to="/feed" className={location.pathname.includes('/feed') ? 'mobile-link active' : 'mobile-link'}>Browse Events</Link>
                    <Link to="/about" className={location.pathname === '/about' ? 'mobile-link active' : 'mobile-link'}>About Us</Link>
                    <div className="mobile-divider"></div>
                    <Link to="/profile" className="mobile-link">My Profile</Link>
                    <Link to="/settings" className="mobile-link">Settings</Link>
                    <button className="mobile-link text-danger">Sign Out</button>
                </nav>
            </div>
        </header>
    );
};

export default Header;

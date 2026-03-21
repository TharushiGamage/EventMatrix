import './Footer.css';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="site-footer-grid">
        <div className="footer-col brand-col">
          <h3>EventMatrix</h3>
          <p>Your premier platform for organizing and discovering campus events effortlessly.</p>
        </div>
        
        <div className="footer-col">
          <h4>Platform</h4>
          <a href="/">Dashboard</a>
          <a href="/feed">Browse Events</a>
        </div>
        
        <div className="footer-col">
          <h4>Legal & Policies</h4>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Community Guidelines</a>
        </div>
        
        <div className="footer-col">
          <h4>Connect</h4>
          <a href="#">Support Center</a>
          <a href="mailto:hello@eventmatrix.camp">Email Us</a>
          <a href="#">FAQs</a>
        </div>
      </div>
      
      <div className="site-footer-bottom">
        <p>&copy; {new Date().getFullYear()} EventMatrix. All rights reserved. Designed for smarter campuses.</p>
      </div>
    </footer>
  );
};

export default Footer;

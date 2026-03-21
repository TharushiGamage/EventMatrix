import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
            <Header />
            {/* We add top padding equivalent to the fixed header's height (76px) so content isn't hidden underneath it */}
            <main style={{ flex: 1, paddingTop: '76px', display: 'flex', flexDirection: 'column' }}>
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;

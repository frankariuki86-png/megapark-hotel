import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AdminProvider } from './context/AdminContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import UserProfile from './components/UserProfile';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import './styles/global.css';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <CartProvider>
          <UserProvider>
            <AdminProvider>
              <Router basename="/megapark-hotel">
                <Routes>
                  <Route path="/admin/login" element={<AdminLogin />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="*" element={
                    <>
                      <Header />
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/orders" element={<Orders />} />
                        <Route path="/profile" element={<UserProfile />} />
                      </Routes>
                      <Footer />
                    </>
                  } />
                </Routes>
              </Router>
            </AdminProvider>
          </UserProvider>
        </CartProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;

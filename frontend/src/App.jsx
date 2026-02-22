import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { UserProvider } from './context/UserContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AdminProvider } from './context/AdminContext';
import Header from './components/Header';
import Footer from './components/Footer';
import SEO from './components/SEO';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import UserProfile from './components/UserProfile';
import PaymentPage from './pages/PaymentPage';
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
                  <Route path="/admin/login" element={
                    <>
                      <SEO 
                        title="Admin Login - Megapark Resort"
                        description="Admin login page for Megapark Resort management system"
                      />
                      <AdminLogin />
                    </>
                  } />
                  <Route path="/admin/dashboard" element={
                    <>
                      <SEO 
                        title="Admin Dashboard - Megapark Resort"
                        description="Admin dashboard for managing rooms, bookings, and orders at Megapark Resort"
                      />
                      <AdminDashboard />
                    </>
                  } />
                  <Route path="*" element={
                    <>
                      <Header />
                      <Routes>
                        <Route path="/" element={
                          <>
                            <SEO 
                              title="Megapark Resort - Book Rooms, Events & Authentic Kenyan Cuisine"
                              description="Megapark Resort offers comfortable accommodation, event venues, and authentic Kenyan cuisine. Book your stay, event, or meal today!"
                              url="https://megapark-hotel.com/"
                              keywords="hotel Kenya, accommodation Nairobi, event venue, restaurant, rooms booking"
                            />
                            <Home />
                          </>
                        } />
                        <Route path="/checkout" element={
                          <>
                            <SEO 
                              title="Checkout - Megapark Resort"
                              description="Complete your booking at Megapark Resort. Secure checkout for rooms, events, and food orders."
                              url="https://megapark-hotel.com/checkout"
                            />
                            <Checkout />
                          </>
                        } />
                        <Route path="/payment" element={
                          <>
                            <PaymentPage />
                          </>
                        } />
                        
                        <Route path="/orders" element={
                          <>
                            <SEO 
                              title="My Orders - Megapark Resort"
                              description="View and manage your orders at Megapark Resort. Track your bookings and payments."
                              url="https://megapark-hotel.com/orders"
                            />
                            <Orders />
                          </>
                        } />
                        <Route path="/profile" element={
                          <>
                            <SEO 
                              title="My Profile - Megapark Resort"
                              description="Manage your profile and preferences at Megapark Resort."
                              url="https://megapark-hotel.com/profile"
                            />
                            <UserProfile />
                          </>
                        } />
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

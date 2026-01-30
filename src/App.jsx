import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { UserProvider } from './context/UserContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import UserProfile from './components/UserProfile';
import './styles/global.css';

function App() {
  return (
    <CartProvider>
      <UserProvider>
        <Router basename="/megapark-hotel">
          <Header />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/profile" element={<UserProfile />} />
          </Routes>
          <Footer />
        </Router>
      </UserProvider>
    </CartProvider>
  );
}

export default App;

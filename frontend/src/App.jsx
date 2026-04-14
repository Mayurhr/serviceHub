import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';

import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import ProvidersPage from './pages/ProvidersPage';
import ProviderProfilePage from './pages/ProviderProfilePage';
import BookingPage from './pages/BookingPage';
import BookingStatusPage from './pages/BookingStatusPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProviderLoginPage from './pages/ProviderLoginPage';

import MyBookingsPage from './pages/user/MyBookingsPage';
import DashboardPage from './pages/user/DashboardPage';
import ProfilePage from './pages/user/ProfilePage';
import InvoicePage from './pages/user/InvoicePage';
import ChatPage from './pages/user/ChatPage';

import ProviderDashboardPage from './pages/provider/ProviderDashboardPage';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminServices from './pages/admin/AdminServices';
import AdminProviders from './pages/admin/AdminProviders';
import AdminBookings from './pages/admin/AdminBookings';
import AdminUsers from './pages/admin/AdminUsers';

const Guard = ({ children, adminOnly = false, providerOnly = false }) => {
  const { user, isAdmin, isProvider } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && !isAdmin) return <Navigate to="/" />;
  if (providerOnly && !isProvider) return <Navigate to="/" />;
  return children;
};

const Layout = () => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <main className="flex-1">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:slug" element={<ServiceDetailPage />} />
        <Route path="/providers" element={<ProvidersPage />} />
        <Route path="/providers/:id" element={<ProviderProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/provider-login" element={<ProviderLoginPage />} />

        <Route path="/book/:slug" element={<Guard><BookingPage /></Guard>} />
        <Route path="/booking/:id" element={<Guard><BookingStatusPage /></Guard>} />
        <Route path="/my-bookings" element={<Guard><MyBookingsPage /></Guard>} />
        <Route path="/dashboard" element={<Guard><DashboardPage /></Guard>} />
        <Route path="/profile" element={<Guard><ProfilePage /></Guard>} />
        <Route path="/invoice/:id" element={<Guard><InvoicePage /></Guard>} />
        <Route path="/chat/:bookingId" element={<Guard><ChatPage /></Guard>} />

        <Route path="/provider/dashboard" element={<Guard providerOnly><ProviderDashboardPage /></Guard>} />

        <Route path="/admin" element={<Guard adminOnly><AdminDashboard /></Guard>} />
        <Route path="/admin/services" element={<Guard adminOnly><AdminServices /></Guard>} />
        <Route path="/admin/providers" element={<Guard adminOnly><AdminProviders /></Guard>} />
        <Route path="/admin/bookings" element={<Guard adminOnly><AdminBookings /></Guard>} />
        <Route path="/admin/users" element={<Guard adminOnly><AdminUsers /></Guard>} />
      </Routes>
    </main>
    <Footer />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px', fontFamily: 'DM Sans, sans-serif', fontWeight: '500' } }} />
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  );
}

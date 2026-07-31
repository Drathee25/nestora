import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { LenisProvider } from './lib/LenisContext';
import { AuthProvider } from './context/AuthContext';

import Home from './pages/Home';
import Listings from './pages/Listings';
import PropertyDetail from './pages/PropertyDetail';
import MapPage from './pages/MapPage';
import Contact from './pages/Contact';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import RequireAuth from './components/RequireAuth';

export default function App() {
  return (
    <LenisProvider>
      <AuthProvider>
        <Navbar />
        <main className="pt-16 min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/listings/:id" element={<PropertyDetail />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <RequireAuth>
                  <AdminDashboard />
                </RequireAuth>
              }
            />
          </Routes>
        </main>
        <Footer />
      </AuthProvider>
    </LenisProvider>
  );
}

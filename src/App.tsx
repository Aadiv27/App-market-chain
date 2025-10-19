
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import JoinRetailerPage from './pages/JoinRetailerPage';
import JoinAdminPage from './pages/JoinAdminPage';
import AIFeaturesPage from './pages/AIFeaturesPage';
import TestPage from './pages/TestPage';
import TestVehiclePage from './pages/TestVehiclePage';
import SimpleVehiclePage from './pages/SimpleVehiclePage';
import JoinVehiclePageFixed from './pages/JoinVehiclePageFixed';
import NavigationTest from './pages/NavigationTest';
import RetailerDashboard from './components/RoleDashboards/RetailerDashboard';
import WholesalerDashboard from './components/RoleDashboards/WholesalerDashboard';
import VehicleDashboard from './components/RoleDashboards/VehicleDashboard';
import AdminDashboard from './components/RoleDashboards/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import JoinWholesalerPage from './pages/joinWholesalerpage';
import TestDataSeeder from './components/TestDataSeeder';
import './utils/authTest'; // Load auth test utilities

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/test" element={<TestPage />} />
              <Route path="/test-vehicle" element={<TestVehiclePage />} />
              <Route path="/simple-vehicle" element={<SimpleVehiclePage />} />
              <Route path="/join-vehicle-fixed" element={<JoinVehiclePageFixed />} />
              <Route path="/nav-test" element={<NavigationTest />} />
              <Route path="/test-data" element={<TestDataSeeder />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/ai-features" element={<AIFeaturesPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/join-retailer" element={<JoinRetailerPage />} />
              <Route path="/join-vehicle" element={<JoinVehiclePageFixed />} />
              <Route path="/join-wholesaler" element={<JoinWholesalerPage />} />
              <Route path="/join-admin" element={<JoinAdminPage />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DashboardPage />
                </ProtectedRoute>
              } />
              <Route path="/admin-dashboard" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/retailer-dashboard" element={
                <ProtectedRoute allowedRoles={['retailer']}>
                  <RetailerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/wholesaler-dashboard" element={
                <ProtectedRoute allowedRoles={['wholesaler']}>
                  <WholesalerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/vehicle-dashboard" element={
                <ProtectedRoute allowedRoles={['vehicle_owner']}>
                  <VehicleDashboard />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
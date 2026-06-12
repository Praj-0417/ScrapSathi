import React from "react";
import {BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Service  from "./pages/Service";
import Navbar  from './components/Navbar';
import Footer from "./components/Footer"
import UserDashboard from "./pages/UserDashboard";
import { LoginProvider } from './components/LoginContext';
import { Error } from './pages/Error';
import SellWaste from './pages/SellWaste';
import SupportUs from './pages/SupportUs';
import LearningCentre from "./pages/LearningCentre";
import WasteCollectorRequests from './pages/WasteCollectorRequests';
import WasteCollectorDashboard from "./pages/WasteCollectorDashboard";
import EditProfile from './pages/EditProfile';
import ProfileView from './pages/UserProfile';
import AdvancedDashboard from './pages/AdvancedDashboard'
import BigOrganizationDashboard from "./pages/big-organization";
import RecycleCompanyDashboard from "./pages/recycle-company";
import ForgotPassword from "./pages/Forget";
import UpdatePassword from "./pages/updatePassword";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import FloatingChatWidget from "./pages/FloatingChatWidget";
import ProtectedRoute from './components/ProtectedRoute';

function App() {
 
  return (
    <>
    <BrowserRouter>
      <LoginProvider>
          <Navbar />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
          <FloatingChatWidget/>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/services" element={<Service />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgotPassword" element={<ForgotPassword />} />
          <Route path="/updatePassword" element={<UpdatePassword />} />
          <Route path="/learning" element={<LearningCentre />} />

          {/* Protected Routes */}
          <Route path="/individual-dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
          <Route path="/sellWaste" element={<ProtectedRoute><SellWaste /></ProtectedRoute>} />
          <Route path="/donate" element={<ProtectedRoute><SupportUs /></ProtectedRoute>} />
          <Route path="/waste-collector-requests" element={<ProtectedRoute><WasteCollectorRequests /></ProtectedRoute>} />
          <Route path="/waste-collector-dashboard" element={<ProtectedRoute><WasteCollectorDashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfileView /></ProtectedRoute>} />
          <Route path="/editProfile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
          <Route path="/AdvancedDashboard" element={<ProtectedRoute><AdvancedDashboard /></ProtectedRoute>} />
          <Route path="/organization-dashboard" element={<ProtectedRoute><BigOrganizationDashboard /></ProtectedRoute>} />
          <Route path="/recycle-company-dashboard" element={<ProtectedRoute><RecycleCompanyDashboard /></ProtectedRoute>} />

          <Route path="*" element={<Error />} />
        </Routes>
        <Footer />
      </LoginProvider>
    </BrowserRouter>
    </>
  );
}

export default App

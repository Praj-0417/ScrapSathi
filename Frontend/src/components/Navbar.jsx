import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import PropTypes from "prop-types";
import { useLogin } from "./LoginContext";

const Navbar = ({ to, label, onClick }) => {
  const { loggedIn, user, logout } = useLogin();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  // New state for side drawer

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  Navbar.propTypes = {
    label: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
    onClick: PropTypes.string.isRequired,
  };
  // Enhanced NavLink Component with improved hover effect
  const NavLink = ({ to, label, onClick }) => (
    <Link
      to={to}
      onClick={onClick}
      className="relative text-gray-700 font-medium hover:text-green-600 transition duration-300 group py-2"
    >
      {label}
      <span className="absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r from-green-600 to-blue-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
    </Link>
  );

  return (
    <nav
      className={`fixed z-50 top-0 left-0 w-full transition-all duration-300 bg-white py-4`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex justify-between items-center">
          {/* Logo with animation */}
          <Link
            to="/"
            className="text-3xl font-extrabold bg-gradient-to-r from-green-600 to-blue-600 text-transparent bg-clip-text hover:scale-105 transition-transform duration-300"
          >
            ScrapSathi
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/" label="Home" />
            <NavLink to="/about" label="About" />
            <NavLink to="/services" label="Services" />
            <NavLink to="/contact" label="Contact" />

            {loggedIn ? (
              <>
                <img
                  alt="img"
                  className="img hidden md:block"
                  src="/images/dp_logo.jpg"
                  width="50"
                  height="50"
                />
              </>
            ) : (
              <>
                {/* <img
                  alt="img"
                  className="img hidden sm:block"
                  src="/images/dp_logo.jpg"
                  width="50"
                  height="50"
                /> */}
                <ul className="nav-item login-item">
                  <Link
                    to="/login"
                    className="bg-gradient-to-r from-green-600 to-blue-500 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:scale-105 transition-transform duration-300 flex items-center justify-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Login / Signup
                  </Link>
                </ul>
              </>
            )}

            {/* Button to trigger side drawer for extra links */}
            <button
              className="text-gray-700 focus:outline-none hover:text-green-600 transition-colors duration-300"
              onClick={() => setSideDrawerOpen(!sideDrawerOpen)}
              aria-label={sideDrawerOpen ? "Close menu" : "Open menu"}
            >
              {sideDrawerOpen ? (
                <XMarkIcon className="h-7 w-7 transition-transform duration-300 rotate-90" />
              ) : (
                <Bars3Icon className="h-7 w-7 transition-transform duration-300" />
              )}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 focus:outline-none hover:text-green-600 transition-colors duration-300"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? (
              <XMarkIcon className="h-7 w-7 transition-transform duration-300 rotate-90" />
            ) : (
              <Bars3Icon className="h-7 w-7 transition-transform duration-300 hover:rotate-180" />
            )}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            isOpen
              ? "max-h-96 opacity-100 translate-y-0"
              : "max-h-0 opacity-0 -translate-y-4"
          }`}
        >
          <div className="flex flex-col items-center space-y-5 py-4">
            <NavLink to="/" label="Home" onClick={() => setIsOpen(false)} />
            <NavLink
              to="/about"
              label="About"
              onClick={() => setIsOpen(false)}
            />
            <NavLink
              to="/services"
              label="Services"
              onClick={() => setIsOpen(false)}
            />
            <NavLink
              to="/contact"
              label="Contact"
              onClick={() => setIsOpen(false)}
            />

            {loggedIn ? (
              <>
                {/* Hide profile image on small screens */}
                <img
                  alt="img"
                  className="img hidden md:block"
                  src="/images/dp_logo.jpg"
                  width="50"
                  height="50"
                />
              </>
            ) : (
              <>
                {/* <img
                  alt="img"
                  className="img hidden sm:block"
                  src="/images/dp_logo.jpg"
                  width="50"
                  height="50"
                /> */}
                <ul className="nav-item login-item">
                  <Link
                    to="/login"
                    className="bg-gradient-to-r from-green-600 to-blue-500 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:scale-105 transition-transform duration-300 flex items-center justify-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Login / Signup
                  </Link>
                </ul>
              </>
            )}
          </div>
        </div>

        {/* Side Drawer for extra links (visible on desktop) */}
        <div
          className={`absolute top-[67px] right-0 w-64 h-full transform transition-transform duration-300 ease-in-out z-40 ${
            sideDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="bg-white min-h-screen flex flex-col items-center space-y-5 py-4">
            {loggedIn ? (
              <>
                <span className="text-green-500 italic text-lg font-bold mx-1">
                  {user.name}
                </span>

                {user.userType === 'individual' ? (
                    <>
                      <NavLink to="/profile" label="Profile" onClick={() => setSideDrawerOpen(false)} />
                      <NavLink to="/individual-dashboard" label="Dashboard" onClick={() => setSideDrawerOpen(false)} />
                      <NavLink to="/sellWaste" label="Schedule Pickup" onClick={() => setSideDrawerOpen(false)} />
                    </>
                  ) : user.userType === 'waste-collector' ? (
                    <>
                      <NavLink to="/profile" label="Profile" onClick={() => setSideDrawerOpen(false)} />
                      <NavLink to="/waste-collector-dashboard" label="Dashboard" onClick={() => setSideDrawerOpen(false)} />
                      <NavLink to="/waste-collector-requests" label="Requests" onClick={() => setSideDrawerOpen(false)} />
                      {/* <NavLink to="/wasteCollectorRegistration" label="Register as waste collector" onClick={() => setSideDrawerOpen(false)} /> */}
                    </>
                  ) : user.userType === 'big-organization' ?(
                    <>
                      <NavLink to="/profile" label="Profile" onClick={() => setSideDrawerOpen(false)} />
                      <NavLink to="/organization-dashboard" label="Dashboard" onClick={() => setSideDrawerOpen(false)} />
                      <NavLink to="/wasteRequest" label="Schedule Pickup" onClick={() => setSideDrawerOpen(false)} />
                      {/* <NavLink to="/organizationRegistration" label="Register your organization" onClick={() => setSideDrawerOpen(false)} /> */}
                    </>
                  ) : user.userType === 'recycle-company' ?(
                    <>
                    <NavLink to="profile" label="Profile" onClick={() => setSideDrawerOpen(false)} />
                    <NavLink to="/recycle-company-dashboard" label="Dashboard" onClick={() => setSideDrawerOpen(false)} />
                    <NavLink to="/recycleCompanyDemand" label="Raise your Demand" onClick={() => setSideDrawerOpen(false)} />
                    {/* <NavLink to="/recycleCompanyRegistration" label="Register your Company" onClick={() => setSideDrawerOpen(false)} /> */}
                    </>
                ) : (
                  <>
                    <NavLink
                      to="/profile"
                      label="Profile"
                      onClick={() => setSideDrawerOpen(false)}
                    />
                    <NavLink
                      to="/wasteRequest"
                      label="Waste Collector Request"
                      onClick={() => setSideDrawerOpen(false)}
                    />
                    <NavLink
                      to="/wasteCollectorRegistration"
                      label="Register as waste collector"
                      onClick={() => setSideDrawerOpen(false)}
                    />
                    <NavLink
                      to="/organizationRegistration"
                      label="Register your organization"
                      onClick={() => setSideDrawerOpen(false)}
                    />
                    <NavLink
                      to="/recycleCompanyRegistration"
                      label="Register your Company"
                      onClick={() => setSideDrawerOpen(false)}
                    />
                  </>
                )}
              </>
            ) : (
              "Welcome to ScrapSathi"
            )}
            <NavLink
              to="/learning"
              label="📘 Learning"
              onClick={() => setSideDrawerOpen(false)}
            />
            <NavLink
              to="/donate"
              label="🌱 Donate for Environment"
              onClick={() => setSideDrawerOpen(false)}
            />

            {loggedIn ? (
              <>
                <NavLink to="/login" label="LogOut" onClick={logout} />
              </>
            ) : (
              <>
                <ul className="nav-item login-item">
                  <Link
                    to="/login"
                    className="bg-gradient-to-r from-green-600 to-blue-500 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:scale-105 transition-transform duration-300 flex items-center justify-center"
                    onClick={() => setIsOpen(false)}
                  >
                    Login / Signup
                  </Link>
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Navbar.propTypes = {
//   label: PropTypes.string.isRequired,
//   to: PropTypes.string.isRequired,
//   onClick: PropTypes.string.isRequired,
// };
// // Enhanced NavLink Component with improved hover effect
// const NavLink = ({ to, label, onClick }) => (
//   <Link
//     to={to}
//     onClick={onClick}
//     className="relative text-gray-700 font-medium hover:text-green-600 transition duration-300 group py-2"
//   >
//     {label}
//     <span className="absolute left-0 bottom-0 w-full h-0.5 bg-gradient-to-r from-green-600 to-blue-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"></span>
//   </Link>
// );

export default Navbar;

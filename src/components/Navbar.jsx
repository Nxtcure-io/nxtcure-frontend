import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import NxtCureLogo from "../assets/logo-1.png";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);


  // Close dropdown when clicking outside
  useEffect(() => {
	 const handleClickOutside = (event) => {
		 if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
			 setDropdownOpen(false);
		 }
	 };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
	document.removeEventListener('mousedown', handleClickOutside);
  	};
  }, []);

  const handlePatientsClick = () => {
	navigate('/patients');
	setDropdownOpen(false);
	setMenuOpen(false);
  };

  const handleAboutClick = () => {
	navigate('/about');
	setDropdownOpen(false);
	setMenuOpen(false);
  };

  const handleFAQClick = () => {
	navigate('/faq');
	setDropdownOpen(false);
	setMenuOpen(false);
  };

  const scrollToSection = (sectionId) => {

	 const element = document.getElementById(sectionId);
	 if (element) {
		element.scrollIntoView({ behavior: 'smooth' });
	 }
	 setMenuOpen(false);
  };

  return (
    <header className="w-full shadow-sm sticky top-0 left-0 z-50 bg-white">
      <div className="max-w-[1440px] mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
	<Link to="/" className="flex items-center space-x-2">
          <img src={NxtCureLogo} alt="Nxt Cure Logo" className="h-10 w-auto" />
          <span className="cormorant text-2xl font-bold text-gray-800">
            NxtCure
          </span>
	 </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-8 items-center">
	 <Link
	   to="/"
            className="nav-txt text-gray-700 hover:text-blue-600 font-medium transition"
          >
            Home
	 </Link>
	 <button
           onClick={handleAboutClick}
            className="nav-txt text-gray-700 hover:text-blue-600 font-medium transition"
          >
            About
          </button>

          {/* Dropdown */}
          <div className="relative group" ref={dropdownRef}>
            <button 
	 	onClick={() => setDropdownOpen(!dropdownOpen)}
	 	className="nav-txt text-gray-700 hover:text-blue-600 font-medium transition cursor-pointer flrx items-center">
              NxtTrials
	     <ChevronDown
	 	className={`m1-1 transform transition-transform duration-200 ${
			dropdownOpen ? "rotate-180" : ""
		}`}
	 	size={16}
	 	/>
            </button>
	   {dropdownOpen && (
              <div className="absolute left-0 mt-2 w-40 bg-white shadow-lg rounded-md z-40 border border-gray-200">
                <button
                  onClick={handlePatientsClick}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                >
                  Patients
                </button>
                <button
                  onClick={() => scrollToSection('doctors')}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition"
                >
		   Physicians
                </button>
              </div>
            )}
          </div>

	<button
            onClick={handleFAQClick}
            className="nav-txt text-gray-700 hover:text-blue-600 font-medium transition"
          >
            FAQs
          </button>
        </nav>

        {/* Mobile Hamburger Icon */}
        <div className="md:hidden">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-800"
          >
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white px-6 py-4 space-y-4 shadow-md z-40">
          <Link to="/" className="block text-gray-700 font-medium"
	     onClick={() => setMenuOpen(false)}>
            Home
	  </Link>
	            <button 
           onClick={handleAboutClick}
            className="block text-gray-700 font-medium w-full text-left"
          >
            About
          </button>

          {/* Mobile Dropdown */}
          <div>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center justify-between w-full text-gray-700 font-medium"
            >
              <span>NxtTrials</span>
              <ChevronDown
                className={`ml-2 transform transition-transform duration-300 ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {dropdownOpen && (
              <div className="mt-2 pl-4 space-y-2">
		 <button
		   onClick={handlePatientsClick}
		   className="block text-gray-700 w-full text-left"
		>
                  Patients
		</button>
                <button
                  onClick={() => scrollToSection('doctors')}
                  className="block text-gray-700 w-full text-left"
                >
                  Physicians
                </button>
              </div>
            )}
          </div>
          <button
            onClick={handleFAQClick}
            className="block text-gray-700 font-medium w-full text-left"
          >
            FAQs
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;

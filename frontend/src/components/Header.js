import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [active, setActive] = useState('');
    const navigate = useNavigate();
    const location = useLocation();

    // 🔹 Update active tab based on current path
    useEffect(() => {
        if (location.pathname === '/') {
        setActive('Music');
        } else if (location.pathname === '/faqs') {
        setActive('FAQs');
        } else if (location.pathname === '/pricing') {
        setActive('Pricing');
        } else if (location.pathname === '/contact') {
        setActive('Contact');
        } else if (location.pathname === '/login') {
        setActive('Login');
        }
    }, [location.pathname]);

    
    return (
        <header className="bg-[#141414] text-white">
            <div className=" mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to={'/'}>
                        <div className="flex-shrink-0">
                            <h1 className="text-xl font-bold tracking-wide">LOGO</h1>
                        </div>
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:block">
                        <div className="flex items-center space-x-8">
                            <Link to={'/'} onClick={() => setActive('Music')} className={`${active === 'Music' ? 'text-white' : 'text-white/40'} hover:text-white transition-colors duration-200 cursor-pointer`}>
                                Music
                            </Link>
                            <Link to={'/faqs'} onClick={() => setActive('FAQs')} className={`${active === 'FAQs' ? 'text-white' : 'text-white/40'} hover:text-white transition-colors duration-200 cursor-pointer`}>
                                FAQs
                            </Link>
                            <Link to={'/pricing'} onClick={() => setActive('Pricing')} className={`${active === 'Pricing' ? 'text-white' : 'text-white/40'} hover:text-white transition-colors duration-200 cursor-pointer`}>
                                Pricing
                            </Link>
                            <Link to={'/contact'} onClick={() => setActive('Contact')} className={`${active === 'Contact' ? 'text-white' : 'text-white/40'} hover:text-white transition-colors duration-200 cursor-pointer`}>
                                Contact us
                            </Link>
                            <span className="text-white">|</span>
                            <Link to={'/login'} className="text-white transition-colors duration-200">
                                Login
                            </Link>
                            <button 
                                onClick={() => navigate("/login", { state: { openSignUp: true } })}
                                className="bg-white text-gray-900 px-4 py-2 rounded-[40px] font-medium hover:bg-gray-100 transition-colors duration-200"
                            >
                                Get Started
                            </button>
                        </div>
                    </nav>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button className="text-white focus:outline-none focus:text-white" onClick={() => setMenuOpen(!menuOpen)}>
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu (hidden by default) */}
            <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out
                    ${menuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
                `}>
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-700">
                    <Link to={'/'} onClick={() => setActive('Music')} className={`${active === 'Music' ? 'text-white' : 'text-gray-400'} hover:text-white transition-colors duration-200 cursor-pointer block px-3 py-2 text-base font-medium`}>
                        Music
                    </Link>
                    <Link to={'/'} onClick={() => setActive('FAQs')} className={`${active === 'FAQs' ? 'text-white' : 'text-gray-400'} hover:text-white transition-colors duration-200 cursor-pointer block px-3 py-2 text-base font-medium`}>
                        FAQs
                    </Link>
                    <Link to={'/'} onClick={() => setActive('Pricing')} className={`${active === 'Pricing' ? 'text-white' : 'text-gray-400'} hover:text-white transition-colors duration-200 cursor-pointer block px-3 py-2 text-base font-medium`}>
                        Pricing
                    </Link>
                    <Link to={'/'} onClick={() => setActive('Contact')} className={`${active === 'Contact' ? 'text-white' : 'text-gray-400'} hover:text-white transition-colors duration-200 cursor-pointer block px-3 py-2 text-base font-medium`}>
                        Contact us
                    </Link>
                    <Link to={'/login'} className={`${active === 'Login' ? 'text-white' : 'text-gray-400'} hover:text-white transition-colors duration-200 cursor-pointer block px-3 py-2 text-base font-medium`}>
                        Login
                    </Link>
                    <button 
                        onClick={() => navigate("/login", { state: { openSignUp: true } })}
                        className="bg-white text-gray-900 px-4 py-2 rounded-[40px] font-medium hover:bg-gray-100 transition-colors duration-200 ml-3 mt-2"
                    >
                        Get Started
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
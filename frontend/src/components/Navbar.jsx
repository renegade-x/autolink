import { Link, useNavigate } from 'react-router-dom';
import { Car, LogOut, LayoutDashboard, Sun, Moon, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) fetchUserRole(session.user.id);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) fetchUserRole(session.user.id);
            else setUserRole(null);
        });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            subscription.unsubscribe();
        };
    }, []);

    const fetchUserRole = async (userId) => {
        const { data } = await supabase.from('profiles').select('role').eq('id', userId).single();
        if (data) setUserRole(data.role);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/');
    };

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.6, ease: "circOut" }}
            className={`fixed w-full z-50 transition-all duration-500 ${isScrolled ? 'glass border-b border-white/20 py-3' : 'bg-gradient-to-b from-slate-900/50 to-transparent backdrop-blur-[2px] py-5'} `}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center group">
                            <motion.div
                                whileHover={{ rotate: 15, scale: 1.1 }}
                                className="p-2.5 bg-brand-500/10 dark:bg-white/5 rounded-xl backdrop-blur-sm border border-brand-200/20 dark:border-white/10"
                            >
                                <Car className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                            </motion.div>
                            <span className="ml-3 text-2xl font-display font-bold tracking-tight text-slate-900 dark:text-white">
                                Auto<span className="text-brand-600 dark:text-brand-400">Link</span>
                            </span>
                        </Link>

                        {/* Desktop Menu */}
                        <div className="hidden md:ml-12 md:flex md:space-x-8">
                            <Link to="/" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-white transition-colors relative group py-2">
                                Browse Cars
                                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
                            </Link>
                            {session && userRole !== 'dealer' && (
                                <Link to="/bookings" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-white transition-colors py-2">
                                    My Bookings
                                </Link>
                            )}
                            {userRole === 'dealer' && (
                                <Link to="/dealer/dashboard" className="text-sm font-medium text-brand-600 bg-brand-50 hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-300 px-4 py-2 rounded-full transition-all flex items-center border border-brand-200 dark:border-brand-500/20 animate-pulse-slow">
                                    <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleTheme}
                            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5 transition-colors focus:outline-none"
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.div
                                    key={theme}
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: 20, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                                </motion.div>
                            </AnimatePresence>
                        </motion.button>

                        {session ? (
                            <div className="hidden md:flex items-center space-x-4">
                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{session.user.email}</span>
                                <motion.button
                                    whileHover={{ scale: 1.1, color: '#ef4444' }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleLogout}
                                    className="p-2 text-slate-400 transition-colors"
                                >
                                    <LogOut className="h-5 w-5" />
                                </motion.button>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center space-x-4">
                                <Link to="/login" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-white transition-colors">Log in</Link>
                                <Link to="/signup">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="bg-brand-600 text-white hover:bg-brand-700 px-6 py-2.5 rounded-full text-sm font-medium shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 transition-all border border-transparent dark:border-white/10"
                                    >
                                        Sign up
                                    </motion.button>
                                </Link>
                            </div>
                        )}

                        {/* Mobile Toggle */}
                        <div className="md:hidden flex items-center">
                            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-600 dark:text-slate-300">
                                {mobileMenuOpen ? <X /> : <Menu />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden glass border-t border-dashed border-white/20 overflow-hidden"
                    >
                        <div className="px-4 py-8 space-y-4 flex flex-col items-center">
                            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-slate-700 dark:text-slate-200">Browse Cars</Link>
                            {!session && (
                                <>
                                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-slate-700 dark:text-slate-200">Log in</Link>
                                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="text-lg font-medium text-brand-600 dark:text-brand-400">Sign up</Link>
                                </>
                            )}
                            {session && (
                                <button onClick={handleLogout} className="text-lg font-medium text-red-500">Log Out</button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}
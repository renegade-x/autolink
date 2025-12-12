import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Building, CreditCard, ArrowRight, Loader2, CheckCircle } from 'lucide-react';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('customer');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data, error: authError } = await supabase.auth.signUp({
            email,
            password,
        });

        if (authError) {
            setError(authError.message);
            setLoading(false);
            return;
        }

        if (data.user) {
            const profileUpdates = {
                id: data.user.id,
                full_name: fullName,
                role: role
            };

            if (role === 'dealer') {
                profileUpdates.address = e.target.address?.value;
                profileUpdates.bank_details = e.target.bank_details?.value;
            }

            const { error: profileError } = await supabase
                .from('profiles')
                .insert(profileUpdates);

            if (profileError) {
                console.error("Profile creation failed:", profileError);
                setError("Account created but profile setup failed. Please contact support.");
            } else {
                navigate('/');
            }
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex text-slate-900 dark:text-white font-sans bg-slate-50 dark:bg-dark-950 transition-colors duration-500">
            {/* Left Side - Showcase (Using different image/accent) */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="hidden lg:flex w-1/2 relative overflow-hidden bg-brand-900 items-center justify-center"
            >
                <div className="absolute inset-0 bg-gradient-to-tl from-brand-900 to-accent-950 opacity-90" />
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-30" />

                {/* Decorative Blobs */}
                <motion.div
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/3 right-1/4 w-80 h-80 bg-brand-400 rounded-full filter blur-[100px] opacity-30"
                />

                <div className="relative z-10 max-w-lg px-12 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.6 }}
                    >
                        <h2 className="text-4xl font-display font-bold text-white mb-6">
                            Join the <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-accent-300">AutoLink Community</span>
                        </h2>
                        <div className="space-y-6 text-left max-w-sm mx-auto">
                            <div className="flex items-center space-x-4 text-brand-100">
                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm"><CheckCircle className="w-6 h-6 text-accent-400" /></div>
                                <span className="text-lg">Exclusive deals on premium cars</span>
                            </div>
                            <div className="flex items-center space-x-4 text-brand-100">
                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm"><CheckCircle className="w-6 h-6 text-accent-400" /></div>
                                <span className="text-lg">Seamless booking experience</span>
                            </div>
                            <div className="flex items-center space-x-4 text-brand-100">
                                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm"><CheckCircle className="w-6 h-6 text-accent-400" /></div>
                                <span className="text-lg">Trusted dealers & verified reviews</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 relative overflow-y-auto">
                {/* Mobile Background */}
                <div className="absolute inset-0 lg:hidden z-0">
                    <div className="absolute inset-0 bg-gradient-to-tl from-brand-900 to-dark-950" />
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-20" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-xl bg-white/80 dark:bg-dark-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-white/5 relative z-10 my-8"
                >
                    <div className="p-8 md:p-10">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white mb-2">Create Account</h2>
                            <p className="text-slate-500 dark:text-slate-400">Join us to start your journey</p>
                        </div>

                        <form onSubmit={handleSignup} className="space-y-5">
                            {/* Role Selection */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div
                                    onClick={() => setRole('customer')}
                                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 text-center flex flex-col items-center ${role === 'customer'
                                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-brand-300 text-slate-500 dark:text-slate-400'
                                        }`}
                                >
                                    <User className="mb-2 w-6 h-6" />
                                    <span className="font-semibold text-sm">Customer</span>
                                </div>
                                <div
                                    onClick={() => setRole('dealer')}
                                    className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300 text-center flex flex-col items-center ${role === 'dealer'
                                        ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-brand-300 text-slate-500 dark:text-slate-400'
                                        }`}
                                >
                                    <Building className="mb-2 w-6 h-6" />
                                    <span className="font-semibold text-sm">Dealer</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="block w-full px-4 py-3 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                        </div>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                                            placeholder="you@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Password</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                        </div>
                                        <input
                                            type="password"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {role === 'dealer' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="space-y-4 overflow-hidden"
                                        >
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Dealership Address</label>
                                                <input
                                                    type="text"
                                                    name="address"
                                                    required
                                                    className="block w-full px-4 py-3 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                                                    placeholder="123 Dealer Lane, City"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Bank Details (IBAN)</label>
                                                <div className="relative group">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                                        <CreditCard className="h-5 w-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        name="bank_details"
                                                        required
                                                        className="block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
                                                        placeholder="DE89 3704..."
                                                    />
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {error && (
                                <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/50 flex items-center">
                                    <span className="mr-2">⚠️</span> {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center py-3.5 px-4 bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-bold rounded-xl shadow-lg shadow-brand-500/30 transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                                        Creating Account...
                                    </>
                                ) : (
                                    <>
                                        Get Started
                                        <ArrowRight className="ml-2 h-5 w-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <span className="text-slate-500 dark:text-slate-400 text-sm">Already have an account? </span>
                            <Link to="/login" className="text-brand-600 dark:text-brand-400 hover:text-brand-500 font-semibold text-sm transition-colors">
                                Sign In
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

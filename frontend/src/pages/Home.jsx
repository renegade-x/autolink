import { useState, useEffect } from 'react';
import { Search, Filter, Car, DollarSign, MapPin } from 'lucide-react';
import VehicleCard from '../components/VehicleCard';
import { motion } from 'framer-motion';

export default function Home() {
    const [vehicles, setVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        location: '',
        make: '',
        max_price: ''
    });

    useEffect(() => {
        fetchVehicles();
    }, []);

    const fetchVehicles = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams();
            if (filters.location) queryParams.append('location', filters.location);
            if (filters.make) queryParams.append('make', filters.make);
            if (filters.max_price) queryParams.append('max_price', filters.max_price);

            const response = await fetch(`${import.meta.env.VITE_API_URL}/vehicles?${queryParams}`);
            if (response.ok) {
                const data = await response.json();
                setVehicles(data);
            }
        } catch (error) {
            console.error("Error fetching vehicles:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchVehicles();
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="space-y-24 pb-24">
            {/* Hero Section */}
            <div className="relative pt-32 pb-32 md:pt-48 md:pb-40 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-100 via-slate-50 to-white dark:from-slate-900 dark:via-dark-950 dark:to-black -z-10 bg-fixed"></div>

                {/* Animated Background Elements */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-brand-400/20 rounded-full blur-3xl animate-pulse-slow -z-10 mix-blend-multiply dark:mix-blend-screen"></div>
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl animate-pulse-slow animation-delay-500 -z-10 mix-blend-multiply dark:mix-blend-screen"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="text-5xl md:text-7xl font-display font-bold text-slate-900 dark:text-white tracking-tight mb-8"
                    >
                        Drive the <span className="text-gradient">Extraordinary</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="max-w-3xl mx-auto text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-12 leading-relaxed"
                    >
                        Experience the freedom of the open road with our premium fleet.
                        Instant booking, verified dealers, and unforgettable journeys await.
                    </motion.p>

                    {/* Floating Glass Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.8, type: "spring" }}
                        className="max-w-5xl mx-auto glass rounded-3xl p-8 border border-white/40 dark:border-white/10"
                    >
                        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="relative group text-left">
                                <label htmlFor="location" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Location</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-brand-500" />
                                    <input
                                        type="text"
                                        id="location"
                                        className="block w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all hover:bg-white dark:hover:bg-slate-800"
                                        placeholder="Where to?"
                                        value={filters.location}
                                        onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="relative group text-left">
                                <label htmlFor="make" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Make/Model</label>
                                <div className="relative">
                                    <Car className="absolute left-4 top-3.5 h-5 w-5 text-brand-500" />
                                    <input
                                        type="text"
                                        id="make"
                                        className="block w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all hover:bg-white dark:hover:bg-slate-800"
                                        placeholder="e.g. Porsche"
                                        value={filters.make}
                                        onChange={(e) => setFilters({ ...filters, make: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="relative group text-left">
                                <label htmlFor="price" className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Max Price</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-3.5 h-5 w-5 text-brand-500" />
                                    <input
                                        type="number"
                                        id="price"
                                        className="block w-full bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-12 pr-4 py-3 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all hover:bg-white dark:hover:bg-slate-800"
                                        placeholder="200"
                                        value={filters.max_price || ''}
                                        onChange={(e) => setFilters({ ...filters, max_price: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex items-end">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center space-x-2"
                                >
                                    <Search className="h-5 w-5" />
                                    <span>Search Cars</span>
                                </motion.button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden glass-card rounded-3xl p-12 border border-white/20">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white mb-4">Why Choose AutoLink?</h2>
                            <p className="text-lg text-slate-600 dark:text-slate-300">Premium service, transparent pricing, and a fleet that impresses.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            {[
                                { icon: Search, title: "Instant Booking", desc: "Search, choose, and book your dream car in a matter of minutes.", color: "brand" },
                                { icon: Car, title: "Premium Fleet", desc: "Verified vehicles from trusted dealers. Quality you can rely on.", color: "blue" },
                                { icon: DollarSign, title: "Transparent Pricing", desc: "No hidden fees. What you see is exactly what you pay.", color: "green" }
                            ].map((feature, idx) => (
                                <motion.div
                                    key={idx}
                                    whileHover={{ y: -10 }}
                                    className="text-center group"
                                >
                                    <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center bg-${feature.color}-500/10 dark:bg-${feature.color}-400/10 group-hover:bg-${feature.color}-500 group-hover:text-white transition-all duration-300`}>
                                        <feature.icon className={`w-8 h-8 text-${feature.color}-600 dark:text-${feature.color}-400 group-hover:text-white`} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Available Vehicles</h2>
                    <div className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full text-sm font-medium text-slate-600 dark:text-slate-300">
                        {vehicles.length} cars available
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
                    </div>
                ) : (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                    >
                        {vehicles.map((vehicle) => (
                            <motion.div key={vehicle.id} variants={item}>
                                <VehicleCard vehicle={vehicle} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { Calendar, CreditCard, DollarSign, CheckCircle, ArrowLeft, Loader2, Info } from 'lucide-react';

export default function BookingPage() {
    const { vehicleId } = useParams();
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(false);
    const [totalPrice, setTotalPrice] = useState(0);
    const [days, setDays] = useState(0);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => setSession(session));

        fetch(`${import.meta.env.VITE_API_URL}/vehicles/${vehicleId}`)
            .then(res => res.json())
            .then(data => setVehicle(data))
            .catch(err => console.error("Error fetching vehicle:", err));
    }, [vehicleId]);

    useEffect(() => {
        if (startDate && endDate && vehicle) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 0) {
                setDays(diffDays);
                setTotalPrice(diffDays * vehicle.price_per_day);
            } else {
                setDays(0);
                setTotalPrice(0);
            }
        }
    }, [startDate, endDate, vehicle]);

    const handleBooking = async (e) => {
        e.preventDefault();
        if (!session) {
            alert("Please log in to book a vehicle");
            navigate('/login');
            return;
        }
        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/bookings/mvp_create?customer_id=${session.user.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vehicle_id: vehicleId,
                    start_date: startDate,
                    end_date: endDate
                })
            });

            if (response.ok) {
                // Success Animation or Redirect
                navigate('/customer-bookings');
            } else {
                const err = await response.json();
                alert(`Booking failed: ${err.detail}`);
            }
        } catch (err) {
            console.error(err);
            alert("Booking error");
        } finally {
            setLoading(false);
        }
    };

    if (!vehicle) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950">
            <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
        </div>
    );

    return (
        <div className="min-h-screen flex text-slate-900 dark:text-white font-sans bg-slate-50 dark:bg-dark-950">

            {/* Left Side: Vehicle Showcase */}
            <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="hidden lg:block w-1/2 relative bg-dark-900 overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark-950/90 z-10" />
                {vehicle.images && vehicle.images[0] ? (
                    <img src={vehicle.images[0]} alt={vehicle.model} className="absolute inset-0 w-full h-full object-cover opacity-80" />
                ) : (
                    <div className="absolute inset-0 bg-slate-800" />
                )}

                <div className="relative z-20 h-full flex flex-col justify-between p-12">
                    <button onClick={() => navigate('/')} className="flex items-center text-white/70 hover:text-white transition-colors w-fit">
                        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Fleet
                    </button>

                    <div>
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-5xl font-display font-bold text-white mb-4"
                        >
                            {vehicle.make} <span className="text-brand-400">{vehicle.model}</span>
                        </motion.h1>
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex items-center space-x-6 text-white/90"
                        >
                            <span className="px-4 py-2 bg-white/10 backdrop-blur rounded-full border border-white/20">{vehicle.year}</span>
                            <span className="text-xl font-semibold">${vehicle.price_per_day} <span className="text-sm font-normal opacity-70">/ day</span></span>
                        </motion.div>
                        <p className="mt-6 text-lg text-slate-300 max-w-md leading-relaxed">{vehicle.description || "Experience the thrill of driving this premium vehicle. Perfect for weekend getaways or business trips."}</p>
                    </div>
                </div>
            </motion.div>

            {/* Right Side: Booking Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 pt-28 lg:p-12 relative overflow-y-auto">
                {/* Mobile Header Image Background */}
                <div className="absolute inset-0 lg:hidden z-0">
                    <div className="absolute inset-0 bg-dark-950/90 z-10" />
                    {vehicle.images?.[0] && <img src={vehicle.images[0]} className="absolute inset-0 w-full h-full object-cover" />}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="w-full max-w-lg bg-white/90 dark:bg-dark-900/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 relative z-20"
                >
                    <div className="mb-8 lg:hidden">
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{vehicle.make} {vehicle.model}</h2>
                        <p className="text-brand-600 dark:text-brand-400 font-semibold mt-1">${vehicle.price_per_day}/day</p>
                    </div>

                    <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white hidden lg:block">Complete Reservation</h2>

                    <form onSubmit={handleBooking} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Pick-up Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                    <input
                                        type="date"
                                        required
                                        value={startDate}
                                        onChange={e => setStartDate(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Return Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                                    <input
                                        type="date"
                                        required
                                        value={endDate}
                                        onChange={e => setEndDate(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Payment Method</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 border-2 border-brand-500 bg-brand-50 dark:bg-brand-900/20 rounded-xl flex items-center justify-center cursor-pointer">
                                    <CreditCard className="w-5 h-5 mr-2 text-brand-600 dark:text-brand-400" />
                                    <span className="font-semibold text-brand-700 dark:text-brand-300">Card</span>
                                </div>
                                <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center opacity-50 cursor-not-allowed">
                                    <DollarSign className="w-5 h-5 mr-2 text-slate-400" />
                                    <span className="text-slate-500">Cash</span>
                                </div>
                            </div>
                        </div>

                        {/* Price Summary */}
                        <div className="bg-slate-50 dark:bg-dark-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <div className="flex justify-between mb-2 text-sm text-slate-500 dark:text-slate-400">
                                <span>Rate</span>
                                <span>${vehicle.price_per_day} x {days} days</span>
                            </div>
                            <div className="flex justify-between mb-4 text-sm text-slate-500 dark:text-slate-400">
                                <span>Service Fee</span>
                                <span>$0.00</span>
                            </div>
                            <div className="border-t border-slate-200 dark:border-slate-700 pt-4 flex justify-between items-center">
                                <span className="font-bold text-lg text-slate-900 dark:text-white">Total</span>
                                <span className="font-bold text-2xl text-brand-600 dark:text-brand-400">${totalPrice.toLocaleString()}</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || days <= 0}
                            className="w-full py-4 bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-bold rounded-xl shadow-lg shadow-brand-500/30 transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Confirm Booking <CheckCircle className="ml-2 w-5 h-5" /></>}
                        </button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}

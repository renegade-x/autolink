import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Star, Calendar, MapPin, DollarSign, Clock, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CustomerBookings() {
    const [session, setSession] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Review Modal State
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (!session) navigate('/login');
            else fetchBookings(session.user.id);
        });
    }, []);

    const fetchBookings = async (userId) => {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/bookings?customer_id=${userId}`);
        if (res.ok) {
            const data = await res.json();
            // Data now includes 'vehicles' object
            setBookings(data);
        }
        setLoading(false);
    };

    const openReviewModal = (booking) => {
        setSelectedBooking(booking);
        setReviewModalOpen(true);
        setRating(5);
        setComment('');
    };

    const submitReview = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                booking_id: selectedBooking.id,
                customer_id: session.user.id,
                dealer_id: selectedBooking.vehicles.dealer_id,
                rating: parseInt(rating),
                comment: comment
            };

            const rRes = await fetch(`${import.meta.env.VITE_API_URL}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (rRes.ok) {
                alert("Review submitted!");
                setReviewModalOpen(false);
            } else {
                alert("Failed to submit review");
            }
        } catch (err) { console.error(err); }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-dark-950 transition-colors duration-500 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-10">
                <div className="mb-10">
                    <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">My Bookings</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your upcoming and past adventures</p>
                </div>

                {bookings.length === 0 ? (
                    <div className="text-center py-20 bg-white/50 dark:bg-dark-800/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10">
                        <Calendar className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                        <h3 className="text-xl font-medium text-slate-900 dark:text-white">No bookings yet</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-2">Time to hit the road! Find your dream car.</p>
                        <button onClick={() => navigate('/')} className="mt-6 px-6 py-2 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-500 transition-colors shadow-lg shadow-brand-500/20">
                            Browse Cars
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bookings.map((booking) => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                                onReview={() => openReviewModal(booking)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Review Modal */}
            <AnimatePresence>
                {reviewModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setReviewModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="relative bg-white dark:bg-dark-900 rounded-3xl w-full max-w-md shadow-2xl p-8 border border-white/10"
                        >
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Rate your experience</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">How was your trip with the {selectedBooking?.vehicles?.make} {selectedBooking?.vehicles?.model}?</p>

                            <form onSubmit={submitReview} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Rating</label>
                                    <div className="flex space-x-2">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                type="button"
                                                onClick={() => setRating(star)}
                                                className={`p-2 rounded-lg transition-colors ${rating >= star ? 'text-amber-400 bg-amber-50 dark:bg-amber-900/20' : 'text-slate-300 dark:text-slate-600 hover:text-amber-200'}`}
                                            >
                                                <Star className="w-8 h-8 fill-current" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Comment</label>
                                    <textarea
                                        rows={4}
                                        value={comment}
                                        onChange={e => setComment(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white placeholder-slate-400"
                                        placeholder="Tell us about your trip..."
                                    ></textarea>
                                </div>
                                <button type="submit" className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold shadow-lg shadow-brand-500/20 transition-all">
                                    Submit Review
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

const BookingCard = ({ booking, onReview }) => {
    const vehicle = booking.vehicles || {};
    const startDate = new Date(booking.start_date);
    const endDate = new Date(booking.end_date);
    const statusConfig = {
        pending_payment: { color: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10', icon: Clock, label: 'Pending Payment' },
        confirmed: { color: 'text-green-500 bg-green-50 dark:bg-green-500/10', icon: CheckCircle, label: 'Confirmed' },
        completed: { color: 'text-blue-500 bg-blue-50 dark:bg-blue-500/10', icon: CheckCircle, label: 'Completed' },
        cancelled: { color: 'text-red-500 bg-red-50 dark:bg-red-500/10', icon: XCircle, label: 'Cancelled' },
    };
    const status = statusConfig[booking.status] || statusConfig.pending_payment;
    const StatusIcon = status.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="group bg-white dark:bg-dark-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl border border-slate-200 dark:border-slate-700 transition-all duration-300 h-full flex flex-col"
        >
            <div className="h-48 overflow-hidden relative bg-slate-200 dark:bg-dark-900">
                {vehicle.images && vehicle.images[0] ? (
                    <img src={vehicle.images[0]} alt={vehicle.model} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400"><Calendar className="w-12 h-12" /></div>
                )}
                <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center space-x-1.5 backdrop-blur-md ${status.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        <span>{status.label}</span>
                    </span>
                </div>
            </div>

            <div className="p-6 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="font-bold text-xl text-slate-900 dark:text-white line-clamp-1">{vehicle.make} {vehicle.model}</h3>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">{vehicle.year}</p>
                    </div>
                </div>

                <div className="space-y-3 mb-6 flex-grow">
                    <div className="flex items-center text-slate-600 dark:text-slate-300 text-sm">
                        <Calendar className="w-4 h-4 mr-3 text-brand-500" />
                        <span>{startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}</span>
                    </div>
                    {vehicle.location && (
                        <div className="flex items-center text-slate-600 dark:text-slate-300 text-sm">
                            <MapPin className="w-4 h-4 mr-3 text-brand-500" />
                            <span>{vehicle.location}</span>
                        </div>
                    )}
                    <div className="flex items-center text-slate-900 dark:text-white font-bold">
                        <DollarSign className="w-4 h-4 mr-3 text-brand-500" />
                        <span>{booking.total_amount} Total</span>
                    </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-white/5">
                    {(booking.status === 'confirmed' || booking.status === 'completed') ? (
                        <button
                            onClick={onReview}
                            className="w-full py-2.5 rounded-xl border border-brand-200 dark:border-brand-800 text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/30 text-sm font-semibold transition-colors flex items-center justify-center"
                        >
                            <Star className="w-4 h-4 mr-2" /> Write Review
                        </button>
                    ) : (
                        <div className="text-center text-xs text-slate-400 italic">
                            {booking.status === 'pending_payment' ? 'Waiting for confirmation' : 'Review unavailable'}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

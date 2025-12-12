import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Plus, Trash2, Edit2, Calendar, DollarSign, Car, CreditCard, ChevronRight, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function DealerDashboard() {
    const [session, setSession] = useState(null);
    const [vehicles, setVehicles] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [activeTab, setActiveTab] = useState('vehicles');
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState(null);
    const navigate = useNavigate();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentVehicle, setCurrentVehicle] = useState(null);
    const [formData, setFormData] = useState({
        make: '', model: '', year: new Date().getFullYear(), price_per_day: '', description: '', location: '', images: ''
    });

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (!session) navigate('/login');
            else fetchUserRole(session.user.id);
        });
    }, []);

    const fetchUserRole = async (userId) => {
        const { data } = await supabase.from('profiles').select('role').eq('id', userId).single();
        if (data) {
            if (data.role !== 'dealer') {
                alert("Access Denied: Dealer only area");
                navigate('/');
                return;
            }
            setUserRole(data.role);
            fetchVehicles(userId);
            fetchBookings(userId);
        }
    };

    const fetchVehicles = async (dealerId) => {
        const { data } = await supabase.from('vehicles').select('*').eq('dealer_id', dealerId).order('created_at', { ascending: false });
        if (data) setVehicles(data);
        setLoading(false);
    };

    const fetchBookings = async (dealerId) => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/bookings?dealer_id=${dealerId}`);
            if (res.ok) {
                const data = await res.json();
                setBookings(data);
            }
        } catch (e) { console.error(e); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure you want to delete this vehicle?")) return;
        const res = await fetch(`${import.meta.env.VITE_API_URL}/vehicles/${id}`, { method: 'DELETE' });
        if (res.ok) setVehicles(vehicles.filter(v => v.id !== id));
        else alert("Failed to delete");
    };

    const handleSaveVehicle = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            dealer_id: session.user.id,
            images: formData.images ? [formData.images] : []
        };

        const url = currentVehicle
            ? `${import.meta.env.VITE_API_URL}/vehicles/${currentVehicle.id}`
            : `${import.meta.env.VITE_API_URL}/vehicles`;

        const method = currentVehicle ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            setIsModalOpen(false);
            fetchVehicles(session.user.id);
            resetForm();
        } else {
            alert("Failed to save");
        }
    };

    const openAddModal = () => { resetForm(); setIsModalOpen(true); };
    const openEditModal = (vehicle) => {
        setCurrentVehicle(vehicle);
        setFormData({
            make: vehicle.make, model: vehicle.model, year: vehicle.year, price_per_day: vehicle.price_per_day,
            description: vehicle.description || '', location: vehicle.location || '',
            images: vehicle.images?.[0] || ''
        });
        setIsModalOpen(true);
    };
    const resetForm = () => {
        setCurrentVehicle(null);
        setFormData({ make: '', model: '', year: new Date().getFullYear(), price_per_day: '', description: '', location: '', images: '' });
    };

    // Stats Calculation
    const totalRevenue = bookings.filter(b => b.status === 'confirmed' || b.status === 'completed').reduce((sum, b) => sum + b.total_amount, 0);
    const activeBookings = bookings.filter(b => b.status !== 'cancelled' && b.status !== 'completed').length;
    const pendingPayment = bookings.filter(b => b.status === 'pending_payment').length;

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-dark-950">
            <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-white pb-20 transition-colors duration-500">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Dealer Dashboard</h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your fleet and bookings</p>
                    </div>
                    {activeTab === 'vehicles' && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={openAddModal}
                            className="bg-brand-600 hover:bg-brand-500 text-white px-6 py-3 rounded-xl shadow-lg shadow-brand-500/30 flex items-center font-semibold transition-all"
                        >
                            <Plus className="w-5 h-5 mr-2" /> Add Vehicle
                        </motion.button>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <StatsCard title="Total Revenue" value={`$${totalRevenue.toLocaleString()}`} icon={DollarSign} color="text-green-500" bg="bg-green-500/10" />
                    <StatsCard title="Active Rentals" value={activeBookings} icon={Car} color="text-brand-500" bg="bg-brand-500/10" />
                    <StatsCard title="Pending Payment" value={pendingPayment} icon={CreditCard} color="text-amber-500" bg="bg-amber-500/10" />
                </div>

                {/* Navigation Tabs */}
                <div className="flex space-x-1 bg-white/50 dark:bg-dark-800/50 p-1 rounded-xl backdrop-blur-md border border-slate-200 dark:border-white/10 mb-8 max-w-md">
                    <TabButton active={activeTab === 'vehicles'} onClick={() => setActiveTab('vehicles')} label="My Vehicles" />
                    <TabButton active={activeTab === 'bookings'} onClick={() => setActiveTab('bookings')} label="Bookings" />
                </div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    {activeTab === 'vehicles' ? (
                        <motion.div
                            key="vehicles"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {vehicles.map((vehicle) => (
                                <VehicleCard
                                    key={vehicle.id}
                                    vehicle={vehicle}
                                    onEdit={() => openEditModal(vehicle)}
                                    onDelete={() => handleDelete(vehicle.id)}
                                />
                            ))}
                            {vehicles.length === 0 && (
                                <div className="col-span-full text-center py-20 bg-white/30 dark:bg-dark-900/30 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700">
                                    <Car className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                                    <p className="text-xl text-slate-500 dark:text-slate-400 font-medium">No vehicles listed yet</p>
                                    <button onClick={openAddModal} className="mt-4 text-brand-600 dark:text-brand-400 hover:underline">Add your first vehicle</button>
                                </div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key="bookings"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-white/50 dark:bg-dark-800/50 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden"
                        >
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-slate-50/50 dark:bg-dark-900/50 border-b border-slate-200 dark:border-white/10">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Booking ID</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                                        {bookings.map((booking) => (
                                            <BookingRow
                                                key={booking.id}
                                                booking={booking}
                                                onConfirmPayment={async () => {
                                                    if (confirm("Confirm payment received?")) {
                                                        await fetch(`${import.meta.env.VITE_API_URL}/bookings/${booking.id}/status?status=confirmed`, { method: 'PUT' });
                                                        fetchBookings(session.user.id);
                                                    }
                                                }}
                                            />
                                        ))}
                                        {bookings.length === 0 && (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                                    No bookings found
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Edit/Add Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white dark:bg-dark-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10 p-8"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-bold font-display">{currentVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSaveVehicle} className="space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <Input label="Make" value={formData.make} onChange={e => setFormData({ ...formData, make: e.target.value })} placeholder="Toyota" />
                                    <Input label="Model" value={formData.model} onChange={e => setFormData({ ...formData, model: e.target.value })} placeholder="Camry" />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <Input label="Year" type="number" value={formData.year} onChange={e => setFormData({ ...formData, year: e.target.value })} />
                                    <Input label="Price / Day ($)" type="number" value={formData.price_per_day} onChange={e => setFormData({ ...formData, price_per_day: e.target.value })} />
                                </div>
                                <Input label="Location" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="New York, NY" />
                                <Input label="Image URL" value={formData.images} onChange={e => setFormData({ ...formData, images: e.target.value })} placeholder="https://..." />

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
                                    <textarea
                                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white"
                                        rows="4"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    ></textarea>
                                </div>

                                <div className="flex justify-end space-x-4 pt-4">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">Cancel</button>
                                    <button type="submit" className="px-6 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium shadow-lg shadow-brand-500/20 transition-all">Save Vehicle</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Components
const StatsCard = ({ title, value, icon: Icon, color, bg }) => (
    <motion.div
        whileHover={{ y: -5 }}
        className="bg-white/50 dark:bg-dark-800/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 p-6 rounded-3xl shadow-sm"
    >
        <div className="flex items-center justify-between">
            <div>
                <p className="text-slate-500 dark:text-slate-400 font-medium mb-1">{title}</p>
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white font-display">{value}</h3>
            </div>
            <div className={`p-4 rounded-2xl ${bg} ${color}`}>
                <Icon className="w-8 h-8" />
            </div>
        </div>
    </motion.div>
);

const TabButton = ({ active, onClick, label }) => (
    <button
        onClick={onClick}
        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${active
            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
    >
        {label}
    </button>
);

const VehicleCard = ({ vehicle, onEdit, onDelete }) => (
    <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -8 }}
        className="group relative bg-white dark:bg-dark-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-brand-500/30 transition-all duration-300"
    >
        <div className="aspect-[16/10] overflow-hidden bg-slate-100 dark:bg-dark-900 relative">
            {vehicle.images?.[0] ? (
                <img src={vehicle.images[0]} alt={vehicle.model} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-700">
                    <Car className="w-16 h-16" />
                </div>
            )}
            <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                <button onClick={onEdit} className="p-2 bg-white/90 dark:bg-black/80 backdrop-blur rounded-full text-slate-700 dark:text-white hover:text-brand-500 transition-colors shadow-lg"><Edit2 className="w-4 h-4" /></button>
                <button onClick={onDelete} className="p-2 bg-white/90 dark:bg-black/80 backdrop-blur rounded-full text-slate-700 dark:text-white hover:text-red-500 transition-colors shadow-lg"><Trash2 className="w-4 h-4" /></button>
            </div>
            <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <span className="text-white text-xs font-semibold">{vehicle.is_available ? 'Available' : 'Rented'}</span>
            </div>
        </div>
        <div className="p-5">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white">{vehicle.make} {vehicle.model}</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">{vehicle.year}</p>
                </div>
                <div className="text-right">
                    <p className="text-brand-600 dark:text-brand-400 font-bold text-xl">${vehicle.price_per_day}</p>
                    <p className="text-xs text-slate-400">per day</p>
                </div>
            </div>
        </div>
    </motion.div>
);

const BookingRow = ({ booking, onConfirmPayment }) => (
    <motion.tr
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
    >
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white font-mono">{booking.id.slice(0, 8)}...</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">
            {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900 dark:text-white">${booking.total_amount}</td>
        <td className="px-6 py-4 whitespace-nowrap">
            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                    booking.status === 'pending_payment' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                        'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'}`}>
                {booking.status.replace('_', ' ').toUpperCase()}
            </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            {booking.status === 'pending_payment' && (
                <button onClick={onConfirmPayment} className="text-brand-600 dark:text-brand-400 hover:text-brand-800 font-semibold border border-brand-200 dark:border-brand-800 px-3 py-1 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/30 transition-colors">
                    Confirm Payment
                </button>
            )}
        </td>
    </motion.tr>
);

const Input = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{label}</label>
        <input
            {...props}
            className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-dark-800 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-brand-500 outline-none transition-all dark:text-white"
        />
    </div>
);

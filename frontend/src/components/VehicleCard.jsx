import { MapPin, Calendar, DollarSign, ArrowRight, Car } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function VehicleCard({ vehicle }) {
    return (
        <div className="group bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl dark:shadow-slate-900/50 transition-all duration-300 hover:-translate-y-1 border border-gray-100 dark:border-slate-700 flex flex-col h-full">
            <div className="h-56 w-full bg-gray-100 dark:bg-slate-700 relative overflow-hidden">
                {vehicle.images && vehicle.images.length > 0 ? (
                    <img
                        src={vehicle.images[0]}
                        alt={`${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000'; // Generic fallback car
                        }}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-slate-800">
                        <Car className="w-12 h-12 opacity-20" />
                    </div>
                )}
                <div className="absolute top-3 right-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm font-bold text-brand-700 dark:text-brand-400 shadow-sm border border-brand-100/50 dark:border-brand-500/20">
                    ${vehicle.price_per_day}<span className="text-xs font-normal text-gray-500 dark:text-gray-400">/day</span>
                </div>
                <div className="absolute top-3 left-3">
                    {vehicle.is_available ?
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 shadow-sm border border-green-200 dark:border-green-800">Available</span> :
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 shadow-sm border border-red-200 dark:border-red-800">Rented</span>
                    }
                </div>
            </div>
            <div className="p-5 flex-grow flex flex-col">
                <div className="flex justify-between items-start">
                    <h3 className="text-xl font-display font-bold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{vehicle.make} {vehicle.model}</h3>
                    <span className="text-sm font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">{vehicle.year}</span>
                </div>

                <div className="mt-3 flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <MapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-brand-400" />
                    <p className="font-medium">{vehicle.location || 'Location varies'}</p>
                </div>

                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">{vehicle.description}</p>

                <div className="mt-auto pt-5">
                    <Link to={`/book/${vehicle.id}`} className="block w-full text-center bg-gray-900 dark:bg-white border border-transparent rounded-xl py-3 text-sm font-bold text-white dark:text-gray-900 hover:bg-brand-600 dark:hover:bg-brand-400 hover:text-white shadow-lg hover:shadow-brand-500/30 transition-all duration-300">
                        Book Now
                    </Link>
                </div>
            </div>
        </div>
    );
}

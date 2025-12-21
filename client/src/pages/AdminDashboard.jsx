import { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';
import { useAuth } from '../context/AuthContext';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { DollarSign, Calendar, Users, MapPin, TrendingUp, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${API_URL}/api/analytics/dashboard`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setData(response.data);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) return <div className="flex justify-center items-center h-screen">Loading Analytics...</div>;
    if (!data) return <div className="text-center py-20">Failed to load dashboard data</div>;

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <div className="container mx-auto px-4 py-8 bg-gray-50 min-h-screen">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                <p className="text-gray-600">Real-time business insights for FarmStay</p>
            </header>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    icon={<DollarSign className="text-green-600" size={24} />}
                    title="Total Revenue"
                    value={`₹${data.stats.totalRevenue.toLocaleString()}`}
                    trend="+12% vs last month"
                    color="green"
                />
                <StatCard
                    icon={<Calendar className="text-blue-600" size={24} />}
                    title="Total Bookings"
                    value={data.stats.totalBookings}
                    trend="+5 new today"
                    color="blue"
                />
                <StatCard
                    icon={<Users className="text-purple-600" size={24} />}
                    title="Active Users"
                    value={data.stats.totalUsers}
                    trend="Growing steadily"
                    color="purple"
                />
                <StatCard
                    icon={<MapPin className="text-orange-600" size={24} />}
                    title="Listed Farms"
                    value={data.stats.totalFarms}
                    trend="Maximum capacity"
                    color="orange"
                />
            </div>

            {/* Charts Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Revenue Chart (Takes 2 columns) */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                            <TrendingUp size={20} /> Revenue Overview
                        </h2>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.revenueChart}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tick={{ fill: '#6B7280' }} tickLine={false} />
                                <YAxis axisLine={false} tick={{ fill: '#6B7280' }} tickLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Farm Distribution Pie Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <Activity size={20} /> Popular Farms
                    </h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data.farmDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.farmDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-3">
                        {data.farmDistribution.map((farm, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                                    <span className="text-gray-600 truncate max-w-[150px]">{farm.name}</span>
                                </span>
                                <span className="font-semibold">{farm.value} bookings</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Bookings Table */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <Calendar size={20} /> Recent Bookings
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Guest</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Farm</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Dates</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Guests</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Amount</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Booked On</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.recentBookings && data.recentBookings.length > 0 ? (
                                data.recentBookings.map((booking, index) => (
                                    <tr key={booking._id || index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">{booking.guestName || booking.user?.name || 'N/A'}</span>
                                                <span className="text-xs text-gray-500">{booking.guestPhone || booking.user?.email || ''}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-gray-900">{booking.farm?.title || 'N/A'}</span>
                                                <span className="text-xs text-gray-500">{booking.farm?.location || ''}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex flex-col">
                                                <span className="text-sm text-gray-900">{new Date(booking.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                <span className="text-xs text-gray-500">to {new Date(booking.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-900">{booking.guests}</td>
                                        <td className="py-3 px-4 text-sm font-semibold text-gray-900">₹{booking.totalPrice?.toLocaleString()}</td>
                                        <td className="py-3 px-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-red-100 text-red-800'
                                                }`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-sm text-gray-500">
                                            {new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="py-8 text-center text-gray-500">No bookings found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, title, value, trend, color }) => {
    const colorClasses = {
        green: 'bg-green-50 text-green-600',
        blue: 'bg-blue-50 text-blue-600',
        purple: 'bg-purple-50 text-purple-600',
        orange: 'bg-orange-50 text-orange-600'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                    {icon}
                </div>
                <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    30 days
                </span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">{title}</h3>
            <div className="flex items-end gap-2">
                <span className="text-2xl font-bold text-gray-900">{value}</span>
            </div>
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <TrendingUp size={12} className="text-green-500" />
                <span className="text-green-500 font-medium">{trend}</span>
            </p>
        </motion.div>
    );
};

export default AdminDashboard;

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';

const Database = () => {
    const [dbData, setDbData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (user.role !== 'admin') {
            navigate('/');
            return;
        }
        fetchDatabase();
    }, [user]);

    const fetchDatabase = async () => {

        if (loading) return <div className="text-center py-20">Loading database...</div>;
        if (!dbData) return <div className="text-center py-20">Failed to load database</div>;

        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-2">Database Viewer</h1>
                <p className="text-gray-600 mb-8">Database: {dbData.database}</p>

                {/* Users Collection */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-blue-600">
                        👥 Users Collection ({dbData.collections.users.count})
                    </h2>
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left">ID</th>
                                        <th className="px-4 py-3 text-left">Name</th>
                                        <th className="px-4 py-3 text-left">Email</th>
                                        <th className="px-4 py-3 text-left">Role</th>
                                        <th className="px-4 py-3 text-left">Created At</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dbData.collections.users.data.map((user) => (
                                        <tr key={user._id} className="border-t hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm font-mono">{user._id}</td>
                                            <td className="px-4 py-3">{user.name}</td>
                                            <td className="px-4 py-3">{user.email}</td>
                                            <td className="px-4 py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {new Date(user.createdAt).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Farms Collection */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-green-600">
                        🏡 Farms Collection ({dbData.collections.farms.count})
                    </h2>
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left">ID</th>
                                        <th className="px-4 py-3 text-left">Title</th>
                                        <th className="px-4 py-3 text-left">Location</th>
                                        <th className="px-4 py-3 text-left">Price (₹)</th>
                                        <th className="px-4 py-3 text-left">Capacity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dbData.collections.farms.data.map((farm) => (
                                        <tr key={farm._id} className="border-t hover:bg-gray-50">
                                            <td className="px-4 py-3 text-sm font-mono">{farm._id}</td>
                                            <td className="px-4 py-3 font-medium">{farm.title}</td>
                                            <td className="px-4 py-3">{farm.location}</td>
                                            <td className="px-4 py-3">₹{farm.price}</td>
                                            <td className="px-4 py-3">{farm.capacity}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Bookings Collection */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 text-purple-600">
                        📅 Bookings Collection ({dbData.collections.bookings.count})
                    </h2>
                    {dbData.collections.bookings.count === 0 ? (
                        <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
                            No bookings yet. Make a test booking to see data here!
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-md overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-4 py-3 text-left">ID</th>
                                            <th className="px-4 py-3 text-left">User</th>
                                            <th className="px-4 py-3 text-left">Farm</th>
                                            <th className="px-4 py-3 text-left">Dates</th>
                                            <th className="px-4 py-3 text-left">Total (₹)</th>
                                            <th className="px-4 py-3 text-left">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dbData.collections.bookings.data.map((booking) => (
                                            <tr key={booking._id} className="border-t hover:bg-gray-50">
                                                <td className="px-4 py-3 text-sm font-mono">{booking._id}</td>
                                                <td className="px-4 py-3">{booking.user?.name || 'N/A'}</td>
                                                <td className="px-4 py-3">{booking.farm?.title || 'N/A'}</td>
                                                <td className="px-4 py-3 text-sm">
                                                    {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                                                </td>
                                                <td className="px-4 py-3 font-bold">₹{booking.totalPrice}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {booking.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                <button
                    onClick={fetchDatabase}
                    className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-green-600 transition"
                >
                    🔄 Refresh Database
                </button>
            </div>
        );
    };

    export default Database;


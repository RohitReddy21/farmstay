import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
    const [users, setUsers] = useState([]);
    const [bookings, setBookings] = useState([]);
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
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            // Note: In a real app, you'd need admin middleware check on backend
            // For this demo, we'll just fetch data if logged in
            const config = {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            };

            const usersRes = await axios.get('https://farmstay-backend.onrender.com//api/admin/users', config);
            setUsers(usersRes.data);

            const bookingsRes = await axios.get('https://farmstay-backend.onrender.com//api/admin/bookings', config);
            setBookings(bookingsRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold mb-4">Registered Users ({users.length})</h2>
                    <ul className="space-y-2">
                        {users.map(u => (
                            <li key={u._id} className="border-b pb-2">
                                <span className="font-medium">{u.name}</span> - {u.email}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold mb-4">Recent Bookings ({bookings.length})</h2>
                    <ul className="space-y-4">
                        {bookings.map(b => (
                            <li key={b._id} className="border-b pb-2">
                                <div className="font-medium">{b.farm?.title || 'Unknown Farm'}</div>
                                <div className="text-sm text-gray-600">
                                    {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                                </div>
                                <div className="text-sm">User: {b.user?.name || 'Unknown'}</div>
                                <div className="font-bold text-green-600">₹{b.totalPrice}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Admin;

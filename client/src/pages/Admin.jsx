import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';

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
            const config = {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            };

            const usersRes = await axios.get(`${API_URL}/api/admin/users`, config);
            setUsers(usersRes.data);

            const bookingsRes = await axios.get(`${API_URL}/api/admin/bookings`, config);
            setBookings(bookingsRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleRoleUpdate = async (userId, newRole) => {
        try {
            const config = {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            };
            await axios.put(`${API_URL}/api/admin/users/${userId}/role`, { role: newRole }, config);
            fetchData(); // Refresh list
        } catch (error) {
            console.error('Error updating role:', error);
            alert('Failed to update role');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Registered Users ({users.length})</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b dark:border-gray-700">
                                    <th className="pb-2 dark:text-gray-300">Name</th>
                                    <th className="pb-2 dark:text-gray-300">Email</th>
                                    <th className="pb-2 dark:text-gray-300">Role</th>
                                    <th className="pb-2 dark:text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id} className="border-b dark:border-gray-700 last:border-0">
                                        <td className="py-3 font-medium dark:text-white">{u.name}</td>
                                        <td className="py-3 text-gray-600 dark:text-gray-400">{u.email}</td>
                                        <td className="py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${u.role === 'admin'
                                                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                                    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                                }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            {u.email !== 'admin@farmstay.com' && (
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        className="text-sm border rounded p-1 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                                                        defaultValue={u.role}
                                                        onChange={(e) => {
                                                            if (e.target.value === 'custom') {
                                                                const newRole = prompt("Enter new role name:");
                                                                if (newRole) handleRoleUpdate(u._id, newRole.toLowerCase());
                                                            } else {
                                                                handleRoleUpdate(u._id, e.target.value);
                                                            }
                                                        }}
                                                    >
                                                        <option value="user">User</option>
                                                        <option value="admin">Admin</option>
                                                        {!['user', 'admin'].includes(u.role) && <option value={u.role}>{u.role}</option>}
                                                        <option value="custom">+ Add New Role</option>
                                                    </select>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border dark:border-gray-700">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Recent Bookings ({bookings.length})</h2>
                    <ul className="space-y-4">
                        {bookings.map(b => (
                            <li key={b._id} className="border-b dark:border-gray-700 pb-2 last:border-0">
                                <div className="font-medium dark:text-white">{b.farm?.title || 'Unknown Farm'}</div>
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    {new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}
                                </div>
                                <div className="text-sm dark:text-gray-300">User: {b.user?.name || 'Unknown'}</div>
                                <div className="font-bold text-green-600 dark:text-green-400">₹{b.totalPrice}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Admin;

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
    }, [user, navigate]);

    const fetchDatabase = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_URL}/api/db/view`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setDbData(response.data);
        } catch (error) {
            console.error('Error fetching database:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (collection, id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        // Optimistic Update
        const previousData = { ...dbData };
        setDbData(prev => {
            const newData = { ...prev };
            newData.collections[collection].data = newData.collections[collection].data.filter(item => item._id !== id);
            newData.collections[collection].count = Math.max(0, newData.collections[collection].count - 1);
            return newData;
        });

        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/api/admin/${collection}/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('Failed to delete item. Restoring...');
            setDbData(previousData);
        }
    };

    if (loading) return <div className="text-center py-20">Loading database...</div>;
    if (!dbData) return <div className="text-center py-20">Failed to load database</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-2">Database Viewer</h1>
            <p className="text-gray-600 mb-8">Database: {dbData.database}</p>

            {Object.keys(dbData.collections).map((collName) => (
                <div key={collName} className="mb-8">
                    <h2 className="text-2xl font-bold mb-4 capitalize">
                        {collName} Collection ({dbData.collections[collName].count})
                    </h2>
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-100">
                                    <tr>
                                        {dbData.collections[collName].data.length > 0 && 
                                            Object.keys(dbData.collections[collName].data[0]).slice(0, 6).map(k => (
                                                <th key={k} className="px-4 py-3 text-left capitalize">{k}</th>
                                            ))
                                        }
                                        <th className="px-4 py-3 text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {dbData.collections[collName].data.map((item) => (
                                        <tr key={item._id} className="border-t hover:bg-gray-50">
                                            {Object.values(item).slice(0, 6).map((v, i) => (
                                                <td key={i} className="px-4 py-3 text-sm truncate max-w-xs">
                                                    {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                                                </td>
                                            ))}
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => handleDelete(collName, item._id)}
                                                    className="bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200 text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ))}

            <button
                onClick={fetchDatabase}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-800 transition"
            >
                🔄 Refresh Database
            </button>
        </div>
    );
};

export default Database;

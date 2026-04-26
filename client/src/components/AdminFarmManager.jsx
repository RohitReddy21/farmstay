import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import API_URL from '../config';
import { ImagePlus, Pencil, PlusCircle, RefreshCw, Trash2, Video, X } from 'lucide-react';

const MAX_UPLOAD_FILE_SIZE_MB = 50;
const MAX_UPLOAD_FILE_SIZE_BYTES = MAX_UPLOAD_FILE_SIZE_MB * 1024 * 1024;

const EMPTY_FORM = {
    title: '',
    description: '',
    location: '',
    price: '',
    capacity: '',
    amenitiesText: '',
    videoLinksText: '',
    category: 'Farm',
    subCategory: '',
    availability: 'All Days'
};

const AdminFarmManager = () => {
    const [farms, setFarms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [expanded, setExpanded] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [existingImages, setExistingImages] = useState([]);
    const [newImages, setNewImages] = useState([]);
    const [existingVideos, setExistingVideos] = useState([]);
    const [newVideos, setNewVideos] = useState([]);

    const getAuthConfig = useCallback(() => {
        const token = localStorage.getItem('token');
        return { headers: { Authorization: `Bearer ${token}` } };
    }, []);

    const getErrorMessage = (err, fallback) => {
        const message = err?.response?.data?.message;
        const details = err?.response?.data?.error;
        if (details && (!message || message === 'Server Error' || message === 'Something went wrong!')) {
            return details;
        }
        return message || details || fallback;
    };

    const fetchFarms = useCallback(async () => {
        setError('');
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/admin/farms`, getAuthConfig());
            setFarms(res.data || []);
        } catch (e) {
            setError(getErrorMessage(e, 'Failed to load farms'));
        } finally {
            setLoading(false);
        }
    }, [getAuthConfig]);

    useEffect(() => {
        fetchFarms();
    }, [fetchFarms]);

    const startCreate = () => {
        setExpanded(true);
        setEditingId(null);
        setForm(EMPTY_FORM);
        setExistingImages([]);
        setNewImages([]);
        setExistingVideos([]);
        setNewVideos([]);
        setError('');
    };

    const startEdit = (farm) => {
        setExpanded(true);
        setEditingId(farm._id);
        setForm({
            title: farm.title || '',
            description: farm.description || '',
            location: farm.location || '',
            price: String(farm.price ?? ''),
            capacity: String(farm.capacity ?? ''),
            amenitiesText: Array.isArray(farm.amenities) ? farm.amenities.join(', ') : '',
            videoLinksText: '',
            category: farm.category || 'Farm',
            subCategory: farm.subCategory || '',
            availability: farm.availability || 'All Days'
        });
        setExistingImages(Array.isArray(farm.images) ? farm.images : []);
        setNewImages([]);
        setExistingVideos(Array.isArray(farm.videos) ? farm.videos : []);
        setNewVideos([]);
        setError('');
    };

    const cancelEdit = () => {
        setExpanded(false);
        setEditingId(null);
        setForm(EMPTY_FORM);
        setExistingImages([]);
        setNewImages([]);
        setExistingVideos([]);
        setNewVideos([]);
        setError('');
    };

    const removeExistingImage = (url) => {
        setExistingImages((prev) => prev.filter((x) => x !== url));
    };

    const removeExistingVideo = (url) => {
        setExistingVideos((prev) => prev.filter((x) => x !== url));
    };

    const parseAmenities = (text) => {
        return (text || '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
    };

    const parseVideoLinks = (text) => {
        return (text || '')
            .split(/[\n,]+/g)
            .map((s) => s.trim())
            .filter(Boolean);
    };

    const validateFilesBySize = (files, label) => {
        const tooLarge = files.find((file) => file.size > MAX_UPLOAD_FILE_SIZE_BYTES);
        if (!tooLarge) return null;
        const fileSizeMb = (tooLarge.size / (1024 * 1024)).toFixed(2);
        return `${label} "${tooLarge.name}" is ${fileSizeMb}MB. Maximum allowed is ${MAX_UPLOAD_FILE_SIZE_MB}MB per file.`;
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            const fd = new FormData();
            fd.append('title', form.title);
            fd.append('description', form.description);
            fd.append('location', form.location);
            fd.append('price', form.price);
            fd.append('capacity', form.capacity);
            fd.append('category', form.category);
            fd.append('subCategory', form.subCategory);
            fd.append('availability', form.availability);
            fd.append('amenities', parseAmenities(form.amenitiesText).join(','));
            fd.append('videoLinks', parseVideoLinks(form.videoLinksText).join(','));

            if (editingId) {
                fd.append('existingImages', JSON.stringify(existingImages));
                fd.append('existingVideos', JSON.stringify(existingVideos));
            }

            for (const file of newImages) {
                fd.append('images', file);
            }
            for (const file of newVideos) {
                fd.append('videos', file);
            }

            if (editingId) {
                await axios.put(`${API_URL}/api/admin/farms/${editingId}`, fd, getAuthConfig());
            } else {
                await axios.post(`${API_URL}/api/admin/farms`, fd, getAuthConfig());
            }

            await fetchFarms();
            cancelEdit();
        } catch (e2) {
            console.error('Save farm failed:', e2?.response?.data || e2);
            setError(getErrorMessage(e2, 'Failed to save farm'));
        } finally {
            setSaving(false);
        }
    };

    const onDelete = async (farmId) => {
        const ok = window.confirm('Delete this farm stay? This cannot be undone.');
        if (!ok) return;

        setError('');
        try {
            await axios.delete(`${API_URL}/api/admin/farms/${farmId}`, getAuthConfig());
            setFarms((prev) => prev.filter((f) => f._id !== farmId));
        } catch (e) {
            setError(getErrorMessage(e, 'Failed to delete farm'));
        }
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mt-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Manage Farm Stays</h2>
                    <p className="text-sm text-gray-500">Create or update farm stay content and images (admin only)</p>
                </div>
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={fetchFarms}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                    >
                        <RefreshCw size={16} /> Refresh
                    </button>
                    <button
                        type="button"
                        onClick={startCreate}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-white hover:bg-green-600"
                    >
                        <PlusCircle size={16} /> New Farm
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {expanded && (
                <form onSubmit={onSubmit} className="mb-8 rounded-xl border border-gray-100 bg-gray-50 p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                            <input
                                value={form.title}
                                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                                placeholder="e.g., Vineyard Farm Stay"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                                rows={6}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Write full farm stay content here..."
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Location</label>
                            <input
                                value={form.location}
                                onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                                placeholder="e.g., Amangal, Telangana"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Price / night</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.price}
                                    onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="4999"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Capacity</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={form.capacity}
                                    onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))}
                                    className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="12"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                            <input
                                value={form.category}
                                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Farm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Sub Category</label>
                            <input
                                value={form.subCategory}
                                onChange={(e) => setForm((p) => ({ ...p, subCategory: e.target.value }))}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                                placeholder="e.g., Vineyard"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Availability</label>
                            <select
                                value={form.availability}
                                onChange={(e) => setForm((p) => ({ ...p, availability: e.target.value }))}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-primary bg-white"
                            >
                                <option value="All Days">All Days</option>
                                <option value="Monday to Friday">Monday to Friday</option>
                            </select>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Amenities (comma separated)</label>
                            <input
                                value={form.amenitiesText}
                                onChange={(e) => setForm((p) => ({ ...p, amenitiesText: e.target.value }))}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                                placeholder="WiFi, Swimming Pool, BBQ Grill, Parking"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Images</label>

                            {editingId && existingImages.length > 0 && (
                                <div className="mb-3">
                                    <div className="text-xs font-semibold text-gray-600 mb-2">Existing images</div>
                                    <div className="flex flex-wrap gap-3">
                                        {existingImages.map((url) => (
                                            <div key={url} className="relative">
                                                <img
                                                    src={url}
                                                    alt="Existing"
                                                    className="h-16 w-24 rounded-md object-cover border border-gray-200"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingImage(url)}
                                                    className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-1 hover:bg-gray-50"
                                                    title="Remove"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer">
                                    <ImagePlus size={16} />
                                    <span className="text-sm font-medium">Choose images</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            const sizeError = validateFilesBySize(files, 'Image');
                                            if (sizeError) {
                                                setError(sizeError);
                                                setNewImages([]);
                                                e.target.value = '';
                                                return;
                                            }
                                            setError('');
                                            setNewImages(files);
                                        }}
                                    />
                                </label>
                                <div className="text-sm text-gray-600">
                                    {newImages.length > 0 ? `${newImages.length} selected` : 'No new images selected'}
                                </div>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Max size: {MAX_UPLOAD_FILE_SIZE_MB}MB per image.</p>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Video links (YouTube/MP4, comma or new line separated)</label>
                            <input
                                value={form.videoLinksText}
                                onChange={(e) => setForm((p) => ({ ...p, videoLinksText: e.target.value }))}
                                className="w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                                placeholder="https://youtube.com/watch?v=... , https://youtu.be/... , https://.../video.mp4"
                            />
                            <p className="mt-1 text-xs text-gray-500">Tip: You can paste normal YouTube links; they will be saved as embed links.</p>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Videos (upload)</label>

                            {editingId && existingVideos.length > 0 && (
                                <div className="mb-3">
                                    <div className="text-xs font-semibold text-gray-600 mb-2">Existing videos</div>
                                    <div className="flex flex-wrap gap-2">
                                        {existingVideos.map((url) => (
                                            <div key={url} className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1">
                                                <Video size={14} className="text-gray-600" />
                                                <a
                                                    href={url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="max-w-[260px] truncate text-xs text-blue-700 hover:underline"
                                                    title={url}
                                                >
                                                    {url}
                                                </a>
                                                <button
                                                    type="button"
                                                    onClick={() => removeExistingVideo(url)}
                                                    className="ml-1 rounded-full p-1 hover:bg-gray-50"
                                                    title="Remove"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 cursor-pointer">
                                    <Video size={16} />
                                    <span className="text-sm font-medium">Choose videos</span>
                                    <input
                                        type="file"
                                        accept="video/*"
                                        multiple
                                        className="hidden"
                                        onChange={(e) => {
                                            const files = Array.from(e.target.files || []);
                                            const sizeError = validateFilesBySize(files, 'Video');
                                            if (sizeError) {
                                                setError(sizeError);
                                                setNewVideos([]);
                                                e.target.value = '';
                                                return;
                                            }
                                            setError('');
                                            setNewVideos(files);
                                        }}
                                    />
                                </label>
                                <div className="text-sm text-gray-600">
                                    {newVideos.length > 0 ? `${newVideos.length} selected` : 'No new videos selected'}
                                </div>
                            </div>
                            <p className="mt-1 text-xs text-gray-500">Max size: {MAX_UPLOAD_FILE_SIZE_MB}MB per video.</p>
                        </div>
                    </div>

                    <div className="mt-5 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-end">
                        <button
                            type="button"
                            onClick={cancelEdit}
                            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100"
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-secondary text-white hover:bg-blue-600 disabled:opacity-60"
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : (editingId ? 'Update Farm' : 'Create Farm')}
                        </button>
                    </div>
                </form>
            )}

            {loading ? (
                <div className="py-10 text-center text-gray-600">Loading farms...</div>
            ) : farms.length === 0 ? (
                <div className="py-10 text-center text-gray-600">No farms found</div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="text-left py-3 px-3 text-sm font-semibold text-gray-600">Farm</th>
                                <th className="text-left py-3 px-3 text-sm font-semibold text-gray-600">Location</th>
                                <th className="text-left py-3 px-3 text-sm font-semibold text-gray-600">Price</th>
                                <th className="text-left py-3 px-3 text-sm font-semibold text-gray-600">Capacity</th>
                                <th className="text-left py-3 px-3 text-sm font-semibold text-gray-600">Images</th>
                                <th className="text-right py-3 px-3 text-sm font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {farms.map((farm) => (
                                <tr key={farm._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                    <td className="py-3 px-3">
                                        <div className="flex items-center gap-3 min-w-[240px]">
                                            <img
                                                src={farm.images?.[0] || 'https://via.placeholder.com/96x64'}
                                                alt={farm.title}
                                                className="h-12 w-16 rounded-md object-cover border border-gray-200"
                                                loading="lazy"
                                            />
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold text-gray-900">{farm.title}</span>
                                                <span className="text-xs text-gray-500">{farm.subCategory || farm.category || 'Farm'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 px-3 text-sm text-gray-700">{farm.location}</td>
                                    <td className="py-3 px-3 text-sm font-semibold text-gray-900">₹{Number(farm.price || 0).toLocaleString()}</td>
                                    <td className="py-3 px-3 text-sm text-gray-700">{farm.capacity}</td>
                                    <td className="py-3 px-3 text-sm text-gray-700">{farm.images?.length || 0}</td>
                                    <td className="py-3 px-3">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => startEdit(farm)}
                                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
                                            >
                                                <Pencil size={16} /> Edit
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => onDelete(farm._id)}
                                                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 size={16} /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminFarmManager;

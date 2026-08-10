import { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, ImagePlus, Pencil, Plus, Trash2, X } from 'lucide-react';
import API_URL from '../../config';

const EMPTY_FORM = { title: '', excerpt: '', content: '', author: '', published: true };
const MAX_COVER_IMAGE_SIZE = 50 * 1024 * 1024;

const BlogManager = () => {
    const [blogs, setBlogs] = useState([]);
    const [form, setForm] = useState(EMPTY_FORM);
    const [coverImage, setCoverImage] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const authConfig = useCallback(() => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }), []);
    const fetchBlogs = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/admin/blogs`, authConfig());
            setBlogs(data || []);
        } catch (err) {
            setError(err.response?.data?.message || 'Could not load blogs.');
        } finally { setLoading(false); }
    }, [authConfig]);

    useEffect(() => { fetchBlogs(); }, [fetchBlogs]);
    const updateField = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));
    const startCreate = () => { setForm(EMPTY_FORM); setCoverImage(null); setEditingId(null); setExpanded(true); setError(''); };
    const startEdit = (blog) => { setForm({ title: blog.title || '', excerpt: blog.excerpt || '', content: blog.content || '', author: blog.author || '', published: blog.published }); setCoverImage(null); setEditingId(blog._id); setExpanded(true); setError(''); };
    const cancel = () => { setExpanded(false); setEditingId(null); setCoverImage(null); setForm(EMPTY_FORM); };

    const saveBlog = async (event) => {
        event.preventDefault();
        if (coverImage && coverImage.size > MAX_COVER_IMAGE_SIZE) {
            setError('Cover image must be smaller than 50MB.');
            return;
        }
        if (coverImage && !coverImage.type.startsWith('image/')) {
            setError('Please choose an image file.');
            return;
        }
        setSaving(true); setError('');
        const payload = new FormData();
        Object.entries(form).forEach(([key, value]) => payload.append(key, value));
        if (coverImage) payload.append('coverImage', coverImage);
        try {
            await axios({ method: editingId ? 'put' : 'post', url: `${API_URL}/api/admin/blogs${editingId ? `/${editingId}` : ''}`, data: payload, headers: authConfig().headers });
            cancel(); await fetchBlogs();
        } catch (err) {
            const message = err.response?.data?.message || err.response?.data?.error;
            setError(message || (err.request ? 'The image upload could not reach the server. Please try again.' : 'Could not save blog.'));
        }
        finally { setSaving(false); }
    };

    const deleteBlog = async (id) => {
        if (!window.confirm('Delete this blog post?')) return;
        try { await axios.delete(`${API_URL}/api/admin/blogs/${id}`, authConfig()); await fetchBlogs(); }
        catch (err) { setError(err.response?.data?.message || 'Could not delete blog.'); }
    };

    return (
        <section className="mb-8 rounded-2xl border border-[#ead7b8] bg-[#fffaf1] p-5 shadow-sm dark:border-[#31392f] dark:bg-[#1a2118] sm:p-6">
            <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-[#a27a3d] dark:text-[#e7c678]">Content</p><h2 className="text-2xl font-bold text-[#211b14] dark:text-[#fff8ea]">Blog posts</h2></div><button type="button" onClick={startCreate} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#7a5527] px-4 py-2 font-semibold text-white transition hover:bg-[#a27a3d]"><Plus size={18} /> New blog post</button></div>
            {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            {expanded && <form onSubmit={saveBlog} className="mb-6 space-y-4 rounded-xl border border-[#ead7b8] bg-[#fff8ea] p-4 dark:border-[#31392f] dark:bg-[#151b15]">
                <div className="flex items-center justify-between"><h3 className="font-bold text-[#211b14] dark:text-[#fff8ea]">{editingId ? 'Edit blog post' : 'Create blog post'}</h3><button type="button" onClick={cancel} className="rounded-full p-1 text-[#7a5527]" aria-label="Close blog form"><X size={20} /></button></div>
                <input name="title" value={form.title} onChange={updateField} placeholder="Blog title" required className="w-full rounded-lg border border-[#dfcaa8] bg-white px-3 py-2 dark:border-[#3a4438] dark:bg-[#1a2118] dark:text-[#fff8ea]" />
                <textarea name="excerpt" value={form.excerpt} onChange={updateField} placeholder="Short excerpt shown on the blog page" required rows="3" className="w-full rounded-lg border border-[#dfcaa8] bg-white px-3 py-2 dark:border-[#3a4438] dark:bg-[#1a2118] dark:text-[#fff8ea]" />
                <textarea name="content" value={form.content} onChange={updateField} placeholder="Write your story. Separate paragraphs with a blank line." required rows="10" className="w-full rounded-lg border border-[#dfcaa8] bg-white px-3 py-2 dark:border-[#3a4438] dark:bg-[#1a2118] dark:text-[#fff8ea]" />
                <div className="grid gap-4 sm:grid-cols-2"><input name="author" value={form.author} onChange={updateField} placeholder="Author (optional)" className="w-full rounded-lg border border-[#dfcaa8] bg-white px-3 py-2 dark:border-[#3a4438] dark:bg-[#1a2118] dark:text-[#fff8ea]" /><label className="flex items-center gap-2 rounded-lg border border-[#dfcaa8] px-3 py-2 text-sm text-[#645747] dark:border-[#3a4438] dark:text-[#b5a898]"><input type="checkbox" name="published" checked={form.published} onChange={updateField} /> Publish immediately</label></div>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-[#dfcaa8] px-3 py-3 text-sm text-[#645747] dark:border-[#3a4438] dark:text-[#b5a898]"><ImagePlus size={18} /> {coverImage ? coverImage.name : 'Choose cover image'}<input type="file" accept="image/*" onChange={(event) => setCoverImage(event.target.files?.[0] || null)} className="sr-only" /></label>
                <button type="submit" disabled={saving} className="rounded-lg bg-[#7a5527] px-5 py-2 font-semibold text-white disabled:opacity-60">{saving ? 'Saving...' : editingId ? 'Update post' : 'Create post'}</button>
            </form>}
            {loading ? <p className="text-[#645747] dark:text-[#b5a898]">Loading blogs...</p> : !blogs.length ? <div className="rounded-xl border border-dashed border-[#dfcaa8] p-6 text-center text-[#645747] dark:border-[#3a4438] dark:text-[#b5a898]">No blog posts yet.</div> : <div className="space-y-3">{blogs.map((blog) => <div key={blog._id} className="flex flex-col justify-between gap-4 rounded-xl border border-[#ead7b8] p-4 dark:border-[#31392f] sm:flex-row sm:items-center"><div className="flex items-start gap-3"><FileText className="mt-1 flex-shrink-0 text-[#a27a3d]" size={20} /><div><h3 className="font-bold text-[#211b14] dark:text-[#fff8ea]">{blog.title}</h3><p className="mt-1 text-sm text-[#645747] dark:text-[#b5a898]">{blog.published ? 'Published' : 'Draft'} · {new Date(blog.updatedAt || blog.createdAt).toLocaleDateString('en-IN')}</p></div></div><div className="flex gap-2"><button type="button" onClick={() => startEdit(blog)} className="inline-flex items-center gap-1 rounded-lg border border-[#dfcaa8] px-3 py-2 text-sm font-semibold text-[#7a5527] dark:border-[#3a4438] dark:text-[#e7c678]"><Pencil size={15} /> Edit</button><button type="button" onClick={() => deleteBlog(blog._id)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-600"><Trash2 size={15} /> Delete</button></div></div>)}</div>}
        </section>
    );
};

export default BlogManager;

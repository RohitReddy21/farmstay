import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { ArrowRight, BookOpen } from 'lucide-react';
import API_URL from '../config';

const BlogCoverImage = ({ blog }) => {
    const [imageFailed, setImageFailed] = useState(false);

    if (!blog.coverImage || imageFailed) {
        return <div className="flex h-56 items-center justify-center bg-[#f4ead8] text-[#7a5527] dark:bg-[#232823] dark:text-[#e7c678]"><BookOpen size={40} /></div>;
    }

    return <img src={blog.coverImage} alt={blog.title} onError={() => setImageFailed(true)} className="h-56 w-full object-cover transition duration-500 group-hover:scale-105" />;
};

const Blogs = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        axios.get(`${API_URL}/api/blogs`)
            .then(({ data }) => setBlogs(data || []))
            .catch(() => setError('We could not load the blog right now.'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <section className="mx-auto w-full max-w-7xl space-y-10 py-6 sm:py-10">
            <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-[#f4ead8] px-4 py-2 text-sm font-semibold text-[#7a5527] dark:bg-[#232823] dark:text-[#e7c678]"><BookOpen size={16} /> From the farm</div>
                <h1 className="text-4xl font-bold tracking-tight text-[#211b14] dark:text-[#fff8ea] sm:text-5xl">Stories from Brown Cows</h1>
                <p className="text-lg leading-relaxed text-[#645747] dark:text-[#b5a898]">Notes on mindful farm stays, ethical dairy, rural living, and the people who make our farm special.</p>
            </div>
            {loading && <p className="text-[#645747] dark:text-[#b5a898]">Loading stories...</p>}
            {error && <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</p>}
            {!loading && !error && !blogs.length && <div className="rounded-2xl border border-dashed border-[#dfcaa8] bg-[#fffaf1] p-10 text-center text-[#645747] dark:border-[#3a4438] dark:bg-[#1a2118] dark:text-[#b5a898]">New stories are coming soon.</div>}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {blogs.map((blog) => (
                    <article key={blog._id} className="group overflow-hidden rounded-2xl border border-[#ead7b8] bg-[#fffaf1] shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-[#31392f] dark:bg-[#1a2118]">
                        <BlogCoverImage blog={blog} />
                        <div className="space-y-4 p-6">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#a27a3d] dark:text-[#e7c678]">{blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString('en-IN') : 'Farm journal'}</p>
                            <h2 className="text-2xl font-bold text-[#211b14] dark:text-[#fff8ea]">{blog.title}</h2>
                            <p className="line-clamp-3 leading-relaxed text-[#645747] dark:text-[#b5a898]">{blog.excerpt}</p>
                            <Link to={`/blogs/${blog.slug}`} className="inline-flex items-center gap-2 font-semibold text-[#7a5527] hover:text-[#a27a3d] dark:text-[#e7c678]">Read story <ArrowRight size={17} /></Link>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
};

export default Blogs;

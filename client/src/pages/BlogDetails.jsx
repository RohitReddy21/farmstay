import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, BookOpen } from 'lucide-react';
import API_URL from '../config';

const BlogDetails = () => {
    const { slug } = useParams();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [coverImageFailed, setCoverImageFailed] = useState(false);

    useEffect(() => {
        axios.get(`${API_URL}/api/blogs/${slug}`)
            .then(({ data }) => setBlog(data))
            .catch(() => setError('This story is not available.'))
            .finally(() => setLoading(false));
    }, [slug]);

    if (loading) return <div className="py-16 text-center text-[#645747] dark:text-[#b5a898]">Loading story...</div>;
    if (error || !blog) return <div className="space-y-5 py-16 text-center"><p className="text-lg text-red-700">{error || 'This story is not available.'}</p><Link to="/blogs" className="font-semibold text-[#7a5527] dark:text-[#e7c678]">Back to blog</Link></div>;

    return (
        <article className="mx-auto w-full max-w-4xl py-6 sm:py-10">
            <Link to="/blogs" className="mb-8 inline-flex items-center gap-2 font-semibold text-[#7a5527] dark:text-[#e7c678]"><ArrowLeft size={17} /> Back to blog</Link>
            {blog.coverImage && !coverImageFailed ? <img src={blog.coverImage} alt={blog.title} onError={() => setCoverImageFailed(true)} className="mb-10 max-h-[32rem] w-full rounded-3xl object-cover shadow-lg" /> : <div className="mb-10 flex h-64 items-center justify-center rounded-3xl bg-[#f4ead8] text-[#7a5527] dark:bg-[#232823] dark:text-[#e7c678]"><BookOpen size={56} /></div>}
            <div className="mb-10 space-y-5">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#a27a3d] dark:text-[#e7c678]">{blog.publishedAt ? new Date(blog.publishedAt).toLocaleDateString('en-IN') : 'Farm journal'} · {blog.author}</p>
                <h1 className="text-4xl font-bold tracking-tight text-[#211b14] dark:text-[#fff8ea] sm:text-6xl">{blog.title}</h1>
                <p className="text-xl leading-relaxed text-[#645747] dark:text-[#b5a898]">{blog.excerpt}</p>
            </div>
            <div className="space-y-6 text-lg leading-8 text-[#4c3f30] dark:text-[#cfc2b2]">
                {blog.content.split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>
        </article>
    );
};

export default BlogDetails;

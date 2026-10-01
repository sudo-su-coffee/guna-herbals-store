
'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BLOG_POSTS } from '@/lib/constants';
import { BlogPost } from '@/lib/types';

export default function JournalPostPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { id } = use(params);
    const [post, setPost] = useState<BlogPost | null>(null);

    useEffect(() => {
        // Find the post by ID
        const foundPost = BLOG_POSTS.find(p => p.id === id) || null;
        setPost(foundPost);
    }, [id]);

    if (!post) {
        return (
            <div className="min-h-screen bg-white pt-24 pb-20 flex items-center justify-center">
                <p>Loading or Post Not Found...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white pt-24 pb-20">
            <div className="max-w-3xl mx-auto px-6">
                <Link href="/journal" className="mb-8 text-gray-500 hover:text-herbal-800 font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-colors">
                    <span>←</span> Back to Journal
                </Link>

                <header className="mb-10 text-center">
                    <div className="flex justify-center gap-2 mb-6">
                        {post.tags.map(tag => (
                            <span key={tag} className="bg-herbal-50 text-herbal-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                {tag}
                            </span>
                        ))}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-6 leading-tight">
                        {post.title}
                    </h1>
                    <div className="flex items-center justify-center gap-4 text-xs text-gray-500 font-sans border-t border-b border-gray-100 py-4">
                        <span>By <strong className="text-gray-800">{post.author}</strong></span>
                        <span>•</span>
                        <span>{post.date}</span>
                        <span>•</span>
                        <span>{post.readTime}</span>
                    </div>
                </header>

                <div className="mb-10 rounded-2xl overflow-hidden shadow-lg">
                    <img src={post.image} alt={post.title} className="w-full h-auto object-cover" />
                </div>

                <article
                    className="prose prose-lg prose-herbal mx-auto text-gray-700 font-serif leading-loose"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                <div className="mt-16 pt-10 border-t border-gray-100 text-center">
                    <h3 className="font-sans font-bold text-gray-900 mb-4">Share this article</h3>
                    <div className="flex justify-center gap-4">
                        <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-herbal-50 transition-colors">FB</button>
                        <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-herbal-50 transition-colors">X</button>
                        <button className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-herbal-50 transition-colors">WA</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

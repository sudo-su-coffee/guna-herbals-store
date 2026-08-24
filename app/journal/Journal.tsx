
import React from 'react';
import { ViewState, BlogPost } from '../../types';
import { BLOG_POSTS } from '../../constants';

interface JournalProps {
  setView: (view: ViewState) => void;
  openPost: (post: BlogPost) => void;
}

const Journal: React.FC<JournalProps> = ({ setView, openPost }) => {
  return (
    <div className="min-h-screen bg-earth-50 pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
                <span className="text-gold-500 font-sans text-xs uppercase tracking-[0.25em] mb-4 block">Guna's Wisdom</span>
                <h1 className="text-4xl md:text-6xl font-serif text-herbal-900 mb-6">The Herbal Journal</h1>
                <p className="max-w-2xl mx-auto text-gray-600 font-light text-base md:text-lg">
                    Explore the ancient secrets of Siddha medicine, hair care rituals, and the science behind our ingredients.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {BLOG_POSTS.map(post => (
                    <div 
                        key={post.id} 
                        className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-earth-100 cursor-pointer flex flex-col"
                        onClick={() => openPost(post)}
                    >
                        <div className="relative h-56 overflow-hidden">
                            <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-herbal-800">
                                {post.tags[0]}
                            </div>
                        </div>
                        <div className="p-6 flex-grow flex flex-col">
                            <div className="flex justify-between items-center text-xs text-gray-400 mb-3 font-sans">
                                <span>{post.date}</span>
                                <span>{post.readTime}</span>
                            </div>
                            <h3 className="text-xl font-serif font-bold text-gray-900 mb-3 group-hover:text-herbal-700 transition-colors line-clamp-2">
                                {post.title}
                            </h3>
                            <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4 flex-grow">
                                {post.excerpt}
                            </p>
                            <span className="text-herbal-800 font-bold text-xs uppercase tracking-widest border-b border-herbal-200 self-start pb-1 group-hover:border-herbal-800 transition-colors">
                                Read Article
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default Journal;

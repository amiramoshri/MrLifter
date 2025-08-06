import React, { useState } from 'react';
import { Play, Plus, Edit3, Trash2, Save, X, Video as VideoIcon, ExternalLink } from 'lucide-react';
import { Video } from '../types';

interface VideosSectionProps {
  videos: Video[];
  isAdmin: boolean;
  onVideoUpdate: (action: 'add' | 'update' | 'delete', videoData: any) => void;
}

export default function VideosSection({ videos, isAdmin, onVideoUpdate }: VideosSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVideo, setEditingVideo] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | Video['category']>('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    thumbnail: '',
    category: 'exercise' as Video['category']
  });

  const categories = [
    { value: 'all', label: 'All Videos', color: 'bg-gray-600' },
    { value: 'exercise', label: 'Exercise', color: 'bg-blue-600' },
    { value: 'tutorial', label: 'Tutorial', color: 'bg-green-600' },
    { value: 'motivation', label: 'Motivation', color: 'bg-purple-600' },
    { value: 'nutrition', label: 'Nutrition', color: 'bg-orange-600' },
    { value: 'shorts', label: 'Shorts', color: 'bg-red-600' },
    { value: 'reels', label: 'Reels', color: 'bg-pink-600' }
  ];

  const filteredVideos = videos.filter(video => 
    selectedCategory === 'all' || video.category === selectedCategory
  );

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      url: '',
      thumbnail: '',
      category: 'exercise'
    });
    setShowAddForm(false);
    setEditingVideo(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.url) return;

    const videoData = {
      title: formData.title,
      description: formData.description || undefined,
      url: formData.url,
      thumbnail: formData.thumbnail || undefined,
      category: formData.category
    };

    if (editingVideo) {
      onVideoUpdate('update', { id: editingVideo, ...videoData });
    } else {
      onVideoUpdate('add', videoData);
    }

    resetForm();
  };

  const handleEdit = (video: Video) => {
    setFormData({
      title: video.title,
      description: video.description || '',
      url: video.url,
      thumbnail: video.thumbnail || '',
      category: video.category
    });
    setEditingVideo(video.id);
    setShowAddForm(true);
  };

  const handleDelete = (videoId: string) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      onVideoUpdate('delete', { id: videoId });
    }
  };

  const getVideoEmbedUrl = (url: string) => {
    // Convert YouTube URLs to embed format (including Shorts)
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Handle YouTube Shorts
    if (url.includes('youtube.com/shorts/')) {
      const videoId = url.split('shorts/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Handle Instagram Reels - try embed format
    if (url.includes('instagram.com/reel/') || url.includes('instagram.com/p/')) {
      // Extract post ID and try embed format
      const postId = url.split('/reel/')[1]?.split('/')[0] || url.split('/p/')[1]?.split('/')[0];
      if (postId) {
        return `https://www.instagram.com/p/${postId}/embed/`;
      }
    }
    return url;
  };

  const getCategoryColor = (category: Video['category']) => {
    const categoryData = categories.find(c => c.value === category);
    return categoryData?.color || 'bg-gray-600';
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-2 sm:px-0">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
          Training Videos
          {isAdmin && <span className="ml-2 text-orange-400 text-xs sm:text-sm">(👑 Admin Mode)</span>}
        </h2>
        <p className="text-slate-300 text-sm sm:text-base">
          {isAdmin ? 'Manage training videos and tutorials' : 'Watch training videos and tutorials'}
        </p>
      </div>

      {/* Category Filter */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {categories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value as any)}
              className={`px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-medium transition-all text-xs sm:text-sm ${
                selectedCategory === category.value
                  ? `${category.color} text-white shadow-lg`
                  : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Add Video Button (Admin Only) */}
      {isAdmin && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-1 sm:space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
          >
            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Add Video</span>
          </button>
        </div>
      )}

      {/* Add/Edit Video Form */}
      {isAdmin && showAddForm && (
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
          <h3 className="text-white font-semibold text-base sm:text-lg mb-4">
            {editingVideo ? 'Edit Video' : 'Add New Video'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-slate-300 font-medium mb-2 text-sm sm:text-base">Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Video title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-2 text-sm sm:text-base">Category</label>
                <select
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as Video['category'] })}
                >
                  <option value="exercise">Exercise</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="motivation">Motivation</option>
                  <option value="nutrition">Nutrition</option>
                  <option value="shorts">YouTube Shorts</option>
                  <option value="reels">Instagram Reels</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-2 text-sm sm:text-base">Video URL</label>
              <input
                type="url"
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="YouTube, YouTube Shorts, or Instagram Reels URL"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
              <p className="text-slate-400 text-xs mt-1">
                Supported: YouTube videos, YouTube Shorts, Instagram Reels
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-2 text-sm sm:text-base">Thumbnail URL (optional)</label>
              <input
                type="url"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="https://example.com/thumbnail.jpg"
                value={formData.thumbnail}
                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-2 text-sm sm:text-base">Description (optional)</label>
              <textarea
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
                placeholder="Video description..."
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                type="submit"
                className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-colors text-sm sm:text-base"
              >
                <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{editingVideo ? 'Update Video' : 'Add Video'}</span>
              </button>
              
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-colors text-sm sm:text-base"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Videos Grid */}
      {filteredVideos.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-white/20">
            <VideoIcon className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
              {selectedCategory === 'all' ? 'No videos available' : `No ${selectedCategory} videos`}
            </h3>
            <p className="text-slate-300 text-sm sm:text-base">
              {isAdmin ? 'Add videos to get started!' : 'Check back later for new content!'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className={`bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden hover:bg-white/15 transition-all duration-300 transform hover:scale-[1.02] group ${
                video.category === 'shorts' || video.category === 'reels' ? 'max-w-sm mx-auto' : ''
              }`}
            >
              {/* Video Embed */}
              <div className={`bg-black ${
                video.category === 'shorts' ? 'aspect-[9/16]' : 
                video.category === 'reels' ? 'aspect-[9/16]' : 
                'aspect-video'
              }`}>
                <iframe
                  src={getVideoEmbedUrl(video.url)}
                  title={video.title}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                  onError={(e) => {
                    // If embed fails, show fallback with platform logo
                    const target = e.target as HTMLIFrameElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                
                {/* Fallback for unsupported videos */}
                <div className="w-full h-full hidden items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                  <div className="text-center text-white p-4">
                    {/* Platform Logo */}
                    <div className="mb-4">
                      {video.category === 'reels' ? (
                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-2">
                          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.611-3.132-1.551-.684-.94-.684-2.126 0-3.066.684-.94 1.835-1.551 3.132-1.551s2.448.611 3.132 1.551c.684.94.684 2.126 0 3.066-.684.94-1.835 1.551-3.132 1.551zm7.718 0c-1.297 0-2.448-.611-3.132-1.551-.684-.94-.684-2.126 0-3.066.684-.94 1.835-1.551 3.132-1.551s2.448.611 3.132 1.551c.684.94.684 2.126 0 3.066-.684.94-1.835 1.551-3.132 1.551z"/>
                          </svg>
                        </div>
                      ) : video.url.includes('youtube.com') || video.url.includes('youtu.be') ? (
                        <div className="w-16 h-16 mx-auto bg-red-600 rounded-2xl flex items-center justify-center mb-2">
                          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                        </div>
                      ) : video.url.includes('tiktok.com') ? (
                        <div className="w-16 h-16 mx-auto bg-black rounded-2xl flex items-center justify-center mb-2">
                          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                          </svg>
                        </div>
                      ) : video.url.includes('facebook.com') || video.url.includes('fb.watch') ? (
                        <div className="w-16 h-16 mx-auto bg-blue-600 rounded-2xl flex items-center justify-center mb-2">
                          <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        </div>
                      ) : (
                        <div className="w-16 h-16 mx-auto bg-gray-600 rounded-2xl flex items-center justify-center mb-2">
                          <VideoIcon className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <p className="text-lg font-semibold mb-2">
                      {video.category === 'reels' ? 'Instagram Reel' :
                       video.url.includes('youtube.com') || video.url.includes('youtu.be') ? 'YouTube Video' :
                       video.url.includes('tiktok.com') ? 'TikTok Video' :
                       video.url.includes('facebook.com') || video.url.includes('fb.watch') ? 'Facebook Video' :
                       'Video Content'}
                    </p>
                    
                    <p className="text-sm text-gray-300 mb-4">
                      This content cannot be embedded directly
                    </p>
                    
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-colors text-sm ${
                        video.category === 'reels' ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700' :
                        video.url.includes('youtube.com') || video.url.includes('youtu.be') ? 'bg-red-600 hover:bg-red-700' :
                        video.url.includes('tiktok.com') ? 'bg-black hover:bg-gray-900' :
                        video.url.includes('facebook.com') || video.url.includes('fb.watch') ? 'bg-blue-600 hover:bg-blue-700' :
                        'bg-gray-600 hover:bg-gray-700'
                      } text-white`}
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>
                        {video.category === 'reels' ? 'View on Instagram' :
                         video.url.includes('youtube.com') || video.url.includes('youtu.be') ? 'Watch on YouTube' :
                         video.url.includes('tiktok.com') ? 'Watch on TikTok' :
                         video.url.includes('facebook.com') || video.url.includes('fb.watch') ? 'Watch on Facebook' :
                         'Watch Video'}
                      </span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Video Info */}
              <div className="p-3 sm:p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getCategoryColor(video.category)}`}>
                        {video.category}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white text-base sm:text-lg mb-1 line-clamp-2">
                      {video.title}
                    </h3>
                  </div>

                  {isAdmin && (
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                      <button
                        onClick={() => handleEdit(video)}
                        className="p-0.5 sm:p-1 bg-blue-600 hover:bg-blue-700 rounded text-white"
                      >
                        <Edit3 className="w-2 h-2 sm:w-3 sm:h-3" />
                      </button>
                      <button
                        onClick={() => handleDelete(video.id)}
                        className="p-0.5 sm:p-1 bg-red-600 hover:bg-red-700 rounded text-white"
                      >
                        <Trash2 className="w-2 h-2 sm:w-3 sm:h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {video.description && (
                  <p className="text-slate-300 text-xs sm:text-sm mb-3 line-clamp-2">
                    {video.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs">
                    {new Date(video.createdAt).toLocaleDateString()}
                  </span>
                  
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors text-xs sm:text-sm"
                  >
                    <ExternalLink className="w-2 h-2 sm:w-3 sm:h-3" />
                    <span>Watch</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
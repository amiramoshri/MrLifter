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
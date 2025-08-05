import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Trash2, Edit3, Save, X, Plus, Calendar } from 'lucide-react';

interface ProgramImage {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  type: 'weekly' | 'monthly';
  createdAt: string;
}

interface ProgramViewerProps {
  isAdmin: boolean;
  onProgramUpdate?: (images: ProgramImage[]) => void;
  programImages: ProgramImage[];
}

export default function ProgramViewer({ isAdmin, onProgramUpdate, programImages }: ProgramViewerProps) {
  const [selectedType, setSelectedType] = useState<'all' | 'weekly' | 'monthly'>('all');
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    imageUrl: '',
    type: 'weekly' as 'weekly' | 'monthly'
  });
  const [isUploading, setIsUploading] = useState(false);

  const filteredImages = programImages.filter(image => 
    selectedType === 'all' || image.type === selectedType
  );

  const resetForm = () => {
    setUploadForm({
      title: '',
      description: '',
      imageUrl: '',
      type: 'weekly'
    });
    setShowUploadForm(false);
    setEditingImage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!uploadForm.title || !uploadForm.imageUrl) return;

    setIsUploading(true);

    const imageData: ProgramImage = {
      id: editingImage || Date.now().toString(),
      title: uploadForm.title,
      description: uploadForm.description,
      imageUrl: uploadForm.imageUrl,
      type: uploadForm.type,
      createdAt: editingImage ? 
        programImages.find(img => img.id === editingImage)?.createdAt || new Date().toISOString() :
        new Date().toISOString()
    };

    let updatedImages;
    if (editingImage) {
      updatedImages = programImages.map(img => 
        img.id === editingImage ? imageData : img
      );
    } else {
      updatedImages = [imageData, ...programImages];
    }

    onProgramUpdate?.(updatedImages);
    resetForm();
    setIsUploading(false);
  };

  const handleEdit = (image: ProgramImage) => {
    setUploadForm({
      title: image.title,
      description: image.description || '',
      imageUrl: image.imageUrl,
      type: image.type
    });
    setEditingImage(image.id);
    setShowUploadForm(true);
  };

  const handleDelete = (imageId: string) => {
    if (window.confirm('Are you sure you want to delete this program image?')) {
      const updatedImages = programImages.filter(img => img.id !== imageId);
      onProgramUpdate?.(updatedImages);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
          Training Programs
          {isAdmin && <span className="ml-2 text-orange-400 text-xs sm:text-sm">(👑 Admin Mode)</span>}
        </h2>
        <p className="text-slate-300 text-sm sm:text-base">
          {isAdmin ? 'Manage training program images' : 'View weekly and monthly training programs'}
        </p>
      </div>

      {/* Type Filter */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-xs sm:text-sm ${
                selectedType === 'all'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              📅 All Programs
            </button>
            <button
              onClick={() => setSelectedType('weekly')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-xs sm:text-sm ${
                selectedType === 'weekly'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              📊 Weekly Programs
            </button>
            <button
              onClick={() => setSelectedType('monthly')}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-xs sm:text-sm ${
                selectedType === 'monthly'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white'
              }`}
            >
              🗓️ Monthly Programs
            </button>
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowUploadForm(true)}
              className="flex items-center space-x-1 sm:space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-colors text-xs sm:text-sm"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Add Program</span>
            </button>
          )}
        </div>
      </div>

      {/* Upload Form */}
      {isAdmin && showUploadForm && (
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/20">
          <h3 className="text-white font-semibold text-base sm:text-lg mb-4">
            {editingImage ? 'Edit Program Image' : 'Add New Program Image'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-slate-300 font-medium mb-2 text-sm sm:text-base">Title</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="Program title (e.g., Week 1 - Upper Body)"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-2 text-sm sm:text-base">Type</label>
                <select
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                  value={uploadForm.type}
                  onChange={(e) => setUploadForm({ ...uploadForm, type: e.target.value as 'weekly' | 'monthly' })}
                >
                  <option value="weekly">📊 Weekly Program</option>
                  <option value="monthly">🗓️ Monthly Program</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-2 text-sm sm:text-base">Image URL</label>
              <input
                type="url"
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                placeholder="https://example.com/program-image.jpg"
                value={uploadForm.imageUrl}
                onChange={(e) => setUploadForm({ ...uploadForm, imageUrl: e.target.value })}
              />
              <p className="text-slate-400 text-xs mt-1">
                Upload your image to a service like Imgur, Google Drive, or Dropbox and paste the direct link here
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-2 text-sm sm:text-base">Description (optional)</label>
              <textarea
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
                placeholder="Program description..."
                rows={3}
                value={uploadForm.description}
                onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
              />
            </div>

            {/* Image Preview */}
            {uploadForm.imageUrl && (
              <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
                <p className="text-slate-300 text-sm mb-2">Preview:</p>
                <img
                  src={uploadForm.imageUrl}
                  alt="Preview"
                  className="w-full max-w-md mx-auto rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling!.classList.remove('hidden');
                  }}
                />
                <div className="hidden text-center text-slate-400 text-sm">
                  ❌ Invalid image URL
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                type="submit"
                disabled={isUploading}
                className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold transition-colors text-sm sm:text-base disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>{editingImage ? 'Update Program' : 'Add Program'}</span>
                  </>
                )}
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

      {/* Program Images Grid */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-white/20">
            <ImageIcon className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
              {selectedType === 'all' ? 'No program images available' : `No ${selectedType} programs`}
            </h3>
            <p className="text-slate-300 text-sm sm:text-base">
              {isAdmin ? 'Add program images to get started!' : 'Check back later for new programs!'}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-1 lg:grid-cols-2">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden hover:bg-white/15 transition-all duration-300 transform hover:scale-[1.02] group"
            >
              {/* Image */}
              <div className="relative">
                <img
                  src={image.imageUrl}
                  alt={image.title}
                  className="w-full h-64 sm:h-80 object-contain bg-slate-800"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzc0MTUxIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                  }}
                />
                
                {/* Type Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                    image.type === 'weekly' ? 'bg-green-600' : 'bg-purple-600'
                  }`}>
                    {image.type === 'weekly' ? '📊 Weekly' : '🗓️ Monthly'}
                  </span>
                </div>

                {/* Admin Controls */}
                {isAdmin && (
                  <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(image)}
                      className="p-1.5 bg-blue-600 hover:bg-blue-700 rounded text-white"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDelete(image.id)}
                      className="p-1.5 bg-red-600 hover:bg-red-700 rounded text-white"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-white text-base sm:text-lg mb-2">
                  {image.title}
                </h3>

                {image.description && (
                  <p className="text-slate-300 text-sm mb-3">
                    {image.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(image.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  <button
                    onClick={() => window.open(image.imageUrl, '_blank')}
                    className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Upload className="w-3 h-3" />
                    <span>View Full Size</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Instructions for Admin */}
      {isAdmin && (
        <div className="bg-blue-600/20 backdrop-blur-sm rounded-xl p-4 border border-blue-500/30">
          <h4 className="text-blue-300 font-semibold mb-2">📝 Instructions for uploading images:</h4>
          <ul className="text-blue-200 text-sm space-y-1">
            <li>• Upload your program image to a free service like <strong>Imgur</strong>, <strong>Google Drive</strong>, or <strong>Dropbox</strong></li>
            <li>• Make sure the image is publicly accessible (anyone with the link can view)</li>
            <li>• Copy the direct image URL and paste it in the form above</li>
            <li>• Recommended image size: 800x600 pixels or larger for best quality</li>
          </ul>
        </div>
      )}
    </div>
  );
}
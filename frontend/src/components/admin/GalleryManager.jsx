import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const GalleryManager = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await api.get('rooms/gallery/');
      setImages(res.data);
    } catch (error) {
      toast.error('Failed to load gallery images');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFiles || selectedFiles.length === 0) {
      toast.error('Please select at least one image to upload');
      return;
    }

    setUploading(true);
    try {
      const uploadPromises = selectedFiles.map(file => {
        const formData = new FormData();
        formData.append('image', file);
        if (caption) {
          formData.append('caption', caption);
        }
        return api.post('rooms/gallery/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      });

      await Promise.all(uploadPromises);
      toast.success(`${selectedFiles.length} image(s) uploaded successfully`);
      setCaption('');
      setSelectedFiles([]);
      setShowForm(false);
      fetchGallery();
    } catch (error) {
      toast.error('Failed to upload some images');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        await api.delete(`rooms/gallery/${id}/`);
        toast.success('Image deleted successfully');
        fetchGallery();
      } catch (error) {
        toast.error('Failed to delete image');
      }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Gallery Images</h4>
        <button 
          className="btn btn-primary-modern shadow-sm" 
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? (
            <><i className="fas fa-times me-2"></i>Cancel</>
          ) : (
            <><i className="fas fa-plus me-2"></i>Add New Images</>
          )}
        </button>
      </div>

      {showForm && (
        <div className="card shadow-sm border-0 p-4 bg-light mb-4">
          <h5 className="mb-3">Upload Images</h5>
          <form onSubmit={handleUpload}>
            <div className="row g-3 align-items-end">
              <div className="col-md-5">
                <label className="form-label text-muted small fw-bold">Select Images</label>
                <input 
                  type="file" 
                  className="form-control" 
                  accept="image/*" 
                  multiple
                  onChange={handleFileChange} 
                  required 
                />
              </div>
              <div className="col-md-5">
                <label className="form-label text-muted small fw-bold">Caption (Optional)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={caption} 
                  onChange={(e) => setCaption(e.target.value)} 
                  placeholder="e.g. Resort Pool View" 
                />
              </div>
              <div className="col-md-2">
                <button type="submit" className="btn btn-success w-100 shadow-sm" disabled={uploading}>
                  {uploading ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span></>
                  ) : 'Upload'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="row g-3">
        {loading ? (
          <div className="col-12 text-center py-5">
            <div className="spinner-border text-primary-modern"></div>
            <div className="mt-2 text-muted small">Loading gallery...</div>
          </div>
        ) : images.length === 0 ? (
          <div className="col-12 text-center py-5 bg-light rounded text-muted">
            <i className="fas fa-images fa-3x mb-3 text-secondary opacity-50"></i>
            <p>No images found in gallery. Click "Add New Images" to start.</p>
          </div>
        ) : (
          images.map(img => (
            <div key={img.id} className="col-md-4 col-lg-3">
              <div className="card h-100 shadow-sm border-0 position-relative overflow-hidden group">
                <img 
                  src={img.image} 
                  alt={img.caption || 'Gallery Image'} 
                  className="card-img-top" 
                  style={{ height: '200px', objectFit: 'cover' }} 
                />
                <div className="card-body p-2 d-flex justify-content-between align-items-center bg-white border-top">
                  <span className="text-truncate small fw-semibold text-muted" style={{ maxWidth: '80%' }}>
                    {img.caption || 'No caption'}
                  </span>
                  <button 
                    className="btn btn-sm btn-outline-danger shadow-sm" 
                    onClick={() => handleDelete(img.id)}
                    title="Delete Image"
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GalleryManager;

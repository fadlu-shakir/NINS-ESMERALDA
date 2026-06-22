import { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const CategoriesManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
  const [editingCategory, setEditingCategory] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('rooms/categories/');
      setCategories(res.data);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`rooms/categories/${editingCategory}/`, categoryForm);
        toast.success('Category updated successfully');
      } else {
        await api.post('rooms/categories/', categoryForm);
        toast.success('Category created successfully');
      }
      setCategoryForm({ name: '', description: '' });
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      toast.error(editingCategory ? 'Failed to update category' : 'Failed to create category');
    }
  };

  const handleEditCategory = (category) => {
    setCategoryForm({ name: category.name, description: category.description });
    setEditingCategory(category.id);
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category? All rooms associated with this category will be affected.')) {
      try {
        await api.delete(`rooms/categories/${id}/`);
        toast.success('Category deleted successfully');
        fetchCategories();
      } catch (error) {
        toast.error('Failed to delete category. It may have associated rooms.');
      }
    }
  };

  const handleCancelCategoryEdit = () => {
    setCategoryForm({ name: '', description: '' });
    setEditingCategory(null);
  };

  // Removed early return to prevent layout shift

  const filteredCategories = categories.filter(c => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (c.name || '').toLowerCase().includes(term);
  });

  return (
    <div className="row">
      <div className="col-lg-4 mb-4">
        <div className="card shadow border-0 p-4 bg-light">
          <h4 className="mb-4">{editingCategory ? 'Edit Category' : 'Add Category'}</h4>
          <form onSubmit={handleCategorySubmit}>
            <div className="mb-3">
              <label className="form-label text-muted small fw-bold">Category Name</label>
              <input type="text" className="form-control" required value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} placeholder="e.g. Deluxe Suite" />
            </div>
            <div className="mb-4">
              <label className="form-label text-muted small fw-bold">Description</label>
              <textarea className="form-control" rows="4" required value={categoryForm.description} onChange={e => setCategoryForm({...categoryForm, description: e.target.value})}></textarea>
            </div>
            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary-modern flex-grow-1">
                {editingCategory ? 'Update Category' : 'Add Category'}
              </button>
              {editingCategory && (
                <button type="button" className="btn btn-secondary" onClick={handleCancelCategoryEdit}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
      <div className="col-lg-8">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0">Existing Categories</h5>
          <div className="search-box position-relative" style={{ minWidth: '250px' }}>
            <i className="bi bi-search position-absolute text-muted" style={{ top: '10px', left: '15px' }}></i>
            <input 
              type="text" 
              className="form-control rounded-pill ps-5 bg-white border-0 shadow-sm" 
              placeholder="Search categories..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="row g-3">
          {loading ? (
            <div className="col-12 text-center py-5">
              <div className="spinner-border text-primary-modern"></div>
              <div className="mt-2 text-muted small">Loading categories...</div>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="col-12 text-center py-4 text-muted">No categories found.</div>
          ) : filteredCategories.map(c => (
            <div key={c.id} className="col-md-6">
              <div className="card h-100 shadow-sm border-0 position-relative">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title text-accent mb-0">{c.name}</h5>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-outline-primary" title="Edit" onClick={() => handleEditCategory(c)}>
                        <i className="fas fa-edit"></i>
                      </button>
                      <button className="btn btn-sm btn-outline-danger" title="Delete" onClick={() => handleDeleteCategory(c.id)}>
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </div>
                  <p className="card-text text-muted small">{c.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoriesManager;

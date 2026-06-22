import React, { useEffect, useState } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api';

const EMPTY_FORM = { name: '', sku: '', price: '', quantity: '', description: '' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [errors, setErrors] = useState({});

  const load = () => {
    setLoading(true);
    getProducts()
      .then(r => setProducts(r.data))
      .catch(() => showAlert('Failed to load products', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const openAdd = () => { setForm(EMPTY_FORM); setErrors({}); setModal('add'); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name, sku: p.sku, price: p.price, quantity: p.quantity, description: p.description || '' });
    setErrors({});
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setEditing(null); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.sku.trim()) e.sku = 'SKU is required';
    if (form.price === '' || isNaN(Number(form.price)) || Number(form.price) < 0) e.price = 'Enter a valid price';
    if (form.quantity === '' || isNaN(Number(form.quantity)) || Number(form.quantity) < 0) e.quantity = 'Enter a valid quantity';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    const payload = { ...form, price: Number(form.price), quantity: Number(form.quantity) };
    try {
      if (modal === 'add') {
        await createProduct(payload);
        showAlert('Product created successfully');
      } else {
        await updateProduct(editing.id, payload);
        showAlert('Product updated');
      }
      closeModal();
      load();
    } catch (err) {
      showAlert(err.response?.data?.detail || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (p) => {
    if (!window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    try {
      await deleteProduct(p.id);
      showAlert('Product deleted');
      load();
    } catch (err) {
      showAlert(err.response?.data?.detail || 'Delete failed', 'error');
    }
  };

  const F = (k) => ({
    value: form[k],
    onChange: (e) => setForm(f => ({ ...f, [k]: e.target.value })),
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="eyebrow">Inventory Catalog</span>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{products.length} items in catalog</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>+ Add Product</button>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <span className="eyebrow">Loading products</span>
        </div>
      ) : (
        <div className="table-wrap">
          <div className="table-header">
            <span className="table-title">Product Catalog</span>
            <span className="eyebrow">{products.length} total</span>
          </div>
          {products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">◈</div>
              <div className="empty-text">No products yet. Add your first one.</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id}>
                    <td className="td-primary">{p.name}</td>
                    <td><span className="sku-badge">{p.sku}</span></td>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>${p.price.toFixed(2)}</td>
                    <td>
                      <span className={p.quantity <= 5 ? 'stock-low' : 'stock-ok'}>
                        {p.quantity} {p.quantity <= 5 && '⚠'}
                      </span>
                    </td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.description || <span className="text-muted">—</span>}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Edit</button>
                        <button className="btn btn-danger" onClick={() => handleDelete(p)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="modal">
            <div className="modal-head">
              <span className="modal-title">{modal === 'add' ? 'Add New Product' : `Edit ${editing?.name}`}</span>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input className="form-input" placeholder="e.g. Wireless Keyboard" {...F('name')} />
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">SKU / Code *</label>
                  <input className="form-input font-mono" placeholder="e.g. KB-001" {...F('sku')} />
                  {errors.sku && <div className="form-error">{errors.sku}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Price (USD) *</label>
                  <input className="form-input" type="number" step="0.01" min="0" placeholder="0.00" {...F('price')} />
                  {errors.price && <div className="form-error">{errors.price}</div>}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Quantity in Stock *</label>
                <input className="form-input" type="number" min="0" placeholder="0" {...F('quantity')} />
                {errors.quantity && <div className="form-error">{errors.quantity}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-textarea" placeholder="Optional product description..." {...F('description')} />
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={closeModal} disabled={submitting}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Saving...</> : modal === 'add' ? 'Create Product' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

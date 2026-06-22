import React, { useEffect, useState } from 'react';
import { getCustomers, createCustomer, deleteCustomer } from '../api';

const EMPTY_FORM = { full_name: '', email: '', phone: '' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const [errors, setErrors] = useState({});

  const load = () => {
    setLoading(true);
    getCustomers()
      .then(r => setCustomers(r.data))
      .catch(() => showAlert('Failed to load customers', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const validate = () => {
    const e = {};
    if (!form.full_name.trim()) e.full_name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Enter a valid email';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await createCustomer(form);
      showAlert('Customer added successfully');
      setModal(false);
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      showAlert(err.response?.data?.detail || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (c) => {
    if (!window.confirm(`Remove customer "${c.full_name}"?`)) return;
    try {
      await deleteCustomer(c.id);
      showAlert('Customer removed');
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
          <span className="eyebrow">Customer Directory</span>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">{customers.length} registered customers</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm(EMPTY_FORM); setErrors({}); setModal(true); }}>
          + Add Customer
        </button>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <span className="eyebrow">Loading customers</span>
        </div>
      ) : (
        <div className="table-wrap">
          <div className="table-header">
            <span className="table-title">Customer Directory</span>
            <span className="eyebrow">{customers.length} total</span>
          </div>
          {customers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">◉</div>
              <div className="empty-text">No customers yet. Add the first one.</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(c => (
                  <tr key={c.id}>
                    <td className="text-muted font-mono" style={{ fontSize: 12 }}>#{c.id}</td>
                    <td className="td-primary">{c.full_name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone || <span className="text-muted">—</span>}</td>
                    <td className="text-muted" style={{ fontSize: 12 }}>
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <button className="btn btn-danger" onClick={() => handleDelete(c)}>Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-head">
              <span className="modal-title">Add New Customer</span>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" placeholder="e.g. Priya Sharma" {...F('full_name')} />
                {errors.full_name && <div className="form-error">{errors.full_name}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input className="form-input" type="email" placeholder="priya@example.com" {...F('email')} />
                {errors.email && <div className="form-error">{errors.email}</div>}
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input className="form-input" placeholder="+91 98765 43210" {...F('phone')} />
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Adding...' : 'Add Customer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

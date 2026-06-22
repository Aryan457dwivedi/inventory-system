import React, { useEffect, useState, useCallback } from 'react';
import { getOrders, createOrder, deleteOrder, getCustomers, getProducts } from '../api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [alert, setAlert] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [customerId, setCustomerId] = useState('');
  const [orderItems, setOrderItems] = useState([{ product_id: '', quantity: 1 }]);
  const [notes, setNotes] = useState('');

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([getOrders(), getCustomers(), getProducts()])
      .then(([o, c, p]) => {
        setOrders(o.data);
        setCustomers(c.data);
        setProducts(p.data);
      })
      .catch(() => showAlert('Failed to load data', 'error'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const showAlert = (msg, type = 'success') => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3500);
  };

  const openCreate = () => {
    setCustomerId('');
    setOrderItems([{ product_id: '', quantity: 1 }]);
    setNotes('');
    setErrors({});
    setModal('create');
  };

  const addItem = () => setOrderItems(prev => [...prev, { product_id: '', quantity: 1 }]);
  const removeItem = (i) => setOrderItems(prev => prev.filter((_, idx) => idx !== i));
  const updateItem = (i, field, val) => setOrderItems(prev =>
    prev.map((item, idx) => idx === i ? { ...item, [field]: val } : item)
  );

  const validate = () => {
    const e = {};
    if (!customerId) e.customer = 'Select a customer';
    const validItems = orderItems.filter(i => i.product_id && i.quantity > 0);
    if (validItems.length === 0) e.items = 'Add at least one product';
    orderItems.forEach((item, i) => {
      if (item.product_id && item.quantity < 1) e[`item_${i}`] = 'Quantity must be ≥ 1';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const computeTotal = () => {
    return orderItems.reduce((sum, item) => {
      const product = products.find(p => p.id === Number(item.product_id));
      return sum + (product ? product.price * Number(item.quantity) : 0);
    }, 0);
  };

  const handleCreate = async () => {
    if (!validate()) return;
    setSubmitting(true);
    const payload = {
      customer_id: Number(customerId),
      items: orderItems
        .filter(i => i.product_id)
        .map(i => ({ product_id: Number(i.product_id), quantity: Number(i.quantity) })),
      notes: notes || undefined,
    };
    try {
      await createOrder(payload);
      showAlert('Order placed successfully');
      setModal(null);
      load();
    } catch (err) {
      showAlert(err.response?.data?.detail || 'Failed to create order', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (o) => {
    if (!window.confirm(`Cancel order #${o.id}? Stock will be restored.`)) return;
    try {
      await deleteOrder(o.id);
      showAlert('Order cancelled — stock restored');
      load();
    } catch (err) {
      showAlert(err.response?.data?.detail || 'Cancel failed', 'error');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <span className="eyebrow">Order History</span>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{orders.length} orders total</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ New Order</button>
      </div>

      {alert && <div className={`alert alert-${alert.type}`}>{alert.msg}</div>}

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <span className="eyebrow">Loading orders</span>
        </div>
      ) : (
        <div className="table-wrap">
          <div className="table-header">
            <span className="table-title">Order History</span>
          </div>
          {orders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">◎</div>
              <div className="empty-text">No orders yet. Create the first one.</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td className="font-mono" style={{ fontSize: 12, color: 'var(--primary)' }}>
                      #{String(o.id).padStart(4, '0')}
                    </td>
                    <td className="td-primary">{o.customer?.full_name || `Customer #${o.customer_id}`}</td>
                    <td className="text-muted">{o.items?.length || 0} item{o.items?.length !== 1 ? 's' : ''}</td>
                    <td style={{ fontWeight: 600, color: 'var(--foreground)' }}>${o.total_amount.toFixed(2)}</td>
                    <td><span className={`badge badge-${o.status}`}>{o.status}</span></td>
                    <td className="text-muted" style={{ fontSize: 12 }}>
                      {o.created_at ? new Date(o.created_at).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => { setSelectedOrder(o); setModal('detail'); }}
                        >
                          View
                        </button>
                        <button className="btn btn-danger" onClick={() => handleCancel(o)}>Cancel</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {modal === 'create' && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="modal" style={{ maxWidth: 600 }}>
            <div className="modal-head">
              <span className="modal-title">Create New Order</span>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Customer *</label>
                <select
                  className="form-select"
                  value={customerId}
                  onChange={e => setCustomerId(e.target.value)}
                >
                  <option value="">Select a customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.full_name} — {c.email}</option>
                  ))}
                </select>
                {errors.customer && <div className="form-error">{errors.customer}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Products *</label>
                <div className="order-items-builder">
                  {orderItems.map((item, i) => (
                    <div key={i} className="order-item-row">
                      <select
                        className="form-select"
                        value={item.product_id}
                        onChange={e => updateItem(i, 'product_id', e.target.value)}
                      >
                        <option value="">Select product...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} — ${p.price.toFixed(2)} ({p.quantity} in stock)
                          </option>
                        ))}
                      </select>
                      <input
                        className="form-input"
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => updateItem(i, 'quantity', e.target.value)}
                        placeholder="Qty"
                      />
                      <button className="remove-btn" onClick={() => removeItem(i)} title="Remove">×</button>
                      {errors[`item_${i}`] && <div className="form-error" style={{ gridColumn: '1/-1' }}>{errors[`item_${i}`]}</div>}
                    </div>
                  ))}
                  <div className="add-item-row">
                    <button className="btn btn-ghost btn-sm" onClick={addItem}>+ Add Product</button>
                    {orderItems.some(i => i.product_id) && (
                      <span style={{ marginLeft: 'auto', color: 'var(--primary)', fontWeight: 600 }}>
                        Estimated: ${computeTotal().toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
                {errors.items && <div className="form-error">{errors.items}</div>}
              </div>

              <div className="form-group">
                <label className="form-label">Notes (optional)</label>
                <textarea
                  className="form-textarea"
                  placeholder="Any special instructions..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={submitting}>
                {submitting ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      {modal === 'detail' && selectedOrder && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(null)}>
          <div className="modal" style={{ maxWidth: 560 }}>
            <div className="modal-head">
              <span className="modal-title">
                Order #{String(selectedOrder.id).padStart(4, '0')}
              </span>
              <button className="modal-close" onClick={() => setModal(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="order-detail-grid">
                <div className="detail-field">
                  <div className="detail-field-label">Customer</div>
                  <div className="detail-field-value">{selectedOrder.customer?.full_name}</div>
                </div>
                <div className="detail-field">
                  <div className="detail-field-label">Status</div>
                  <div className="detail-field-value">
                    <span className={`badge badge-${selectedOrder.status}`}>{selectedOrder.status}</span>
                  </div>
                </div>
                <div className="detail-field">
                  <div className="detail-field-label">Total Amount</div>
                  <div className="detail-field-value" style={{ color: 'var(--primary)' }}>
                    ${selectedOrder.total_amount.toFixed(2)}
                  </div>
                </div>
                <div className="detail-field">
                  <div className="detail-field-label">Created</div>
                  <div className="detail-field-value">
                    {selectedOrder.created_at ? new Date(selectedOrder.created_at).toLocaleString() : '—'}
                  </div>
                </div>
              </div>
              {selectedOrder.notes && (
                <div className="detail-field mb-4">
                  <div className="detail-field-label">Notes</div>
                  <div className="detail-field-value" style={{ fontWeight: 400, fontSize: 13 }}>{selectedOrder.notes}</div>
                </div>
              )}
              <div className="table-title mb-4" style={{ marginBottom: 10 }}>Items Ordered</div>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map(item => (
                    <tr key={item.id}>
                      <td className="td-primary">{item.product?.name || `Product #${item.product_id}`}</td>
                      <td><span className="sku-badge">{item.product?.sku || '—'}</span></td>
                      <td>{item.quantity}</td>
                      <td>${item.unit_price.toFixed(2)}</td>
                      <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                        ${(item.unit_price * item.quantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-foot">
              <button className="btn btn-ghost" onClick={() => setModal(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

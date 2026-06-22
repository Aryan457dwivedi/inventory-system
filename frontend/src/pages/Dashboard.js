import React, { useEffect, useState } from 'react';
import { getDashboard } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getDashboard()
      .then(r => setStats(r.data))
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-state">
      <div className="spinner" />
      <span>Loading dashboard...</span>
    </div>
  );

  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">System overview & inventory health</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{stats.total_products}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Customers</div>
          <div className="stat-value">{stats.total_customers}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{stats.total_orders}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Low Stock Items</div>
          <div className="stat-value" style={{ color: stats.low_stock_products.length > 0 ? 'var(--red)' : 'var(--green)' }}>
            {stats.low_stock_products.length}
          </div>
        </div>
      </div>

      {stats.low_stock_products.length > 0 && (
        <div className="table-wrap">
          <div className="table-header">
            <span className="table-title">⚠ Low Stock Alert</span>
            <span className="badge badge-pending">Needs attention</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Remaining</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {stats.low_stock_products.map(p => (
                <tr key={p.id}>
                  <td className="td-primary">{p.name}</td>
                  <td><span className="sku-badge">{p.sku}</span></td>
                  <td className="stock-low">{p.quantity} left</td>
                  <td>${p.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {stats.low_stock_products.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>✓</div>
          <div style={{ color: 'var(--green)', fontWeight: 600, marginBottom: 4 }}>All stock levels healthy</div>
          <div className="text-muted" style={{ fontSize: 13 }}>No products below the 5-unit threshold</div>
        </div>
      )}
    </div>
  );
}

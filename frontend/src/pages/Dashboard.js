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

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <span className="eyebrow">Loading dashboard</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">{error}</div>
    );
  }

  if (!stats) return null;

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="status-dot" style={{ backgroundColor: 'var(--amber)' }} />
            <span className="eyebrow">Inventory Management System</span>
          </div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            System overview and inventory health for the current operating period.
          </p>
        </div>
        <div className="dash-status">
          <span className="eyebrow block mb-1.5">System Status</span>
          <span className="dash-status-live">
            <span className="status-dot animate-pulse" />
            Operational
          </span>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-label">Total Products</div>
          <div className="stat-value">{stats.total_products.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Customers</div>
          <div className="stat-value">{stats.total_customers.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{stats.total_orders.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Low Stock Items</div>
          <div
            className="stat-value"
            style={{
              color: stats.low_stock_products.length > 0 ? 'var(--red)' : 'var(--green)',
            }}
          >
            {String(stats.low_stock_products.length).padStart(2, '0')}
          </div>
        </div>
      </div>

      {stats.low_stock_products.length > 0 && (
        <div className="table-wrap">
          <div className="table-header">
            <span className="table-title">Low Stock Alert</span>
            <span className="badge badge-pending">Needs attention</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Remaining</th>
                <th style={{ textAlign: 'right' }}>Price</th>
              </tr>
            </thead>
            <tbody>
              {stats.low_stock_products.map(p => (
                <tr key={p.id}>
                  <td className="td-primary">{p.name}</td>
                  <td><span className="sku-badge">{p.sku}</span></td>
                  <td className="stock-low">{String(p.quantity).padStart(2, '0')} left</td>
                  <td className="font-mono" style={{ textAlign: 'right', fontSize: 13 }}>
                    ${p.price.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {stats.low_stock_products.length === 0 && (
        <div className="card dash-empty">
          <div className="eyebrow mb-3" style={{ color: 'var(--green)' }}>
            Nominal state reached
          </div>
          <div className="dash-empty-title">All stock levels healthy</div>
          <div className="text-muted" style={{ fontSize: 13 }}>
            No products below the 5-unit threshold.
          </div>
        </div>
      )}

      <div className="dash-footer">
        <span className="eyebrow">© Vestige Systems</span>
        <span className="eyebrow font-mono dash-footer-version">v4.02 · Synced 14:20 UTC</span>
      </div>
    </div>
  );
}

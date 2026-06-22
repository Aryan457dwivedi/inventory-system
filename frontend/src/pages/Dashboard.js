import React, { useEffect, useState } from 'react';
import { getDashboard } from '../api';

function IconGrid() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  );
}

function IconBox() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

function IconWarn() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function now() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
  });
}

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
      <span>Loading dashboard</span>
    </div>
  );

  if (error) return <div className="alert alert-error">{error}</div>;
  if (!stats) return null;

  const lowCount = stats.low_stock_products.length;

  return (
    <div>
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <span className="eyebrow">Overview</span>
          <div className="dashboard-title">Dashboard</div>
        </div>
        <div className="dashboard-date">{now()}</div>
      </div>

      {/* KPI Row */}
      <div className="kpi-row">
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Products</span>
            <span className="kpi-icon violet"><IconBox /></span>
          </div>
          <div className="kpi-value">{stats.total_products}</div>
          <div className="kpi-sub">Active in catalog</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Customers</span>
            <span className="kpi-icon violet"><IconUsers /></span>
          </div>
          <div className="kpi-value">{stats.total_customers}</div>
          <div className="kpi-sub">Registered accounts</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Orders</span>
            <span className="kpi-icon green"><IconGrid /></span>
          </div>
          <div className="kpi-value">{stats.total_orders}</div>
          <div className="kpi-sub">Total placed</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-label">Low Stock</span>
            <span className={`kpi-icon ${lowCount > 0 ? 'red' : 'green'}`}>
              {lowCount > 0 ? <IconWarn /> : <IconCheck />}
            </span>
          </div>
          <div className="kpi-value" style={{ color: lowCount > 0 ? 'var(--danger)' : 'var(--success)' }}>
            {lowCount}
          </div>
          <div className="kpi-sub">{lowCount > 0 ? 'Need restocking' : 'All levels healthy'}</div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="dash-grid">
        {/* Low stock panel */}
        <div className="dash-panel">
          <div className="dash-panel-head">
            <span className="dash-panel-title">Low Stock Items</span>
            {lowCount > 0 && (
              <span className="badge badge-pending">{lowCount} alert{lowCount !== 1 ? 's' : ''}</span>
            )}
          </div>

          {lowCount === 0 ? (
            <div className="empty-panel">
              <div className="empty-panel-icon"><IconCheck /></div>
              <div className="empty-panel-text">
                All stock levels are healthy.<br />Nothing below 5 units.
              </div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Qty</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                {stats.low_stock_products.map(p => (
                  <tr key={p.id}>
                    <td className="td-primary">{p.name}</td>
                    <td><span className="sku-badge">{p.sku}</span></td>
                    <td className="stock-low">{p.quantity}</td>
                    <td style={{ color: 'var(--primary)', fontWeight: 600 }}>${p.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* System status panel */}
        <div className="dash-panel">
          <div className="dash-panel-head">
            <span className="dash-panel-title">System Status</span>
            <span className="badge badge-completed">Live</span>
          </div>
          <div className="health-list">
            {[
              { label: 'Database',     val: 'Connected', ok: true },
              { label: 'API',          val: 'Healthy',   ok: true },
              { label: 'Stock alerts', val: lowCount > 0 ? `${lowCount} items` : 'None', ok: lowCount === 0 },
              { label: 'Total orders', val: String(stats.total_orders), ok: true },
            ].map((row, i) => (
              <div key={i} className="health-row">
                <span className="health-name">{row.label}</span>
                <span className={`health-val${row.ok ? '' : ' bad'}`}>{row.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

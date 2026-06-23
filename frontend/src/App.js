import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import './index.css';

const NAV_ITEMS = [
  {
    to: '/', label: 'Dashboard',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
  },
  {
    to: '/products', label: 'Products',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
  },
  {
    to: '/customers', label: 'Customers',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  },
  {
    to: '/orders', label: 'Orders',
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
  },
];

// Collapsed: N-node mark only
function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="15" y1="45" x2="15" y2="15" stroke="#0F6E56" strokeWidth="4.5" strokeLinecap="round"/>
      <line x1="45" y1="45" x2="45" y2="15" stroke="#0F6E56" strokeWidth="4.5" strokeLinecap="round"/>
      <line x1="15" y1="15" x2="45" y2="45" stroke="#0F6E56" strokeWidth="4.5" strokeLinecap="round"/>
      <circle cx="15" cy="15" r="5.5" fill="#0F6E56"/>
      <circle cx="15" cy="45" r="5.5" fill="#0F6E56"/>
      <circle cx="45" cy="15" r="5.5" fill="#0F6E56"/>
      <circle cx="45" cy="45" r="5.5" fill="#0F6E56"/>
    </svg>
  );
}

// Expanded: wordmark only (the node icon is already shown via LogoMark in the brand row)
function LogoFull() {
  return (
    <svg width="140" height="44" viewBox="0 0 340 130" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="88" fontFamily="Helvetica, Arial, sans-serif" fontSize="68" fontWeight="500" fill="#1A1A1A">
        nexus
      </text>
      <text x="2" y="114" fontFamily="Helvetica, Arial, sans-serif" fontSize="17" letterSpacing="2.5" fill="#5F5E5A">
        inventory os
      </text>
    </svg>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <nav className="sidebar">
          <div className="sidebar-brand">
            <span className="brand-icon"><LogoMark /></span>
            <div className="brand-text"><LogoFull /></div>
          </div>

          <ul className="nav-list">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="sidebar-footer">
            <span className="footer-dot" />
            <span className="footer-label">Connected</span>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

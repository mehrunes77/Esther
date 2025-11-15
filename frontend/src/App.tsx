/**
 * Esther - Main Application Component
 */

import React, { useState } from 'react';
import { NewsBanner } from './components/NewsBanner';
import { PlanetDashboard } from './components/PlanetDashboard';
import './App.css';

type View = 'dashboard' | 'settings' | 'news';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  return (
    <div className="app">
      {/* DEBUG: Verify React is rendering */}
      <div style={{background: '#1a1a1a', padding: '5px', textAlign: 'center', fontSize: '11px', color: '#4a9e8e', borderBottom: '1px solid #2d7a6e'}}>
        ✓ react is running | backend: localhost:5001 | frontend: localhost:3001
      </div>
      
      {/* News Banner */}
      <NewsBanner />
      
      <nav className="navbar">
        <div className="title">esther</div>
        
        <div className="nav-menu">
          <button
            className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            dashboard
          </button>
          
          <button
            className={`nav-btn ${currentView === 'settings' ? 'active' : ''}`}
            onClick={() => setCurrentView('settings')}
          >
            settings
          </button>
          
          <button
            className={`nav-btn ${currentView === 'news' ? 'active' : ''}`}
            onClick={() => setCurrentView('news')}
          >
            news
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="content">
        {currentView === 'dashboard' && <PlanetDashboard />}
        {currentView === 'settings' && (
          <div className="coming-soon">
            <h2>settings</h2>
            <p>configure update intervals</p>
          </div>
        )}
        {currentView === 'news' && (
          <div className="coming-soon">
            <h2>astronomy news</h2>
            <p>filtered feeds from nasa, esa, and arxiv</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>
          esther v0.1.0 | open source | data from nasa jpl horizons
        </p>
        <p className="disclaimer">
          educational use only | not for navigation or scientific research
        </p>
      </footer>
    </div>
  );
}

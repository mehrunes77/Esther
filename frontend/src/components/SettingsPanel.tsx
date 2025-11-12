/**
 * Settings Panel Component
 * Allows users to configure update intervals and data sources
 */

import React, { useState, useEffect } from 'react';
import styles from './SettingsPanel.module.css';

export interface SettingsPanelProps {
  onSave: (settings: any) => void;
  initialSettings?: any;
}

export function SettingsPanel({ onSave, initialSettings }: SettingsPanelProps) {
  const [settings, setSettings] = useState(initialSettings || {});

  const handleIntervalChange = (key: string, value: number) => {
    setSettings({
      ...settings,
      [key]: value,
    });
  };

  const handleToggleSource = (sourceId: string) => {
    setSettings({
      ...settings,
      newsFiltering: {
        ...settings.newsFiltering,
        sources: settings.newsFiltering?.sources?.map((s: any) =>
          s.id === sourceId ? { ...s, enabled: !s.enabled } : s
        ),
      },
    });
  };

  const handleSave = () => {
    onSave(settings);
  };

  return (
    <div className={styles.settingsPanel}>
      <h2>⚙️ Settings</h2>

      {/* Update Intervals */}
      <div className={styles.section}>
        <h3>Update Intervals</h3>

        <div className={styles.setting}>
          <label>
            Planet Positions Update
            <input
              type="range"
              min="60000"
              max="3600000"
              step="60000"
              value={settings.planetUpdateInterval || 900000}
              onChange={(e) =>
                handleIntervalChange('planetUpdateInterval', parseInt(e.target.value))
              }
            />
            <span className={styles.value}>
              {Math.round((settings.planetUpdateInterval || 900000) / 60000)} min
            </span>
          </label>
        </div>

        <div className={styles.setting}>
          <label>
            News Feed Update
            <input
              type="range"
              min="300000"
              max="3600000"
              step="300000"
              value={settings.newsUpdateInterval || 1800000}
              onChange={(e) =>
                handleIntervalChange('newsUpdateInterval', parseInt(e.target.value))
              }
            />
            <span className={styles.value}>
              {Math.round((settings.newsUpdateInterval || 1800000) / 60000)} min
            </span>
          </label>
        </div>

        <div className={styles.setting}>
          <label>
            Asteroid Data Update
            <input
              type="range"
              min="600000"
              max="3600000"
              step="600000"
              value={settings.asteroidUpdateInterval || 3600000}
              onChange={(e) =>
                handleIntervalChange('asteroidUpdateInterval', parseInt(e.target.value))
              }
            />
            <span className={styles.value}>
              {Math.round((settings.asteroidUpdateInterval || 3600000) / 60000)} min
            </span>
          </label>
        </div>
      </div>

      {/* News Sources */}
      <div className={styles.section}>
        <h3>News Sources</h3>
        <p className={styles.description}>
          Only astronomy-related news is included. Auto-filtered by keywords.
        </p>
        {settings.newsFiltering?.sources?.map((source: any) => (
          <div key={source.id} className={styles.sourceToggle}>
            <input
              type="checkbox"
              id={source.id}
              checked={source.enabled}
              onChange={() => handleToggleSource(source.id)}
            />
            <label htmlFor={source.id}>
              <strong>{source.name}</strong>
              <span className={styles.category}>{source.category}</span>
            </label>
          </div>
        ))}
      </div>

      {/* UI Preferences */}
      <div className={styles.section}>
        <h3>Display</h3>
        <div className={styles.setting}>
          <label>
            <input
              type="checkbox"
              checked={settings.ui?.updateNotifications || false}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  ui: {
                    ...settings.ui,
                    updateNotifications: e.target.checked,
                  },
                })
              }
            />
            Show update notifications
          </label>
        </div>
        <div className={styles.setting}>
          <label>
            <input
              type="checkbox"
              checked={settings.ui?.autoRefresh !== false}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  ui: {
                    ...settings.ui,
                    autoRefresh: e.target.checked,
                  },
                })
              }
            />
            Auto-refresh data
          </label>
        </div>
      </div>

      {/* Save Button */}
      <div className={styles.actions}>
        <button className={styles.saveBtn} onClick={handleSave}>
          💾 Save Settings
        </button>
      </div>
    </div>
  );
}

export default SettingsPanel;

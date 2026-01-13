'use client';

import { useState } from 'react';
import {
  Settings,
  Key,
  Globe,
  Database,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function SettingsPage() {
  const [showApiKeys, setShowApiKeys] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const [settings, setSettings] = useState({
    myphonerApiKey: '',
    myphonerCampaignId: '',
    wordpressUrl: 'https://asoldi.com',
    wordpressUsername: '',
    wordpressAppPassword: '',
    lucaApiKey: '',
    lucaCompanyId: '',
  });

  const handleSave = async () => {
    // In production, save these to a secure backend
    // For now, show a success message
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="animate-fade-in">
        <h1 className="text-3xl font-bold font-display text-white mb-2">
          Settings
        </h1>
        <p className="text-dark-400">
          Configure integrations and API connections
        </p>
      </div>

      {/* Success Message */}
      {saved && (
        <div className="flex items-center gap-3 p-4 bg-asoldi-500/20 border border-asoldi-500/30 rounded-xl text-asoldi-400 animate-slide-up">
          <CheckCircle2 className="w-5 h-5" />
          Settings saved successfully!
        </div>
      )}

      {/* MyPhoner Settings */}
      <div className="glass-card p-6 animate-slide-up">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/30">
            <Key className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold font-display text-white">
              MyPhoner Integration
            </h2>
            <p className="text-sm text-dark-400">
              Connect to sync call data and agent stats
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              API Key
            </label>
            <div className="relative">
              <input
                type={showApiKeys ? 'text' : 'password'}
                value={settings.myphonerApiKey}
                onChange={(e) => setSettings({ ...settings, myphonerApiKey: e.target.value })}
                className="input-field pr-12"
                placeholder="Enter your MyPhoner API key"
              />
              <button
                type="button"
                onClick={() => setShowApiKeys(!showApiKeys)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
              >
                {showApiKeys ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Campaign ID
            </label>
            <input
              type="text"
              value={settings.myphonerCampaignId}
              onChange={(e) => setSettings({ ...settings, myphonerCampaignId: e.target.value })}
              className="input-field"
              placeholder="Enter your campaign ID"
            />
          </div>
        </div>

        <div className="mt-4 p-4 bg-dark-900/50 rounded-xl">
          <p className="text-sm text-dark-400">
            <span className="text-white font-medium">How to get your API key:</span>
            <br />
            1. Log in to MyPhoner → Settings → API
            <br />
            2. Click &quot;Generate API Key&quot;
            <br />
            3. Copy and paste the key above
          </p>
        </div>
      </div>

      {/* WordPress Settings */}
      <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
            <Globe className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold font-display text-white">
              WordPress Integration
            </h2>
            <p className="text-sm text-dark-400">
              Sync users from your WordPress site
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              WordPress URL
            </label>
            <input
              type="url"
              value={settings.wordpressUrl}
              onChange={(e) => setSettings({ ...settings, wordpressUrl: e.target.value })}
              className="input-field"
              placeholder="https://asoldi.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Admin Username
            </label>
            <input
              type="text"
              value={settings.wordpressUsername}
              onChange={(e) => setSettings({ ...settings, wordpressUsername: e.target.value })}
              className="input-field"
              placeholder="Your WordPress admin username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Application Password
            </label>
            <div className="relative">
              <input
                type={showApiKeys ? 'text' : 'password'}
                value={settings.wordpressAppPassword}
                onChange={(e) => setSettings({ ...settings, wordpressAppPassword: e.target.value })}
                className="input-field pr-12"
                placeholder="WordPress application password"
              />
              <button
                type="button"
                onClick={() => setShowApiKeys(!showApiKeys)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
              >
                {showApiKeys ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-dark-900/50 rounded-xl">
          <p className="text-sm text-dark-400">
            <span className="text-white font-medium">How to create an Application Password:</span>
            <br />
            1. WordPress Admin → Users → Your Profile
            <br />
            2. Scroll to &quot;Application Passwords&quot;
            <br />
            3. Enter a name and click &quot;Add New&quot;
          </p>
        </div>
      </div>

      {/* Luca Settings */}
      <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30">
            <Database className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold font-display text-white">
              Luca Accounting
            </h2>
            <p className="text-sm text-dark-400">
              Connect to sync payment and payday data
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl mb-4">
          <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-400">
            Luca API access may require contacting their support team. 
            Check if your plan includes API access.
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              API Key
            </label>
            <div className="relative">
              <input
                type={showApiKeys ? 'text' : 'password'}
                value={settings.lucaApiKey}
                onChange={(e) => setSettings({ ...settings, lucaApiKey: e.target.value })}
                className="input-field pr-12"
                placeholder="Enter your Luca API key"
              />
              <button
                type="button"
                onClick={() => setShowApiKeys(!showApiKeys)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-400 hover:text-white"
              >
                {showApiKeys ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Company ID
            </label>
            <input
              type="text"
              value={settings.lucaCompanyId}
              onChange={(e) => setSettings({ ...settings, lucaCompanyId: e.target.value })}
              className="input-field"
              placeholder="Your Luca company ID"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button onClick={handleSave} className="btn-primary flex items-center gap-2">
          <Save className="w-5 h-5" />
          Save Settings
        </button>
      </div>
    </div>
  );
}



'use client';

import { useState, useEffect } from 'react';
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
  Info,
  ExternalLink,
} from 'lucide-react';

export default function SettingsPage() {
  const [showApiKeys, setShowApiKeys] = useState(false);
  
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

      {/* Important Notice */}
      <div className="glass-card p-6 bg-blue-500/10 border-blue-500/30 animate-slide-up">
        <div className="flex items-start gap-4">
          <Info className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2">
              ⚠️ Environment Variables Configuration
            </h3>
            <p className="text-dark-300 mb-3">
              <strong>These settings cannot be changed from this page.</strong> Environment variables must be configured in:
            </p>
            <ul className="list-disc list-inside text-dark-400 space-y-1 mb-3">
              <li><strong>Local:</strong> Edit <code className="bg-dark-900 px-2 py-1 rounded text-sm">.env.local</code> file in your project root</li>
              <li><strong>Production (Hostinger):</strong> Go to your Node.js app settings → Environment Variables</li>
            </ul>
            <div className="p-4 bg-dark-900 rounded-xl mt-4">
              <p className="text-sm text-dark-300 mb-2">
                <strong className="text-white">For special characters (like @ in email):</strong>
              </p>
              <code className="block text-xs bg-dark-800 p-3 rounded text-dark-300 font-mono">
                WORDPRESS_USERNAME="daracha777@gmail.com"<br />
                WORDPRESS_APP_PASSWORD="dtKc hoaU RFDn MEIE Tvfa uDey"
              </code>
              <p className="text-xs text-dark-500 mt-2">
                Always wrap values with special characters in double quotes <code className="bg-dark-800 px-1 rounded">"..."</code>
              </p>
            </div>
            <p className="text-sm text-amber-400 mt-3">
              <strong>After changing environment variables:</strong> Restart your server (local) or redeploy (Hostinger) for changes to take effect.
            </p>
          </div>
        </div>
      </div>

      {/* MyPhoner Settings */}
      <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
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
            <div className="p-4 bg-dark-900 rounded-xl">
              <code className="text-sm text-dark-300 font-mono">
                MYPHONER_API_KEY=your-api-key-here
              </code>
            </div>
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
            3. Add to <code className="bg-dark-800 px-1 rounded">.env.local</code> or Hostinger environment variables
          </p>
        </div>
      </div>

      {/* WordPress Settings */}
      <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
            <Globe className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold font-display text-white">
              WordPress Integration
            </h2>
            <p className="text-sm text-dark-400">
              Sync users with &quot;employee&quot; role from your WordPress site
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              WordPress URL
            </label>
            <div className="p-4 bg-dark-900 rounded-xl">
              <code className="text-sm text-dark-300 font-mono">
                WORDPRESS_URL=https://asoldi.com
              </code>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Admin Username (Email)
            </label>
            <div className="p-4 bg-dark-900 rounded-xl">
              <code className="text-sm text-dark-300 font-mono break-all">
                WORDPRESS_USERNAME=&quot;your-email@example.com&quot;
              </code>
              <p className="text-xs text-dark-500 mt-2">
                ⚠️ Wrap email addresses in quotes because of the @ symbol
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-300 mb-2">
              Application Password
            </label>
            <div className="p-4 bg-dark-900 rounded-xl">
              <code className="text-sm text-dark-300 font-mono break-all">
                WORDPRESS_APP_PASSWORD=&quot;xxxx xxxx xxxx xxxx xxxx xxxx&quot;
              </code>
              <p className="text-xs text-dark-500 mt-2">
                ⚠️ Wrap in quotes if it contains spaces
              </p>
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
            <br />
            4. Copy the password (it will only show once!)
            <br /><br />
            <span className="text-amber-400">⚠️ Make sure users have the &quot;employee&quot; role in WordPress</span>
          </p>
        </div>
      </div>

      {/* Luca Settings */}
      <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
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
              API Key (Personal API Token)
            </label>
            <div className="p-4 bg-dark-900 rounded-xl">
              <code className="text-sm text-dark-300 font-mono break-all">
                LUCA_API_KEY=your-long-personal-api-token
              </code>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-dark-900/50 rounded-xl">
          <p className="text-sm text-dark-400">
            <span className="text-white font-medium">How to get your Luca API key:</span>
            <br />
            1. Log in to Luca Regnskap
            <br />
            2. Go to Settings → API
            <br />
            3. Generate a Personal API Key
            <br />
            4. Copy the long token and add to environment variables
          </p>
        </div>
      </div>

      {/* Example .env.local */}
      <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <h2 className="text-xl font-semibold font-display text-white mb-4">
          Example .env.local File
        </h2>
        <div className="p-4 bg-dark-900 rounded-xl overflow-x-auto">
          <pre className="text-xs text-dark-300 font-mono">
{`# Authentication
JWT_SECRET=1VprV6utfeF15Zdx3RZqbiBRbyhWMAnV
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# MyPhoner API
MYPHONER_API_KEY=DHM9WdBHZjBvW6rGGX2smxPD

# WordPress API
WORDPRESS_URL=https://asoldi.com
WORDPRESS_USERNAME="daracha777@gmail.com"
WORDPRESS_APP_PASSWORD="dtKc hoaU RFDn MEIE Tvfa uDey"

# Luca Accounting
LUCA_API_KEY=eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJGYTl3cUd2VORGR2dzK2R1MUF...`}
          </pre>
        </div>
        <p className="text-xs text-dark-500 mt-3">
          💡 <strong>Tip:</strong> Always wrap values with special characters (@, spaces, etc.) in double quotes
        </p>
      </div>
    </div>
  );
}

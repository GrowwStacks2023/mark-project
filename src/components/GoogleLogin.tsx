import { Calendar, Loader2, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile',
].join(' ');

export default function GoogleLogin() {
  const [copied, setCopied] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = window.location.origin + '/auth/callback';

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(SCOPES)}&access_type=offline&prompt=consent`;

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(authUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleConnect = () => {
    window.location.href = authUrl;
  };

  return (
    <div className="space-y-4 w-full">
      <button
        onClick={handleConnect}
        className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
      >
        <Calendar className="w-5 h-5" />
        <span>Connect Google Calendar</span>
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or copy the authorization URL</span>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-start gap-2 mb-2">
          <div className="flex-1 break-all text-xs text-gray-700 font-mono">
            {authUrl}
          </div>
          <button
            onClick={handleCopyUrl}
            className="flex-shrink-0 p-2 hover:bg-gray-200 rounded transition-colors"
            title="Copy URL"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-gray-600" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Copy this URL and paste it in your browser if the button doesn't work
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm font-semibold text-blue-900 mb-2">
          Important: Configure Redirect URI
        </p>
        <p className="text-sm text-blue-800 mb-2">
          Add this redirect URI to your Google Cloud Console:
        </p>
        <div className="bg-white rounded px-3 py-2 font-mono text-sm text-blue-900 border border-blue-200">
          {redirectUri}
        </div>
        <p className="text-xs text-blue-700 mt-2">
          Go to Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs → Edit → Authorized redirect URIs
        </p>
      </div>
    </div>
  );
}

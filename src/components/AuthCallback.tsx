import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import { getUserProfile } from '../services/googleCalendar';

export default function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { setAccessToken, setUserEmail } = useAuthStore();

  useEffect(() => {
    const handleCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const errorParam = params.get('error');

      if (errorParam) {
        setError('Authorization was denied or cancelled');
        toast.error('Authorization failed');
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
        return;
      }

      if (!code) {
        setError('No authorization code received');
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
        return;
      }

      try {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        const clientSecret = import.meta.env.VITE_GOOGLE_CLIENT_SECRET;
        const redirectUri = window.location.origin + '/auth/callback';

        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            code,
            client_id: clientId,
            client_secret: clientSecret,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
          }),
        });

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json();
          throw new Error(errorData.error_description || 'Failed to exchange code for token');
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;

        setAccessToken(accessToken);

        const profile = await getUserProfile(accessToken);
        setUserEmail(profile.email);

        toast.success('Successfully connected to Google Calendar!');
        window.location.href = '/';
      } catch (err) {
        console.error('Token exchange error:', err);
        setError(err instanceof Error ? err.message : 'Failed to complete authentication');
        toast.error('Authentication failed');
        setTimeout(() => {
          window.location.href = '/';
        }, 3000);
      }
    };

    handleCallback();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting you back...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Connecting...</h2>
        <p className="text-gray-600">Please wait while we connect your Google Calendar</p>
      </div>
    </div>
  );
}

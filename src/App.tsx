import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import GoogleLogin from './components/GoogleLogin';
import EnterpriseApp from './components/EnterpriseApp';

function App() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-purple-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-white font-bold text-3xl">M</span>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mb-2">
                MeetingHub Pro
              </h1>
              <p className="text-gray-600 text-lg">
                Enterprise meeting management with AI-powered insights
              </p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
              <p className="text-gray-600 mb-6">
                Connect your Google Calendar to get started
              </p>

              <div className="flex flex-col items-center gap-4">
                <GoogleLogin />
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Enterprise Features:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Master recording control for all meetings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Auto-sync with Google Calendar every 3 minutes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Fireflies.ai integration for AI-powered transcripts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Real-time meeting status tracking</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">✓</span>
                    <span>Comprehensive analytics and insights</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '10px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
            loading: {
              iconTheme: {
                primary: '#3B82F6',
                secondary: '#fff',
              },
            },
          }}
        />
      </>
    );
  }

  return (
    <>
      <EnterpriseApp />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
          loading: {
            iconTheme: {
              primary: '#3B82F6',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  );
}

export default App;

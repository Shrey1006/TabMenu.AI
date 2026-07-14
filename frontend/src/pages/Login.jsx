import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(email, password);
      const routes = { admin: '/admin', kitchen: '/kitchen', waiter: '/waiter' };
      navigate(routes[user.role] || '/');
    } catch {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-50 dark:bg-espresso-950 px-4 transition-colors duration-200 relative">
      
      {/* Floating Theme Medallion */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 flex h-11 w-11 items-center justify-center rounded-full bg-white dark:bg-espresso-900 text-chocolate-900 dark:text-espresso-50 border border-cream-200 dark:border-espresso-750 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
        title="Toggle Theme"
        aria-label="Toggle Theme"
      >
        <span className="text-base">{isDark ? '☀️' : '🌙'}</span>
      </button>

      <form 
        onSubmit={handleSubmit} 
        className="w-full max-w-md rounded-3xl border border-cream-200 dark:border-espresso-750 bg-white dark:bg-espresso-900 p-8 sm:p-10 shadow-xl transition-all duration-200 text-chocolate-900 dark:text-espresso-50"
      >
        <div className="text-center">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="mx-auto h-16 w-16 rounded-full border border-gold-500/20 shadow-md bg-white p-1" 
          />
          <h1 className="mt-4 font-serif text-3xl font-bold">Staff Login</h1>
          <p className="mt-1 text-sm text-chocolate-800 dark:text-espresso-100">
            Kitchen · Waiter · Admin portals
          </p>
        </div>

        {error && (
          <p className="mt-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-950/60 p-3 text-sm text-red-600 dark:text-red-400 text-center font-medium">
            ⚠️ {error}
          </p>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-chocolate-700 dark:text-espresso-100 mb-1.5 font-medium">
              Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-cream-200 dark:border-espresso-750 px-4 py-3 bg-white dark:bg-espresso-950 outline-none focus:border-gold-500 dark:text-stone-100 transition-colors"
              required
            />
          </div>
          
          <div>
            <label className="block text-xs uppercase tracking-wider text-chocolate-700 dark:text-espresso-100 mb-1.5 font-medium">
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-cream-200 dark:border-espresso-750 px-4 py-3 bg-white dark:bg-espresso-950 outline-none focus:border-gold-500 dark:text-stone-100 transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 py-3.5 font-bold uppercase tracking-wider text-white shadow-md hover:shadow-lg disabled:opacity-50 transition-all cursor-pointer mt-2"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-cream-100 dark:border-espresso-800 flex flex-col items-center gap-3">
          <p className="text-center text-xs text-chocolate-700 dark:text-espresso-100/60 font-medium">
            Demo: admin@ambika.com / admin123
          </p>
          <Link 
            to="/" 
            className="text-sm font-semibold text-gold-500 hover:text-gold-600 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </form>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
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
    <div className="flex min-h-screen items-center justify-center bg-brand-50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-lg">
        <img src="/logo.png" alt="Logo" className="mx-auto h-14 w-14 rounded-full" />
        <h1 className="mt-4 text-center text-2xl font-bold">Staff Login</h1>
        <p className="mt-1 text-center text-sm text-stone-500">Kitchen · Waiter · Admin portals</p>

        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}

        <div className="mt-6 space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-stone-300 px-4 py-3 focus:border-brand-500 focus:outline-none"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-600 py-3 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-stone-400">
          Demo: admin@ambika.com / admin123
        </p>
      </form>
    </div>
  );
}

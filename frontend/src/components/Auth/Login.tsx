import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface LoginProps {
  onSwitchToRegister: () => void;
}

const authInputClass =
  'mt-1 block w-full px-3 py-2 bg-surface-overlay border border-line-medium rounded-md text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-colors';

const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-base">
      <div className="max-w-md w-full space-y-8 p-8 bg-surface-raised border border-line-subtle rounded-xl shadow-2xl">
        <div>
          <h2 className="text-center text-3xl font-bold text-ink">
            Room & Wall Planner
          </h2>
          <p className="mt-2 text-center text-sm text-ink-muted">
            Sign in to your account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-danger/15 border border-danger/40 p-4">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-ink-secondary">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={authInputClass}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink-secondary">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={authInputClass}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-glossy btn-glossy-primary w-full flex justify-center py-2.5 px-4 text-sm disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-sm text-accent hover:text-accent-hover transition-colors"
            >
              Don't have an account? Register
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

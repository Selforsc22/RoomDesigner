import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

const authInputClass =
  'mt-1 block w-full px-3 py-2 bg-surface-overlay border border-line-medium rounded-md text-ink placeholder:text-ink-faint focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/30 transition-colors';

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register(email, username, password);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register');
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
            Create your account
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
              <label htmlFor="username" className="block text-sm font-medium text-ink-secondary">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink-secondary">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={authInputClass}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-glossy btn-glossy-primary w-full flex justify-center py-2.5 px-4 text-sm disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-sm text-accent hover:text-accent-hover transition-colors"
            >
              Already have an account? Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;

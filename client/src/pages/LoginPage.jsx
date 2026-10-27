import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';
import { extractErrorMessage } from '../utils/formatters';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const destination = location.state?.from || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter both your email address and password.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await login({ email: email.trim(), password });
      if (result.user?.role === 'admin' && destination === '/dashboard') {
        navigate('/admin', { replace: true });
      } else {
        navigate(destination, { replace: true });
      }
    } catch (err) {
      setError(extractErrorMessage(err, 'Unable to sign in with those credentials.'));
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemoAccount = (role) => {
    setError('');
    if (role === 'admin') {
      setEmail('admin@phytoguard.edu');
      setPassword('Admin@2026!');
    } else {
      setEmail('farmer@phytoguard.edu');
      setPassword('Farmer@2026!');
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="rounded-2xl border border-[#DCE3DA] bg-white p-7 sm:p-9 space-y-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-extrabold text-[#17231A]">Sign in to PhytoGuard</h1>
          <p className="text-sm text-[#526056]">
            Access crop leaf diagnosis, prediction history, and agronomy tools.
          </p>
        </div>

        {error && <ErrorMessage title="Sign-In Failed" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="block text-xs font-semibold text-[#17231A]">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="grower@example.com"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#CBD5C8] bg-white text-[#17231A] focus:outline-none focus:border-[#1E5631]"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="login-password" className="block text-xs font-semibold text-[#17231A]">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#CBD5C8] bg-white text-[#17231A] focus:outline-none focus:border-[#1E5631]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#1E5631] hover:bg-[#164225] rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                Signing In...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" aria-hidden="true" />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-[#E2E7DF] space-y-2.5">
          <p className="text-xs font-medium text-[#526056]">
            Local Review Accounts (Seeded in Development Mode):
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => fillDemoAccount('farmer')}
              className="px-3 py-2 text-xs font-semibold text-[#17231A] bg-[#F3F6F2] hover:bg-[#E6ECE4] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Fill Grower Account
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount('admin')}
              className="px-3 py-2 text-xs font-semibold text-[#17231A] bg-[#F3F6F2] hover:bg-[#E6ECE4] rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Fill Admin Account
            </button>
          </div>
        </div>

        <p className="text-xs text-center text-[#526056]">
          New to PhytoGuard?{' '}
          <Link to="/register" className="font-semibold text-[#1E5631] hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

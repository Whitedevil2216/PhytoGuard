import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';
import { extractErrorMessage } from '../utils/formatters';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const validateForm = () => {
    if (name.trim().length < 2) {
      return 'Full name must be at least 2 characters.';
    }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      return 'Please enter a valid email address.';
    }
    if (password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return 'Password must contain at least one uppercase letter, one lowercase letter, and one number.';
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationIssue = validateForm();
    if (validationIssue) {
      setError(validationIssue);
      return;
    }

    setSubmitting(true);
    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(extractErrorMessage(err, 'Registration could not be completed.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="rounded-2xl border border-[#DCE3DA] bg-white p-7 sm:p-9 space-y-6">
        <div className="space-y-1.5">
          <h1 className="text-2xl font-extrabold text-[#17231A]">Create Grower Account</h1>
          <p className="text-sm text-[#526056]">
            Register to upload crop leaf photographs and store your field prediction history.
          </p>
        </div>

        {error && <ErrorMessage title="Registration Issue" message={error} />}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <label htmlFor="reg-name" className="block text-xs font-semibold text-[#17231A]">
              Full Name
            </label>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Anitha Selvam"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#CBD5C8] bg-white text-[#17231A] focus:outline-none focus:border-[#1E5631]"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reg-email" className="block text-xs font-semibold text-[#17231A]">
              Email Address
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="anitha@example.com"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#CBD5C8] bg-white text-[#17231A] focus:outline-none focus:border-[#1E5631]"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reg-password" className="block text-xs font-semibold text-[#17231A]">
              Password
            </label>
            <input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 chars (A-Z, a-z, 0-9)"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#CBD5C8] bg-white text-[#17231A] focus:outline-none focus:border-[#1E5631]"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="reg-confirm" className="block text-xs font-semibold text-[#17231A]">
              Confirm Password
            </label>
            <input
              id="reg-confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
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
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" aria-hidden="true" />
                Create Account
              </>
            )}
          </button>
        </form>

        <p className="text-xs text-center text-[#526056]">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-[#1E5631] hover:underline">
            Sign in instead
          </Link>
        </p>
      </div>
    </div>
  );
}

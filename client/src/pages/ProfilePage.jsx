import React, { useEffect, useState } from 'react';
import { CheckCircle2, KeyRound, Loader2, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ErrorMessage from '../components/ErrorMessage';
import { extractErrorMessage, formatDateTime } from '../utils/formatters';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [location, setLocation] = useState(user?.location || '');
  const [preferredLanguage, setPreferredLanguage] = useState(user?.preferredLanguage || 'en-IN');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setLocation(user.location || '');
      setPreferredLanguage(user.preferredLanguage || 'en-IN');
    }
  }, [user]);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (name.trim().length < 2) {
      setError('Full name must be at least 2 characters long.');
      return;
    }

    setSavingProfile(true);
    try {
      await updateProfile({
        name: name.trim(),
        location: location.trim(),
        preferredLanguage,
      });
      setSuccessMessage('Account profile details updated.');
    } catch (err) {
      setError(extractErrorMessage(err, 'Unable to update profile settings.'));
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (!currentPassword || !newPassword) {
      setError('Enter both your current password and a new password.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      await updateProfile({
        currentPassword,
        newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage('Password updated with bcryptjs hashing.');
    } catch (err) {
      setError(extractErrorMessage(err, 'Unable to change password.'));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17231A]">
          Account &amp; Security
        </h1>
        <p className="text-sm text-[#526056]">
          Manage your grower profile, regional preference, and account credentials.
        </p>
      </div>

      {successMessage && (
        <div
          role="status"
          className="rounded-xl border border-[#1E5631]/30 bg-[#EEF5F0] px-4 py-3 flex items-center gap-2.5 text-sm font-medium text-[#1E5631]"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{successMessage}</span>
        </div>
      )}

      {error && <ErrorMessage title="Update Failed" message={error} />}

      {/* Account Metadata Summary */}
      <section className="rounded-2xl border border-[#DCE3DA] bg-white p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-xs font-medium text-[#526056]">Registered Email</p>
          <p className="text-sm font-semibold text-[#17231A] truncate pt-0.5">
            {user?.email || '—'}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-[#526056]">Access Role</p>
          <p className="text-sm font-semibold text-[#17231A] pt-0.5">
            {user?.role === 'admin' ? 'Administrator' : 'Registered Grower'}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-[#526056]">Member Since</p>
          <p className="text-sm font-mono text-[#17231A] tabular-nums pt-0.5">
            {user?.createdAt ? formatDateTime(user.createdAt) : 'Active Session'}
          </p>
        </div>
      </section>

      {/* Profile Details Form */}
      <form
        onSubmit={handleProfileSave}
        className="rounded-2xl border border-[#DCE3DA] bg-white p-6 sm:p-7 space-y-5"
      >
        <div className="space-y-1">
          <h2 className="text-base font-bold text-[#17231A]">Grower Details</h2>
          <p className="text-xs text-[#526056]">
            Used to personalize your workspace and Crop Assistant voice locale.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="profile-name" className="block text-xs font-semibold text-[#17231A]">
              Full Name
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#CBD5C8] bg-white text-[#17231A] focus:outline-none focus:border-[#1E5631]"
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="profile-location"
              className="block text-xs font-semibold text-[#17231A]"
            >
              District / Farming Region (Optional)
            </label>
            <input
              id="profile-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g., Coimbatore, Tamil Nadu"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#CBD5C8] bg-white text-[#17231A] focus:outline-none focus:border-[#1E5631]"
            />
          </div>
        </div>

        <div className="space-y-1.5 max-w-xs">
          <label htmlFor="profile-lang" className="block text-xs font-semibold text-[#17231A]">
            Preferred Voice Assistant Locale
          </label>
          <select
            id="profile-lang"
            value={preferredLanguage}
            onChange={(e) => setPreferredLanguage(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#CBD5C8] bg-white text-[#17231A] focus:outline-none focus:border-[#1E5631]"
          >
            <option value="en-IN">English (India — en-IN)</option>
            <option value="en-US">English (US — en-US)</option>
            <option value="ta-IN">Tamil (Experimental — ta-IN)</option>
          </select>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={savingProfile}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg bg-[#1E5631] text-white hover:bg-[#164225] disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            {savingProfile ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" aria-hidden="true" />
                Save Profile
              </>
            )}
          </button>
        </div>
      </form>

      {/* Password Rotation Form */}
      <form
        onSubmit={handlePasswordChange}
        className="rounded-2xl border border-[#DCE3DA] bg-white p-6 sm:p-7 space-y-5"
      >
        <div className="space-y-1">
          <h2 className="text-base font-bold text-[#17231A]">Change Password</h2>
          <p className="text-xs text-[#526056]">
            Passwords are never stored in plaintext and are salted and hashed with bcryptjs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label htmlFor="current-pass" className="block text-xs font-semibold text-[#17231A]">
              Current Password
            </label>
            <input
              id="current-pass"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#CBD5C8] bg-white text-[#17231A] focus:outline-none focus:border-[#1E5631]"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="new-pass" className="block text-xs font-semibold text-[#17231A]">
              New Password
            </label>
            <input
              id="new-pass"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 8 characters"
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#CBD5C8] bg-white text-[#17231A] focus:outline-none focus:border-[#1E5631]"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="confirm-pass" className="block text-xs font-semibold text-[#17231A]">
              Confirm New Password
            </label>
            <input
              id="confirm-pass"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-[#CBD5C8] bg-white text-[#17231A] focus:outline-none focus:border-[#1E5631]"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={savingPassword}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg border border-[#1E5631] text-[#1E5631] hover:bg-[#EEF5F0] disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap"
          >
            {savingPassword ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                Updating Password...
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" aria-hidden="true" />
                Update Password
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

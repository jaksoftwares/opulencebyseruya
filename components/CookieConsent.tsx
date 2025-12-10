'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

const COOKIE_STORAGE_KEY = 'opulence_cookie_consent_v1';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = window.localStorage.getItem(COOKIE_STORAGE_KEY);
      if (!stored) {
        setVisible(true);
      }
    } catch (error) {
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(COOKIE_STORAGE_KEY, 'accepted');
      }
    } catch (error) {
      // Ignore storage errors and just hide the banner
    }
    setVisible(false);
  };

  const handleDismiss = () => {
    setVisible(false);
  };

  const handleRefreshData = () => {
    if (typeof window === 'undefined') return;

    try {
      // Clear known legacy/stale keys without wiping everything
      window.localStorage.removeItem('opulence_auth');
      window.localStorage.removeItem('opulence-auth-token');

      // You can add other keys here in the future as needed
    } catch (error) {
      // Swallow errors; we still attempt a reload
    }

    window.location.reload();
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-4 sm:px-6 sm:pb-6">
      <div className="w-full max-w-4xl rounded-2xl border border-amber-200 bg-white/95 shadow-xl backdrop-blur">
        <div className="flex items-start gap-4 p-4 sm:p-5">
          <div className="mt-1 h-8 w-8 flex items-center justify-center rounded-full bg-amber-100 text-amber-700 font-semibold text-lg">
            OB
          </div>
          <div className="flex-1 space-y-2">
            <h2 className="text-sm sm:text-base font-semibold text-gray-900">
              We use cookies to enhance your Opulence experience
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              We use cookies and similar technologies to keep you signed in, remember your preferences, and
              improve how our store works. You can accept cookies to continue enjoying a seamless shopping
              experience.
            </p>
            <p className="text-[11px] sm:text-xs text-gray-500">
              If things ever feel outdated (for example, prices or account info look wrong), you can refresh
              your data below. This clears some old saved information and reloads the latest version of the
              site.
            </p>
            <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 sm:px-5"
                  onClick={handleAccept}
                >
                  Allow cookies
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-200 text-amber-700 hover:bg-amber-50"
                  onClick={handleRefreshData}
                >
                  Refresh data
                </Button>
              </div>
              <button
                type="button"
                onClick={handleDismiss}
                className="self-start text-xs text-gray-500 hover:text-gray-700 underline-offset-2 hover:underline"
              >
                Maybe later
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDismiss}
            className="ml-2 mt-1 hidden sm:inline-flex h-6 w-6 items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            aria-label="Close cookie banner"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

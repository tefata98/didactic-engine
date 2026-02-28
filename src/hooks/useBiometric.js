import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/AppContext';

export default function useBiometric() {
  const { state } = useApp();
  const [isLocked, setIsLocked] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Check if WebAuthn / biometric is supported
  useEffect(() => {
    const supported = !!(window.PublicKeyCredential && navigator.credentials);
    setIsSupported(supported);
  }, []);

  // Lock on tab visibility change if Face ID is enabled
  useEffect(() => {
    if (!state.settings.faceId) {
      setIsLocked(false);
      return;
    }

    // Lock when tab becomes hidden
    const handleVisibility = () => {
      if (document.hidden) {
        sessionStorage.setItem('light_locked', 'true');
      }
    };

    // Check if we should be locked on mount
    const wasLocked = sessionStorage.getItem('light_locked');
    if (wasLocked === 'true') {
      setIsLocked(true);
    }

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [state.settings.faceId]);

  const authenticate = useCallback(async () => {
    if (!state.settings.faceId) {
      setIsLocked(false);
      return true;
    }

    setIsAuthenticating(true);
    try {
      // Try WebAuthn biometric authentication
      if (isSupported && window.PublicKeyCredential) {
        const challenge = new Uint8Array(32);
        crypto.getRandomValues(challenge);

        const credential = await navigator.credentials.create({
          publicKey: {
            challenge,
            rp: { name: 'Light', id: window.location.hostname },
            user: {
              id: new Uint8Array(16),
              name: 'stefan',
              displayName: 'Stefan',
            },
            pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
            authenticatorSelection: {
              authenticatorAttachment: 'platform',
              userVerification: 'required',
            },
            timeout: 60000,
          },
        });

        if (credential) {
          setIsLocked(false);
          sessionStorage.removeItem('light_locked');
          return true;
        }
      }

      // Fallback: just unlock (biometric not available)
      setIsLocked(false);
      sessionStorage.removeItem('light_locked');
      return true;
    } catch {
      // User cancelled or biometric failed — stay locked
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, [state.settings.faceId, isSupported]);

  const unlock = useCallback(() => {
    setIsLocked(false);
    sessionStorage.removeItem('light_locked');
  }, []);

  return { isLocked, isSupported, isAuthenticating, authenticate, unlock };
}

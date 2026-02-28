import { useState, useEffect, useCallback, useRef } from 'react';

export default function useNotifications() {
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );
  const [swReady, setSwReady] = useState(false);
  const timersRef = useRef([]);

  // Check if SW is ready
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => setSwReady(true));
    }
  }, []);

  const requestPermission = useCallback(async () => {
    if (typeof Notification === 'undefined') return 'unsupported';
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  const sendNotification = useCallback((title, options = {}) => {
    if (permission !== 'granted') return null;

    // Prefer SW-based notification (works when tab isn't focused)
    if (swReady && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        reg.active.postMessage({
          type: 'SHOW_NOTIFICATION',
          payload: { title, body: options.body, tag: options.tag, data: options.data },
        });
      });
      return true;
    }

    // Fallback: direct Notification API
    try {
      return new Notification(title, {
        icon: '/didactic-engine/icon-192.png',
        badge: '/didactic-engine/icon-192.png',
        vibrate: [100, 50, 100],
        ...options,
      });
    } catch {
      return null;
    }
  }, [permission, swReady]);

  const scheduleReminders = useCallback((reminders) => {
    // Clear existing app-side timers
    timersRef.current.forEach(id => clearTimeout(id));
    timersRef.current = [];

    if (permission !== 'granted' || !reminders) return;

    // Try to delegate scheduling to the Service Worker
    if (swReady && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        reg.active.postMessage({
          type: 'SCHEDULE_NOTIFICATIONS',
          payload: { reminders },
        });
      });
      return;
    }

    // Fallback: app-side setTimeout (only works while tab is open)
    function scheduleDailyAt(timeStr, title, body, dayFilter) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const now = new Date();
      const target = new Date();
      target.setHours(hours, minutes, 0, 0);

      if (target <= now) {
        target.setDate(target.getDate() + 1);
      }

      if (dayFilter) {
        const day = target.getDay();
        if (!dayFilter.includes(day)) return;
      }

      const ms = target - now;
      const timerId = setTimeout(() => {
        sendNotification(title, { body });
        const nextId = setTimeout(() => scheduleDailyAt(timeStr, title, body, dayFilter), 24 * 60 * 60 * 1000);
        timersRef.current.push(nextId);
      }, ms);
      timersRef.current.push(timerId);
    }

    if (reminders.sleepWindDown?.enabled) {
      scheduleDailyAt(reminders.sleepWindDown.time || '22:30', 'Wind-Down Time', 'Time to start your sleep routine. Screens off, brain dump, cool room.');
    }
    if (reminders.workout?.enabled) {
      scheduleDailyAt(reminders.workout.time || '07:00', 'Workout Time', 'Resistance band session today!', [1, 3, 5]);
    }
    if (reminders.vocalPractice?.enabled) {
      scheduleDailyAt(reminders.vocalPractice.time || '18:00', 'Vocal Practice', 'Time for your SLS warm-up. 25 minutes for your voice!');
    }
    if (reminders.readingGoal?.enabled) {
      scheduleDailyAt(reminders.readingGoal.time || '21:00', 'Reading Time', 'Grab your book — 20 pages before bed!');
    }
  }, [permission, sendNotification, swReady]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(id => clearTimeout(id));
    };
  }, []);

  return { permission, requestPermission, sendNotification, scheduleReminders, swReady };
}

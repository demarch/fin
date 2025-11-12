import { useEffect } from 'react';

type KeyboardShortcutHandler = (event: KeyboardEvent) => void;

interface KeyboardShortcutOptions {
  enabled?: boolean;
  preventDefault?: boolean;
}

/**
 * Hook to handle keyboard shortcuts
 * @param key - The key to listen for (e.g., 'Escape', 'Enter', 'k')
 * @param callback - Function to call when key is pressed
 * @param options - Additional options
 */
export const useKeyboardShortcut = (
  key: string,
  callback: KeyboardShortcutHandler,
  options: KeyboardShortcutOptions = {}
) => {
  const { enabled = true, preventDefault = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === key) {
        if (preventDefault) {
          event.preventDefault();
        }
        callback(event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [key, callback, enabled, preventDefault]);
};

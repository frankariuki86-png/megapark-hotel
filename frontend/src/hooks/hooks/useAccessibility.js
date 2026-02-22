/**
 * Accessibility Utilities Hook
 * Provides keyboard navigation, focus management, and ARIA support
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to handle keyboard navigation in lists/grids
 * Provides arrow key navigation between items
 */
export const useKeyboardNavigation = (itemsCount, onItemSelect) => {
  const [selectedIndex, setSelectedIndex] = window.__a11y?.useState?.(0) || [0, () => {}];
  const itemRefs = useRef([]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % itemsCount);
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + itemsCount) % itemsCount);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (onItemSelect) {
            onItemSelect(selectedIndex);
          }
          break;
        case 'Home':
          e.preventDefault();
          setSelectedIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setSelectedIndex(itemsCount - 1);
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [itemsCount, selectedIndex, onItemSelect]);

  return { selectedIndex, itemRefs };
};

/**
 * Hook to manage focus trap (confines keyboard focus within a modal/dialog)
 */
export const useFocusTrap = (isActive) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const handleKeyDown = (e) => {
      if (e.key !== 'Tab') return;

      const focusableElements = containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    containerRef.current.addEventListener('keydown', handleKeyDown);
    return () => containerRef.current?.removeEventListener('keydown', handleKeyDown);
  }, [isActive]);

  return containerRef;
};

/**
 * Hook to announce changes to screen readers using aria-live regions
 */
export const useAriaLive = () => {
  const announceRef = useRef(null);

  const announce = useCallback((message, priority = 'polite') => {
    if (!announceRef.current) {
      const el = document.createElement('div');
      el.setAttribute('aria-live', priority);
      el.setAttribute('aria-atomic', 'true');
      el.setAttribute('class', 'sr-only');
      el.style.position = 'absolute';
      el.style.left = '-10000px';
      document.body.appendChild(el);
      announceRef.current = el;
    }

    announceRef.current.setAttribute('aria-live', priority);
    announceRef.current.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      if (announceRef.current) {
        announceRef.current.textContent = '';
      }
    }, 1000);
  }, []);

  return { announce };
};

/**
 * Hook to skip to main content
 */
export const useSkipLink = () => {
  const handleSkipClick = useCallback((e) => {
    e.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return { handleSkipClick };
};

/**
 * Add keyboard shortcut support
 */
export const useKeyboardShortcuts = (shortcuts) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      for (const [combination, callback] of Object.entries(shortcuts)) {
        const [keys, cb] = Array.isArray(combination) ? combination : [combination, callback];
        
        if (typeof keys === 'string') {
          // Simple key matching
          if (e.key === keys && cb instanceof Function) {
            e.preventDefault();
            cb(e);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

export default {
  useKeyboardNavigation,
  useFocusTrap,
  useAriaLive,
  useSkipLink,
  useKeyboardShortcuts,
};

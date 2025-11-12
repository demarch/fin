import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToast, useToastStore } from './useToast';

describe('useToast', () => {
  beforeEach(() => {
    // Reset store before each test
    useToastStore.setState({ toasts: [] });
  });

  describe('useToastStore', () => {
    it('should start with empty toasts array', () => {
      const { toasts } = useToastStore.getState();
      expect(toasts).toEqual([]);
    });

    it('should add toast with addToast', () => {
      const { addToast, toasts } = useToastStore.getState();

      act(() => {
        addToast('Test message', 'success');
      });

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0].message).toBe('Test message');
      expect(state.toasts[0].type).toBe('success');
      expect(state.toasts[0].duration).toBe(5000); // default duration
    });

    it('should add toast with custom duration', () => {
      const { addToast } = useToastStore.getState();

      act(() => {
        addToast('Test message', 'error', 3000);
      });

      const state = useToastStore.getState();
      expect(state.toasts[0].duration).toBe(3000);
    });

    it('should generate unique IDs for each toast', () => {
      const { addToast } = useToastStore.getState();

      act(() => {
        addToast('Message 1', 'success');
        addToast('Message 2', 'error');
      });

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(2);
      expect(state.toasts[0].id).not.toBe(state.toasts[1].id);
    });

    it('should remove toast by ID', () => {
      const { addToast, removeToast } = useToastStore.getState();

      let toastId: string;

      act(() => {
        addToast('Test message', 'success');
        const state = useToastStore.getState();
        toastId = state.toasts[0].id;
      });

      act(() => {
        removeToast(toastId);
      });

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(0);
    });

    it('should only remove toast with matching ID', () => {
      const { addToast, removeToast } = useToastStore.getState();

      let toastId1: string;
      let toastId2: string;

      act(() => {
        addToast('Message 1', 'success');
        addToast('Message 2', 'error');
        const state = useToastStore.getState();
        toastId1 = state.toasts[0].id;
        toastId2 = state.toasts[1].id;
      });

      act(() => {
        removeToast(toastId1);
      });

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0].id).toBe(toastId2);
    });
  });

  describe('Helper methods', () => {
    it('should add success toast', () => {
      const { success } = useToastStore.getState();

      act(() => {
        success('Success message');
      });

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0].type).toBe('success');
      expect(state.toasts[0].message).toBe('Success message');
    });

    it('should add error toast', () => {
      const { error } = useToastStore.getState();

      act(() => {
        error('Error message');
      });

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0].type).toBe('error');
      expect(state.toasts[0].message).toBe('Error message');
    });

    it('should add warning toast', () => {
      const { warning } = useToastStore.getState();

      act(() => {
        warning('Warning message');
      });

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0].type).toBe('warning');
      expect(state.toasts[0].message).toBe('Warning message');
    });

    it('should add info toast', () => {
      const { info } = useToastStore.getState();

      act(() => {
        info('Info message');
      });

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0].type).toBe('info');
      expect(state.toasts[0].message).toBe('Info message');
    });

    it('should respect custom duration in helper methods', () => {
      const { success } = useToastStore.getState();

      act(() => {
        success('Success message', 10000);
      });

      const state = useToastStore.getState();
      expect(state.toasts[0].duration).toBe(10000);
    });
  });

  describe('useToast hook', () => {
    it('should return helper functions', () => {
      const { result } = renderHook(() => useToast());

      expect(result.current).toHaveProperty('success');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('warning');
      expect(result.current).toHaveProperty('info');
    });

    it('should add toast via hook', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Hook success');
      });

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(1);
      expect(state.toasts[0].message).toBe('Hook success');
      expect(state.toasts[0].type).toBe('success');
    });

    it('should add multiple toasts via hook', () => {
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.success('Success');
        result.current.error('Error');
        result.current.warning('Warning');
        result.current.info('Info');
      });

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(4);
      expect(state.toasts.map(t => t.type)).toEqual(['success', 'error', 'warning', 'info']);
    });
  });

  describe('Multiple toasts management', () => {
    it('should handle multiple toasts in queue', () => {
      const { addToast } = useToastStore.getState();

      act(() => {
        addToast('Toast 1', 'success');
        addToast('Toast 2', 'error');
        addToast('Toast 3', 'warning');
      });

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(3);
    });

    it('should maintain order of toasts', () => {
      const { addToast } = useToastStore.getState();

      act(() => {
        addToast('First', 'success');
        addToast('Second', 'error');
        addToast('Third', 'warning');
      });

      const state = useToastStore.getState();
      expect(state.toasts[0].message).toBe('First');
      expect(state.toasts[1].message).toBe('Second');
      expect(state.toasts[2].message).toBe('Third');
    });

    it('should remove toasts independently', () => {
      const { addToast, removeToast } = useToastStore.getState();

      let ids: string[];

      act(() => {
        addToast('Toast 1', 'success');
        addToast('Toast 2', 'error');
        addToast('Toast 3', 'warning');
        ids = useToastStore.getState().toasts.map(t => t.id);
      });

      act(() => {
        removeToast(ids[1]); // Remove middle toast
      });

      const state = useToastStore.getState();
      expect(state.toasts).toHaveLength(2);
      expect(state.toasts[0].message).toBe('Toast 1');
      expect(state.toasts[1].message).toBe('Toast 3');
    });
  });
});

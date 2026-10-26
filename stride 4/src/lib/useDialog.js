import { useEffect, useRef } from 'react';

/**
 * Modal dialog behaviour shared by the run drawer and the training-pattern sheet:
 *   - focus moves into the dialog when it opens (to `initialFocusRef`)
 *   - Tab / Shift+Tab stay inside it
 *   - Escape closes it
 *   - focus returns to the element that opened it
 * Dialogs can stack (a run opened from the sheet): only the top one reacts to keys.
 */
const stack = [];

export default function useDialog(isOpen, onClose, initialFocusRef) {
  const panelRef = useRef(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return undefined;
    const id = Symbol('dialog');
    stack.push(id);
    const returnTo = document.activeElement;
    (initialFocusRef?.current ?? panelRef.current)?.focus();
    document.body.classList.add('has-dialog');

    const onKey = (e) => {
      if (stack[stack.length - 1] !== id || !panelRef.current) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onCloseRef.current();
        return;
      }
      if (e.key === 'Tab') {
        const items = [...panelRef.current.querySelectorAll('button, [href], input, select, [tabindex]:not([tabindex="-1"])')].filter(
          // visible, enabled, and for radio groups only the checked option (the browser's own tab stop)
          (el) => !el.disabled && el.getClientRects().length > 0 && !(el.type === 'radio' && !el.checked),
        );
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && (document.activeElement === first || !panelRef.current.contains(document.activeElement))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (document.activeElement === last || !panelRef.current.contains(document.activeElement))) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      stack.splice(stack.indexOf(id), 1);
      if (!stack.length) document.body.classList.remove('has-dialog');
      returnTo?.focus?.();
    };
  }, [isOpen, initialFocusRef]);

  return panelRef;
}

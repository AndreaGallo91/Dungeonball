import { useEffect, useRef, useCallback } from 'react';

export function useInput(onAction) {
  const keysRef = useRef(new Set());
  const plungerRef = useRef({ charging: false, charge: 0, startTime: 0 });

  const handleKeyDown = useCallback(
    (e) => {
      if (keysRef.current.has(e.key)) return;
      keysRef.current.add(e.key);

      switch (e.key) {
        case 'a':
        case 'A':
        case 'ArrowLeft':
          onAction({ type: 'flipper', side: 'left', active: true });
          break;
        case 'd':
        case 'D':
        case 'ArrowRight':
          onAction({ type: 'flipper', side: 'right', active: true });
          break;
        case ' ':
          e.preventDefault();
          if (!plungerRef.current.charging) {
            plungerRef.current.charging = true;
            plungerRef.current.startTime = Date.now();
            plungerRef.current.charge = 0;
          }
          break;
        case 'ArrowUp':
          onAction({ type: 'tilt' });
          break;
        case 'p':
        case 'P':
        case 'Escape':
          onAction({ type: 'pause' });
          break;
      }
    },
    [onAction]
  );

  const handleKeyUp = useCallback(
    (e) => {
      keysRef.current.delete(e.key);

      switch (e.key) {
        case 'a':
        case 'A':
        case 'ArrowLeft':
          onAction({ type: 'flipper', side: 'left', active: false });
          break;
        case 'd':
        case 'D':
        case 'ArrowRight':
          onAction({ type: 'flipper', side: 'right', active: false });
          break;
        case ' ':
          if (plungerRef.current.charging) {
            onAction({
              type: 'launch',
              force: Math.min(plungerRef.current.charge, 1),
            });
            plungerRef.current.charging = false;
            plungerRef.current.charge = 0;
          }
          break;
      }
    },
    [onAction]
  );

  // Update plunger charge
  useEffect(() => {
    const interval = setInterval(() => {
      if (plungerRef.current.charging) {
        const elapsed = Date.now() - plungerRef.current.startTime;
        plungerRef.current.charge = Math.min(elapsed / 1500, 1);
        onAction({
          type: 'plungerCharge',
          charge: plungerRef.current.charge,
        });
      }
    }, 16);
    return () => clearInterval(interval);
  }, [onAction]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return plungerRef;
}

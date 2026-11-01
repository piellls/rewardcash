'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// Renders its children directly under <body>, outside the page.
//
// Full-screen dialogs (login, support, task details, cash out...) use this so that `position: fixed` is measured
// against the screen. Inside the page, any wrapper with a transform, filter, backdrop-filter, contain or will-change
// becomes the containing block of a fixed child, and the dialog then sits in the middle of that wrapper (the whole
// page) instead of the middle of the screen. Under <body> nothing can do that to it, whatever the page does later.
//
// Nothing is rendered on the server or on the first client render, which is fine: dialogs only appear after a click
// or an effect, and they mount one render later, so effects inside them (focus, sounds) still run as before.
export default function Portal({ children }) {
  const [target, setTarget] = useState(null);
  useEffect(() => { setTarget(document.body); }, []);
  return target ? createPortal(children, target) : null;
}

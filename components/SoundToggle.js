'use client';

import { Volume2, VolumeX } from 'lucide-react';
import { useSound } from '@/lib/sfx';

// Speaker button for the header. Remembers the choice (localStorage) and shows moving bars while sound is on.
export default function SoundToggle({ className = '' }) {
  const { on, toggle } = useSound();
  return (
    <button
      type="button"
      data-sfx="off"
      onClick={toggle}
      aria-pressed={on}
      aria-label={on ? 'Sound on. Turn sound off' : 'Sound off. Turn sound on'}
      title={on ? 'Sound on' : 'Sound off'}
      className={`g-icon-btn relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--bb-border)] bg-[var(--bb-surface)] text-zinc-300 hover:border-[#7854f7]/60 hover:text-white ${className}`}
    >
      {on ? (
        <span className="flex items-center gap-1.5 text-[#c3b2ff]">
          <Volume2 className="h-4 w-4" aria-hidden="true" />
        </span>
      ) : (
        <VolumeX className="h-4 w-4 text-zinc-500" aria-hidden="true" />
      )}
    </button>
  );
}

import { useEffect, useState } from 'preact/hooks';
import { subscribeToasts, type Toast } from '../toast';

export function Toasts() {
  const [list, setList] = useState<Toast[]>([]);
  useEffect(() => subscribeToasts(setList), []);
  return (
    <div class="toasts" aria-live="polite">
      {list.map((t) => (
        <div class="toast" key={t.id}>
          <span class="toast-icon">{t.icon}</span>
          <span>
            <strong>{t.title}</strong>
            {t.text && <small>{t.text}</small>}
          </span>
        </div>
      ))}
    </div>
  );
}

export interface Toast {
  id: number;
  icon: string;
  title: string;
  text?: string;
}

type Listener = (list: Toast[]) => void;
let list: Toast[] = [];
let next = 1;
const listeners = new Set<Listener>();

const emit = () => listeners.forEach((f) => f(list));

export function toast(icon: string, title: string, text?: string) {
  const t = { id: next++, icon, title, text };
  list = [...list, t].slice(-3);
  emit();
  setTimeout(() => {
    list = list.filter((x) => x.id !== t.id);
    emit();
  }, 4200);
}

export function subscribeToasts(fn: Listener) {
  listeners.add(fn);
  fn(list);
  return () => void listeners.delete(fn);
}

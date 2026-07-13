/**
 * Toast store. Reactive notifications with auto-dismiss and queueing.
 */
export type ToastTone = 'info' | 'success' | 'error';
export interface Toast {
	id: number;
	tone: ToastTone;
	text: string;
	duration: number;
}

let nextId = 1;

function createToastStore() {
	let items = $state<Toast[]>([]);
	const timers = new Map<number, ReturnType<typeof setTimeout>>();

	function push(tone: ToastTone, text: string, duration = 4000) {
		const id = nextId++;
		items = [...items, { id, tone, text, duration }];
		const t = setTimeout(() => dismiss(id), duration);
		timers.set(id, t);
		return id;
	}

	function dismiss(id: number) {
		const t = timers.get(id);
		if (t) { clearTimeout(t); timers.delete(id); }
		items = items.filter((x) => x.id !== id);
	}

	return {
		get items() { return items; },
		info:    (text: string, duration?: number) => push('info', text, duration),
		success: (text: string, duration?: number) => push('success', text, duration),
		error:   (text: string, duration?: number) => push('error', text, duration ?? 6000),
		dismiss
	};
}

export const toasts = createToastStore();
/**
 * Action: adds `data-inview="true"` when the node enters viewport. Use with the
 * `.reveal` class in app.css to fade-up on scroll.
 */
export function inview(node: HTMLElement, options: IntersectionObserverInit = {}) {
	if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
		node.dataset.inview = 'true';
		return {};
	}
	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					node.dataset.inview = 'true';
					observer.unobserve(node);
				}
			}
		},
		{ threshold: 0.1, rootMargin: '0px 0px -10% 0px', ...options }
	);
	observer.observe(node);
	return {
		destroy() { observer.disconnect(); }
	};
}

/**
 * Action: shake horizontally once. Used for inline form errors.
 */
export function shake(node: HTMLElement) {
	let timer: ReturnType<typeof setTimeout> | null = null;
	function trigger() {
		node.classList.remove('shake');
		// force reflow
		void node.offsetWidth;
		node.classList.add('shake');
		timer = setTimeout(() => node.classList.remove('shake'), 400);
	}
	node.addEventListener('invalid', trigger);
	node.addEventListener('form:error', trigger as EventListener);
	return {
		update() {},
		destroy() {
			node.removeEventListener('invalid', trigger);
			node.removeEventListener('form:error', trigger as EventListener);
			if (timer) clearTimeout(timer);
		}
	};
}
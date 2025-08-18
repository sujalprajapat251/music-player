// Cross-browser Web Audio context utilities
// - Singleton AudioContext with webkit fallback
// - Unlock helpers for autoplay-restricted environments (iOS Safari, mobile)

let sharedAudioContext = null;

export function getAudioContext() {
	const AudioContextClass = window.AudioContext || window.webkitAudioContext;
	if (!AudioContextClass) {
		throw new Error('Web Audio API not supported in this browser.');
	}
	if (!sharedAudioContext) {
		sharedAudioContext = new AudioContextClass({ latencyHint: 'interactive' });
	}
	return sharedAudioContext;
}

export async function ensureAudioUnlocked() {
	let ctx;
	try {
		ctx = getAudioContext();
	} catch (e) {
		return; // Not supported, nothing to unlock
	}

	if (ctx.state === 'running') return;

	try {
		await ctx.resume();
		if (ctx.state === 'running') return;
	} catch {}

	// iOS Safari sometimes needs a silent buffer kick
	try {
		const buffer = ctx.createBuffer(1, 1, 22050);
		const source = ctx.createBufferSource();
		source.buffer = buffer;
		source.connect(ctx.destination);
		source.start(0);
		await ctx.resume();
	} catch {}
}

export function attachAudioUnlockOnce() {
	const unlock = async () => {
		try { await ensureAudioUnlocked(); } finally {
			['pointerdown', 'touchend', 'keydown'].forEach(evt =>
				window.removeEventListener(evt, unlock, true)
			);
		}
	};
	['pointerdown', 'touchend', 'keydown'].forEach(evt =>
		window.addEventListener(evt, unlock, true)
	);
}



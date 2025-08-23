
let sharedAudioContext = null;

export function getAudioContext() {
	const AudioContextClass = window.AudioContext || window.webkitAudioContext;
	if (!AudioContextClass) {
		throw new Error('Web Audio API not supported in this browser.');
	}
	if (!sharedAudioContext) {
		sharedAudioContext = new AudioContextClass({ 
			latencyHint: 'interactive',
			sampleRate: 44100
		});
	}
	
	// Ensure audio context is resumed if suspended
	if (sharedAudioContext.state === 'suspended') {
		sharedAudioContext.resume().catch(console.error);
	}
	
	return sharedAudioContext;
}

export async function ensureAudioUnlocked() {
	let ctx;
	try {
		ctx = getAudioContext();
	} catch (e) {
		return false; // Not supported
	}

	if (ctx.state === 'running') return true;

	try {
		await ctx.resume();
		if (ctx.state === 'running') return true;
	} catch {}

	// iOS Safari sometimes needs a silent buffer kick
	try {
		const buffer = ctx.createBuffer(1, 1, 22050);
		const source = ctx.createBufferSource();
		source.buffer = buffer;
		source.connect(ctx.destination);
		source.start(0);
		source.stop(0.001);
		await ctx.resume();
		return ctx.state === 'running';
	} catch {
		return false;
	}
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



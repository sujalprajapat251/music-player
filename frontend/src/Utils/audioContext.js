import audioManager from './audioManager';

let sharedAudioContext = null;

export function getAudioContext() {
	const AudioContextClass = window.AudioContext || window.webkitAudioContext;
	if (!AudioContextClass) {
		throw new Error('Web Audio API not supported in this browser.');
	}
	
	if (sharedAudioContext) {
		return sharedAudioContext;
	}
	
	if (!audioManager.getAudioContext()) {
		audioManager.initialize();
	}
	
	sharedAudioContext = audioManager.getAudioContext();
	
	// Ensure audio context is resumed if suspended
	if (sharedAudioContext.state === 'suspended') {
		sharedAudioContext.resume().catch(console.error);
	}
	
	return sharedAudioContext;
}

export async function recreateAudioContext(sampleRate, latencyHint) {
	try {
		const qualityMap = {
			48000: 'High',
			44100: 'Medium', 
			22050: 'Low',
			11025: 'Extra Low'
		};
		
		const quality = qualityMap[sampleRate] || 'Medium';
		await audioManager.changeQuality(quality);

		sharedAudioContext = audioManager.getAudioContext();
		
		return sharedAudioContext;
	} catch (error) {
		console.error('Failed to recreate audio context:', error);
		throw error;
	}
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

export { audioManager };


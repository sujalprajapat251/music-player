import * as Tone from 'tone';

class AudioEffectsPlayer {
    constructor() {
        this.currentEffect = null;
        this.isPlaying = false;
        this.effects = new Map();
        this.oscillator = null;
        this.gainNode = null;
        this.filterNode = null;
        this.distortionNode = null;
        this.delayNode = null;
        this.chorusNode = null;
        this.reverbNode = null;

        this.initializeToneEffects();
    }

    initializeToneEffects() {
        this.toneEffects = {
            distortion: new Tone.Distortion(0.8),
            chorus: new Tone.Chorus(4, 2.5, 0.5),
            phaser: new Tone.Phaser({
                frequency: 0.5,
                octaves: 3,
                stages: 10,
                Q: 10,
                baseFrequency: 350
            }),
            autoWah: new Tone.AutoWah(50, 6, -30),
            bitCrusher: new Tone.BitCrusher(4),
            delay: new Tone.FeedbackDelay("8n", 0.5),
            reverb: new Tone.Reverb(2),
            tremolo: new Tone.Tremolo(9, 0.75),
            vibrato: new Tone.Vibrato(5, 0.1),
            flanger: new Tone.Chorus(0.6, 2.5, 0.8),
            overdrive: new Tone.Distortion(0.4),
            compressor: new Tone.Compressor(-30, 3),
            filter: new Tone.Filter(800, "lowpass"),
            pitchShift: new Tone.PitchShift(2)
        };

        Object.values(this.toneEffects).forEach(effect => {
            effect.toDestination();
        });
    }

    async playEffect(effectName) {
        try {
            if (Tone.context.state !== 'running') {
                await Tone.start();
            }

            this.stopEffect();

            const oscillator = new Tone.Oscillator(220, "sawtooth");
            let effectChain = oscillator;

            switch (effectName.toLowerCase()) {
                case 'bitcrushar':
                case 'bitcrusher':
                    effectChain = oscillator.chain(this.toneEffects.bitCrusher, Tone.Destination);
                    oscillator.frequency.setValueAtTime(110, Tone.now());
                    this.playBitcrusherDemo(oscillator);
                    break;

                case 'classic dist':
                case 'classic distortion':
                    effectChain = oscillator.chain(this.toneEffects.distortion, Tone.Destination);
                    this.playDistortionDemo(oscillator);
                    break;

                case 'clipper':
                    effectChain = oscillator.chain(this.toneEffects.compressor, this.toneEffects.distortion, Tone.Destination);
                    this.playClipperDemo(oscillator);
                    break;

                case 'crusher':
                    effectChain = oscillator.chain(this.toneEffects.bitCrusher, this.toneEffects.distortion, Tone.Destination);
                    this.playCrusherDemo(oscillator);
                    break;

                case 'fuzz':
                    const fuzzGain = new Tone.Gain(2);
                    effectChain = oscillator.chain(fuzzGain, this.toneEffects.distortion, Tone.Destination);
                    this.playFuzzDemo(oscillator);
                    break;

                case 'juicy distrotion':
                case 'juicy distortion':
                    const juicyFilter = new Tone.Filter(1000, "lowpass");
                    effectChain = oscillator.chain(this.toneEffects.distortion, juicyFilter, Tone.Destination);
                    this.playJuicyDistortionDemo(oscillator);
                    break;

                case 'overdrive':
                    effectChain = oscillator.chain(this.toneEffects.overdrive, Tone.Destination);
                    this.playOverdriveDemo(oscillator);
                    break;

                case 'auto pan':
                    const autoPanner = new Tone.AutoPanner("4n");
                    effectChain = oscillator.chain(autoPanner, Tone.Destination);
                    autoPanner.start();
                    this.playAutoPanDemo(oscillator);
                    break;

                case 'auto-wah':
                case 'autowah':
                    effectChain = oscillator.chain(this.toneEffects.autoWah, Tone.Destination);
                    this.playAutoWahDemo(oscillator);
                    break;

                case 'chorus':
                    effectChain = oscillator.chain(this.toneEffects.chorus, Tone.Destination);
                    this.toneEffects.chorus.start();
                    this.playChorusDemo(oscillator);
                    break;

                case 'flanger':
                    effectChain = oscillator.chain(this.toneEffects.flanger, Tone.Destination);
                    this.toneEffects.flanger.start();
                    this.playFlangerDemo(oscillator);
                    break;

                case 'instant sidechain':
                    effectChain = oscillator.chain(this.toneEffects.compressor, Tone.Destination);
                    this.playInstantSidechainDemo(oscillator);
                    break;

                case 'phaser':
                    effectChain = oscillator.chain(this.toneEffects.phaser, Tone.Destination);
                    this.playPhaserDemo(oscillator);
                    break;

                case 'pitch shifter':
                    effectChain = oscillator.chain(this.toneEffects.pitchShift, Tone.Destination);
                    this.playPitchShifterDemo(oscillator);
                    break;

                case 'rotary':
                    const rotaryTremolo = new Tone.Tremolo(6, 0.8);
                    effectChain = oscillator.chain(rotaryTremolo, Tone.Destination);
                    rotaryTremolo.start();
                    this.playRotaryDemo(oscillator);
                    break;

                case 'rotary pro':
                    const rotaryProTremolo = new Tone.Tremolo(8, 0.9);
                    const rotaryProChorus = new Tone.Chorus(2, 1.5, 0.3);
                    effectChain = oscillator.chain(rotaryProTremolo, rotaryProChorus, Tone.Destination);
                    rotaryProTremolo.start();
                    rotaryProChorus.start();
                    this.playRotaryProDemo(oscillator);
                    break;

                case 'stereo chorus':
                    const stereoChorus = new Tone.Chorus(6, 2.5, 0.7);
                    effectChain = oscillator.chain(stereoChorus, Tone.Destination);
                    stereoChorus.start();
                    this.playStereoChorusDemo(oscillator);
                    break;

                case 'tape wobble':
                    const tapeVibrato = new Tone.Vibrato(0.3, 0.1);
                    effectChain = oscillator.chain(tapeVibrato, Tone.Destination);
                    this.playTapeWobbleDemo(oscillator);
                    break;

                default:
                    effectChain = oscillator.chain(Tone.Destination);
                    this.playDefaultDemo(oscillator);
                    break;
            }

            this.currentEffect = { oscillator, effectChain };
            this.isPlaying = true;

        } catch (error) {
            console.error('Error playing effect:', error);
        }
    }

    playBitcrusherDemo(oscillator) {
        oscillator.start();
        oscillator.frequency.setValueAtTime(220, Tone.now());
        oscillator.frequency.exponentialRampToValueAtTime(880, Tone.now() + 1);
        oscillator.frequency.exponentialRampToValueAtTime(220, Tone.now() + 2);
        oscillator.stop(Tone.now() + 3);
    }

    playDistortionDemo(oscillator) {
        oscillator.start();
        const notes = [220, 277, 330, 440];
        notes.forEach((freq, index) => {
            oscillator.frequency.setValueAtTime(freq, Tone.now() + index * 0.5);
        });
        oscillator.stop(Tone.now() + 2.5);
    }

    playClipperDemo(oscillator) {
        oscillator.start();
        oscillator.frequency.setValueAtTime(330, Tone.now());
        oscillator.frequency.setValueAtTime(440, Tone.now() + 0.5);
        oscillator.frequency.setValueAtTime(550, Tone.now() + 1);
        oscillator.stop(Tone.now() + 2);
    }

    playCrusherDemo(oscillator) {
        oscillator.start();
        oscillator.frequency.setValueAtTime(110, Tone.now());
        oscillator.frequency.exponentialRampToValueAtTime(440, Tone.now() + 1.5);
        oscillator.stop(Tone.now() + 2.5);
    }

    playFuzzDemo(oscillator) {
        oscillator.start();
        oscillator.frequency.setValueAtTime(165, Tone.now());
        oscillator.frequency.setValueAtTime(220, Tone.now() + 0.3);
        oscillator.frequency.setValueAtTime(277, Tone.now() + 0.6);
        oscillator.frequency.setValueAtTime(330, Tone.now() + 0.9);
        oscillator.stop(Tone.now() + 2);
    }

    playJuicyDistortionDemo(oscillator) {
        oscillator.start();
        oscillator.frequency.setValueAtTime(220, Tone.now());
        oscillator.frequency.exponentialRampToValueAtTime(660, Tone.now() + 1);
        oscillator.frequency.exponentialRampToValueAtTime(220, Tone.now() + 2);
        oscillator.stop(Tone.now() + 3);
    }

    playOverdriveDemo(oscillator) {
        oscillator.start();
        const chord = [220, 277, 330];
        chord.forEach((freq, index) => {
            oscillator.frequency.setValueAtTime(freq, Tone.now() + index * 0.2);
        });
        oscillator.stop(Tone.now() + 2);
    }

    playAutoPanDemo(oscillator) {
        oscillator.start();
        oscillator.frequency.setValueAtTime(440, Tone.now());
        oscillator.stop(Tone.now() + 3);
    }

    playAutoWahDemo(oscillator) {
        oscillator.start();
        oscillator.frequency.setValueAtTime(220, Tone.now());
        oscillator.frequency.exponentialRampToValueAtTime(880, Tone.now() + 2);
        oscillator.stop(Tone.now() + 3);
    }

    playChorusDemo(oscillator) {
        oscillator.start();
        oscillator.frequency.setValueAtTime(330, Tone.now());
        oscillator.frequency.setValueAtTime(440, Tone.now() + 1);
        oscillator.frequency.setValueAtTime(550, Tone.now() + 2);
        oscillator.stop(Tone.now() + 3);
    }

    playFlangerDemo(oscillator) {
        oscillator.start();
        oscillator.frequency.setValueAtTime(440, Tone.now());
        oscillator.frequency.linearRampToValueAtTime(880, Tone.now() + 2);
        oscillator.stop(Tone.now() + 3);
    }

    playInstantSidechainDemo(oscillator) {
        oscillator.start();
        const gain = new Tone.Gain(1);
        oscillator.connect(gain);
        gain.toDestination();
        
        for (let i = 0; i < 6; i++) {
            gain.gain.setValueAtTime(0.1, Tone.now() + i * 0.5);
            gain.gain.exponentialRampToValueAtTime(1, Tone.now() + i * 0.5 + 0.1);
        }
        oscillator.stop(Tone.now() + 3);
    }

    playPhaserDemo(oscillator) {
        oscillator.start();
        oscillator.frequency.setValueAtTime(220, Tone.now());
        oscillator.frequency.exponentialRampToValueAtTime(440, Tone.now() + 2);
        oscillator.stop(Tone.now() + 4);
    }

    playPitchShifterDemo(oscillator) {
        oscillator.start();
        oscillator.frequency.setValueAtTime(440, Tone.now());
        oscillator.stop(Tone.now() + 2);
    }

    playRotaryDemo(oscillator) {
        oscillator.start();
        oscillator.frequency.setValueAtTime(330, Tone.now());
        oscillator.stop(Tone.now() + 4);
    }

    playRotaryProDemo(oscillator) {
        oscillator.start();
        oscillator.frequency.setValueAtTime(220, Tone.now());
        oscillator.frequency.setValueAtTime(330, Tone.now() + 1);
        oscillator.stop(Tone.now() + 4);
    }

    playStereoChorusDemo(oscillator) {
        oscillator.start();
        oscillator.frequency.setValueAtTime(440, Tone.now());
        oscillator.frequency.setValueAtTime(554, Tone.now() + 1);
        oscillator.frequency.setValueAtTime(659, Tone.now() + 2);
        oscillator.stop(Tone.now() + 3);
    }

    playTapeWobbleDemo(oscillator) {
        oscillator.start();
        oscillator.frequency.setValueAtTime(440, Tone.now());
        for (let i = 0; i < 10; i++) {
            const variation = 440 + (Math.sin(i) * 10);
            oscillator.frequency.setValueAtTime(variation, Tone.now() + i * 0.3);
        }
        oscillator.stop(Tone.now() + 3);
    }

    playDefaultDemo(oscillator) {
        oscillator.start();
        oscillator.frequency.setValueAtTime(440, Tone.now());
        oscillator.stop(Tone.now() + 1);
    }

    stopEffect() {
        if (this.currentEffect && this.isPlaying) {
            try {
                if (this.currentEffect.oscillator) {
                    this.currentEffect.oscillator.stop();
                }
                Object.values(this.toneEffects).forEach(effect => {
                    if (effect.stop && typeof effect.stop === 'function') {
                        effect.stop();
                    }
                });
            } catch (error) {
                console.error('Error stopping effect:', error);
            }
            this.currentEffect = null;
            this.isPlaying = false;
        }
    }

    isEffectPlaying() {
        return this.isPlaying;
    }

    dispose() {
        this.stopEffect();
        Object.values(this.toneEffects).forEach(effect => {
            if (effect.dispose && typeof effect.dispose === 'function') {
                effect.dispose();
            }
        });
    }
}

const audioEffectsPlayer = new AudioEffectsPlayer();

export default audioEffectsPlayer;
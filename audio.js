window.ZenAudioEngine = class ZenAudioEngine {
    constructor() {
        this.ctx = null;
        this.synthGain = null;
        this.isPlayingAmbient = false;
    }

    init() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.synthGain = this.ctx.createGain();
        this.synthGain.gain.setValueAtTime(0.04, this.ctx.currentTime); // Low background volume
        this.synthGain.connect(this.ctx.destination);
    }

    startAmbientMusic() {
        if (this.isPlayingAmbient) return;
        this.isPlayingAmbient = true;
        
        // Lo-fi Chord progressions: HZ frequencies
        const progression = [
            [130.81, 164.81, 196.00, 246.94], // Cmaj7
            [110.00, 130.81, 164.81, 196.00], // Am7
            [87.31, 110.00, 130.81, 164.81],  // Fmaj7
            [98.00, 123.47, 146.83, 196.00]   // G6
        ];

        let index = 0;
        // Create warm node once
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, this.ctx.currentTime);
        filter.connect(this.synthGain);

        const playNextChord = () => {
            if (!this.isPlayingAmbient) return;
            const chords = progression[index];
            const now = this.ctx.currentTime;
            // Filter is already connected

            chords.forEach(freq => {
                const osc = this.ctx.createOscillator();
                const noteGain = this.ctx.createGain();
                
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now);
                
                noteGain.gain.setValueAtTime(0, now);
                noteGain.gain.linearRampToValueAtTime(0.2, now + 1.5);
                noteGain.gain.setValueAtTime(0.2, now + 4.5);
                noteGain.gain.linearRampToValueAtTime(0, now + 6.0);
                
                osc.connect(noteGain);
                noteGain.connect(filter);
                
                osc.start(now);
                osc.stop(now + 6.0);
            });

            index = (index + 1) % progression.length;
            setTimeout(playNextChord, 5800); // 6s duration minus small crossfade
        };
        playNextChord();
    }

    playSuccessSFX() {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now); // A5 note
        osc.frequency.exponentialRampToValueAtTime(1760, now + 0.12);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.2);
    }

    playFailureSFX() {
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.25);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
    }
}

// Adjusted filter node to prevent audio distortion

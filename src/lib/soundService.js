/**
 * Simple service to handle audio playback for UI notifications and interactions.
 */

const SOUNDS = {
    NOTIFICATION: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
    MESSAGE_SENT: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
    MESSAGE_RECEIVED: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
    INCOMING_CALL: 'https://assets.mixkit.co/active_storage/sfx/1357/1357-preview.mp3',
    RINGTONE: 'https://assets.mixkit.co/active_storage/sfx/1350/1350-preview.mp3'
};

class SoundService {
    constructor() {
        this.enabled = true;
        this.audioCache = {};
        this.ringingAudio = null;
        this.ringTimeout = null;
    }

    setEnabled(enabled) {
        this.enabled = enabled;
    }

    play(soundKey) {
        // Read directly from localStorage to respect SettingsContext updates
        const saved = localStorage.getItem('needam_settings');
        const settings = saved ? JSON.parse(saved) : { soundsEnabled: true };

        if (!settings.soundsEnabled) return;

        const url = SOUNDS[soundKey];
        if (!url) return;

        try {
            // Re-use or create audio object
            if (!this.audioCache[url]) {
                this.audioCache[url] = new Audio(url);
            }

            const audio = this.audioCache[url];
            audio.currentTime = 0;
            audio.play().catch(err => {
                // Browser might block autoplay if user hasn't interacted yet
                console.warn('Playback failed:', err);
            });
        } catch (err) {
            console.error('Audio playback error:', err);
        }
    }

    playNotification() {
        this.play('NOTIFICATION');
    }

    playMessageSent() {
        this.play('MESSAGE_SENT');
    }

    playMessageReceived() {
        this.play('MESSAGE_RECEIVED');
    }

    playIncomingCall() {
        this.play('INCOMING_CALL');
    }

    startRinging() {
        const saved = localStorage.getItem('needam_settings');
        const settings = saved ? JSON.parse(saved) : { soundsEnabled: true };
        if (!settings.soundsEnabled) return;

        const url = SOUNDS.RINGTONE;
        try {
            if (!this.ringingAudio) {
                this.ringingAudio = new Audio(url);
                this.ringingAudio.addEventListener('ended', () => {
                    // Wait 2 seconds before playing again
                    this.ringTimeout = setTimeout(() => {
                        this.ringingAudio.currentTime = 0;
                        this.ringingAudio.play().catch(err => console.warn('Ringing failed:', err));
                    }, 2000);
                });
            }
            this.stopRinging(); // Ensure clean start
            this.ringingAudio.currentTime = 0;
            this.ringingAudio.play().catch(err => console.warn('Ringing failed:', err));
        } catch (err) {
            console.error('Ringing error:', err);
        }
    }

    stopRinging() {
        if (this.ringTimeout) {
            clearTimeout(this.ringTimeout);
            this.ringTimeout = null;
        }
        if (this.ringingAudio) {
            this.ringingAudio.pause();
            this.ringingAudio.currentTime = 0;
        }
    }
}

export const soundService = new SoundService();

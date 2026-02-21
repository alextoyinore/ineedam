/**
 * Simple service to handle audio playback for UI notifications and interactions.
 */

const SOUNDS = {
    NOTIFICATION: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
    MESSAGE_SENT: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
    MESSAGE_RECEIVED: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3'
};

class SoundService {
    constructor() {
        this.enabled = true;
        this.audioCache = {};
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
}

export const soundService = new SoundService();

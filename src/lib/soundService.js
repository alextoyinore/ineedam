/**
 * Simple service to handle audio playback for UI notifications and interactions.
 */

const SOUNDS = {
    NOTIFICATION: '/sounds/notification.mp3',
    MESSAGE_SENT: '/sounds/message_sent.mp3',
    MESSAGE_RECEIVED: '/sounds/message_received.mp3',
    INCOMING_CALL: '/sounds/ringtone.mp3',
    RINGTONE: '/sounds/ringtone.mp3'
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
                const audio = new Audio(url);
                audio.addEventListener('error', (e) => {
                    console.error(`Audio playback error for ${soundKey}:`, e);
                    // Check if it's a network error
                    if (audio.error && audio.error.code === 4) {
                        console.warn(`Sound asset at ${url} could not be loaded. Please check your network connection or if the URL is still valid.`);
                    }
                });
                this.audioCache[url] = audio;
            }

            const audio = this.audioCache[url];
            audio.currentTime = 0;
            audio.play().catch(err => {
                // Browser might block autoplay if user hasn't interacted yet
                if (err.name === 'NotAllowedError') {
                    console.warn(`Autoplay blocked for ${soundKey}. Interaction required.`);
                } else {
                    console.warn(`Playback failed for ${soundKey}:`, err);
                }
            });
        } catch (err) {
            console.error(`System error playing ${soundKey}:`, err);
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

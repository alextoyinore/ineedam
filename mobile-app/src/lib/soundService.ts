import { createAudioPlayer, AudioPlayer } from 'expo-audio';

const SOUNDS = {
    NOTIFICATION: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
    MESSAGE_SENT: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3',
    MESSAGE_RECEIVED: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
};

class SoundService {
    private sounds: Record<string, AudioPlayer> = {};

    async play(soundKey: keyof typeof SOUNDS) {
        try {
            // In a real app, we would load from AsyncStorage settings
            // For now, mirroring web's default enabled state
            const url = SOUNDS[soundKey];

            if (this.sounds[url]) {
                const player = this.sounds[url];
                player.seekTo(0);
                player.play();
            } else {
                const player = createAudioPlayer(url);
                this.sounds[url] = player;
                player.play();
            }
        } catch (error) {
            console.warn('Sound playback failed:', error);
        }
    }

    async playNotification() {
        await this.play('NOTIFICATION');
    }

    async playMessageSent() {
        await this.play('MESSAGE_SENT');
    }

    async playMessageReceived() {
        await this.play('MESSAGE_RECEIVED');
    }
}

export const mobileSoundService = new SoundService();

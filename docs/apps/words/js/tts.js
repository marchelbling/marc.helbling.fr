export class TTS {
    constructor() {
        this.index = {};
        this.fallbackVoice = null;
        this.currentAudio = null;
        this.initFallback();
        this.indexReady = this.loadIndex();
    }
    initFallback() {
        const load = () => {
            const voices = speechSynthesis.getVoices();
            this.fallbackVoice = voices.find(v => v.lang.startsWith('fr')) ?? voices[0] ?? null;
        };
        load();
        speechSynthesis.addEventListener('voiceschanged', load);
    }
    async loadIndex() {
        try {
            const res = await fetch('./audio/index.json');
            if (res.ok)
                this.index = await res.json();
        }
        catch (e) {
            console.warn('Audio index unavailable, falling back to browser synthesis:', e);
        }
    }
    async speak(text) {
        this.cancel();
        await this.indexReady;
        const slug = this.index[text];
        if (slug && await this.playFile(`./audio/${slug}.ogg`))
            return;
        return this.speakFallback(text);
    }
    playFile(url) {
        return new Promise(resolve => {
            const a = new Audio(url);
            this.currentAudio = a;
            a.onended = () => resolve(true);
            a.onerror = () => resolve(false);
            a.play().catch(() => resolve(false));
        });
    }
    speakFallback(text) {
        return new Promise(resolve => {
            const utt = new SpeechSynthesisUtterance(text);
            utt.lang = 'fr-FR';
            if (this.fallbackVoice)
                utt.voice = this.fallbackVoice;
            utt.onend = () => resolve();
            utt.onerror = () => resolve();
            speechSynthesis.speak(utt);
        });
    }
    cancel() {
        speechSynthesis.cancel();
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio = null;
        }
    }
}

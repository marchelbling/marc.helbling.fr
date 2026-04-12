export class TTS {
    constructor() {
        this.voice = null;
        const load = () => {
            const voices = speechSynthesis.getVoices();
            this.voice = voices.find(v => v.lang.startsWith('fr')) ?? voices[0] ?? null;
        };
        load();
        speechSynthesis.addEventListener('voiceschanged', load);
    }
    speak(text) {
        speechSynthesis.cancel();
        const utt = new SpeechSynthesisUtterance(text);
        utt.lang = 'fr-FR';
        if (this.voice)
            utt.voice = this.voice;
        speechSynthesis.speak(utt);
    }
    cancel() {
        speechSynthesis.cancel();
    }
}

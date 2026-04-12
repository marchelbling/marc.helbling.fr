export class TTS {
  private voice: SpeechSynthesisVoice | null = null;

  constructor() {
    const load = () => {
      const voices = speechSynthesis.getVoices();
      this.voice = voices.find(v => v.lang.startsWith('fr')) ?? voices[0] ?? null;
    };
    load();
    speechSynthesis.addEventListener('voiceschanged', load);
  }

  speak(text: string): void {
    speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'fr-FR';
    if (this.voice) utt.voice = this.voice;
    speechSynthesis.speak(utt);
  }

  cancel(): void {
    speechSynthesis.cancel();
  }
}

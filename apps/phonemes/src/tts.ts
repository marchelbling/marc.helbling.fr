type AudioIndex = Record<string, string>;

export class TTS {
  private index: AudioIndex = {};
  private indexReady: Promise<void>;
  private fallbackVoice: SpeechSynthesisVoice | null = null;
  private currentAudio: HTMLAudioElement | null = null;

  constructor() {
    this.initFallback();
    this.indexReady = this.loadIndex();
  }

  private initFallback(): void {
    const load = () => {
      const voices = speechSynthesis.getVoices();
      this.fallbackVoice = voices.find(v => v.lang.startsWith('fr')) ?? voices[0] ?? null;
    };
    load();
    speechSynthesis.addEventListener('voiceschanged', load);
  }

  private async loadIndex(): Promise<void> {
    try {
      const res = await fetch('./audio/index.json');
      if (res.ok) this.index = await res.json() as AudioIndex;
    } catch (e) {
      console.warn('Audio index unavailable, falling back to browser synthesis:', e);
    }
  }

  async speak(text: string): Promise<void> {
    this.cancel();
    await this.indexReady;
    const slug = this.index[text];
    if (slug && await this.playFile(`./audio/${slug}.ogg`)) return;
    return this.speakFallback(text);
  }

  private playFile(url: string): Promise<boolean> {
    return new Promise(resolve => {
      const a = new Audio(url);
      this.currentAudio = a;
      a.onended = () => resolve(true);
      a.onerror = () => resolve(false);
      a.play().catch(() => resolve(false));
    });
  }

  private speakFallback(text: string): Promise<void> {
    return new Promise(resolve => {
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = 'fr-FR';
      if (this.fallbackVoice) utt.voice = this.fallbackVoice;
      utt.onend = () => resolve();
      utt.onerror = () => resolve();
      speechSynthesis.speak(utt);
    });
  }

  cancel(): void {
    speechSynthesis.cancel();
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
  }
}

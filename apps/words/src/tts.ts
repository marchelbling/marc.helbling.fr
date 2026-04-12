export class TTS {
  private kokoro: any = null;
  private fallbackVoice: SpeechSynthesisVoice | null = null;
  private audioCtx: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  onReady?: () => void;

  constructor() {
    this.initFallback();
    void this.loadKokoro();
  }

  private initFallback(): void {
    const load = () => {
      const voices = speechSynthesis.getVoices();
      this.fallbackVoice = voices.find(v => v.lang.startsWith('fr')) ?? voices[0] ?? null;
    };
    load();
    speechSynthesis.addEventListener('voiceschanged', load);
  }

  private async loadKokoro(): Promise<void> {
    try {
      const CDN = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3/dist/transformers.min.js';
      // @ts-ignore — CDN URL resolved at runtime, no static type declarations
      const { KokoroTTS } = await import(CDN);
      this.kokoro = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0', {
        dtype: 'q8',
      });
    } catch (e) {
      console.warn('Kokoro TTS unavailable, falling back to browser synthesis:', e);
    } finally {
      this.onReady?.();
    }
  }

  speak(text: string): Promise<void> {
    this.cancel();
    if (this.kokoro) {
      return this.speakKokoro(text);
    } else {
      return this.speakFallback(text);
    }
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

  private async speakKokoro(text: string): Promise<void> {
    const result = await this.kokoro.generate(text, { voice: 'ff_siwis' });
    if (!this.audioCtx) this.audioCtx = new AudioContext();
    const buf = this.audioCtx.createBuffer(1, result.audio.length, result.sampling_rate);
    buf.copyToChannel(result.audio, 0);
    const src = this.audioCtx.createBufferSource();
    src.buffer = buf;
    src.connect(this.audioCtx.destination);
    this.currentSource = src;
    return new Promise(resolve => {
      src.onended = () => resolve();
      src.start();
    });
  }

  cancel(): void {
    speechSynthesis.cancel();
    if (this.currentSource) {
      try { this.currentSource.stop(); } catch { /* already stopped */ }
      this.currentSource = null;
    }
  }
}

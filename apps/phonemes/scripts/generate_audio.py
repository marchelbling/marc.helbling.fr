#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.11"
# dependencies = [
#   "piper-tts",
#   "soundfile",
#   "numpy",
# ]
# ///
"""Generate OGG audio files for every word in phonemes.json using Piper TTS."""
import hashlib
import json
import sys
import urllib.request
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[3]
DATA_JSON = REPO_ROOT / "static/apps/phonemes/phonemes.json"
AUDIO_DIR = REPO_ROOT / "static/apps/phonemes/audio"
MODEL_DIR = Path(__file__).resolve().parent / ".piper-models"

VOICE = "fr_FR-siwis-medium"
VOICE_URL = (
    "https://huggingface.co/rhasspy/piper-voices/resolve/main/"
    "fr/fr_FR/siwis/medium/fr_FR-siwis-medium.onnx"
)


def slug(word: str) -> str:
    return hashlib.sha1(word.encode("utf-8")).hexdigest()[:16]


def ensure_model() -> Path:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    onnx = MODEL_DIR / f"{VOICE}.onnx"
    cfg = MODEL_DIR / f"{VOICE}.onnx.json"
    for path, url in ((onnx, VOICE_URL), (cfg, VOICE_URL + ".json")):
        if not path.exists():
            print(f"Downloading {path.name}…")
            urllib.request.urlretrieve(url, path)
    return onnx


def main() -> int:
    from piper import PiperVoice  # noqa: PLC0415
    import numpy as np  # noqa: PLC0415
    import soundfile as sf  # noqa: PLC0415

    data = json.loads(DATA_JSON.read_text())
    words = sorted({w["word"] for w in data["words"]})
    print(f"{len(words)} unique words → {AUDIO_DIR}")

    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    mapping = {w: slug(w) for w in words}
    (AUDIO_DIR / "index.json").write_text(
        json.dumps(mapping, ensure_ascii=False, indent=2)
    )

    model_path = ensure_model()
    voice = PiperVoice.load(str(model_path))

    for i, word in enumerate(words, 1):
        out = AUDIO_DIR / f"{slug(word)}.ogg"
        if out.exists():
            continue

        chunks = list(voice.synthesize(word))
        audio = np.concatenate([c.audio_int16_array for c in chunks])
        sf.write(out, audio, chunks[0].sample_rate, format="OGG", subtype="VORBIS")
        print(f"  [{i}/{len(words)}] {word}")

    print("Done.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

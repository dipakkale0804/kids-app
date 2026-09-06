// src/lib/speech.ts
/**
 * Centralized, bulletproof Speech Synthesis utility tailored for kids (ages 2-8).
 * Works reliably across Chrome, Edge, Safari, iOS, and Android.
 * Solves Chromium's asynchronous cancel() drop bug using safe queuing.
 */

export interface KidsSpeakOptions {
  text: string;
  rate?: number;    // Calm, clear tempo (default 0.76)
  pitch?: number;   // Natural human pitch (default 1.0)
  volume?: number;  // Clear volume (default 1.0)
  lang?: string;    // Language tag (default 'en-US')
  onBoundary?: (event: SpeechSynthesisEvent) => void;
  onEnd?: () => void;
  onError?: (event: SpeechSynthesisErrorEvent) => void;
}

let activeUtterance: SpeechSynthesisUtterance | null = null;
let speechTimeout: NodeJS.Timeout | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];

// Pre-load and cache voices
if (typeof window !== "undefined" && "speechSynthesis" in window) {
  try {
    cachedVoices = window.speechSynthesis.getVoices();
    window.speechSynthesis.onvoiceschanged = () => {
      try {
        cachedVoices = window.speechSynthesis.getVoices();
      } catch {}
    };
  } catch {}
}

/**
 * Immediately cancels any pending or active speech synthesis.
 */
export function stopKidsSpeech(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    if (speechTimeout) {
      clearTimeout(speechTimeout);
      speechTimeout = null;
    }
    window.speechSynthesis.cancel();
    activeUtterance = null;
    (window as unknown as { __kidsUtterance?: SpeechSynthesisUtterance | null }).__kidsUtterance = null;
  } catch {}
}

/**
 * Retrieves the best available natural/clear English voice for kids.
 */
export function getBestKidsVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  try {
    const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return null;

    // Preferred friendly, clear natural English voices
    const preferredNames = [
      "google us english",
      "samantha",
      "karen",
      "moira",
      "tessa",
      "serena",
      "zira",
      "victoria",
      "allison",
      "natural",
      "jenny",
      "aria"
    ];

    for (const name of preferredNames) {
      const found = voices.find(
        (v) => v.lang && v.lang.startsWith("en") && v.name.toLowerCase().includes(name)
      );
      if (found) return found;
    }

    // Any English voice
    const defaultEn = voices.find((v) => v.lang && (v.lang === "en-US" || v.lang.startsWith("en")));
    return defaultEn || voices[0] || null;
  } catch {
    return null;
  }
}

/**
 * Speaks text using calibrated kid-friendly speed, natural pitch, and voice selection.
 * Safely avoids Chromium cancel-drop race condition using a small 40ms dispatch delay.
 */
export function speakKidsText(options: KidsSpeakOptions): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  const {
    text,
    rate = 0.76,
    pitch = 1.0,
    volume = 1.0,
    lang = "en-US",
    onBoundary,
    onEnd,
    onError,
  } = options;

  if (!text || text.trim().length === 0) return;

  try {
    if (speechTimeout) {
      clearTimeout(speechTimeout);
      speechTimeout = null;
    }

    // Cancel prior speech
    window.speechSynthesis.cancel();

    // Chromium requires a brief delay after cancel() before speak() to allow
    // the audio engine's IPC to clear without discarding the new utterance.
    speechTimeout = setTimeout(() => {
      try {
        // Resume if Chromium audio pipeline was paused
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = volume;
        utterance.lang = lang;

        const voice = getBestKidsVoice();
        if (voice) {
          utterance.voice = voice;
        }

        if (onBoundary) {
          utterance.onboundary = onBoundary;
        }

        utterance.onend = () => {
          activeUtterance = null;
          (window as unknown as { __kidsUtterance?: SpeechSynthesisUtterance | null }).__kidsUtterance = null;
          if (onEnd) onEnd();
        };

        utterance.onerror = (e) => {
          activeUtterance = null;
          (window as unknown as { __kidsUtterance?: SpeechSynthesisUtterance | null }).__kidsUtterance = null;
          if (onError) onError(e);
        };

        // Retain reference on window object to prevent Chrome garbage-collection bug
        activeUtterance = utterance;
        (window as unknown as { __kidsUtterance?: SpeechSynthesisUtterance | null }).__kidsUtterance = utterance;

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("SpeechSynthesis error:", err);
      }
    }, 50);
  } catch (err) {
    console.warn("SpeechSynthesis error:", err);
  }
}

// src/lib/speech.ts
/**
 * Centralized Speech Synthesis utility tailored for kids (ages 2-8).
 * Ensures calm, natural pacing, child-appropriate pitch, voice selection,
 * and reliable stop/cancellation across route transitions.
 */

export interface KidsSpeakOptions {
  text: string;
  rate?: number;    // Calm, clear tempo (default 0.74)
  pitch?: number;   // Natural human pitch (default 1.0, avoiding squeaky/robotic artifacts)
  volume?: number;  // Full clear volume (default 1.0)
  lang?: string;    // Language tag (default 'en-US')
  onBoundary?: (event: SpeechSynthesisEvent) => void;
  onEnd?: () => void;
  onError?: (event: SpeechSynthesisErrorEvent) => void;
}

let activeUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Immediately cancels all currently active speech synthesis in the browser.
 */
export function stopKidsSpeech(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel();
    activeUtterance = null;
    if (typeof window !== "undefined") {
      (window as unknown as { __kidsUtterance?: SpeechSynthesisUtterance | null }).__kidsUtterance = null;
    }
  } catch {
    // Ignore browser audio cancellation quirks
  }
}

/**
 * Retrieves the best available natural/clear English voice for kids.
 */
export function getBestKidsVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // Preferred friendly, clear natural voices
  const preferredNames = [
    "natural",
    "google us english",
    "jenny",
    "aria",
    "samantha",
    "karen",
    "moira",
    "tessa",
    "serena",
    "zira",
    "victoria",
    "allison"
  ];

  for (const name of preferredNames) {
    const found = voices.find(
      (v) => v.lang.startsWith("en") && v.name.toLowerCase().includes(name)
    );
    if (found) return found;
  }

  // Any female or online English voice
  const femaleVoice = voices.find(
    (v) => v.lang.startsWith("en") && (v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("online"))
  );
  if (femaleVoice) return femaleVoice;

  // Any English voice
  const defaultEn = voices.find((v) => v.lang.startsWith("en"));
  return defaultEn || voices[0] || null;
}

/**
 * Speaks text using calibrated kid-friendly speed, natural pitch, and voice selection.
 * Always cancels any lingering speech before speaking.
 */
export function speakKidsText(options: KidsSpeakOptions): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

  // Cancel prior speech first
  stopKidsSpeech();

  const {
    text,
    rate = 0.74,   // Paced for toddlers/preschoolers (0.72 - 0.76)
    pitch = 1.0,   // Natural human pitch (1.0)
    volume = 1.0,
    lang = "en-US",
    onBoundary,
    onEnd,
    onError,
  } = options;

  if (!text || text.trim().length === 0) return;

  try {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    utterance.lang = lang;

    // Attach best voice if ready
    const voice = getBestKidsVoice();
    if (voice) {
      utterance.voice = voice;
    }

    if (onBoundary) {
      utterance.onboundary = onBoundary;
    }

    utterance.onend = () => {
      activeUtterance = null;
      if (typeof window !== "undefined") {
        (window as unknown as { __kidsUtterance?: SpeechSynthesisUtterance | null }).__kidsUtterance = null;
      }
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      activeUtterance = null;
      if (typeof window !== "undefined") {
        (window as unknown as { __kidsUtterance?: SpeechSynthesisUtterance | null }).__kidsUtterance = null;
      }
      if (onError) onError(e);
    };

    // Hold reference on window object to prevent Chrome garbage-collection bug
    activeUtterance = utterance;
    (window as unknown as { __kidsUtterance?: SpeechSynthesisUtterance | null }).__kidsUtterance = utterance;

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("Speech synthesis error:", err);
  }
}

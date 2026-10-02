// Pronunciation via the browser's built-in speech synthesis (no network needed
// when the device has an offline English voice). British English preferred.

export const audioSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

function pickVoice(): SpeechSynthesisVoice | undefined {
  const voices = speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang.replace('_', '-') === 'en-GB' && v.localService) ||
    voices.find((v) => v.lang.replace('_', '-') === 'en-GB') ||
    voices.find((v) => v.lang.toLowerCase().startsWith('en'))
  );
}

export function speak(text: string, rate = 0.92) {
  if (!audioSupported) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-GB';
  u.rate = rate;
  const v = pickVoice();
  if (v) u.voice = v;
  speechSynthesis.speak(u);
}

if (audioSupported) {
  // Some browsers load voices lazily.
  speechSynthesis.getVoices();
}

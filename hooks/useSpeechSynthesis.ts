import { useState, useEffect, useCallback } from 'react';

export const useSpeechSynthesis = () => {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);

      const setEnglishVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        // Prefer a native US English voice if available
        let englishVoice = voices.find(v => v.lang === 'en-US' && v.localService);
        if (!englishVoice) {
            // Fallback to any English voice
            englishVoice = voices.find(v => v.lang.startsWith('en-'));
        }
        if (englishVoice) {
            setVoice(englishVoice);
        }
      };

      setEnglishVoice();
      // Voices can load asynchronously
      window.speechSynthesis.onvoiceschanged = setEnglishVoice;

      return () => {
        window.speechSynthesis.onvoiceschanged = null;
        window.speechSynthesis.cancel(); // Clean up on unmount
      };
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!supported || !voice) {
        console.warn('Speech synthesis not supported or voice not ready.');
        return;
    }

    // Always cancel any previous utterance before starting a new one
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.pitch = 1;
    utterance.rate = 1;

    utterance.onstart = () => {
      setSpeaking(true);
    };
    utterance.onend = () => {
      setSpeaking(false);
    };
    utterance.onerror = (event) => {
      console.error('SpeechSynthesis Error', event);
      setSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [supported, voice]);
  
  return { speak, speaking, supported };
};

import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { VocabularyWord } from '../types';
import { TrashIcon, SpeakerIcon } from './IconComponents';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

interface FlashcardProps {
  word: VocabularyWord;
  onRemove: () => void;
}

export interface FlashcardRef {
    flip: () => void;
}

export const Flashcard = forwardRef<FlashcardRef, FlashcardProps>(({ word, onRemove }, ref) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const { speak, speaking, supported } = useSpeechSynthesis();

  const handleFlip = () => {
    if (speaking) return;
    setIsFlipped(prev => !prev);
  };

  useImperativeHandle(ref, () => ({
    flip() {
      handleFlip();
    },
  }));

  return (
    <div className="w-full h-80 perspective-1000">
      <div 
        className={`relative w-full h-full transform-style-3d transition-transform duration-700 ${isFlipped ? 'rotate-y-180' : ''}`}
      >
        {/* Front of card */}
        <div 
          className="absolute w-full h-full backface-hidden flex flex-col justify-center items-center p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl cursor-pointer border border-slate-200 dark:border-slate-700"
          onClick={handleFlip}
        >
          <div className="flex items-center gap-4">
            <h2 className="text-4xl font-bold text-slate-800 dark:text-slate-100 text-center">{word.word}</h2>
            {supported && (
              <button
                onClick={(e) => { e.stopPropagation(); speak(word.word); }}
                disabled={speaking}
                className="text-slate-400 dark:text-slate-500 hover:text-sky-500 dark:hover:text-sky-400 disabled:opacity-50 disabled:cursor-wait transition-colors"
                aria-label={`Pronounce "${word.word}"`}
                title="Pronounce word"
              >
                <SpeakerIcon />
              </button>
            )}
          </div>
          <p className="absolute bottom-4 text-sm text-slate-400">Çevirmek için tıkla</p>
        </div>

        {/* Back of card */}
        <div 
          className="absolute w-full h-full backface-hidden rotate-y-180 flex flex-col justify-between p-6 bg-sky-500 dark:bg-sky-800 text-white rounded-2xl shadow-2xl cursor-pointer"
          onClick={handleFlip}
        >
          <div className='text-center flex-grow flex flex-col justify-center'>
            <h3 className="text-2xl font-bold">{word.translation}</h3>
            <div className="mt-4 pt-4 border-t border-sky-400 dark:border-sky-700">
              <p className="text-sm opacity-80">Örnek Cümle:</p>
              <div className='flex items-center justify-center gap-2 mt-1'>
                 <p className="italic text-lg">"{word.sentence}"</p>
                 {supported && (
                    <button
                        onClick={(e) => { e.stopPropagation(); speak(word.sentence); }}
                        disabled={speaking}
                        className="text-white/80 hover:text-white disabled:opacity-50 disabled:cursor-wait transition-colors"
                        aria-label="Listen to example sentence"
                        title="Listen to example sentence"
                    >
                        <SpeakerIcon />
                    </button>
                 )}
              </div>
            </div>
          </div>
           <button
            onClick={(e) => {
              e.stopPropagation(); // prevent card from flipping when removing
              onRemove();
            }}
            className="absolute top-4 right-4 p-2 rounded-full text-white hover:bg-white/20 transition"
            aria-label="Kelimeyi sil"
            title="Kelimeyi sil"
          >
            <TrashIcon />
          </button>
           <p className="absolute bottom-4 text-sm text-white/70 w-full text-center left-0">Çevirmek için tıkla</p>
        </div>
      </div>
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
});
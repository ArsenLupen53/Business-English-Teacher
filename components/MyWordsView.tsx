import React, { useState, useEffect, useCallback, useRef } from 'react';
import { VocabularyWord } from '../types';
import { Flashcard, FlashcardRef } from './Flashcard';
import { ArrowLeftIcon, ArrowRightIcon, ShuffleIcon } from './IconComponents';

interface MyWordsViewProps {
  words: VocabularyWord[];
  removeWord: (word: VocabularyWord) => void;
}

export function MyWordsView({ words, removeWord }: MyWordsViewProps) {
  const [displayedWords, setDisplayedWords] = useState<VocabularyWord[]>([...words]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flashcardRef = useRef<FlashcardRef>(null);

  useEffect(() => {
    // Sync state when the master `words` prop changes from the parent.
    // This preserves the shuffle order when words are removed from this view,
    // and correctly appends new words added from the 'Learn' view.
    setDisplayedWords(currentDisplayed => {
        const propWordSet = new Set(words.map(w => w.word));
        
        // Filter out words that were removed from the parent
        const newDisplayed = currentDisplayed.filter(dw => propWordSet.has(dw.word));

        // Add words that are new in the parent
        const displayedWordSet = new Set(newDisplayed.map(w => w.word));
        const wordsToAdd = words.filter(w => !displayedWordSet.has(w.word));

        return [...newDisplayed, ...wordsToAdd];
    });

    // Adjust index to prevent out-of-bounds errors after list changes.
    // This logic ensures that if the last item is removed, the index points to the new last item.
    if (currentIndex >= words.length && words.length > 0) {
        setCurrentIndex(words.length - 1);
    } else if (words.length === 0) {
        setCurrentIndex(0);
    }
  }, [words]);


  const shuffleWords = useCallback(() => {
    setDisplayedWords(prevWords => {
        const newArray = [...prevWords];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]]; // Swap elements
        }
        return newArray;
    });
    setCurrentIndex(0);
  }, []);

  const goToPrevious = useCallback(() => {
    if(displayedWords.length === 0) return;
    const isFirst = currentIndex === 0;
    const newIndex = isFirst ? displayedWords.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, displayedWords.length]);

  const goToNext = useCallback(() => {
    if(displayedWords.length === 0) return;
    const isLast = currentIndex === displayedWords.length - 1;
    const newIndex = isLast ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, displayedWords.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
            return;
        }
        if (e.code === 'ArrowLeft') {
            goToPrevious();
        } else if (e.code === 'ArrowRight') {
            goToNext();
        } else if (e.code === 'Space') {
            e.preventDefault();
            flashcardRef.current?.flip();
        }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
    };
  }, [goToPrevious, goToNext]);


  if (words.length === 0) {
    return (
      <div className="text-center text-slate-500 dark:text-slate-400 py-16">
        <h2 className="text-2xl font-bold mb-4">Kaydedilmiş Kelime Bulunmuyor</h2>
        <p>Flashcardları görmek için "Öğren" sekmesinden kelime kaydedin.</p>
      </div>
    );
  }

  const currentWord = displayedWords[currentIndex];

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center gap-6">
        <div className="flex items-center justify-center gap-4 relative w-full">
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Flashcards</h2>
            <button
                onClick={shuffleWords}
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-700 shadow-md hover:bg-slate-100 dark:hover:bg-slate-600 hover:text-sky-500 dark:hover:text-sky-400 transition"
                aria-label="Shuffle cards"
                title="Kartları Karıştır"
            >
                <ShuffleIcon />
            </button>
        </div>
      {currentWord && (
        <Flashcard
            ref={flashcardRef}
            key={currentWord.word}
            word={currentWord}
            onRemove={() => removeWord(currentWord)}
        />
      )}
      <div className="flex items-center justify-center gap-8 w-full">
        <button 
          onClick={goToPrevious}
          className="p-3 rounded-full bg-white dark:bg-slate-700 shadow-md hover:bg-slate-100 dark:hover:bg-slate-600 transition"
          aria-label="Previous card"
        >
            <ArrowLeftIcon />
        </button>
        <span className="text-lg font-semibold text-slate-600 dark:text-slate-400">
          {displayedWords.length > 0 ? currentIndex + 1 : 0} / {displayedWords.length}
        </span>
        <button 
            onClick={goToNext}
            className="p-3 rounded-full bg-white dark:bg-slate-700 shadow-md hover:bg-slate-100 dark:hover:bg-slate-600 transition"
            aria-label="Next card"
        >
            <ArrowRightIcon />
        </button>
      </div>
       <div className='text-center text-slate-500 dark:text-slate-400 mt-2 text-sm'>
            <p>
                <kbd className="font-sans border bg-slate-200 dark:bg-slate-900 px-2 py-0.5 rounded">←</kbd> / <kbd className="font-sans border bg-slate-200 dark:bg-slate-900 px-2 py-0.5 rounded">→</kbd> ile gezinin, <kbd className="font-sans border bg-slate-200 dark:bg-slate-900 px-2 py-0.5 rounded">Boşluk</kbd> ile çevirin.
            </p>
        </div>
    </div>
  );
}
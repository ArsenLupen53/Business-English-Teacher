import React from 'react';
import { VocabularyWord } from '../types';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { SpeakerIcon, TrashIcon } from './IconComponents';

interface MyWordsListProps {
  words: VocabularyWord[];
  removeWord: (word: VocabularyWord) => void;
}

function SavedWordItem({ item, onRemove }: { item: VocabularyWord, onRemove: () => void }) {
  const { speak, speaking, supported } = useSpeechSynthesis();
  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 transition-shadow hover:shadow-xl">
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">{item.word}</h3>
            {supported && (
              <button
                onClick={() => speak(item.word)}
                disabled={speaking}
                className="text-slate-400 dark:text-slate-500 hover:text-sky-500 dark:hover:text-sky-400 disabled:opacity-50 disabled:cursor-wait transition-colors"
                aria-label={`Pronounce "${item.word}"`}
                title="Pronounce word"
              >
                <SpeakerIcon />
              </button>
            )}
          </div>
          <p className="text-md text-sky-600 dark:text-sky-400 font-medium">{item.translation}</p>
        </div>
        <button
          onClick={onRemove}
          className="p-2 rounded-full text-slate-400 dark:text-slate-500 hover:bg-red-100 dark:hover:bg-slate-700 hover:text-red-500 transition-colors"
          aria-label="Kelimeyi sil"
          title="Kelimeyi sil"
        >
          <TrashIcon />
        </button>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        <p className="text-sm text-slate-600 dark:text-slate-400">Örnek Cümle:</p>
        <div className="flex items-start justify-between gap-4">
            <p className="italic text-slate-700 dark:text-slate-300 flex-grow">"{item.sentence}"</p>
            {supported && (
                <button
                    onClick={() => speak(item.sentence)}
                    disabled={speaking}
                    className="text-slate-400 dark:text-slate-500 hover:text-sky-500 dark:hover:text-sky-400 disabled:opacity-50 disabled:cursor-wait transition-colors flex-shrink-0 mt-1"
                    aria-label="Listen to example sentence"
                    title="Listen to example sentence"
                >
                    <SpeakerIcon />
                </button>
            )}
        </div>
      </div>
    </div>
  );
}

export function MyWordsList({ words, removeWord }: MyWordsListProps) {
  if (words.length === 0) {
    return (
      <div className="text-center text-slate-500 dark:text-slate-400 py-16">
        <h2 className="text-2xl font-bold mb-4">Kelimelerim Listeniz Boş</h2>
        <p>Öğrenmek istediğiniz kelimeleri "Öğren" sekmesindeki <br/> yer imi ikonuna tıklayarak ekleyebilirsiniz.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-center text-slate-800 dark:text-slate-100 mb-6">Kaydedilen Kelimeler</h2>
      {words.map((word) => (
        <SavedWordItem key={word.word} item={word} onRemove={() => removeWord(word)} />
      ))}
    </div>
  );
}
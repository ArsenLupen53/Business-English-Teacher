import React from 'react';
import { VocabularyWord } from '../types';
import { BookmarkIcon, SpeakerIcon, InfoIcon } from './IconComponents';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';

interface VocabularyItemProps {
  item: VocabularyWord;
  onToggleSave: (word: VocabularyWord) => void;
  isSaved: boolean;
  onShowDetails: (word: VocabularyWord) => void;
}

export const VocabularyItem: React.FC<VocabularyItemProps> = ({ item, onToggleSave, isSaved, onShowDetails }) => {
  const { speak, speaking, supported } = useSpeechSynthesis();

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 transition-shadow hover:shadow-xl">
      <div className="flex justify-between items-start gap-4">
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
        <div className="flex items-center flex-shrink-0">
            <button
              onClick={() => onShowDetails(item)}
              className="p-2 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-sky-500"
              aria-label="Detayları gör"
              title="Detayları gör"
            >
                <InfoIcon />
            </button>
            <button
              onClick={() => onToggleSave(item)}
              className={`p-2 rounded-full transition-colors ${
                isSaved 
                ? 'text-amber-500 hover:bg-amber-100 dark:hover:bg-slate-700' 
                : 'text-slate-400 dark:text-slate-500 hover:bg-amber-100 dark:hover:bg-slate-700 hover:text-amber-500'
              }`}
              aria-label={isSaved ? 'Kaydı Kaldır' : 'Kelimeyi Kaydet'}
              title={isSaved ? 'Kaydı Kaldır' : 'Kelimeyi Kaydet'}
            >
              <BookmarkIcon filled={isSaved} />
            </button>
        </div>
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

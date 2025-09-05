import React from 'react';
import { VocabularyWord } from '../types';
import { VocabularyItem } from './VocabularyItem';
import { Loader } from './Loader';

interface VocabularyListProps {
  words: VocabularyWord[];
  onToggleSave: (word: VocabularyWord) => void;
  isWordSaved: (word: VocabularyWord) => boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  onShowDetails: (word: VocabularyWord) => void;
}

export function VocabularyList({ words, onToggleSave, isWordSaved, isLoading, onLoadMore, onShowDetails }: VocabularyListProps) {
  const showLoadMore = words.length > 0 && !isLoading;
  
  if (isLoading && words.length === 0) {
      return <Loader message="AI Sizin İçin Kelimeler Hazırlıyor..." />;
  }

  if (words.length === 0 && !isLoading) {
      return (
          <div className="text-center text-slate-500 dark:text-slate-400 py-16">
              <p className="text-lg">Başlamak için yukarıdan mesleğinizi girin.</p>
              <p>AI, size özel kelime ve kullanım listeleri oluşturacaktır.</p>
          </div>
      );
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {words.map((word, index) => (
        <VocabularyItem 
            key={`${word.word}-${index}`} 
            item={word} 
            onToggleSave={onToggleSave} 
            isSaved={isWordSaved(word)}
            onShowDetails={onShowDetails}
        />
      ))}
      {showLoadMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={onLoadMore}
            className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-opacity-75 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors duration-300"
          >
            Daha Fazla Getir
          </button>
        </div>
      )}
      {isLoading && words.length > 0 && <Loader message="Daha fazla kelime yükleniyor..." />}
    </div>
  );
}

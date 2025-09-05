import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ProfessionInput } from './components/ProfessionInput';
import { VocabularyList } from './components/VocabularyList';
import { MyWordsView } from './components/MyWordsView';
import { WordDetailModal } from './components/WordDetailModal';
import { generateVocabulary } from './services/geminiService';
import { VocabularyWord } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';

type View = 'learn' | 'my-words';

export default function App() {
  const [profession, setProfession] = useState<string>('');
  const [vocabulary, setVocabulary] = useState<VocabularyWord[]>([]);
  const [myWords, setMyWords] = useLocalStorage<VocabularyWord[]>('myWords', []);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('learn');
  const [selectedWord, setSelectedWord] = useState<VocabularyWord | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleGenerate = useCallback(async (newProfession: string) => {
    setProfession(newProfession);
    setVocabulary([]);
    setError(null);
    setIsLoading(true);
    try {
      const existingWords = myWords.map(w => w.word);
      const newWords = await generateVocabulary(newProfession, existingWords);
      setVocabulary(newWords);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [myWords]);

  const handleLoadMore = useCallback(async () => {
    if (!profession) return;
    setError(null);
    setIsLoading(true);
    try {
      const existingWords = [...myWords, ...vocabulary].map(w => w.word);
      const newWords = await generateVocabulary(profession, existingWords);
      setVocabulary(prev => [...prev, ...newWords]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [profession, vocabulary, myWords]);

  const handleShowDetails = (word: VocabularyWord) => {
    setSelectedWord(word);
    setIsDetailModalOpen(true);
  };

  const isWordSaved = (word: VocabularyWord) => {
    return myWords.some(w => w.word.toLowerCase() === word.word.toLowerCase());
  }

  const toggleSaveWord = (word: VocabularyWord) => {
    if (isWordSaved(word)) {
      setMyWords(prev => prev.filter(w => w.word.toLowerCase() !== word.word.toLowerCase()));
    } else {
      setMyWords(prev => [...prev, word]);
    }
  };

  const removeWordFromMyWords = (wordToRemove: VocabularyWord) => {
    setMyWords(prev => prev.filter(w => w.word.toLowerCase() !== wordToRemove.word.toLowerCase()));
  };

  const renderContent = () => {
    switch(view) {
      case 'learn':
        return (
          <div>
            <ProfessionInput onGenerate={handleGenerate} isLoading={isLoading} />
            {error && <p className="text-center text-red-500 mt-4">{error}</p>}
            <VocabularyList 
              words={vocabulary} 
              onToggleSave={toggleSaveWord}
              isWordSaved={isWordSaved}
              isLoading={isLoading} 
              onLoadMore={handleLoadMore} 
              onShowDetails={handleShowDetails}
            />
          </div>
        );
      case 'my-words':
        return <MyWordsView words={myWords} removeWord={removeWordFromMyWords} />;
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen font-sans">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-slate-200 dark:bg-slate-800 rounded-lg p-1 shadow-inner">
            <button
              onClick={() => setView('learn')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${view === 'learn' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'}`}
            >
              Öğren
            </button>
            <button
              onClick={() => setView('my-words')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${view === 'my-words' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-700'}`}
            >
              Kelimelerim ({myWords.length})
            </button>
          </div>
        </div>

        {renderContent()}
      </main>
      <WordDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        word={selectedWord}
        profession={profession}
      />
    </div>
  );
}

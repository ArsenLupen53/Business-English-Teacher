import React, { useState, useEffect } from 'react';
import { VocabularyWord, WordDetails } from '../types';
import { getWordDetails } from '../services/geminiService';
import { Loader } from './Loader';
import { CloseIcon } from './IconComponents';

interface WordDetailModalProps {
  word: VocabularyWord | null;
  profession: string;
  isOpen: boolean;
  onClose: () => void;
}

export function WordDetailModal({ word, profession, isOpen, onClose }: WordDetailModalProps) {
  const [details, setDetails] = useState<WordDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && word) {
      const fetchDetails = async () => {
        setIsLoading(true);
        setError(null);
        setDetails(null);
        try {
          const fetchedDetails = await getWordDetails(word, profession);
          setDetails(fetchedDetails);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetails();
    }
  }, [isOpen, word, profession]);

  // Handle Escape key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !word) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="word-details-title"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="p-6 border-b border-slate-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 id="word-details-title" className="text-2xl font-bold text-slate-800 dark:text-slate-100">{word.word}</h2>
              <p className="text-lg text-sky-600 dark:text-sky-400">{word.translation}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              aria-label="Detayları kapat"
            >
              <CloseIcon />
            </button>
          </div>
        </header>
        
        <div className="p-6">
          {isLoading && <Loader message="Detaylar hazırlanıyor..." />}
          {error && <p className="text-center text-red-500">{error}</p>}
          {details && (
            <div className="space-y-6">
              <DetailSection title="Tanım">
                <p className="font-medium text-slate-800 dark:text-slate-200">{details.definition.en}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{details.definition.tr}</p>
              </DetailSection>

              {details.synonyms && details.synonyms.length > 0 && (
                <DetailSection title="Eş Anlamlılar">
                  <div className="flex flex-wrap gap-2">
                    {details.synonyms.map(s => <Badge key={s}>{s}</Badge>)}
                  </div>
                </DetailSection>
              )}

              {details.antonyms && details.antonyms.length > 0 && (
                 <DetailSection title="Zıt Anlamlılar">
                    <div className="flex flex-wrap gap-2">
                        {details.antonyms.map(a => <Badge key={a} color="red">{a}</Badge>)}
                    </div>
                </DetailSection>
              )}
              
              <DetailSection title="Ek Örnek Cümleler">
                 <ul className="list-disc list-inside space-y-4">
                    {details.examples.map((ex, i) => (
                        <li key={i}>
                            <span className="italic text-slate-700 dark:text-slate-300">"{ex.en}"</span>
                            <p className="italic text-sm text-slate-500 dark:text-slate-400 pl-6">"{ex.tr}"</p>
                        </li>
                    ))}
                </ul>
              </DetailSection>

              <DetailSection title="Kullanım İpuçları">
                <p className="font-medium text-slate-800 dark:text-slate-200">{details.collocations.en}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{details.collocations.tr}</p>
              </DetailSection>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const DetailSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div>
        <h3 className="text-sm font-semibold uppercase text-slate-500 dark:text-slate-400 mb-2">{title}</h3>
        <div className="text-slate-700 dark:text-slate-300">{children}</div>
    </div>
);

const Badge = ({ children, color = 'blue' }: { children: React.ReactNode, color?: 'blue' | 'red' }) => {
    const colors = {
        blue: 'bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200',
        red: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
    };
    return (
        <span className={`px-2.5 py-1 text-sm font-medium rounded-full ${colors[color]}`}>
            {children}
        </span>
    );
};

import React, { useState } from 'react';

interface ProfessionInputProps {
  onGenerate: (profession: string) => void;
  isLoading: boolean;
}

export function ProfessionInput({ onGenerate, isLoading }: ProfessionInputProps) {
  const [profession, setProfession] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (profession.trim() && !isLoading) {
      onGenerate(profession.trim());
    }
  };

  return (
    <div className="max-w-2xl mx-auto mb-8">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg">
        <input
          type="text"
          value={profession}
          onChange={(e) => setProfession(e.target.value)}
          placeholder="Mesleğinizi girin (örn: Software Developer)"
          className="flex-grow px-4 py-3 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
          aria-label="Profession Input"
        />
        <button
          type="submit"
          disabled={isLoading || !profession.trim()}
          className="px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75 disabled:bg-slate-400 disabled:dark:bg-slate-600 disabled:cursor-not-allowed transition-colors duration-300 flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Oluşturuluyor...
            </>
          ) : 'Kelimeleri Getir'}
        </button>
      </form>
    </div>
  );
}

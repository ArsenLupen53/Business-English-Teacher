import React from 'react';

export function Header() {
  return (
    <header className="bg-white dark:bg-slate-800 shadow-md">
      <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-sky-600 dark:text-sky-400">Business English Teacher</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Mesleğinize özel İngilizce kelimeler öğrenin.</p>
        </div>
      </div>
    </header>
  );
}
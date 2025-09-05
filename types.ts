export interface VocabularyWord {
  word: string;
  translation: string;
  sentence: string;
}

export interface BilingualContent {
  en: string;
  tr: string;
}

export interface WordDetails {
  definition: BilingualContent;
  synonyms: string[];
  antonyms: string[];
  examples: BilingualContent[];
  collocations: BilingualContent;
}

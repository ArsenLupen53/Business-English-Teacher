import { GoogleGenAI, Type } from "@google/genai";
import { VocabularyWord, WordDetails } from '../types';

// The API key must be obtained from the environment variable `process.env.API_KEY`.
// We assume it's set in the environment where this code runs.
// A non-null assertion (!) is used because the environment is expected to have this variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

/**
 * Defines the JSON schema for the expected response from the Gemini API.
 * This ensures the model returns data in a predictable structure.
 */
const vocabularySchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      word: {
        type: Type.STRING,
        description: 'The English vocabulary word.',
      },
      translation: {
        type: Type.STRING,
        description: 'The Turkish translation of the word.',
      },
      sentence: {
        type: Type.STRING,
        description: 'An example sentence using the word in an English business context.',
      },
    },
    // Ensure all properties are present in each object.
    required: ['word', 'translation', 'sentence'],
  },
};

const wordDetailsSchema = {
    type: Type.OBJECT,
    properties: {
        definition: {
            type: Type.OBJECT,
            properties: {
                en: {
                    type: Type.STRING,
                    description: "A clear, concise definition of the word in English, tailored to its professional use."
                },
                tr: {
                    type: Type.STRING,
                    description: "The Turkish translation of the English definition."
                }
            },
            required: ["en", "tr"]
        },
        synonyms: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of relevant English synonyms."
        },
        antonyms: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "An array of relevant English antonyms."
        },
        examples: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    en: {
                        type: Type.STRING,
                        description: "An additional, diverse example sentence in English."
                    },
                    tr: {
                        type: Type.STRING,
                        description: "The Turkish translation of the example sentence."
                    }
                },
                required: ["en", "tr"]
            },
            description: "An array of 3 additional, diverse example sentences, each with an English and Turkish version."
        },
        collocations: {
            type: Type.OBJECT,
            properties: {
                en: {
                    type: Type.STRING,
                    description: "A short explanation in English of common words or phrases frequently used with the target word."
                },
                tr: {
                    type: Type.STRING,
                    description: "The Turkish translation of the collocations explanation."
                }
            },
            required: ["en", "tr"]
        }
    },
    required: ["definition", "synonyms", "antonyms", "examples", "collocations"]
};


/**
 * Generates a list of vocabulary words for a given profession using the Gemini API.
 * @param profession The profession to generate vocabulary for.
 * @param existingWords A list of words to exclude from the generated list.
 * @returns A promise that resolves to an array of VocabularyWord objects.
 */
export async function generateVocabulary(profession: string, existingWords: string[]): Promise<VocabularyWord[]> {
  const systemInstruction = `You are an expert linguist specializing in professional and technical English terminology. Your task is to identify and provide the most essential and frequently used vocabulary for various professions to help users master their business English skills.`;

  const prompt = `
    I am a "${profession}". Generate a list of the 5 most frequently used and essential English vocabulary words for someone in my profession. Prioritize words that are critical for daily tasks, communication, and understanding core concepts in this field. These should be the words a professional in this area uses almost every day.

    For each word:
    1. Provide the English word.
    2. Provide its precise Turkish translation in a professional context.
    3. Provide a clear and practical example sentence showing its common usage for a "${profession}".

    Avoid overly generic business terms unless they have a very specific and frequent meaning within this profession. Also, avoid extremely niche or obscure jargon unless it is fundamentally essential.
    ${existingWords.length > 0 ? `Exclude these words from your response: ${existingWords.join(', ')}.` : ''}
    The output must be a JSON array of objects, with the keys "word", "translation", and "sentence".
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: vocabularySchema,
      },
    });

    const jsonString = response.text.trim();
    
    // It's possible the API returns an empty string if it can't generate content.
    if (!jsonString) {
      console.warn("Gemini API returned an empty response string.");
      return [];
    }

    // The response is expected to be a JSON string that can be parsed into an array of VocabularyWord.
    const newWords: VocabularyWord[] = JSON.parse(jsonString);
    return newWords;

  } catch (error) {
    console.error("Error generating vocabulary from Gemini API:", error);
    if (error instanceof Error) {
        // Provide a more user-friendly error message to be displayed in the UI.
        // FIX: Removed specific API key error handling to comply with guidelines.
        // The user should not be prompted about API key configuration.
        throw new Error(`Failed to generate vocabulary. Please try again later.`);
    }
    throw new Error("An unknown error occurred while generating vocabulary.");
  }
}

/**
 * Generates detailed information for a specific vocabulary word.
 * @param word The word object to get details for.
 * @param profession The user's profession for context.
 * @returns A promise that resolves to a WordDetails object.
 */
export async function getWordDetails(word: VocabularyWord, profession: string): Promise<WordDetails> {
  const systemInstruction = `You are an expert linguist and a business English teacher. Your task is to provide a detailed analysis of a given English word within the context of a specific profession. For any content you generate, you must also provide a high-quality Turkish translation.`;
  
  const prompt = `
    As an expert linguist for a "${profession}", provide a detailed analysis of the word "${word.word}".
    The user already knows its Turkish translation is "${word.translation}" and has seen it in the sentence: "${word.sentence}".

    Provide the following details in a structured JSON format:
    1.  "definition": An object with "en" and "tr" keys. "en" should be a clear, concise definition of the word in English, tailored to its use within the "${profession}" field. "tr" should be the Turkish translation of this definition.
    2.  "synonyms": An array of 3-5 relevant English synonyms. If none, provide an empty array.
    3.  "antonyms": An array of 1-3 relevant English antonyms. If none, provide an empty array.
    4.  "examples": An array of 3 objects, each with "en" and "tr" keys. Each object should represent an additional, diverse example sentence that is different from the one provided and showcases the word's usage in various contexts for a "${profession}". "en" is the English sentence, "tr" is its Turkish translation.
    5.  "collocations": An object with "en" and "tr" keys. "en" should be a short explanation of common words or phrases that are frequently used with "${word.word}" (e.g., "implement a strategy", "conduct an analysis"). "tr" should be the Turkish translation of this explanation.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: wordDetailsSchema,
      },
    });

    const jsonString = response.text.trim();
    if (!jsonString) {
      throw new Error("Received an empty response from the details API.");
    }
    const details: WordDetails = JSON.parse(jsonString);
    return details;

  } catch (error) {
    console.error("Error fetching word details from Gemini API:", error);
    throw new Error("Kelime detayları alınamadı. Lütfen tekrar deneyin.");
  }
}
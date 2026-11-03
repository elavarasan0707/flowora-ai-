import { GoogleGenAI } from '@google/genai';

// Initialize Gemini SDK with server-side API key and User-Agent header
const apiKey = process.env.GEMINI_API_KEY || '';

export const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Priority list based on live availability and sub-5s response speed with 0% 503 error rate
export const CANDIDATE_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3-flash-preview',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.8-flash',
];

export interface GenerationParams {
  systemInstruction?: string;
  prompt: string;
  temperature?: number;
  responseMimeType?: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function isTransientError(error: any): boolean {
  if (!error) return false;
  const status = error.status || error.code || error.statusCode;
  const msg = String(error.message || '').toLowerCase();
  return (
    status === 503 ||
    status === 429 ||
    status === 'UNAVAILABLE' ||
    status === 'RESOURCE_EXHAUSTED' ||
    msg.includes('high demand') ||
    msg.includes('unavailable') ||
    msg.includes('rate limit') ||
    msg.includes('spikes in demand') ||
    msg.includes('overloaded') ||
    msg.includes('quota')
  );
}

export async function callGemini(params: GenerationParams): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please ensure the API key is set in environment secrets.');
  }

  const config: Record<string, any> = {
    temperature: params.temperature ?? 0.75,
  };

  if (params.systemInstruction) {
    config.systemInstruction = params.systemInstruction;
  }

  if (params.responseMimeType) {
    config.responseMimeType = params.responseMimeType;
  }

  let lastError: any = null;

  // Try each model in the fallback chain
  for (const modelName of CANDIDATE_MODELS) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: params.prompt,
          config,
        });

        const outputText = response.text;
        if (outputText && outputText.trim().length > 0) {
          return outputText.trim();
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Gemini call failed for model ${modelName} (attempt ${attempt}/2):`, err?.message || err);

        if (isTransientError(err)) {
          if (attempt === 1) {
            await sleep(300);
            continue;
          }
          break;
        } else {
          break;
        }
      }
    }
  }

  console.error('All Gemini candidate models failed:', lastError);
  let userMessage = 'AI model service is temporarily busy. Please retry in a few seconds.';
  if (lastError?.message && typeof lastError.message === 'string') {
    userMessage = lastError.message;
  }

  throw new Error(userMessage);
}

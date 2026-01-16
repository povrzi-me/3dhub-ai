export const MODEL_CONFIG = {
  // Primary model: The specific preview version we want to use
  primary: 'gemini-2.5-flash-native-audio-preview-09-2025',
  
  // Fallback model: A more stable experimental version if the specific date-stamp is deprecated
  fallback: 'gemini-2.5-flash-native-audio-preview',
  
  // Safe default: The generic flash model (note: might not support live audio in all regions)
  safe: 'gemini-2.0-flash-exp'
};

export function getModelSequence() {
  return [MODEL_CONFIG.primary, MODEL_CONFIG.fallback, MODEL_CONFIG.safe];
}
export interface GeneratedImage {
  id: string;
  imageUrl: string;
  prompt: string;
  sourceImageUrl?: string; // If it was an edit
  timestamp: number;
}

export interface GeminiError {
  message: string;
}

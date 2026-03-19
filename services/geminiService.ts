import { GoogleGenAI } from "@google/genai";

// Initialize the client with the API key from environment variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const MODEL_NAME = 'gemini-2.5-flash-image';

/**
 * Generates or Edits an image using Gemini 2.5 Flash Image.
 * 
 * @param prompt The text description of the change or the new image.
 * @param base64Image Optional base64 string of the source image to edit.
 * @param mimeType Optional mime type of the source image.
 * @returns The base64 string of the generated image.
 */
export const generateOrEditImage = async (
  prompt: string,
  base64Image?: string,
  mimeType: string = 'image/png'
): Promise<string> => {
  try {
    const parts: any[] = [];

    // If a source image is provided, we are in "Edit" mode (or image-to-image mode)
    if (base64Image) {
      // Ensure the base64 string doesn't have the data URL prefix
      const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
      
      parts.push({
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType,
        },
      });
    }

    // Add the text prompt
    parts.push({
      text: prompt,
    });

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: parts,
      },
      // No specific config needed for basic image gen/edit in flash-image unless requesting JSON
    });

    // Parse the response to find the image part
    if (response.candidates && response.candidates.length > 0) {
      const content = response.candidates[0].content;
      if (content && content.parts) {
        for (const part of content.parts) {
          if (part.inlineData && part.inlineData.data) {
             return part.inlineData.data;
          }
        }
      }
    }

    throw new Error("No image data found in the response.");

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate image.");
  }
};

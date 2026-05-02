import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function generateCaption(topic: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a cool, mysterious, and short social media caption for a post about: ${topic}. Format: text only.`,
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("AI Error:", error);
    return "";
  }
}

export async function generateHashtags(caption: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 5 relevant social media hashtags for this caption: "${caption}". Format: #word1 #word2...`,
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("AI Error:", error);
    return "";
  }
}

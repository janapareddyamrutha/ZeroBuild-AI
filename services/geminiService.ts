
import { GoogleGenAI, Type } from "@google/genai";
import { Room, Project, FurnitureItem, RoomType } from "../types";

// Always use the named parameter and process.env.API_KEY directly for initialization as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  // Architectural Reasoning (Gemini 3 Pro)
  generateBlueprint: async (project: Project): Promise<string> => {
    const prompt = `Act as an expert architect for ZeroBuild.AI. 
    Based on this plot (${project.length}x${project.breadth} ft, ${project.plotArea} sq ft) in an ${project.locationType} area, for a ${project.buildingType} with ${project.floors} floors. 
    Style: ${project.architecturalStyle}. 
    Provide a professional conceptual architectural recommendation focusing on structural integrity and spatial flow. 
    DISCLAIMER: This is for visualization only, not for construction drawings.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    return response.text || "Failed to generate blueprint reasoning.";
  },

  // NEW: Generate a highly detailed conceptual SVG Floor Plan (AutoCAD Style)
  generateConceptualFloorPlan: async (project: Project): Promise<string> => {
    const prompt = `You are the ZeroBuild.AI Technical Drafting Engine. 
    Generate a conceptual 2D Floor Plan in SVG format for a ${project.buildingType} on a ${project.length}x${project.breadth} plot.
    Rooms to include: ${project.rooms.map(r => r.name).join(", ")}.
    
    SVG STYLING RULES:
    - Background: Light gray or white.
    - Lines: Thin, precise dark blue or black lines (0.5px - 1px).
    - Aesthetic: Technical blueprint / CAD drafting style.
    - Include: Wall thickness (double lines), door swing arcs, window markers.
    - Labels: All rooms must be clearly labeled with their names and estimated areas.
    - Dimensions: Show dimension lines with arrows and numbers matching the ${project.length}x${project.breadth} plot.
    - Aspect Ratio: The SVG viewBox must exactly match ${project.length} / ${project.breadth}.
    
    Return ONLY the raw SVG code. No text before or after.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    const svgMatch = response.text?.match(/<svg[\s\S]*<\/svg>/);
    return svgMatch ? svgMatch[0] : "";
  },

  // AI Visualization for Building Exterior (Branded Prompting)
  generate3DVisual: async (project: Project): Promise<string> => {
    const prompt = `SYSTEM: ZeroBuild.AI Architectural Visualization Engine.
    MODE: EXTERIOR AFTER.
    OBJECT: A ${project.architecturalStyle} style ${project.buildingType} with ${project.floors} floors.
    COLOR THEME: ${project.buildingColor}.
    SETTING: A professional architectural site photo in an ${project.locationType} landscape.
    LIGHTING: Late afternoon golden hour, soft shadows, photorealistic.
    DETAILS: Large glass windows, modern textures, landscaping, 8k resolution.
    RULES: High-quality 3D render, photorealistic. No sketches. No cartoons.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { aspectRatio: "16:9" }
      }
    });

    let imageUrl = "";
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }
    return imageUrl;
  },

  // STRICT Room Visualization Logic (Gemini 2.5 Flash Image)
  generateRoomVisual: async (project: Project, room: Room, mode: 'before' | 'after'): Promise<string> => {
    let prompt = "";
    
    if (mode === 'before') {
      prompt = `
        SYSTEM: You are the ZeroBuild.AI Interior Visualization Engine.
        TASK: Generate a photorealistic 3D render of a BEFORE view.
        ROOM TYPE: ${room.type}.
        MODE: BEFORE
        STRICT RULES:
        - Show an EMPTY room, strictly NO furniture or decor.
        - Plain concrete or white-washed walls, neutral flooring (concrete or light wood).
        - Natural daylight from a single window.
        - High-resolution architectural bare shell style.
      `;
    } else {
      prompt = `
        SYSTEM: You are the ZeroBuild.AI Interior Visualization Engine.
        TASK: Generate a photorealistic 3D render of an AFTER view.
        ROOM TYPE: ${room.type} (Residential)
        MODE: AFTER
        COLOR ENFORCEMENT: Apply EXACT color "${room.color}" to walls and accents.
        STRICT RULES:
        - Photorealistic 3D render of a fully furnished ${room.type}.
        - Furniture: Matching modern high-end pieces for ${room.type}.
        - Lighting: Recessed warm lighting combined with natural light.
        - High resolution, professional interior photography style.
      `;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: prompt }] },
      config: {
        imageConfig: { aspectRatio: "16:9" }
      }
    });

    let imageUrl = "";
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }
    
    if (!imageUrl) {
        throw new Error("Visualization engine could not generate image. Scope: conceptual residential only.");
    }
    
    return imageUrl;
  },

  // Chatbot (Gemini 3 Flash)
  chat: async (message: string, history: { role: 'user' | 'model', text: string }[]): Promise<string> => {
    const chat = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: "You are ZeroBuild AI Assistant. Help with residential buildings only. If the user asks for engineering drawings, say: 'ZeroBuild.AI provides conceptual architectural visualization, not construction drawings.'",
      }
    });

    const response = await chat.sendMessage({ message: message });
    return response.text || "I'm sorry, I couldn't process that.";
  }
};

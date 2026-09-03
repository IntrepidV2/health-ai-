import { GoogleGenAI, Type, Schema, FunctionDeclaration, Modality, LiveServerMessage } from "@google/genai";
import { Patient, VitalRecord, RiskAnalysis } from "../types";

const apiKey = process.env.API_KEY || ''; // Ensure this is available
const ai = new GoogleGenAI({ apiKey });

// Helper to convert File to Base64 for Gemini
async function fileToGenerativePart(file: File): Promise<{ inlineData: { data: string; mimeType: string } }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      // remove data:image/jpeg;base64, prefix
      const base64Content = base64Data.split(',')[1];
      resolve({
        inlineData: {
          data: base64Content,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// -- OCR / DATA EXTRACTION --

export const extractDataFromDocument = async (file: File): Promise<Partial<VitalRecord>> => {
  const model = "gemini-3-flash-preview"; 
  
  const filePart = await fileToGenerativePart(file);

  const prompt = `
    Analyze this medical document or image. 
    Your task is to extract patient vital signs if they are visible in the document.
    
    Look for the following fields:
    - Systolic Blood Pressure (systolic)
    - Diastolic Blood Pressure (diastolic)
    - Heart Rate or Pulse (heartRate)
    - Blood Glucose Level (glucose) - if unit is mmol/L, convert to mg/dL (multiply by 18).
    - Body Temperature (temperature) - if Celsius, convert to Fahrenheit.
    
    If a specific value is NOT found, omit it from the JSON. Do not guess.
    
    Also generate a short "notes" string summarizing what kind of document this looks like (e.g. "Lab Report from Dr. Smith, Oct 12").
    
    Output purely JSON matching the schema.
  `;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      systolic: { type: Type.NUMBER, description: "Systolic blood pressure (mmHg)" },
      diastolic: { type: Type.NUMBER, description: "Diastolic blood pressure (mmHg)" },
      heartRate: { type: Type.NUMBER, description: "Heart rate in bpm" },
      glucose: { type: Type.NUMBER, description: "Blood glucose in mg/dL" },
      temperature: { type: Type.NUMBER, description: "Body temperature in Fahrenheit" },
      notes: { type: Type.STRING, description: "Brief summary of the document source/date" }
    },
    required: ['notes']
  };

  try {
    const result = await ai.models.generateContent({
      model,
      contents: {
        parts: [filePart, { text: prompt }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });
    
    const text = result.text;
    if (!text) return { notes: "Could not extract readable text." };
    return JSON.parse(text) as Partial<VitalRecord>;
  } catch (error) {
    console.error("OCR Extraction failed", error);
    throw new Error("Failed to analyze document.");
  }
};

// -- ANALYTICS ENGINE (Simulates n8n AI Node) --

export const analyzePatientRisk = async (patient: Patient, newRecord: VitalRecord): Promise<RiskAnalysis> => {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    You are an AI medical risk assessment engine for "Pulsera".
    Analyze the following data for the user. Merge the new record with history.
    
    User/Patient: ${patient.name}, ${patient.age}y, ${patient.condition}.
    
    Recent Vitals History (Last 3):
    ${JSON.stringify(patient.vitalsHistory.slice(-3))}
    
    NEW INCOMING DATA:
    ${JSON.stringify(newRecord)}
    
    TASK:
    Determine risk level (NORMAL, WORSENING, CRITICAL).
    Identify the trend (IMPROVING, STABLE, WORSENING).
    
    SUMMARY RULES:
    1. Explain what changed over time and why it matters.
    2. Do NOT repeat the raw numbers in the summary.
    3. Describe trends (e.g., "rising", "falling", "fluctuating").
    4. Explain what those trends mean in simple human language.
    5. Example: "Your blood pressure has been slowly increasing this week, which puts more strain on your heart."
    
    Provide a list of 2-3 action items.
    
    Output JSON only.
  `;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      level: { type: Type.STRING, enum: ['NORMAL', 'WORSENING', 'CRITICAL'] },
      summary: { type: Type.STRING },
      trend: { type: Type.STRING, enum: ['IMPROVING', 'STABLE', 'WORSENING'] },
      actionItems: { type: Type.ARRAY, items: { type: Type.STRING } },
      alertTriggered: { type: Type.BOOLEAN }
    },
    required: ['level', 'summary', 'trend', 'actionItems', 'alertTriggered']
  };

  try {
    const result = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const text = result.text;
    if (!text) throw new Error("No response from AI");
    return JSON.parse(text) as RiskAnalysis;
  } catch (error) {
    console.error("Analysis failed", error);
    // Fallback if AI fails
    return {
      level: 'WORSENING',
      summary: "AI Service unavailable. Please consult a doctor.",
      trend: 'STABLE',
      actionItems: ["Check inputs"],
      alertTriggered: false
    };
  }
};

// -- CHAT ASSISTANT (with Grounding & Context) --

export const chatWithAssistant = async (history: {role: string, parts: {text: string}[]}[], message: string, patient?: Patient) => {
  // Use Gemini 3 Flash for speed and Search tool
  const model = "gemini-3-flash-preview"; 
  
  let systemInstruction = "You are 'Pulse', a helpful medical assistant. You are talking directly to the patient. Use Google Search to verify serious symptoms. Be empathetic, professional, and friendly. CRITICAL: Keep your answers extremely short and precise (max 2 sentences). Avoid long explanations. Always advise consulting a doctor for serious issues.";

  if (patient) {
    systemInstruction = `
      You are 'Pulse', a personal health assistant for the patient, ${patient.name}.
      
      PATIENT DATA CONTEXT:
      - Age: ${patient.age}
      - Conditions: ${patient.condition}
      - Current Risk Level: ${patient.currentRisk.level}
      - Health Trend: ${patient.currentRisk.trend}
      - Latest Analysis Summary: "${patient.currentRisk.summary}"
      
      RECENT VITALS HISTORY (Last 5 records):
      ${JSON.stringify(patient.vitalsHistory.slice(-5))}
      
      INSTRUCTIONS:
      - You have full access to the patient's data above. 
      - If the user asks about their health status (BP, sugar, heart rate), explain what changed over time and why it matters.
      - DO NOT repeat the raw numbers in your explanation.
      - Describe trends (rising, falling, unstable) and what they mean in simple human language.
      - Example: "Your blood pressure is trending up, which might be why you feel tired."
      - CRITICAL: Keep your answers EXTREMELY SHORT and PRECISE (max 2-3 sentences). Do not write long paragraphs.
      - Use Google Search to look up general medical information if needed.
      - DISCLAIMER: You are an AI. For chest pain, difficulty breathing, or severe symptoms, ALWAYS tell them to call emergency services or a doctor immediately.
    `;
  }

  try {
    const result = await ai.models.generateContent({
      model,
      contents: [
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        tools: [{ googleSearch: {} }], // Grounding enabled
        systemInstruction: systemInstruction
      }
    });

    return {
      text: result.text || "I couldn't process that.",
      groundingChunks: result.candidates?.[0]?.groundingMetadata?.groundingChunks
    };
  } catch (e) {
    console.error("Chat error", e);
    return { text: "Service temporary unavailable.", groundingChunks: [] };
  }
};

// -- LIVE AUDIO (Real-time Conversation) --

export interface LiveSessionCallbacks {
  onMessage: (text: string, audioData?: string) => void;
  onConnect: () => void;
  onClose: () => void;
}

export const connectLiveSession = async (callbacks: LiveSessionCallbacks) => {
  const model = "gemini-2.5-flash-native-audio-preview-12-2025";
  const session = await ai.live.connect({
    model,
    callbacks: {
      onopen: callbacks.onConnect,
      onclose: callbacks.onClose,
      onmessage: (msg: LiveServerMessage) => {
        // Handle audio output
        const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
        if (audioData) {
            callbacks.onMessage("", audioData);
        }
        
        // Handle text transcription if available (optional for UI)
        if (msg.serverContent?.modelTurn?.parts?.[0]?.text) {
             // We prioritize audio, but could use text for captions
        }
      }
    },
    config: {
      responseModalities: [Modality.AUDIO],
      systemInstruction: "You are a warm, empathetic nurse assistant named Pulse. Talk to the user directly as your patient. Keep answers extremely short, precise, and comforting. Do not speak for long periods. Explain trends in simple human language without quoting raw numbers repeatedly.",
    }
  });
  
  return session;
};

// Helper to encode PCM for Live API
export function createPcmBlob(data: Float32Array): { data: string, mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = Math.max(-1, Math.min(1, data[i])) * 32767; // Clamp and scale
  }
  
  let binary = '';
  const bytes = new Uint8Array(int16.buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  
  return {
    data: btoa(binary),
    mimeType: 'audio/pcm;rate=16000',
  };
}
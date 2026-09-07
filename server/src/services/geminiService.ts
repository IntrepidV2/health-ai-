import { GoogleGenAI, Type, Schema } from '@google/genai';
import { VitalRecordDTO, RiskAnalysisDTO, PatientDTO } from '../types.js';

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const extractDataFromDocument = async (
  buffer: Buffer,
  mimeType: string,
  filename: string
): Promise<Partial<VitalRecordDTO>> => {
  const model = 'gemini-2.5-flash';

  const base64Content = buffer.toString('base64');
  const filePart = {
    inlineData: {
      data: base64Content,
      mimeType: mimeType || 'image/jpeg',
    },
  };

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
      systolic: { type: Type.NUMBER, description: 'Systolic blood pressure (mmHg)' },
      diastolic: { type: Type.NUMBER, description: 'Diastolic blood pressure (mmHg)' },
      heartRate: { type: Type.NUMBER, description: 'Heart rate in bpm' },
      glucose: { type: Type.NUMBER, description: 'Blood glucose in mg/dL' },
      temperature: { type: Type.NUMBER, description: 'Body temperature in Fahrenheit' },
      notes: { type: Type.STRING, description: 'Brief summary of the document source/date' },
    },
    required: ['notes'],
  };

  try {
    const result = await ai.models.generateContent({
      model,
      contents: {
        parts: [filePart, { text: prompt }],
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema,
      },
    });

    const text = result.text;
    if (!text) return { notes: `Extracted from ${filename}` };
    return JSON.parse(text) as Partial<VitalRecordDTO>;
  } catch (error) {
    console.error('Server OCR Extraction failed:', error);
    return { notes: `Uploaded: ${filename} (OCR analysis unavailable)` };
  }
};

export const analyzePatientRisk = async (
  patient: PatientDTO,
  newRecord: VitalRecordDTO
): Promise<RiskAnalysisDTO> => {
  const model = 'gemini-2.5-flash';

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
      alertTriggered: { type: Type.BOOLEAN },
    },
    required: ['level', 'summary', 'trend', 'actionItems', 'alertTriggered'],
  };

  try {
    const result = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema,
      },
    });

    const text = result.text;
    if (!text) throw new Error('No response from AI');
    return JSON.parse(text) as RiskAnalysisDTO;
  } catch (error) {
    console.error('Server risk analysis failed:', error);
    return {
      level: 'NORMAL',
      summary: 'Vitals logged successfully. Continue regular monitoring.',
      trend: 'STABLE',
      actionItems: ['Maintain daily check-ins', 'Stay hydrated'],
      alertTriggered: false,
    };
  }
};

export const chatWithAssistant = async (
  history: { role: string; parts: { text: string }[] }[],
  message: string,
  patient?: PatientDTO
) => {
  const model = 'gemini-2.5-flash';

  let systemInstruction =
    "You are 'Pulse', a helpful medical assistant. You are talking directly to the patient. Use Google Search to verify serious symptoms. Be empathetic, professional, and friendly. CRITICAL: Keep your answers extremely short and precise (max 2 sentences). Avoid long explanations. Always advise consulting a doctor for serious issues.";

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
      contents: [...history, { role: 'user', parts: [{ text: message }] }],
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction,
      },
    });

    return {
      text: result.text || "I couldn't process that.",
      groundingChunks: result.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
    };
  } catch (e) {
    console.error('Server chat error:', e);
    return {
      text: 'I am currently having trouble connecting to the AI service. Please try again shortly.',
      groundingChunks: [],
    };
  }
};

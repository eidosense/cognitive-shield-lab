import { GoogleGenAI, Type, Schema } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are the forensic analytical engine of Cognitive Shield Lab.
Your task: Rapidly analyze user-submitted media (audio, video, speech, URLs) into a high-impact second-by-second somatic breakdown.

Generate exactly 4 to 6 key chronological timestamp frames (e.g. 00:03s, 00:09s, 00:18s, 00:27s).
Keep all text descriptions brief, punchy, and empirical.
Identify:
1. Exact timestamp & second.
2. Target organ ('brain', 'heart', 'infrasound', or 'gut').
3. Concise detected mechanism (e.g., "7.5Hz sub-audible drone", "140 BPM urgency chime", "Double-bind guilt trap").
4. Physiological/biochemical impact (e.g., "Amygdala panic surge", "Cortisol spike & tachycardia", "Visceral nausea").
5. Severity (1-10).

Calculate CMI score (0-100), threat level, infrasound zone, and a brief report.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, mediaData, mimeType, videoUrl, artifactTitle } = body;

    if (!prompt && !mediaData && !videoUrl) {
      return NextResponse.json(
        { error: "No prompt, media file, or video URL provided." },
        { status: 400 }
      );
    }

    const contents: any[] = [];
    
    let userMessage = `Artifact: ${artifactTitle || "Target Media"}\n\n`;
    if (videoUrl) {
      userMessage += `Video URL: ${videoUrl}\n`;
    }
    if (prompt) {
      userMessage += `Input Content:\n${prompt}\n`;
    }

    if (mediaData && mimeType) {
      contents.push({
        inlineData: {
          data: mediaData,
          mimeType: mimeType,
        },
      });
    }

    contents.push(userMessage);

    const responseSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        cmiScore: { type: Type.INTEGER },
        threatLevel: { type: Type.STRING },
        primaryObjective: { type: Type.STRING },
        timelineFrames: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              timestamp: { type: Type.STRING },
              second: { type: Type.INTEGER },
              targetOrgan: { type: Type.STRING },
              detectedMechanism: { type: Type.STRING },
              biochemicalSomaticImpact: { type: Type.STRING },
              severity: { type: Type.INTEGER }
            },
            required: [
              "timestamp",
              "second",
              "targetOrgan",
              "detectedMechanism",
              "biochemicalSomaticImpact",
              "severity"
            ]
          }
        },
        infrasoundBrainwaveMetrics: {
          type: Type.OBJECT,
          properties: {
            detectedInfrasoundZone: { type: Type.STRING },
            infrasoundSeverity: { type: Type.INTEGER },
            entrainedBrainwave: { type: Type.STRING },
            binauralPacingHazard: { type: Type.INTEGER },
            vestibularDisorientation: { type: Type.INTEGER },
            acousticWeaponProfile: { type: Type.STRING },
          },
          required: [
            "detectedInfrasoundZone",
            "infrasoundSeverity",
            "entrainedBrainwave",
            "binauralPacingHazard",
            "vestibularDisorientation",
            "acousticWeaponProfile"
          ]
        },
        somaticBiochemicalImpact: {
          type: Type.OBJECT,
          properties: {
            amygdalaThreat: { type: Type.INTEGER },
            prefrontalInhibition: { type: Type.INTEGER },
            cortisolStressSurge: { type: Type.INTEGER },
            dopamineExploitation: { type: Type.INTEGER },
            cardiovascularStrain: { type: Type.INTEGER },
            gutBrainTension: { type: Type.INTEGER },
            summaryBiochemical: { type: Type.STRING },
            summaryConsciousness: { type: Type.STRING },
            affectedOrganHotspots: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: [
            "amygdalaThreat",
            "prefrontalInhibition",
            "cortisolStressSurge",
            "dopamineExploitation",
            "cardiovascularStrain",
            "gutBrainTension",
            "summaryBiochemical",
            "summaryConsciousness",
            "affectedOrganHotspots"
          ]
        },
        countermeasures: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        markdownReport: { type: Type.STRING }
      },
      required: [
        "cmiScore",
        "threatLevel",
        "primaryObjective",
        "timelineFrames",
        "infrasoundBrainwaveMetrics",
        "somaticBiochemicalImpact",
        "countermeasures",
        "markdownReport"
      ]
    };

    // Use models/gemini-3.8-flash as requested by the user
    const response = await ai.models.generateContent({
      model: "models/gemini-3.8-flash",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.1,
        thinkingConfig: {
          thinkingBudget: 1024,
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from forensic engine.");
    }

    const parsedData = JSON.parse(resultText);
    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("Timeline analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Internal analysis failure." },
      { status: 500 }
    );
  }
}

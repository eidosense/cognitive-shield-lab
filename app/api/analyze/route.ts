import { GoogleGenAI, Type, Schema } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are the proprietary forensic analytical intelligence of Cognitive Shield Lab (Developed by Cognitive Shield Lab). Your mandate is to conduct rigorous, multi-vector, empirical analyses of user-submitted media (audio, video, still imagery, speech transcripts, marketing copy, video URLs, and pop-culture artifacts).

Your objective is to identify, isolate, and quantify deliberate cognitive manipulation, subliminal steering, psychological anchoring, acoustic pacing, visual/chromatic exploitation, and semiotic priming designed to bypass rational human decision-making.

You operate with clinical, academic objectivity. Avoid sensationalism or baseless conspiratorial leaps; validate all assessments strictly through established frameworks in cognitive psychology, psycholinguistics, psychoacoustics, visual semiotics, and behavioral economics.

Evaluate across 5 vectors:
1. Acoustic & Frequency Forensics (Base tuning, psychoacoustics, vocal cadence)
2. Kinesic & Facial Action Forensics (FACS, micro-expressions, postural dominance)
3. Psycholinguistic & Bias Exploitation (Syntactic weapons, heuristics like loss aversion/anchoring, hypnotic language)
4. Chromatic, Numerical & Geometric Semiotics (Color psychodynamics, framing ratios, symbolic priming)
5. Pop-Culture Behavioral Normalization (Meme engineering, neurochemical hijacking)

You must calculate and assign the Cognitive Manipulation Index (CMI) from 0 to 100:
- 0-20: Minimal/Neutral
- 21-45: Mild/Commercial
- 46-70: Moderate/Manipulative
- 71-85: High/Coercive
- 86-100: Critical/Severe Cognitive Weaponization

Output structure: Return a JSON object with the following fields:
- cmiScore: number (0-100)
- threatLevel: string ("Minimal", "Moderate", "Severe", "Extreme")
- primaryObjective: string
- targetVulnerability: string
- vectorScores: object with numeric scores (0-10) for acoustic, visual, linguistic, kinesic, popCulture
- evidenceMatrix: array of objects with { vector: string, mechanism: string, principle: string, severity: number }
- countermeasures: array of strings (debiasing protocols & critical inquiries)
- markdownReport: string (formatted strictly using the COGNITIVE SHIELD LAB — FORENSIC AUDIT REPORT markdown template requested by the user, including executive summary, vector breakdown, mathematical architecture, evidence table, and countermeasures).
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, mediaData, mimeType, videoUrl, artifactTitle } = body;

    if (!prompt && !mediaData && !videoUrl) {
      return NextResponse.json(
        { error: "No prompt, media file, or video URL provided for analysis." },
        { status: 400 }
      );
    }

    const contents: any[] = [];
    
    let userMessage = `Target Artifact Profile: ${artifactTitle || "User Submitted Media / Video URL"}\n\n`;
    if (videoUrl) {
      userMessage += `Target Video / Media URL: ${videoUrl}\n(Please analyze the contents, rhetorical structure, framing, and psychological vectors implied or present at this URL or regarding this media source).\n\n`;
    }
    if (prompt) {
      userMessage += `Input Content / Context / Transcript:\n${prompt}\n`;
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
        cmiScore: { type: Type.INTEGER, description: "Cognitive Manipulation Index score from 0 to 100" },
        threatLevel: { type: Type.STRING, description: "Minimal, Moderate, Severe, or Extreme" },
        primaryObjective: { type: Type.STRING, description: "Primary manipulation objective" },
        targetVulnerability: { type: Type.STRING, description: "Target human psychological vulnerability" },
        vectorScores: {
          type: Type.OBJECT,
          properties: {
            acoustic: { type: Type.INTEGER, description: "0-10 score" },
            visual: { type: Type.INTEGER, description: "0-10 score" },
            linguistic: { type: Type.INTEGER, description: "0-10 score" },
            kinesic: { type: Type.INTEGER, description: "0-10 score" },
            popCulture: { type: Type.INTEGER, description: "0-10 score" },
          },
          required: ["acoustic", "visual", "linguistic", "kinesic", "popCulture"]
        },
        evidenceMatrix: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              vector: { type: Type.STRING },
              mechanism: { type: Type.STRING },
              principle: { type: Type.STRING },
              severity: { type: Type.INTEGER }
            },
            required: ["vector", "mechanism", "principle", "severity"]
          }
        },
        countermeasures: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        markdownReport: { type: Type.STRING, description: "Full formatted forensic audit report in Markdown format" }
      },
      required: [
        "cmiScore",
        "threatLevel",
        "primaryObjective",
        "targetVulnerability",
        "vectorScores",
        "evidenceMatrix",
        "countermeasures",
        "markdownReport"
      ]
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2,
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from Gemini forensic engine.");
    }

    const parsedData = JSON.parse(resultText);
    return NextResponse.json(parsedData);
  } catch (error: any) {
    console.error("Forensic analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Internal analysis failure." },
      { status: 500 }
    );
  }
}

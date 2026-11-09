'use client';

import React, { useState } from 'react';
import { 
  Shield, 
  Activity, 
  FileText, 
  Upload, 
  AlertTriangle, 
  CheckCircle2, 
  Cpu, 
  Eye, 
  Volume2, 
  Brain, 
  Palette, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  History, 
  RefreshCw,
  Terminal,
  FileCheck,
  Zap,
  Lock,
  ArrowRight,
  Box,
  Link as LinkIcon,
  Video
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CognitiveShield3D from '@/components/CognitiveShield3D';

interface AnalysisResult {
  cmiScore: number;
  threatLevel: string;
  primaryObjective: string;
  targetVulnerability: string;
  vectorScores: {
    acoustic: number;
    visual: number;
    linguistic: number;
    kinesic: number;
    popCulture: number;
  };
  evidenceMatrix: Array<{
    vector: string;
    mechanism: string;
    principle: string;
    severity: number;
  }>;
  countermeasures: string[];
  markdownReport: string;
}

interface SavedAudit {
  id: string;
  timestamp: string;
  title: string;
  cmiScore: number;
  threatLevel: string;
  result: AnalysisResult;
}

const PRESET_CASE_STUDIES = [
  {
    id: 'crypto-urgency',
    title: 'Synthetic Scarcity Crypto Pitch',
    category: 'Commercial / Financial Steering',
    description: 'A 60-second video transcript and promotional copy for a token pre-sale relying heavily on loss aversion and artificial countdown timers.',
    content: 'WARNING: 98% of people will miss out on the greatest wealth transfer in history. Institutional whales are accumulating right now behind closed doors. If you do not lock in your allocation within the next 4 minutes and 12 seconds, you will be permanently priced out. Do you want your family to stay trapped in fiat slavery while everyone else achieves generational freedom? Click below before the smart contract locks forever.',
  },
  {
    id: 'corporate-crisis',
    title: 'Corporate Crisis PR Executive Statement',
    category: 'Institutional Deflection / PR',
    description: 'An executive video address following a major data breach and regulatory inquiry.',
    content: 'While certain legacy misalignments occurred during our accelerated scaling phase, it is vital to remember our foundational commitment to community trust. Independent reviews indicate zero systemic vulnerability, though isolated anomalies were swiftly mitigated. Moving forward, our stakeholders can rest assured that our dynamic synergy remains robust and forward-looking.',
  },
  {
    id: 'populist-rally',
    title: 'Populist Rally Speech Excerpt',
    category: 'Ideological Polarization',
    description: 'A political stump speech utilizing in-group/out-group framing and thought-terminating clichés.',
    content: 'They do not want you to speak. They want you silenced, censored, and subjugated in your own hometown. It is us versus them—the entrenched elites who despise your values versus the hardworking patriots who built this nation. We are going to take back what is ours, no matter what it takes. Stand with me now.',
  },
  {
    id: 'educational-neutral',
    title: 'Peer-Reviewed Scientific Briefing',
    category: 'Informative / Neutral Baseline',
    description: 'An objective academic summary of public health statistics and statistical variance.',
    content: 'This report examines longitudinal data collected across four metropolitan hospital districts between 2022 and 2025. Results indicate a 14% variance in seasonal respiratory admissions, correlating moderately with regional temperature drops and population density metrics. Methodological limitations and confidence intervals are detailed in Appendix B.',
  }
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<'analyze' | 'presets' | 'history'>('analyze');
  const [artifactTitle, setArtifactTitle] = useState('');
  const [promptInput, setPromptInput] = useState('');
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [mediaFile, setMediaFile] = useState<{ data: string; mimeType: string; name: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'report' | '3d'>('report');

  const [savedAudits, setSavedAudits] = useState<SavedAudit[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('csl_saved_audits');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const saveToHistory = (title: string, result: AnalysisResult) => {
    const newAudit: SavedAudit = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      title: title || 'Unnamed Artifact',
      cmiScore: result.cmiScore,
      threatLevel: result.threatLevel,
      result,
    };
    const updated = [newAudit, ...savedAudits.slice(0, 19)];
    setSavedAudits(updated);
    try {
      localStorage.setItem('csl_saved_audits', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('File size exceeds 20MB limit for direct browser analysis.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1];
      setMediaFile({
        data: base64String,
        mimeType: file.type,
        name: file.name,
      });
      if (!artifactTitle) {
        setArtifactTitle(file.name);
      }
      setErrorMsg(null);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read file.');
    };
    reader.readAsDataURL(file);
  };

  const loadPreset = (preset: typeof PRESET_CASE_STUDIES[0]) => {
    setArtifactTitle(preset.title);
    setPromptInput(preset.content);
    setVideoUrlInput('');
    setMediaFile(null);
    setActiveTab('analyze');
  };

  const runAnalysis = async () => {
    if (!promptInput.trim() && !mediaFile && !videoUrlInput.trim()) {
      setErrorMsg('Please provide a video URL, transcript, description, or media file to analyze.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    setScanStep(1);

    const scanInterval = setInterval(() => {
      setScanStep((prev) => (prev < 5 ? prev + 1 : prev));
    }, 800);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptInput,
          videoUrl: videoUrlInput.trim() || undefined,
          mediaData: mediaFile?.data,
          mimeType: mediaFile?.mimeType,
          artifactTitle: artifactTitle || (videoUrlInput ? 'Video URL Import' : 'Submitted Artifact'),
        }),
      });

      clearInterval(scanInterval);

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Forensic analysis pipeline failed.');
      }

      const data: AnalysisResult = await res.json();
      setAnalysisResult(data);
      saveToHistory(artifactTitle || (videoUrlInput ? 'Video URL Import' : 'Submitted Artifact'), data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'An error occurred during multi-vector scanning.');
    } finally {
      setIsAnalyzing(false);
      setScanStep(0);
    }
  };

  const getThreatColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'extreme':
      case 'critical':
      case 'severe':
        return 'text-rose-400 bg-rose-950/40 border-rose-800/60';
      case 'moderate':
        return 'text-amber-400 bg-amber-950/40 border-amber-800/60';
      default:
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/60';
    }
  };

  const getBadgeColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'extreme':
      case 'critical':
      case 'severe':
        return 'bg-rose-500';
      case 'moderate':
        return 'bg-amber-500';
      default:
        return 'bg-emerald-500';
    }
  };

  const copyReport = () => {
    if (analysisResult?.markdownReport) {
      navigator.clipboard.writeText(analysisResult.markdownReport);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadReport = () => {
    if (analysisResult?.markdownReport) {
      const blob = new Blob([analysisResult.markdownReport], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Cognitive_Shield_Audit_${artifactTitle.replace(/\s+/g, '_') || 'Report'}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 border border-cyan-400/30">
            <Shield className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-wider bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
                COGNITIVE SHIELD LAB
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                Engine v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400 tracking-tight">
              Developed by Cognitive Shield Lab • Multimodal Manipulation Analyzer + Video URL Ingestion
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('analyze')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'analyze'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="w-4 h-4" />
            Forensic Suite
          </button>
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'presets'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Case Library ({PRESET_CASE_STUDIES.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <History className="w-4 h-4" />
            Audit History ({savedAudits.length})
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-8">
        {/* Hero Banner */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800/80 p-8 shadow-2xl">
          <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 text-xs font-mono mb-4">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              Multimodal Ingestion • Video URL Import & 3D Telemetry
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
              Detect & Deconstruct Cognitive Steering
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Scan video URLs (YouTube, Vimeo, MP4 links), transcripts, marketing copy, and broadcasts across acoustic frequencies, psycholinguistic traps, chromatic semiotics, and behavioral priming vectors backed by real-time Three.js 3D telemetry.
            </p>
          </div>
        </section>

        {/* Tab Content */}
        {activeTab === 'presets' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PRESET_CASE_STUDIES.map((preset) => (
              <div
                key={preset.id}
                className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between hover:border-cyan-500/50 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-800 text-cyan-400 border border-slate-700">
                      {preset.category}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">Reference Spec</span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors mb-2">
                    {preset.title}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                    {preset.description}
                  </p>
                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60 text-xs font-mono text-slate-300 line-clamp-3 mb-6">
                    {preset.content}
                  </div>
                </div>
                <button
                  onClick={() => loadPreset(preset)}
                  className="w-full py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-sm font-semibold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  Load into Forensic Suite <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <History className="w-5 h-5 text-cyan-400" />
              Saved Forensic Audit Reports
            </h2>
            {savedAudits.length === 0 ? (
              <div className="text-center py-16 text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-40" />
                <p>No previous audit logs stored in local session history.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {savedAudits.map((audit) => (
                  <div
                    key={audit.id}
                    className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between hover:border-cyan-500/40 transition-all cursor-pointer"
                    onClick={() => {
                      setArtifactTitle(audit.title);
                      setAnalysisResult(audit.result);
                      setActiveTab('analyze');
                    }}
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold text-white">{audit.title}</span>
                        <span className={`text-xs px-2 py-0.5 rounded font-mono border ${getThreatColor(audit.threatLevel)}`}>
                          {audit.threatLevel} Threat
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">
                        {new Date(audit.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs text-slate-400 font-mono">CMI Score</div>
                        <div className="text-lg font-bold text-cyan-400">{audit.cmiScore} / 100</div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-600" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analyze' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Input Panel */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-6 shadow-xl flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-cyan-400" />
                    Artifact Ingestion Pipeline
                  </h2>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800/40">
                    Multimodal Ready
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-wider">
                    Artifact Title / Identifier
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Q3 Promotional Ad, Political Speech Clip"
                    value={artifactTitle}
                    onChange={(e) => setArtifactTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>

                {/* Video URL Import */}
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5 text-cyan-400" /> Video or Media URL Import
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <LinkIcon className="w-4 h-4" />
                    </span>
                    <input
                      type="url"
                      placeholder="https://youtube.com/watch?v=... or direct MP4 link"
                      value={videoUrlInput}
                      onChange={(e) => setVideoUrlInput(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-wider">
                    Transcript / Copy / Additional Context
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Paste transcript, notes, or specific timestamps to inspect..."
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors resize-y"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-2 uppercase tracking-wider">
                    Attach Media File (Audio, Video, Image, PDF)
                  </label>
                  <div className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-xl p-4 text-center transition-colors bg-slate-950/40 relative">
                    <input
                      type="file"
                      accept="audio/*,video/*,image/*,application/pdf,text/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="w-6 h-6 text-cyan-400" />
                      <span className="text-xs text-slate-300 font-medium">
                        {mediaFile ? mediaFile.name : 'Click to upload or drag & drop media'}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        Supports MP3, MP4, WAV, PNG, JPG, PDF (Max 20MB)
                      </span>
                    </div>
                  </div>
                  {mediaFile && (
                    <button
                      onClick={() => setMediaFile(null)}
                      className="text-xs text-rose-400 mt-2 hover:underline cursor-pointer"
                    >
                      Remove attached media
                    </button>
                  )}
                </div>

                {errorMsg && (
                  <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  onClick={runAnalysis}
                  disabled={isAnalyzing}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      Executing Multi-Vector Audit...
                    </>
                  ) : (
                    <>
                      <Cpu className="w-4 h-4 text-slate-950" />
                      Run Forensic Manipulation Scan
                    </>
                  )}
                </button>
              </div>

              {/* Scanning Progress Telemetry */}
              {isAnalyzing && (
                <div className="bg-slate-900/80 border border-cyan-500/40 rounded-2xl p-6 shadow-xl space-y-4 animate-pulse">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-cyan-400">SCAN PIPELINE ACTIVE</span>
                    <span className="text-xs font-mono text-slate-400">Step {scanStep} / 5</span>
                  </div>
                  <div className="space-y-2 text-xs font-mono text-slate-300">
                    <div className={`flex items-center gap-2 ${scanStep >= 1 ? 'text-cyan-300 font-bold' : 'text-slate-600'}`}>
                      <Volume2 className="w-4 h-4" /> Vector A: Acoustic & Frequency Forensics
                    </div>
                    <div className={`flex items-center gap-2 ${scanStep >= 2 ? 'text-cyan-300 font-bold' : 'text-slate-600'}`}>
                      <Eye className="w-4 h-4" /> Vector B: Kinesic & Facial Action Forensics
                    </div>
                    <div className={`flex items-center gap-2 ${scanStep >= 3 ? 'text-cyan-300 font-bold' : 'text-slate-600'}`}>
                      <Brain className="w-4 h-4" /> Vector C: Psycholinguistic & Bias Exploitation
                    </div>
                    <div className={`flex items-center gap-2 ${scanStep >= 4 ? 'text-cyan-300 font-bold' : 'text-slate-600'}`}>
                      <Palette className="w-4 h-4" /> Vector D: Chromatic & Geometric Semiotics
                    </div>
                    <div className={`flex items-center gap-2 ${scanStep >= 5 ? 'text-cyan-300 font-bold' : 'text-slate-600'}`}>
                      <Zap className="w-4 h-4" /> Vector E: Pop-Culture Behavioral Normalization
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Results & 3D Viewer Panel */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* View Toggle Tabs */}
              <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800/80 p-2 rounded-2xl">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('report')}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-medium flex items-center gap-2 transition-all cursor-pointer ${
                      viewMode === 'report' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FileText className="w-4 h-4" /> Forensic Report
                  </button>
                  <button
                    onClick={() => setViewMode('3d')}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-medium flex items-center gap-2 transition-all cursor-pointer ${
                      viewMode === '3d' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Box className="w-4 h-4" /> 3D Neural Matrix Viewer
                  </button>
                </div>
                {analysisResult && (
                  <span className={`text-xs font-mono px-3 py-1 rounded-full border ${getThreatColor(analysisResult.threatLevel)}`}>
                    CMI: {analysisResult.cmiScore} / 100
                  </span>
                )}
              </div>

              {viewMode === '3d' ? (
                <CognitiveShield3D
                  cmiScore={analysisResult?.cmiScore || 15}
                  threatLevel={analysisResult?.threatLevel || 'Minimal'}
                />
              ) : !analysisResult ? (
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[500px]">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-600 mb-4 border border-slate-700">
                    <Shield className="w-8 h-8 opacity-40 text-cyan-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-300 mb-2">Awaiting Artifact Submission</h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed mb-6">
                    Paste a video URL or transcript on the left, or load a preset case study from the Case Library to initiate forensic deconstruction.
                  </p>
                  <button
                    onClick={() => setViewMode('3d')}
                    className="px-4 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-mono font-semibold flex items-center gap-2 transition-all mx-auto cursor-pointer"
                  >
                    <Box className="w-4 h-4" /> Preview 3D Neural Shield Matrix Now
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {/* CMI Score & Threat Card */}
                  <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                    <div className="absolute right-0 top-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                      <div>
                        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                          Cognitive Shield Lab Forensic Audit
                        </span>
                        <h2 className="text-2xl font-extrabold text-white mt-1">
                          {artifactTitle || 'Audited Artifact'}
                        </h2>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={copyReport}
                          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer"
                        >
                          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          {copied ? 'Copied Report' : 'Copy Markdown'}
                        </button>
                        <button
                          onClick={downloadReport}
                          className="px-3 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-semibold flex items-center gap-1.5 transition-all border border-cyan-500/30 cursor-pointer"
                        >
                          <Download className="w-4 h-4" /> Download .md
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
                        <span className="text-xs font-mono text-slate-400">CMI SCORE (0-100)</span>
                        <div className="flex items-baseline gap-2 mt-2">
                          <span className="text-3xl font-extrabold text-cyan-400 font-mono">
                            {analysisResult.cmiScore}
                          </span>
                          <span className="text-xs text-slate-500">/ 100</span>
                        </div>
                      </div>

                      <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
                        <span className="text-xs font-mono text-slate-400">THREAT LEVEL</span>
                        <div className="mt-2">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${getThreatColor(analysisResult.threatLevel)}`}>
                            <span className={`w-2 h-2 rounded-full ${getBadgeColor(analysisResult.threatLevel)}`} />
                            {analysisResult.threatLevel}
                          </span>
                        </div>
                      </div>

                      <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
                        <span className="text-xs font-mono text-slate-400">PRIMARY OBJECTIVE</span>
                        <p className="text-xs font-medium text-slate-200 mt-2 line-clamp-2">
                          {analysisResult.primaryObjective}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/60 mb-6">
                      <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block mb-1">
                        Target Vulnerability Exploited
                      </span>
                      <p className="text-sm text-slate-300">
                        {analysisResult.targetVulnerability}
                      </p>
                    </div>

                    {/* Vector Scores Breakdown */}
                    <div>
                      <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-3">
                        Vector Vulnerability Heatmap (0-10 Scale)
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        {Object.entries(analysisResult.vectorScores).map(([key, score]) => (
                          <div key={key} className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-center">
                            <span className="text-[10px] uppercase font-mono text-slate-500 block mb-1">
                              {key}
                            </span>
                            <span className={`text-lg font-bold font-mono ${score > 7 ? 'text-rose-400' : score > 4 ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {score} / 10
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Evidence Matrix Table */}
                  <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                      <FileCheck className="w-5 h-5 text-cyan-400" />
                      Forensic Evidence Matrix
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 font-mono">
                            <th className="pb-3 pr-4">VECTOR</th>
                            <th className="pb-3 pr-4">DETECTED MECHANISM</th>
                            <th className="pb-3 pr-4">SCIENTIFIC PRINCIPLE</th>
                            <th className="pb-3 text-right">SEVERITY</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          {analysisResult.evidenceMatrix.map((item, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                              <td className="py-3 pr-4 font-mono font-medium text-cyan-300">{item.vector}</td>
                              <td className="py-3 pr-4">{item.mechanism}</td>
                              <td className="py-3 pr-4 text-slate-400">{item.principle}</td>
                              <td className="py-3 text-right font-mono font-bold text-amber-400">{item.severity} / 10</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Countermeasures */}
                  <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                      <Shield className="w-5 h-5 text-emerald-400" />
                      Cognitive Countermeasures (Immunization Protocols)
                    </h3>
                    <ul className="space-y-3">
                      {analysisResult.countermeasures.map((cm, idx) => (
                        <li key={idx} className="flex items-start gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 text-sm text-slate-300">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{cm}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Full Markdown Report */}
                  <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-6 shadow-xl">
                    <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-cyan-400" />
                      Full Forensic Audit Report
                    </h3>
                    <div className="bg-slate-950/80 rounded-xl p-6 border border-slate-800 text-slate-300 text-sm leading-relaxed overflow-x-auto font-sans markdown-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {analysisResult.markdownReport}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 px-6 py-4 text-center text-xs text-slate-500 font-mono">
        Cognitive Shield Lab Core Engine • Empirical Multimodal Forensic Deconstruction • Video URL Ingestion
      </footer>
    </div>
  );
}

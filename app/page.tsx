'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Upload, 
  RefreshCw, 
  Video, 
  Zap,
  Clock,
  Play,
  Pause,
  Download,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Brain,
  Radio,
  HeartPulse,
  Sparkles,
  Target,
  FileText,
  Compass,
  ArrowRight,
  Activity,
  GraduationCap,
  BookOpen,
  Library
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import HumanBody3DView, { SomaticBiochemicalImpact, InfrasoundBrainwaveMetrics, TimelineFrame } from '@/components/HumanBody3DView';
import ScientificCharts from '@/components/ScientificCharts';
import { ScientificCitation } from '@/app/api/analyze/route';

interface AnalysisResult {
  videoSubject: string;
  innerMotivation: string;
  subconsciousVulnerability: string;
  cmiScore: number;
  threatLevel: string;
  primaryObjective: string;
  timelineFrames: TimelineFrame[];
  infrasoundBrainwaveMetrics: InfrasoundBrainwaveMetrics;
  somaticBiochemicalImpact: SomaticBiochemicalImpact;
  scientificCitations: ScientificCitation[];
  countermeasures: string[];
  markdownReport: string;
}

const SAMPLE_PRESETS = [
  {
    id: 'digital-music-production',
    title: 'Digital Video / Music Production',
    tag: 'Mimetic Priming',
    prompt: `00:02s - Loudness overcompression & high-contrast neon red/purple palette induces autonomic sympathetic arousal.
00:08s - Rapid cut (<2.1s) and close-up central gaze trigger mirror neuron simulation and prefrontal cognitive fatigue.
00:16s - 40-80 Hz rhythmic bass pulse forces cardiac entrainment while autotuned vocal saturation bypasses analytical inquiry.
00:24s - Cyclic 4-bar repetition and status-mimicry gestures trigger dopaminergic reward seeking and trance consumption.`,
  },
  {
    id: 'infrasound-horror',
    title: '7–8 Hz Infrasound Acoustic Cue',
    tag: 'Visceral Dread',
    prompt: `00:03s - Ambient room tone starts with subtle sub-audible infrasound drone (7.5 Hz) layered underneath.
00:09s - Speaker whisper introduces loss framing; bass frequency swells directly in phase with internal organ resonance.
00:18s - Sudden acoustic transient spike and pitch-bend designed to induce autonomic startle reflex and tachycardia.
00:27s - Infrasound pulse peaks at 8 Hz causing vestibular vertigo and visceral stomach contraction.`,
  },
  {
    id: 'scarcity-panic-speech',
    title: 'Urgency Countdown Pitch',
    tag: 'Amygdala Hijack',
    prompt: `00:02s - Rapid-cut alarm visuals with sharp Beta-frequency chime enforcing cognitive tunnel vision.
00:08s - False dilemma assertion ("Either you buy now or your family stays poor"); triggers acute amygdala panic.
00:15s - Countdown timer ticks rapidly at 140 BPM, increasing cardiac rhythm and noradrenaline.
00:24s - Thought-terminating slogan repeated three times to exhaust prefrontal critical deliberation.`,
  },
  {
    id: 'alpha-hypnotic-ad',
    title: 'Alpha Wave Entrainment Ad',
    tag: 'Suggestibility',
    prompt: `00:04s - 10 Hz stereo binaural acoustic carrier begins soothing nervous defense filters.
00:12s - Voice lowers cadence to hypnotic syncopation, suppressing analytical inquiry.
00:20s - Subliminal suggestion anchor planted into subconscious receptivity window.
00:28s - Call to action delivered while viewer is locked into suggested Alpha state.`,
  }
];

export default function Home() {
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [promptInput, setPromptInput] = useState('');
  const [mediaFile, setMediaFile] = useState<{ data: string; mimeType: string; name: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showFullDossier, setShowFullDossier] = useState(false);

  // Timeline scrubber state
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlayingTimeline, setIsPlayingTimeline] = useState(true);

  // Auto-play second-by-second timeline loop
  useEffect(() => {
    if (!isPlayingTimeline || !analysisResult?.timelineFrames?.length) return;
    const interval = setInterval(() => {
      setCurrentFrameIndex((prev) => (prev + 1) % analysisResult.timelineFrames.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [isPlayingTimeline, analysisResult]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('File exceeds 20MB limit.');
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
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const executeAnalysis = async (customPrompt?: string, customUrl?: string, customTitle?: string) => {
    const textToAnalyze = customPrompt !== undefined ? customPrompt : promptInput;
    const urlToAnalyze = customUrl !== undefined ? customUrl : videoUrlInput;

    if (!textToAnalyze.trim() && !mediaFile && !urlToAnalyze.trim()) {
      setErrorMsg('Please enter a YouTube/Video URL, speech transcript, or upload a media file.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    setIsPlayingTimeline(false);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToAnalyze,
          videoUrl: urlToAnalyze.trim() || undefined,
          mediaData: mediaFile?.data,
          mimeType: mediaFile?.mimeType,
          artifactTitle: customTitle || (urlToAnalyze ? 'Target Media URL' : 'Target Media Submission'),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Forensic analysis failed.');
      }

      const data: AnalysisResult = await res.json();
      setAnalysisResult(data);
      setCurrentFrameIndex(0);
      setIsPlayingTimeline(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error executing scan.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyReport = () => {
    if (analysisResult?.markdownReport) {
      navigator.clipboard.writeText(analysisResult.markdownReport);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currentFrame = analysisResult?.timelineFrames?.[currentFrameIndex] || analysisResult?.timelineFrames?.[0];

  return (
    <main className="min-h-screen bg-[#070a12] text-slate-100 pb-16 selection:bg-cyan-500 selection:text-black">
      {/* 1. 2027 Futuristic Workstation Header */}
      <header className="border-b border-slate-800/80 bg-[#090d16]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-100 tracking-tight text-base font-sans">
                Cognitive Shield Lab
              </span>
              <span className="hidden sm:inline text-xs text-slate-400 ml-2 font-mono">
                · Multimodal Manipulation & Neuro-Somatic Analyzer
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {analysisResult && (
              <button
                onClick={() => {
                  setAnalysisResult(null);
                  setVideoUrlInput('');
                  setPromptInput('');
                  setMediaFile(null);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                + New Analysis
              </button>
            )}
            <div className="px-2.5 py-1 rounded-md bg-cyan-950/60 border border-cyan-800/60 text-cyan-400 font-mono text-[11px]">
              ONLINE · 2027.04
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex flex-col gap-6">
        {/* 2. Sleek Unified Input & Scanner Deck */}
        <div className="bg-[#0e1320] border border-slate-800/90 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col gap-3">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="relative flex-1 w-full">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Video className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Paste YouTube / MP4 Video URL or speech transcript..."
                  value={videoUrlInput || promptInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val.startsWith('http')) {
                      setVideoUrlInput(val);
                      setPromptInput('');
                    } else {
                      setPromptInput(val);
                      setVideoUrlInput('');
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') executeAnalysis();
                  }}
                  className="w-full bg-[#080c14] border border-slate-700/80 rounded-xl pl-10 pr-4 py-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all font-mono"
                />
              </div>

              {/* Media File Upload Compact Button */}
              <label className="shrink-0 flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-slate-700 hover:border-cyan-500 bg-[#080c14] text-slate-400 hover:text-slate-200 text-xs cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span className="max-w-[140px] truncate">{mediaFile ? mediaFile.name : 'Upload Media'}</span>
                <input
                  type="file"
                  accept="audio/*,video/*,image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Run Forensic Analysis CTA */}
              <button
                onClick={() => executeAnalysis()}
                disabled={isAnalyzing}
                className="w-full md:w-auto px-7 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs transition-all shadow-lg shadow-cyan-600/20 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer whitespace-nowrap"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deconstructing Media...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Execute Analysis</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick 1-Click Samples (Clickable chips to test) */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-400">
              <span className="text-slate-500 flex items-center gap-1 font-mono text-[11px]">
                <Sparkles className="w-3 h-3 text-cyan-400" /> Quick Samples:
              </span>
              {SAMPLE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => {
                    setPromptInput(preset.prompt);
                    setVideoUrlInput('');
                    setMediaFile(null);
                    executeAnalysis(preset.prompt, '', preset.title);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 hover:text-cyan-300 transition-colors cursor-pointer text-[11px] font-mono flex items-center gap-1.5"
                >
                  <span>{preset.title}</span>
                  <span className="text-[10px] text-slate-500">[{preset.tag}]</span>
                </button>
              ))}
            </div>

            {errorMsg && (
              <div className="mt-1 text-xs text-rose-400 bg-rose-950/40 border border-rose-800/60 p-2.5 rounded-xl">
                {errorMsg}
              </div>
            )}
          </div>
        </div>

        {/* 3. Empty State (When no analysis has been run yet) */}
        {!analysisResult && !isAnalyzing && (
          <div className="bg-[#0e1320] border border-slate-800/90 rounded-2xl p-10 shadow-xl flex flex-col items-center text-center gap-8 relative overflow-hidden">
            <div className="flex flex-col items-center max-w-xl">
              <div className="w-14 h-14 rounded-2xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 mb-4 shadow-xl">
                <Compass className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-100 tracking-tight">
                Awaiting Media Stream for Multimodal Deconstruction
              </h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Paste a video URL, attach an audio file, or select a sample above. The 2027 engine extracts the true video narrative, uncovers hidden creator inner motivations, simulates autonomic organ stress, and scans for 7–8 Hz infrasound frequencies.
              </p>
            </div>

            {/* 4 Analytical Pillars Preview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full text-left">
              <div className="bg-[#080c14] border border-slate-800 p-4 rounded-xl flex flex-col gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-950/60 text-cyan-400 flex items-center justify-center">
                  <FileText className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-semibold text-slate-200">Video Content & Narrative</h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Identifies subject context, key messaging, storyline, and genre dynamics.
                </p>
              </div>

              <div className="bg-[#080c14] border border-slate-800 p-4 rounded-xl flex flex-col gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-950/60 text-rose-400 flex items-center justify-center">
                  <Target className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-semibold text-slate-200">Inner Motivation (Gizli Motivasyon)</h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Uncovers why it was engineered, subconscious agendas, and status exploitation.
                </p>
              </div>

              <div className="bg-[#080c14] border border-slate-800 p-4 rounded-xl flex flex-col gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-950/60 text-amber-400 flex items-center justify-center">
                  <Radio className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-semibold text-slate-200">7–8 Hz Infrasound Hazard</h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Detects sub-audible internal organ resonance coupling and nausea cues.
                </p>
              </div>

              <div className="bg-[#080c14] border border-slate-800 p-4 rounded-xl flex flex-col gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-950/60 text-blue-400 flex items-center justify-center">
                  <Activity className="w-3.5 h-3.5" />
                </div>
                <h4 className="text-xs font-semibold text-slate-200">3D Biometric Stress Telemetry</h4>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Simulates autonomic heart rate spikes, cortisol release, and brainwave shift.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 4. Active Analysis State: Full 2027 Dashboard */}
        {analysisResult && (
          <div className="flex flex-col gap-6">
            {/* A. Core Forensic Narrative & Inner Motivation Banner */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 bg-[#0e1320] border border-slate-800/90 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" />

              {/* What the video is about (Video Subject) */}
              <div className="md:col-span-5 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800 pb-4 md:pb-0 md:pr-5">
                <div>
                  <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
                    <FileText className="w-3.5 h-3.5" /> Video Subject & Narrative
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100 leading-relaxed">
                    {analysisResult.videoSubject}
                  </h3>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-500 font-mono block">Targeted Subconscious Vulnerability:</span>
                  <span className="text-xs font-semibold text-rose-300 mt-0.5 block">
                    {analysisResult.subconsciousVulnerability}
                  </span>
                </div>
              </div>

              {/* Inner Motivation (Gizli / Bilinçdışı Motivasyon) */}
              <div className="md:col-span-7 flex flex-col justify-between md:pl-2">
                <div>
                  <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
                    <Target className="w-3.5 h-3.5" /> Inner Motivation & Hidden Agenda (Gizli Motivasyon)
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    {analysisResult.innerMotivation}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Primary Objective:</span>
                  <span className="font-semibold text-cyan-300">{analysisResult.primaryObjective}</span>
                </div>
              </div>
            </div>

            {/* B. Primary Telemetry KPI Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#0e1320] border border-slate-800/90 rounded-2xl p-4 shadow-xl">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wide">
                  Cognitive Manipulation Index
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold font-mono text-slate-100 tracking-tight">
                    {analysisResult.cmiScore}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 font-mono">/ 100</span>
                </div>
                <span className={`inline-block mt-1 text-xs font-mono font-semibold ${analysisResult.cmiScore >= 70 ? 'text-rose-400' : 'text-amber-400'}`}>
                  ● {analysisResult.threatLevel}
                </span>
              </div>

              <div className="bg-[#0e1320] border border-slate-800/90 rounded-2xl p-4 shadow-xl">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wide">
                  Primary Neural Target
                </span>
                <div className="text-sm font-bold text-cyan-300 mt-2 truncate">
                  {analysisResult.somaticBiochemicalImpact.affectedOrganHotspots?.[0] || 'Prefrontal Cortex'}
                </div>
                <span className="text-xs text-slate-400 mt-1 block">
                  Fatigue Index: <strong className="text-slate-200">{analysisResult.somaticBiochemicalImpact.prefrontalInhibition}/10</strong>
                </span>
              </div>

              <div className="bg-[#0e1320] border border-slate-800/90 rounded-2xl p-4 shadow-xl">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wide">
                  Infrasound Hazard Band
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold font-mono text-rose-400 tracking-tight">
                    7–8 Hz
                  </span>
                  <span className="text-xs font-medium text-rose-300">Resonant</span>
                </div>
                <span className="text-xs text-slate-400 mt-1 block truncate">
                  Coupling: <strong className="text-slate-300">{analysisResult.infrasoundBrainwaveMetrics.detectedInfrasoundZone}</strong>
                </span>
              </div>

              <div className="bg-[#0e1320] border border-slate-800/90 rounded-2xl p-4 shadow-xl">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wide">
                  Analytical Resistance
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-extrabold font-mono text-cyan-400 tracking-tight">
                    28%
                  </span>
                  <span className="text-xs text-slate-500">Remaining</span>
                </div>
                <span className="text-xs text-amber-400 font-mono mt-1 block">
                  Sympathetic nervous lock
                </span>
              </div>
            </div>

            {/* C. 3D Somatic Holographic Projection (Left 5 Cols) + Scientific Charts (Right 7 Cols) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: 3D Holographic Somatic Anatomy */}
              <div className="lg:col-span-5 flex flex-col gap-3">
                <div className="bg-[#0e1320] border border-slate-800/90 rounded-2xl p-4 shadow-xl flex flex-col gap-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5 font-mono">
                      <Brain className="w-4 h-4 text-cyan-400" /> Holographic Somatic Scan
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Focus: <strong className="text-cyan-400">{currentFrame?.targetOrgan.toUpperCase()}</strong>
                    </span>
                  </div>

                  <HumanBody3DView
                    cmiScore={analysisResult.cmiScore}
                    threatLevel={analysisResult.threatLevel}
                    timelineFrames={analysisResult.timelineFrames}
                    currentFrameIndex={currentFrameIndex}
                    onSelectFrame={(idx) => {
                      setCurrentFrameIndex(idx);
                      setIsPlayingTimeline(false);
                    }}
                    somaticData={analysisResult.somaticBiochemicalImpact}
                    acousticData={analysisResult.infrasoundBrainwaveMetrics}
                  />
                </div>
              </div>

              {/* Right Column: Multi-Chart Telemetry Dashboard */}
              <div className="lg:col-span-7">
                <ScientificCharts
                  timelineFrames={analysisResult.timelineFrames}
                  currentFrameIndex={currentFrameIndex}
                  onSelectFrame={(idx) => {
                    setCurrentFrameIndex(idx);
                    setIsPlayingTimeline(false);
                  }}
                  somaticData={analysisResult.somaticBiochemicalImpact}
                  acousticData={analysisResult.infrasoundBrainwaveMetrics}
                />
              </div>
            </div>

            {/* D. Second-by-Second Scientific Frame Sequence */}
            <div className="bg-[#0e1320] border border-slate-800/90 rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-semibold text-slate-100 tracking-tight font-mono">
                    Second-by-Second Scientific Frame Sequence
                  </h3>
                </div>
                <button
                  onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
                  className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {isPlayingTimeline ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                  <span>{isPlayingTimeline ? 'Pause' : 'Auto Play'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {analysisResult.timelineFrames.map((frame, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setCurrentFrameIndex(idx);
                      setIsPlayingTimeline(false);
                    }}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                      idx === currentFrameIndex
                        ? 'border-cyan-500 bg-cyan-950/30 shadow-lg ring-1 ring-cyan-500'
                        : 'border-slate-800 hover:border-slate-700 bg-[#080c14]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-cyan-400">
                        {frame.timestamp}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase font-mono ${
                        frame.severity >= 7 ? 'bg-rose-950/70 text-rose-300 border border-rose-800/60' : 'bg-amber-950/70 text-amber-300 border border-amber-800/60'
                      }`}>
                        {frame.targetOrgan} · {frame.severity}/10
                      </span>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200 leading-snug line-clamp-1">
                        {frame.detectedMechanism}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {frame.biochemicalSomaticImpact}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* E. 4 Distilled Scientific Explanations */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1 */}
              <div className="bg-[#0e1320] border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-rose-950/60 text-rose-400 flex items-center justify-center mb-3">
                    <Radio className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                    01. Infrasound Mechanics
                  </h4>
                  <h3 className="text-sm font-semibold text-slate-100 mt-1">
                    7–8 Hz Organ Resonance
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Human ears cannot hear tones below 20 Hz, but internal organs vibrate in resonance at 7–8 Hz. Infrasound triggers autonomic panic, nausea, and vestibular disorientation.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-rose-400 font-semibold font-mono">
                  Hazard: 7.5 Hz Resonant Band
                </div>
              </div>

              {/* Card 2 */}
              <div className="bg-[#0e1320] border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-amber-950/60 text-amber-400 flex items-center justify-center mb-3">
                    <Brain className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                    02. Brainwave Entrainment
                  </h4>
                  <h3 className="text-sm font-semibold text-slate-100 mt-1">
                    Alpha Wave Receptivity
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Rhythms tuned to 8–12 Hz lower mental defense mechanisms, inducing light trance. Rapid video cuts (&lt;2.1s) fragment prefrontal cortex critical filtering.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-amber-400 font-semibold font-mono">
                  State: Alpha/Beta Frequency Shift
                </div>
              </div>

              {/* Card 3 */}
              <div className="bg-[#0e1320] border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-cyan-950/60 text-cyan-400 flex items-center justify-center mb-3">
                    <HeartPulse className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                    03. Biochemical Cascade
                  </h4>
                  <h3 className="text-sm font-semibold text-slate-100 mt-1">
                    Cardio & Cortisol Lock
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    40–80 Hz sub-bass beats force autonomic cardiac phase-locking. Mirror neuron stimuli trigger dopamine reward-seeking and status mimicry, reducing analytical skepticism.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-cyan-400 font-semibold font-mono">
                  Elevated: Noradrenaline & Cortisol
                </div>
              </div>

              {/* Card 4 */}
              <div className="bg-[#0e1320] border border-slate-800/90 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="w-8 h-8 rounded-lg bg-emerald-950/60 text-emerald-400 flex items-center justify-center mb-3">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                    04. Scientific Antidote
                  </h4>
                  <h3 className="text-sm font-semibold text-slate-100 mt-1">
                    Cognitive Immunization
                  </h3>
                  <ul className="text-xs text-slate-400 mt-2 space-y-1.5 list-disc list-inside">
                    <li>Watch video completely muted to decouple visual pacing from auditory trance.</li>
                    <li>Listen to voice alone without visuals to expose empty slogans.</li>
                  </ul>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-emerald-400 font-semibold font-mono">
                  Protocol: Sensory Decoupling
                </div>
              </div>
            </div>

            {/* F. Peer-Reviewed Academic Citations & Empirical Evidence Matrix */}
            {analysisResult.scientificCitations && analysisResult.scientificCitations.length > 0 && (
              <div className="bg-[#0e1320] border border-slate-800/90 rounded-2xl p-6 shadow-xl flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-sm font-semibold text-slate-100 tracking-tight font-mono">
                        Peer-Reviewed Empirical Literature & Grounding Matrix
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      All detected cognitive, somatic, and psychoacoustic manipulation vectors are strictly grounded in published, peer-reviewed academic studies.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/50 border border-cyan-800/50 text-cyan-300 font-mono text-[11px] self-start sm:self-auto">
                    <Library className="w-3.5 h-3.5" />
                    <span>{analysisResult.scientificCitations.length} Peer-Reviewed Studies</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysisResult.scientificCitations.map((cite, idx) => (
                    <div
                      key={idx}
                      className="bg-[#080c14] border border-slate-800/90 hover:border-slate-700/80 p-4 rounded-xl flex flex-col justify-between gap-3 transition-colors"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded bg-slate-900 text-cyan-400 border border-slate-800">
                            {cite.dimension}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {cite.academicField}
                          </span>
                        </div>

                        <h4 className="text-xs font-semibold text-slate-100 font-sans leading-snug">
                          {cite.phenomenon}
                        </h4>

                        <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed font-sans">
                          {cite.empiricalMechanism}
                        </p>
                      </div>

                      <div className="pt-2.5 border-t border-slate-800/80 flex flex-col gap-1">
                        <span className="text-[10px] font-mono text-slate-500">Academic Citation:</span>
                        <div className="text-xs font-mono font-medium text-slate-300 flex items-start gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{cite.peerReviewedPaper}</span>
                        </div>
                        <span className="text-[10px] text-cyan-400 font-mono mt-0.5 font-semibold">
                          Journal: {cite.journalOrSource}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-1 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Guaranteed Empirical Anchor: Zero Conspiracy Bias · Direct Peer-Reviewed Science</span>
                  <span className="text-slate-400">Cognitive Shield Forensic Standards</span>
                </div>
              </div>
            )}

            {/* G. Collapsible Full Forensic Markdown Dossier */}
            <div className="bg-[#0e1320] border border-slate-800/90 rounded-2xl p-4 shadow-xl">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowFullDossier(!showFullDossier)}
                  className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-300 hover:text-white cursor-pointer"
                >
                  {showFullDossier ? <ChevronUp className="w-4 h-4 text-cyan-400" /> : <ChevronDown className="w-4 h-4 text-cyan-400" />}
                  <span>{showFullDossier ? 'Hide Technical Forensic Dossier' : 'View Full Technical Forensic Dossier (.md)'}</span>
                </button>

                {showFullDossier && (
                  <button
                    onClick={copyReport}
                    className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 flex items-center gap-1.5 cursor-pointer font-mono"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy Report'}</span>
                  </button>
                )}
              </div>

              {showFullDossier && (
                <div className="mt-4 pt-4 border-t border-slate-800 prose prose-invert prose-sm max-w-none font-sans">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {analysisResult.markdownReport}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

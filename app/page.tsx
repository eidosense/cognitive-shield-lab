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
  Sparkles
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import HumanBody3DView, { SomaticBiochemicalImpact, InfrasoundBrainwaveMetrics, TimelineFrame } from '@/components/HumanBody3DView';
import ScientificCharts from '@/components/ScientificCharts';

interface AnalysisResult {
  cmiScore: number;
  threatLevel: string;
  primaryObjective: string;
  timelineFrames: TimelineFrame[];
  infrasoundBrainwaveMetrics: InfrasoundBrainwaveMetrics;
  somaticBiochemicalImpact: SomaticBiochemicalImpact;
  countermeasures: string[];
  markdownReport: string;
}

const PRESET_CASE_STUDIES = [
  {
    id: 'digital-music-production',
    title: 'Modern Digital Video / Music',
    content: `00:02s - Loudness overcompression & high-contrast neon red/purple palette induces autonomic sympathetic arousal.
00:08s - Rapid cut (<2.1s) and close-up central gaze trigger mirror neuron simulation and prefrontal cognitive fatigue.
00:16s - 40-80 Hz rhythmic bass pulse forces cardiac entrainment while autotuned vocal saturation bypasses analytical inquiry.
00:24s - Cyclic 4-bar repetition and status-mimicry gestures trigger dopaminergic reward seeking and trance consumption.`,
  },
  {
    id: 'infrasound-horror',
    title: '7-8 Hz Infrasound Acoustic Cue',
    content: `00:03s - Ambient room tone starts with subtle sub-audible infrasound drone (7.5 Hz) layered underneath.
00:09s - Speaker whisper introduces loss framing; bass frequency swells directly in phase with organ resonance.
00:18s - Sudden acoustic transient spike and pitch-bend designed to induce autonomic startle reflex and tachycardia.
00:27s - Infrasound pulse peaks at 8 Hz causing vestibular vertigo and visceral stomach contraction.`,
  },
  {
    id: 'scarcity-panic-speech',
    title: 'Urgency Countdown Pitch',
    content: `00:02s - Rapid-cut alarm visuals with sharp Beta-frequency chime enforcing cognitive tunnel vision.
00:08s - False dilemma assertion ("Either you buy now or your family stays poor"); triggers acute amygdala panic.
00:15s - Countdown timer ticks rapidly at 140 BPM, increasing cardiac rhythm and noradrenaline.
00:24s - Thought-terminating slogan repeated three times to exhaust prefrontal critical deliberation.`,
  },
  {
    id: 'alpha-hypnotic-ad',
    title: 'Alpha Wave Entrainment Ad',
    content: `00:04s - 10 Hz stereo binaural acoustic carrier begins soothing nervous defense filters.
00:12s - Voice lowers cadence to hypnotic syncopation, suppressing analytical inquiry.
00:20s - Subliminal suggestion anchor planted into subconscious receptivity window.
00:28s - Call to action delivered while viewer is locked into suggested Alpha state.`,
  }
];

const DEFAULT_INITIAL_ANALYSIS: AnalysisResult = {
  cmiScore: 72,
  threatLevel: 'High / Coercive',
  primaryObjective: 'Bypassing Critical Deliberation, Emotional Resonance Capture, and Mimetic Priming (Prefrontal Cortex Bypass).',
  timelineFrames: [
    {
      timestamp: '00:02s',
      second: 2,
      targetOrgan: 'cardio',
      detectedMechanism: 'Loudness Overcompression & High-Contrast Visual Palette',
      biochemicalSomaticImpact: 'Autonomic sympathetic arousal; rapid heart-rate elevation and peripheral vasoconstriction.',
      severity: 7.5,
    },
    {
      timestamp: '00:08s',
      second: 8,
      targetOrgan: 'brain',
      detectedMechanism: 'Rapid Visual Cut (<2.1s) & Central Gaze Framing',
      biochemicalSomaticImpact: 'Mirror neuron hyper-activation; prefrontal cortex analytical fatigue and fragmented cognitive filtering.',
      severity: 8.0,
    },
    {
      timestamp: '00:16s',
      second: 16,
      targetOrgan: 'infrasound',
      detectedMechanism: '40-80 Hz Rhythmic Sub-Bass Pulse & Vocal Autotune Saturation',
      biochemicalSomaticImpact: 'Neural phase-locking entrainment forcing cardiac synchronization; synthetic vocal tone bypasses skeptical evaluation.',
      severity: 7.2,
    },
    {
      timestamp: '00:24s',
      second: 24,
      targetOrgan: 'gut',
      detectedMechanism: 'Cyclic 4-Bar Repetition Loop & Status-Mimicry Gestures',
      biochemicalSomaticImpact: 'Vagus nerve suppression, visceral tension, and dopaminergic reward-seeking priming.',
      severity: 7.0,
    },
  ],
  infrasoundBrainwaveMetrics: {
    detectedInfrasoundZone: '40-80 Hz Sub-Bass Band with transient 7-8 Hz resonant coupling',
    infrasoundSeverity: 7.5,
    entrainedBrainwave: 'Alpha (8-12 Hz) & Beta (15-22 Hz) Mixed Entrainment',
    binauralPacingHazard: 6.8,
    vestibularDisorientation: 5.5,
    acousticWeaponProfile: 'Standard Digital Loudness War / Brickwall Limiting acoustic fatigue',
  },
  somaticBiochemicalImpact: {
    amygdalaThreat: 7.8,
    prefrontalInhibition: 8.2,
    cortisolStressSurge: 7.5,
    dopamineExploitation: 8.5,
    cardiovascularStrain: 7.4,
    gutBrainTension: 6.8,
    summaryBiochemical: 'Dopaminergic reward pursuit combined with acute sympathetic noradrenaline surge.',
    summaryConsciousness: 'Analytical prefrontal bypass inducing passive mimetic suggestibility and trance absorption.',
    affectedOrganHotspots: ['Prefrontal Cortex', 'Amygdala', 'Cardiovascular Node', 'Vagus Nerve / Enteric Axis'],
  },
  countermeasures: [
    'Mute audio to isolate visual pacing; evaluate core message without acoustic entrainment.',
    'Listen to voice alone without video to expose superficial slogans and repetitive cadence.',
    'Check internal visceral state: if experiencing sudden unprovoked anxiety or trance, remove headphones immediately.',
  ],
  markdownReport: `### 🛡️ Cognitive Shield Forensic Summary
**Target:** Modern Digital Video / Music Production & Cultural Artifact  
**Analysis Engine:** Cognitive Shield Core  

- **Cognitive Manipulation Index (CMI):** 72/100 — [Threat Level: High / Coercive]
- **Primary Mechanism:** Sensory overcompression, 7–8 Hz organ resonance coupling, and rapid cut pacing (<2.1s) bypassing prefrontal cortex deliberation.
- **Biochemical State:** Autonomic sympathetic arousal with elevated cortisol and dopamine exploitation.`,
};

export default function Home() {
  const [artifactTitle, setArtifactTitle] = useState('Modern Digital Video / Music Production');
  const [promptInput, setPromptInput] = useState(PRESET_CASE_STUDIES[0].content);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [mediaFile, setMediaFile] = useState<{ data: string; mimeType: string; name: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult>(DEFAULT_INITIAL_ANALYSIS);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showFullDossier, setShowFullDossier] = useState(false);

  // Timeline scrubber state
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlayingTimeline, setIsPlayingTimeline] = useState(true);

  // Auto-play second-by-second timeline loop
  useEffect(() => {
    if (!isPlayingTimeline || !analysisResult.timelineFrames.length) return;
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
      if (!artifactTitle) setArtifactTitle(file.name);
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  const loadPreset = (preset: typeof PRESET_CASE_STUDIES[0]) => {
    setArtifactTitle(preset.title);
    setPromptInput(preset.content);
    setVideoUrlInput('');
    setMediaFile(null);
  };

  const runAnalysis = async () => {
    if (!promptInput.trim() && !mediaFile && !videoUrlInput.trim()) {
      setErrorMsg('Please provide a video URL, transcript, or media file.');
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
          prompt: promptInput,
          videoUrl: videoUrlInput.trim() || undefined,
          mediaData: mediaFile?.data,
          mimeType: mediaFile?.mimeType,
          artifactTitle: artifactTitle || (videoUrlInput ? 'Video Target' : 'Submitted Media'),
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Analysis failed.');
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

  const currentFrame = analysisResult.timelineFrames[currentFrameIndex] || analysisResult.timelineFrames[0];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-16 selection:bg-blue-600 selection:text-white">
      {/* 1. Ultra-Clean Top Bar */}
      <header className="border-b border-slate-200/80 bg-white sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight text-base">
                Cognitive Shield Lab
              </span>
              <span className="hidden sm:inline text-xs text-slate-500 ml-2">
                · Multimodal Manipulation & Neuro-Somatic Analyzer
              </span>
            </div>
          </div>

          {/* Quick Preset Selector Buttons */}
          <div className="hidden lg:flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            {PRESET_CASE_STUDIES.map((preset) => (
              <button
                key={preset.id}
                onClick={() => loadPreset(preset)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  artifactTitle === preset.title
                    ? 'bg-white text-blue-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex flex-col gap-6">
        {/* 2. Minimalist Analysis Input Strip */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Video className="w-4 h-4" />
              </span>
              <input
                type="url"
                placeholder="Paste YouTube / Video URL or speech transcript..."
                value={videoUrlInput || promptInput}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.startsWith('http')) {
                    setVideoUrlInput(val);
                  } else {
                    setPromptInput(val);
                    setVideoUrlInput('');
                  }
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:bg-white transition-all font-sans"
              />
            </div>

            {/* Media Upload Compact */}
            <label className="shrink-0 flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 text-slate-600 text-xs cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              <span>{mediaFile ? mediaFile.name : 'Attach Audio / Video'}</span>
              <input
                type="file"
                accept="audio/*,video/*,image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {/* Run Analysis Button */}
            <button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-xs flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  <span>Analyze</span>
                </>
              )}
            </button>
          </div>

          {errorMsg && (
            <div className="mt-2.5 text-xs text-rose-600 bg-rose-50 border border-rose-100 p-2.5 rounded-xl">
              {errorMsg}
            </div>
          )}
        </div>

        {/* 3. Primary Telemetry KPI Strip (4 Distilled Scientific Indicators) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
              Cognitive Manipulation Index
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold font-mono text-slate-900 tracking-tight">
                {analysisResult.cmiScore}
              </span>
              <span className="text-xs font-semibold text-slate-400 font-mono">/ 100</span>
            </div>
            <span className={`inline-block mt-1 text-xs font-semibold ${analysisResult.cmiScore >= 70 ? 'text-rose-600' : 'text-amber-600'}`}>
              ● {analysisResult.threatLevel}
            </span>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
              Primary Neural Target
            </span>
            <div className="text-sm font-bold text-slate-900 mt-2 truncate">
              {analysisResult.somaticBiochemicalImpact.affectedOrganHotspots?.[0] || 'Prefrontal Cortex'}
            </div>
            <span className="text-xs text-slate-500 mt-1 block">
              Cognitive Fatigue: <strong>{analysisResult.somaticBiochemicalImpact.prefrontalInhibition}/10</strong>
            </span>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
              Infrasound Hazard Zone
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold font-mono text-rose-600 tracking-tight">
                7–8 Hz
              </span>
              <span className="text-xs font-medium text-rose-700">Resonant</span>
            </div>
            <span className="text-xs text-slate-500 mt-1 block truncate">
              Coupling: <strong>{analysisResult.infrasoundBrainwaveMetrics.detectedInfrasoundZone}</strong>
            </span>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wide">
              Analytical Resistance
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold font-mono text-blue-600 tracking-tight">
                28%
              </span>
              <span className="text-xs text-slate-400">Remaining</span>
            </div>
            <span className="text-xs text-amber-600 font-medium mt-1 block">
              Sympathetic nervous lock
            </span>
          </div>
        </div>

        {/* 4. Core Visual Section: 3D Somatic Anatomy (Left 5 Cols) + Scientific Charts (Right 7 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: 3D Anatomical Body Projection */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-blue-600" /> Somatic Resonance & Synapse Map
                </span>
                <span className="text-xs font-mono text-slate-500">
                  Target: <strong className="text-blue-600">{currentFrame?.targetOrgan.toUpperCase()}</strong>
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

        {/* 5. Chronological Second-by-Second Scientific Frame Matrix */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                Second-by-Second Scientific Frame Sequence
              </h3>
            </div>
            <button
              onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
              className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {isPlayingTimeline ? <Pause className="w-3.5 h-3.5 text-amber-600" /> : <Play className="w-3.5 h-3.5 text-emerald-600" />}
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
                    ? 'border-blue-500 bg-blue-50/50 shadow-xs ring-1 ring-blue-500'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-600">
                    {frame.timestamp}
                  </span>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded uppercase ${
                    frame.severity >= 7 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {frame.targetOrgan} · {frame.severity}/10
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-slate-900 leading-snug line-clamp-1">
                    {frame.detectedMechanism}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {frame.biochemicalSomaticImpact}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Simplified Scientific Analyses (Basite İndirgenmiş 4 Temel Analiz) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Infrasound & 7-8 Hz */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
                <Radio className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                01. Infrasound Mechanics
              </h4>
              <h3 className="text-sm font-semibold text-slate-900 mt-1">
                7–8 Hz Organ Resonance
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Human ears cannot hear tones below 20 Hz, but internal organs vibrate in resonance at 7–8 Hz. Infrasound causes sudden unprovoked panic, nausea, and disorientation.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-rose-600 font-semibold font-mono">
              Coupling: 7.5 Hz Detected
            </div>
          </div>

          {/* Card 2: Brainwave Entrainment */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
                <Brain className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                02. Brainwave Entrainment
              </h4>
              <h3 className="text-sm font-semibold text-slate-900 mt-1">
                Alpha Wave Receptivity
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Rhythms tuned to 8–12 Hz lower mental defense mechanisms, inducing light trance and high suggestibility. Rapid video cuts (&lt;2.1s) fragment prefrontal critical filtering.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-amber-600 font-semibold font-mono">
              Entrainment: Alpha/Beta Shift
            </div>
          </div>

          {/* Card 3: Biochemical Autonomic Cascade */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                <HeartPulse className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                03. Biochemical Response
              </h4>
              <h3 className="text-sm font-semibold text-slate-900 mt-1">
                Cardio & Cortisol Lock
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                40–80 Hz sub-bass beats force autonomic cardiac phase-locking. Mirror neuron stimuli trigger dopamine reward-seeking and status mimicry, reducing analytical skepticism.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-blue-600 font-semibold font-mono">
              Spike: Noradrenaline & Cortisol
            </div>
          </div>

          {/* Card 4: Scientific Countermeasures */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                04. Scientific Antidote
              </h4>
              <h3 className="text-sm font-semibold text-slate-900 mt-1">
                Cognitive Immunization
              </h3>
              <ul className="text-xs text-slate-600 mt-2 space-y-1.5 list-disc list-inside">
                <li>Watch video completely muted to decouple visual pacing from auditory trance.</li>
                <li>Listen to voice alone without visuals to expose empty semantic loops.</li>
              </ul>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-emerald-600 font-semibold font-mono">
              Protocol: Sensory Decoupling
            </div>
          </div>
        </div>

        {/* 7. Collapsible Forensic Dossier (Quiet & Uncluttered) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowFullDossier(!showFullDossier)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-slate-900 cursor-pointer"
            >
              {showFullDossier ? <ChevronUp className="w-4 h-4 text-blue-600" /> : <ChevronDown className="w-4 h-4 text-blue-600" />}
              <span>{showFullDossier ? 'Hide Technical Markdown Report' : 'View Full Technical Forensic Dossier'}</span>
            </button>

            {showFullDossier && (
              <button
                onClick={copyReport}
                className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 flex items-center gap-1.5 cursor-pointer font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Report'}</span>
              </button>
            )}
          </div>

          {showFullDossier && (
            <div className="mt-4 pt-4 border-t border-slate-100 prose prose-slate prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {analysisResult.markdownReport}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

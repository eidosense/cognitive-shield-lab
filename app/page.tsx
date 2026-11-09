'use client';

import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Upload, 
  AlertTriangle, 
  Download, 
  Copy, 
  Check, 
  RefreshCw, 
  Video, 
  Zap,
  Clock,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import HumanBody3DView, { SomaticBiochemicalImpact, InfrasoundBrainwaveMetrics, TimelineFrame } from '@/components/HumanBody3DView';
import BiometricStressDashboard from '@/components/BiometricStressDashboard';

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
    title: 'Modern Digital Video / Music Production',
    content: `00:02s - Loudness overcompression & high-contrast neon red/purple palette induces autonomic sympathetic arousal.
00:08s - Rapid cut (<2.1s) and close-up central gaze trigger mirror neuron simulation and prefrontal cognitive fatigue.
00:16s - 40-80 Hz rhythmic bass pulse forces cardiac entrainment while autotuned vocal saturation bypasses analytical inquiry.
00:24s - Cyclic 4-bar repetition and status-mimicry gestures trigger dopaminergic reward seeking and trance consumption.`,
  },
  {
    id: 'infrasound-horror',
    title: '7-8 Hz Infrasound Film Cue',
    content: '00:03s - Ambient room tone starts with subtle sub-audible infrasound drone (7.5 Hz) layered underneath.\n00:09s - Speaker whisper introduces loss framing; bass frequency swells directly in phase with organ resonance.\n00:18s - Sudden acoustic transient spike and pitch-bend designed to induce autonomic startle reflex and tachycardia.\n00:27s - Infrasound pulse peaks at 8 Hz causing vestibular vertigo and visceral stomach contraction.',
  },
  {
    id: 'scarcity-panic-speech',
    title: '4-Min Urgency Countdown Pitch',
    content: '00:02s - Rapid-cut alarm visuals with sharp Beta-frequency chime enforcing cognitive tunnel vision.\n00:08s - False dilemma assertion ("Either you buy now or your family stays poor"); triggers acute amygdala panic.\n00:15s - Countdown timer ticks rapidly at 140 BPM, increasing cardiac rhythm and noradrenaline.\n00:24s - Thought-terminating slogan repeated three times to exhaust prefrontal critical deliberation.',
  },
  {
    id: 'alpha-hypnotic-ad',
    title: 'Alpha Wave Entrainment Ad',
    content: '00:04s - 10 Hz stereo binaural acoustic carrier begins soothing nervous defense filters.\n00:12s - Voice lowers cadence to hypnotic syncopation, suppressing analytical inquiry.\n00:20s - Subliminal suggestion anchor planted into subconscious receptivity window.\n00:28s - Call to action delivered while viewer is locked into suggested Alpha state.',
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
    'Watch the video with sound completely muted to observe the artificial visual pacing and status postures without auditory hypnosis.',
    'Listen to the audio with screen off; evaluate whether words have rational factual value or are empty rhythmic loops.',
    'Ask: "What specific visceral emotion is this rapid cut sequence and compressed bass trying to elicit in my body?"',
  ],
  markdownReport: `### 🛡️ Cognitive Shield Analysis Report
**Target Artifact:** Modern Digital Video / Music Production & Cultural Artifact  
**Developed by:** Cognitive Shield Lab  

#### 1. Executive Summary & Scoring
- **Cognitive Manipulation Index (CMI):** 72/100 — [Threat Level: High / Coercive]
- **Primary Objective:** Bypassing Critical Deliberation, Emotional Resonance Capture, and Mimetic Priming (Prefrontal Cortex Bypass).
- **Target Vulnerability:** Dopaminergic reward-seeking, mirror-neuron resonance, and prefrontal cognitive fatigue.

#### 2. Vector Breakdown
- **Acoustic & Audio Elements:** Industry-standard 440 Hz carrier tuning with brickwall limiting. Sub-audible 40–80 Hz rhythmic pulse induces autonomic sympathetic arousal (cardiac entrainment). Hyper-compressed vocal autotune removes natural vocal flaws to craft hypnotic smoothness.
- **Visuals, Chromatics & Semiotics:** Saturated warm tones (red/orange desire triggers) combined with cold neon tones (synthetic authority). Central composition and close-up gaze trigger mirror neuron simulation.
- **Speech & Linguistic Traps:** Cyclic chant loops (semantic satiation), thought-terminating slogans, and cognitive ease exploitation.
- **Behavioral & Non-Verbal Dynamics:** Hyper-confidence micro-postures designed to prime status mimicry and subconscious belonging.

#### 3. Mathematical & Algorithmic Rigor
- **Cuts-Per-Minute (CPM):** Average scene transition every 1.8 – 2.4 seconds, outrunning deliberate rational processing.
- **Repetition Cycles:** 4 and 8-bar cyclic patterns inducing neural phase locking.

#### 4. Cognitive Countermeasures
- Watch video completely muted to decouple visual acting from acoustic entrainment.
- Listen to audio alone without video to expose superficial semantic slogans.
- Ask: "What bodily arousal state is this media attempting to manufacture?"`
};

export default function Home() {
  const [artifactTitle, setArtifactTitle] = useState('Modern Digital Video / Music Production');
  const [promptInput, setPromptInput] = useState(PRESET_CASE_STUDIES[0].content);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [mediaFile, setMediaFile] = useState<{ data: string; mimeType: string; name: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(DEFAULT_INITIAL_ANALYSIS);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'3d' | 'report'>('3d');

  // Second-by-second playback state
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isPlayingTimeline, setIsPlayingTimeline] = useState(false);

  // Auto-play second-by-second timeline loop
  useEffect(() => {
    if (!isPlayingTimeline || !analysisResult?.timelineFrames?.length) return;
    const interval = setInterval(() => {
      setCurrentFrameIndex((prev) => (prev + 1) % analysisResult.timelineFrames.length);
    }, 2800);
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
      setIsPlayingTimeline(true); // Automatically start frame-by-frame simulation!
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

  const downloadReport = () => {
    if (analysisResult?.markdownReport) {
      const blob = new Blob([analysisResult.markdownReport], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Cognitive_Audit_${artifactTitle.replace(/\s+/g, '_') || 'Report'}.md`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const currentFrame = analysisResult?.timelineFrames?.[currentFrameIndex] || null;

  return (
    <div className="min-h-screen bg-[#010409] text-[#c9d1d9] flex flex-col font-sans selection:bg-[#58a6ff]/30 selection:text-white">
      {/* Header */}
      <header className="border-b border-[#21262d] bg-[#0d1117] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#161b22] border border-[#30363d] flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-[#58a6ff]" />
          </div>
          <span className="font-bold text-sm text-[#f0f6fc] tracking-tight">
            COGNITIVE SHIELD
          </span>
        </div>

        {/* Preset Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {PRESET_CASE_STUDIES.map((preset) => (
            <button
              key={preset.id}
              onClick={() => loadPreset(preset)}
              className="px-2.5 py-1 rounded text-[11px] font-mono bg-[#161b22] hover:bg-[#21262d] text-[#8b949e] hover:text-[#58a6ff] border border-[#30363d] transition-colors cursor-pointer whitespace-nowrap"
            >
              {preset.title}
            </button>
          ))}
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Input Pipeline (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 flex flex-col gap-3 shadow-sm">
            <div>
              <input
                type="text"
                placeholder="Video / Artifact Title..."
                value={artifactTitle}
                onChange={(e) => setArtifactTitle(e.target.value)}
                className="w-full bg-[#010409] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-[#f0f6fc] placeholder:text-[#484f58] focus:outline-none focus:border-[#58a6ff] transition-colors"
              />
            </div>

            <div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#8b949e]">
                  <Video className="w-3.5 h-3.5" />
                </span>
                <input
                  type="url"
                  placeholder="Paste YouTube or MP4 Video URL..."
                  value={videoUrlInput}
                  onChange={(e) => setVideoUrlInput(e.target.value)}
                  className="w-full bg-[#010409] border border-[#30363d] rounded-lg pl-9 pr-3 py-2 text-xs text-[#f0f6fc] placeholder:text-[#484f58] focus:outline-none focus:border-[#58a6ff] transition-colors"
                />
              </div>
            </div>

            <div>
              <textarea
                rows={3}
                placeholder="Paste transcript, speech timestamps, or sound cues..."
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                className="w-full bg-[#010409] border border-[#30363d] rounded-lg p-3 text-xs text-[#f0f6fc] placeholder:text-[#484f58] focus:outline-none focus:border-[#58a6ff] transition-colors resize-y font-mono"
              />
            </div>

            {/* Media Upload Compact */}
            <div className="border border-dashed border-[#30363d] hover:border-[#58a6ff] rounded-lg p-2.5 text-center transition-colors bg-[#010409]/60 relative">
              <input
                type="file"
                accept="audio/*,video/*,image/*"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="flex items-center justify-center gap-2 text-xs text-[#8b949e]">
                <Upload className="w-3.5 h-3.5 text-[#58a6ff]" />
                <span>{mediaFile ? mediaFile.name : 'Attach Audio / Video / Media Binary'}</span>
              </div>
            </div>

            {errorMsg && (
              <div className="p-2 rounded bg-[#f85149]/10 border border-[#da3633] text-[#f85149] text-xs flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="w-full py-2.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Generating Frame-by-Frame Timeline...
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5" />
                  Analyze Second-by-Second
                </>
              )}
            </button>
          </div>

          {/* Chronological Second-by-Second Event List */}
          {analysisResult?.timelineFrames && analysisResult.timelineFrames.length > 0 && (
            <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-[#21262d] pb-2">
                <span className="text-xs font-mono font-bold text-[#f0f6fc] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#58a6ff]" /> Frame Timeline Breakdown
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
                    className="px-2 py-0.5 rounded bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] text-[11px] font-mono flex items-center gap-1 cursor-pointer"
                  >
                    {isPlayingTimeline ? <Pause className="w-3 h-3 text-[#e3b341]" /> : <Play className="w-3 h-3 text-[#3fb950]" />}
                    {isPlayingTimeline ? 'Pause' : 'Auto Play'}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-1">
                {analysisResult.timelineFrames.map((frame, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setCurrentFrameIndex(idx);
                      setIsPlayingTimeline(false);
                    }}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer text-xs font-mono flex items-start justify-between gap-3 ${
                      idx === currentFrameIndex
                        ? 'bg-[#161b22] border-[#58a6ff] text-white shadow-sm'
                        : 'bg-[#010409]/60 border-[#21262d] text-[#8b949e] hover:border-[#30363d]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-[#58a6ff]">{frame.timestamp}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${frame.severity >= 7 ? 'bg-[#f85149]/20 text-[#f85149]' : frame.severity >= 4 ? 'bg-[#d29922]/20 text-[#d29922]' : 'bg-[#3fb950]/20 text-[#3fb950]'}`}>
                          {frame.targetOrgan.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-[#c9d1d9] text-[11px] line-clamp-1">{frame.detectedMechanism}</p>
                      <p className="text-[#8b949e] text-[10px] mt-0.5">{frame.biochemicalSomaticImpact}</p>
                    </div>
                    <span className="text-[11px] font-bold text-[#d29922] shrink-0 mt-1">
                      {frame.severity}/10
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3D Human Body Timeline View (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex items-center justify-between bg-[#0d1117] border border-[#21262d] px-3 py-2 rounded-xl">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('3d')}
                className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${activeTab === '3d' ? 'bg-[#21262d] text-[#58a6ff]' : 'text-[#8b949e] hover:text-white'}`}
              >
                3D Second-by-Second Body View
              </button>
              <button
                onClick={() => setActiveTab('report')}
                className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-all cursor-pointer ${activeTab === 'report' ? 'bg-[#21262d] text-[#58a6ff]' : 'text-[#8b949e] hover:text-white'}`}
              >
                Forensic Dossier
              </button>
            </div>

            {analysisResult && (
              <div className="flex items-center gap-2">
                <button
                  onClick={copyReport}
                  className="px-2 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-xs text-[#c9d1d9] flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-[#3fb950]" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={downloadReport}
                  className="px-2 py-1 rounded bg-[#238636]/20 hover:bg-[#238636]/30 text-[#3fb950] text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" /> Save .md
                </button>
              </div>
            )}
          </div>

          {activeTab === '3d' ? (
            <div className="flex flex-col gap-3">
              <HumanBody3DView
                cmiScore={analysisResult?.cmiScore || 15}
                threatLevel={analysisResult?.threatLevel || 'Minimal'}
                timelineFrames={analysisResult?.timelineFrames || []}
                currentFrameIndex={currentFrameIndex}
                onSelectFrame={(idx) => {
                  setCurrentFrameIndex(idx);
                  setIsPlayingTimeline(false);
                }}
                somaticData={analysisResult?.somaticBiochemicalImpact || null}
                acousticData={analysisResult?.infrasoundBrainwaveMetrics || null}
              />

              {/* Biometric Stress Dashboard using Recharts */}
              {analysisResult?.timelineFrames && analysisResult.timelineFrames.length > 0 && (
                <BiometricStressDashboard
                  timelineFrames={analysisResult.timelineFrames}
                  currentFrameIndex={currentFrameIndex}
                  onSelectFrame={(idx) => {
                    setCurrentFrameIndex(idx);
                    setIsPlayingTimeline(false);
                  }}
                />
              )}

              {/* Dynamic Second-by-Second Live Inspection Card */}
              {currentFrame && (
                <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold font-mono text-[#58a6ff]">{currentFrame.timestamp}</span>
                      <span className="text-xs font-mono text-[#8b949e]">•</span>
                      <span className="text-xs font-bold text-[#f0f6fc]">{currentFrame.detectedMechanism}</span>
                    </div>
                    <p className="text-xs text-[#8b949e]">
                      Biological / Mental Reaction: <strong className="text-[#c9d1d9]">{currentFrame.biochemicalSomaticImpact}</strong>
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => setCurrentFrameIndex((prev) => Math.max(0, prev - 1))}
                      disabled={currentFrameIndex === 0}
                      className="p-1.5 rounded bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setCurrentFrameIndex((prev) => Math.min((analysisResult?.timelineFrames?.length || 1) - 1, prev + 1))}
                      disabled={!analysisResult?.timelineFrames || currentFrameIndex === analysisResult.timelineFrames.length - 1}
                      className="p-1.5 rounded bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] disabled:opacity-40 cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : !analysisResult ? (
            <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-12 text-center text-[#8b949e] text-xs">
              No audit report generated yet. Submit media or select a preset to analyze.
            </div>
          ) : (
            <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-5 overflow-x-auto text-xs text-[#c9d1d9] leading-relaxed markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {analysisResult.markdownReport}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#21262d] bg-[#0d1117] px-6 py-2.5 text-center text-[11px] text-[#8b949e] font-mono">
        Cognitive Shield • Automated Second-by-Second Frame Somatic Diagnostics
      </footer>
    </div>
  );
}

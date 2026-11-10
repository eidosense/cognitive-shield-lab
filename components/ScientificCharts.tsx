'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { Activity, Radio, ShieldAlert } from 'lucide-react';
import { TimelineFrame, SomaticBiochemicalImpact, InfrasoundBrainwaveMetrics } from '@/components/HumanBody3DView';

interface ScientificChartsProps {
  timelineFrames: TimelineFrame[];
  currentFrameIndex: number;
  onSelectFrame: (index: number) => void;
  somaticData: SomaticBiochemicalImpact | null;
  acousticData: InfrasoundBrainwaveMetrics | null;
}

export default function ScientificCharts({
  timelineFrames,
  currentFrameIndex,
  onSelectFrame,
  somaticData,
  acousticData,
}: ScientificChartsProps) {
  // 1. Biometric Stress Response Time-Series
  const timeSeriesData = timelineFrames.map((frame, index) => {
    const sev = frame.severity || 5;
    const organ = frame.targetOrgan.toLowerCase();

    let heartRate = 70 + Math.round(sev * 4.6);
    if (organ.includes('heart') || organ.includes('cardio') || organ.includes('pulse')) {
      heartRate += 12;
    }

    let cortisol = Math.round((5 + sev * 2.1) * 10) / 10;
    if (organ.includes('infrasound') || organ.includes('gut')) {
      cortisol += 3.2;
    }

    let betaAlphaRatio = Math.round((0.7 + sev * 0.15) * 10) / 10;
    if (organ.includes('brain')) {
      betaAlphaRatio += 0.4;
    }

    return {
      timestamp: frame.timestamp,
      second: frame.second,
      heartRate,
      cortisol,
      betaAlphaRatio,
      organ: frame.targetOrgan,
      mechanism: frame.detectedMechanism,
      severity: frame.severity,
      index,
    };
  });

  const activePoint = timeSeriesData[currentFrameIndex] || timeSeriesData[0];

  // 2. Frequency & Infrasound Resonance Bands (0 - 80 Hz)
  const frequencyBands = [
    {
      band: '0-6 Hz',
      label: 'Sub-Infra',
      intensity: acousticData?.infrasoundSeverity ? acousticData.infrasoundSeverity * 7 : 35,
      hazard: 'Low',
      color: '#94a3b8',
    },
    {
      band: '7-8 Hz',
      label: 'Dangerous Organ Resonance',
      intensity: acousticData?.infrasoundSeverity ? Math.min(100, acousticData.infrasoundSeverity * 12) : 88,
      hazard: 'Severe',
      color: '#ef4444', // Red: Resonance with Alpha & visceral organs
    },
    {
      band: '8-12 Hz',
      label: 'Alpha (Suggestibility)',
      intensity: (somaticData?.prefrontalInhibition || 7) * 9.5,
      hazard: 'High',
      color: '#f59e0b', // Amber: Hypnotic entrainment
    },
    {
      band: '12-30 Hz',
      label: 'Beta (Stress/Alarm)',
      intensity: (somaticData?.amygdalaThreat || 7) * 9.2,
      hazard: 'High',
      color: '#3b82f6', // Blue: High cognitive tension
    },
    {
      band: '40-80 Hz',
      label: 'Sub-Bass (Entrainment)',
      intensity: (somaticData?.cardiovascularStrain || 6) * 10.5,
      hazard: 'Moderate',
      color: '#6366f1', // Indigo: Autonomic cardiac locking
    },
  ];

  // 3. Somatic Vulnerability Radar (0 - 10 scale)
  const radarData = [
    {
      subject: 'Amygdala Threat',
      value: somaticData?.amygdalaThreat || 7.5,
      fullMark: 10,
    },
    {
      subject: 'Prefrontal Bypass',
      value: somaticData?.prefrontalInhibition || 8.0,
      fullMark: 10,
    },
    {
      subject: 'Cardiac Strain',
      value: somaticData?.cardiovascularStrain || 7.2,
      fullMark: 10,
    },
    {
      subject: 'Gut Tension',
      value: somaticData?.gutBrainTension || 6.8,
      fullMark: 10,
    },
    {
      subject: 'Dopamine Hook',
      value: somaticData?.dopamineExploitation || 8.2,
      fullMark: 10,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Chart 1: Autonomic Biometric Stress Curves */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3.5 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                Autonomic Biometric Stress Curve
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Fluctuations in heart rate, cortisol proxy, and neural stress ratio across timeline
            </p>
          </div>

          {/* Active telemetry readouts */}
          <div className="flex items-center gap-3 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-100 text-rose-700 font-mono">
              <span className="text-rose-500 mr-1.5 font-sans">Heart Rate:</span>
              <strong>{activePoint?.heartRate} BPM</strong>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100 text-amber-700 font-mono">
              <span className="text-amber-500 mr-1.5 font-sans">Cortisol:</span>
              <strong>{activePoint?.cortisol} µg/dL</strong>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 font-mono">
              <span className="text-blue-500 mr-1.5 font-sans">Beta/Alpha:</span>
              <strong>{activePoint?.betaAlphaRatio}x</strong>
            </div>
          </div>
        </div>

        <div className="w-full h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={timeSeriesData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              onClick={(state) => {
                if (state && typeof state.activeTooltipIndex === 'number') {
                  onSelectFrame(state.activeTooltipIndex);
                }
              }}
            >
              <defs>
                <linearGradient id="modernHeart" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="modernCortisol" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="timestamp"
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                domain={[60, 130]}
                tickLine={false}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl text-xs shadow-xl border border-slate-800">
                        <div className="font-semibold text-blue-400 mb-1">
                          {d.timestamp} · Target: {d.organ.toUpperCase()}
                        </div>
                        <div className="text-rose-300 font-mono">Heart Rate: {d.heartRate} BPM</div>
                        <div className="text-amber-300 font-mono">Cortisol Surge: {d.cortisol} µg/dL</div>
                        <div className="text-blue-300 font-mono">Neural Tension: {d.betaAlphaRatio}x</div>
                        <div className="text-slate-400 text-[11px] mt-1.5 pt-1.5 border-t border-slate-800">
                          {d.mechanism}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="heartRate"
                stroke="#ef4444"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#modernHeart)"
              />
              <Area
                type="monotone"
                dataKey="cortisol"
                stroke="#f59e0b"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#modernCortisol)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two-Column Grid: Frequency Spectrum (Bar) & Somatic Vulnerability (Radar) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Chart 2: Frequency Spectrum & 7-8 Hz Infrasound Hazard */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3 mb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-500" />
                <h4 className="text-sm font-semibold text-slate-900 tracking-tight">
                  Acoustic & Infrasound Spectrum
                </h4>
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-100">
                7–8 Hz Peak Hazard
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Internal organ vibration coupling and brainwave entrainment frequencies
            </p>
          </div>

          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={frequencyBands} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="band" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded-lg text-xs shadow-lg">
                          <div className="font-semibold text-slate-200">{d.band} · {d.label}</div>
                          <div className="text-rose-400 font-mono mt-0.5">Energy Level: {d.intensity}%</div>
                          <div className="text-slate-400 text-[10px] mt-0.5">Hazard: {d.hazard}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="intensity" radius={[6, 6, 0, 0]}>
                  {frequencyBands.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>7-8 Hz = Alpha & visceral organ resonance</span>
            <span className="font-medium text-slate-700">Ref: Bioacoustics Lab</span>
          </div>
        </div>

        {/* Chart 3: Neuro-Somatic Vulnerability Radar */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="border-b border-slate-100 pb-3 mb-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-indigo-600" />
                <h4 className="text-sm font-semibold text-slate-900 tracking-tight">
                  Neuro-Somatic Vulnerability Radar
                </h4>
              </div>
              <span className="text-[11px] font-medium text-slate-500">
                Scale 0–10
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Multi-axis physiological impact profile
            </p>
          </div>

          <div className="w-full h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="75%">
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 10]} stroke="#cbd5e1" tick={false} />
                <Radar
                  name="Somatic Threat"
                  dataKey="value"
                  stroke="#4f46e5"
                  fill="#6366f1"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Prefrontal & Amygdala show highest vulnerability</span>
            <span className="font-medium text-indigo-600">Cognitive Bypass</span>
          </div>
        </div>
      </div>
    </div>
  );
}

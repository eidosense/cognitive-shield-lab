'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Activity, Heart, Brain, Zap } from 'lucide-react';
import { TimelineFrame } from '@/components/HumanBody3DView';

interface BiometricStressDashboardProps {
  timelineFrames: TimelineFrame[];
  currentFrameIndex: number;
  onSelectFrame?: (index: number) => void;
}

export default function BiometricStressDashboard({
  timelineFrames,
  currentFrameIndex,
  onSelectFrame,
}: BiometricStressDashboardProps) {
  if (!timelineFrames || timelineFrames.length === 0) return null;

  // Synthesize empirical autonomic response metrics per timeline frame
  const chartData = timelineFrames.map((frame, index) => {
    const sev = frame.severity || 5;
    const organ = frame.targetOrgan.toLowerCase();

    // Heart Rate (BPM baseline ~72bpm, spiking to 125bpm during high arousal/fear)
    let heartRate = 70 + Math.round(sev * 4.8);
    if (organ.includes('heart') || organ.includes('cardio') || organ.includes('pulse')) {
      heartRate += 12;
    }

    // Cortisol Proxy (ug/dL index scaled 5 - 28)
    let cortisolProxy = Math.round((5 + sev * 2.1) * 10) / 10;
    if (organ.includes('infrasound') || organ.includes('hpa') || organ.includes('gut')) {
      cortisolProxy += 3.5;
    }

    // Alpha / Beta brainwave ratio (Beta dominance > 1.0 represents high stress & cognitive fatigue)
    let betaStressRatio = Math.round((0.6 + sev * 0.16) * 10) / 10;
    if (organ.includes('brain') || organ.includes('head')) {
      betaStressRatio += 0.4;
    }

    return {
      name: frame.timestamp,
      second: frame.second,
      heartRate,
      cortisolProxy,
      betaStressRatio,
      organ: frame.targetOrgan,
      mechanism: frame.detectedMechanism,
      index,
    };
  });

  const activePoint = chartData[currentFrameIndex] || chartData[0];

  return (
    <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 flex flex-col gap-3 shadow-sm">
      {/* Header telemetry summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#21262d] pb-2.5">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#58a6ff]" />
          <span className="text-xs font-bold text-[#f0f6fc] font-mono tracking-tight">
            BIOMETRIC STRESS DASHBOARD
          </span>
          <span className="text-[10px] font-mono text-[#8b949e]">
            Autonomic Nervous Response
          </span>
        </div>

        {/* Live point readouts */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-[#010409] px-2.5 py-1 rounded border border-[#21262d]">
            <Heart className="w-3.5 h-3.5 text-[#f85149]" />
            <span className="text-[#8b949e]">HR:</span>
            <strong className="text-[#f85149]">{activePoint?.heartRate} BPM</strong>
          </div>
          <div className="flex items-center gap-1.5 bg-[#010409] px-2.5 py-1 rounded border border-[#21262d]">
            <Zap className="w-3.5 h-3.5 text-[#d29922]" />
            <span className="text-[#8b949e]">Cortisol:</span>
            <strong className="text-[#d29922]">{activePoint?.cortisolProxy} µg/dL</strong>
          </div>
          <div className="flex items-center gap-1.5 bg-[#010409] px-2.5 py-1 rounded border border-[#21262d]">
            <Brain className="w-3.5 h-3.5 text-[#58a6ff]" />
            <span className="text-[#8b949e]">Beta/Alpha:</span>
            <strong className="text-[#58a6ff]">{activePoint?.betaStressRatio}x</strong>
          </div>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="w-full h-44">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 12, left: -20, bottom: 0 }}
            onClick={(state) => {
              if (state && typeof state.activeTooltipIndex === 'number' && onSelectFrame) {
                onSelectFrame(state.activeTooltipIndex);
              }
            }}
          >
            <defs>
              <linearGradient id="colorHeart" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f85149" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f85149" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorCortisol" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#d29922" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#d29922" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262d" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#8b949e"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#30363d' }}
            />
            <YAxis
              stroke="#8b949e"
              fontSize={10}
              domain={[60, 135]}
              tickLine={false}
              axisLine={{ stroke: '#30363d' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-[#0d1117] border border-[#30363d] p-2.5 rounded-lg text-xs font-mono shadow-xl">
                      <div className="font-bold text-[#58a6ff] mb-1">
                        {d.name} • {d.organ.toUpperCase()}
                      </div>
                      <div className="text-[#f85149]">Heart Rate: {d.heartRate} BPM</div>
                      <div className="text-[#d29922]">Cortisol Surge: {d.cortisolProxy} µg/dL</div>
                      <div className="text-[#58a6ff]">Beta/Alpha Shift: {d.betaStressRatio}x</div>
                      <div className="text-[#8b949e] text-[10px] mt-1 max-w-[200px] truncate">
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
              stroke="#f85149"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorHeart)"
            />
            <Area
              type="monotone"
              dataKey="cortisolProxy"
              stroke="#d29922"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorCortisol)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

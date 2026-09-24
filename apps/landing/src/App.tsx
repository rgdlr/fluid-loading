import {
  createSkeletonElement,
  FluidLoading,
  type FluidLoadingState,
  type InternalState,
  type LayoutSnapshot,
  measureElement,
  serializeSnapshot,
} from '@fluid-loading/react';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import './landing.css';

type ContentType =
  | 'card'
  | 'article'
  | 'profile'
  | 'dashboard'
  | 'product'
  | 'table'
  | 'margins'
  | 'list'
  | 'bento';
type ContentVariation = 'short' | 'medium' | 'long' | 'error';
type MotionMode = 'normal' | 'reduced';
type SidebarTab = 'behavior' | 'styles';

interface BenchmarkResult {
  nodeCount: number;
  scanTimeMs: number;
  boneCount: number;
  snapshotBytes: number;
  skeletonDomTimeMs: number;
}

interface ThemePreset {
  id: string;
  name: string;
  boneBg: string;
  surfaceBg: string;
  shimmerHex: string;
  shimmerOpacity: number;
  shimmerDuration: number;
  containerRadius: number;
  textRadius: number;
  rectRadius: number;
}

interface TimingPreset {
  id: string;
  name: string;
  icon: string;
  duration: number;
  revealDuration: number;
  minimumSkeletonDuration: number;
  networkDelay: number;
}

const TIMING_PRESETS: TimingPreset[] = [
  {
    id: 'snappy',
    name: 'Fast',
    icon: '⚡',
    duration: 200,
    revealDuration: 120,
    minimumSkeletonDuration: 180,
    networkDelay: 350,
  },
  {
    id: 'balanced',
    name: 'Balanced',
    icon: '⚖️',
    duration: 350,
    revealDuration: 200,
    minimumSkeletonDuration: 350,
    networkDelay: 600,
  },
  {
    id: 'slow',
    name: 'Slow',
    icon: '🐢',
    duration: 1000,
    revealDuration: 400,
    minimumSkeletonDuration: 1000,
    networkDelay: 1200,
  },
];

const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'amber',
    name: 'Amber',
    boneBg: '#353d4f',
    surfaceBg: '#1c202b',
    shimmerHex: '#fbbf24',
    shimmerOpacity: 25,
    shimmerDuration: 1.5,
    containerRadius: 14,
    textRadius: 5,
    rectRadius: 8,
  },
  {
    id: 'slate',
    name: 'Slate',
    boneBg: '#272f3d',
    surfaceBg: '#0f172a',
    shimmerHex: '#94a3b8',
    shimmerOpacity: 20,
    shimmerDuration: 1.8,
    containerRadius: 8,
    textRadius: 3,
    rectRadius: 6,
  },
  {
    id: 'violet',
    name: 'Violet',
    boneBg: '#2d1b4e',
    surfaceBg: '#130924',
    shimmerHex: '#e879f9',
    shimmerOpacity: 35,
    shimmerDuration: 1.2,
    containerRadius: 16,
    textRadius: 6,
    rectRadius: 12,
  },
  {
    id: 'emerald',
    name: 'Emerald',
    boneBg: '#063828',
    surfaceBg: '#021e15',
    shimmerHex: '#34d399',
    shimmerOpacity: 30,
    shimmerDuration: 1.4,
    containerRadius: 12,
    textRadius: 4,
    rectRadius: 8,
  },
  {
    id: 'crimson',
    name: 'Rose',
    boneBg: '#3a1d28',
    surfaceBg: '#1a0c14',
    shimmerHex: '#fb7185',
    shimmerOpacity: 30,
    shimmerDuration: 1.3,
    containerRadius: 12,
    textRadius: 5,
    rectRadius: 8,
  },
  {
    id: 'nordic',
    name: 'Frost',
    boneBg: '#1e293b',
    surfaceBg: '#0b1324',
    shimmerHex: '#38bdf8',
    shimmerOpacity: 30,
    shimmerDuration: 1.5,
    containerRadius: 14,
    textRadius: 4,
    rectRadius: 10,
  },
];

function hexToRgba(hex: string, alphaPercent: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) || 0;
  const g = parseInt(clean.substring(2, 4), 16) || 0;
  const b = parseInt(clean.substring(4, 6), 16) || 0;
  return `rgba(${r}, ${g}, ${b}, ${(alphaPercent / 100).toFixed(2)})`;
}

export function App(): React.JSX.Element {
  const [loading, setLoading] = useState(true);
  const [contentType, setContentType] = useState<ContentType>('card');
  const [variation, setVariation] = useState<ContentVariation>('medium');
  const [motionMode, setMotionMode] = useState<MotionMode>('normal');
  const [estimatedHeight, setEstimatedHeight] = useState(240);
  const [duration, setDuration] = useState(350);
  const [revealDuration, setRevealDuration] = useState(200);
  const [minimumSkeletonDuration, setMinimumSkeletonDuration] = useState(350);
  const [networkDelay, setNetworkDelay] = useState(600);

  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('behavior');
  const [selectedTimingPreset, setSelectedTimingPreset] = useState<string>('balanced');
  const [selectedPreset, setSelectedPreset] = useState<string>('amber');
  const [boneBg, setBoneBg] = useState('#353d4f');
  const [surfaceBg, setSurfaceBg] = useState('#1c202b');
  const [shimmerHex, setShimmerHex] = useState('#fbbf24');
  const [shimmerOpacity, setShimmerOpacity] = useState(25);
  const [shimmerDuration, setShimmerDuration] = useState(1.5);
  const [containerRadius, setContainerRadius] = useState(14);
  const [textRadius, setTextRadius] = useState(5);
  const [rectRadius, setRectRadius] = useState(8);
  const [exportTab, setExportTab] = useState<'css' | 'react'>('css');
  const [copiedCode, setCopiedCode] = useState(false);

  const [_fluidState, setFluidState] = useState<FluidLoadingState>('loading');
  const [internalState, setInternalState] = useState<InternalState>('loading');
  const [lastSnapshot, setLastSnapshot] = useState<LayoutSnapshot | null>(null);

  const [benchmarkResults, setBenchmarkResults] = useState<BenchmarkResult[]>([]);
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  const timerRef = useRef<number | null>(null);

  const triggerLoad = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    setLoading(true);
    setFluidState('loading');
    setInternalState('loading');
    timerRef.current = window.setTimeout(() => {
      setLoading(false);
    }, networkDelay);
  }, [networkDelay]);

  useEffect(() => {
    triggerLoad();
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleContentTypeChange = (type: ContentType) => {
    if (type === contentType) return;
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    setContentType(type);
    setLoading(true);
    setFluidState('loading');
    setInternalState('loading');
    timerRef.current = window.setTimeout(() => {
      setLoading(false);
    }, networkDelay);
  };

  const handleVariationChange = (v: ContentVariation) => {
    if (v === variation) return;
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    setVariation(v);
    setLoading(true);
    setFluidState('loading');
    setInternalState('loading');
    timerRef.current = window.setTimeout(() => {
      setLoading(false);
    }, networkDelay);
  };

  const applyTimingPreset = (preset: TimingPreset) => {
    setSelectedTimingPreset(preset.id);
    setDuration(preset.duration);
    setRevealDuration(preset.revealDuration);
    setMinimumSkeletonDuration(preset.minimumSkeletonDuration);
    setNetworkDelay(preset.networkDelay);
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }
    setLoading(true);
    setFluidState('loading');
    setInternalState('loading');
    timerRef.current = window.setTimeout(() => {
      setLoading(false);
    }, preset.networkDelay);
  };

  const applyDefaultPreset = () => {
    const balanced = TIMING_PRESETS.find((p) => p.id === 'balanced') || TIMING_PRESETS[1];
    applyTimingPreset(balanced);
    setEstimatedHeight(240);
  };

  const applyThemePreset = (preset: ThemePreset) => {
    setSelectedPreset(preset.id);
    setBoneBg(preset.boneBg);
    setSurfaceBg(preset.surfaceBg);
    setShimmerHex(preset.shimmerHex);
    setShimmerOpacity(preset.shimmerOpacity);
    setShimmerDuration(preset.shimmerDuration);
    setContainerRadius(preset.containerRadius);
    setTextRadius(preset.textRadius);
    setRectRadius(preset.rectRadius);
  };

  const resetStylesToDefault = () => {
    applyThemePreset(THEME_PRESETS[0]);
  };

  const resetAll = () => {
    applyDefaultPreset();
    resetStylesToDefault();
    setContentType('card');
    setVariation('medium');
    setMotionMode('normal');
  };

  const getCssVariablesCode = () => {
    const shimmerColor = hexToRgba(shimmerHex, shimmerOpacity);
    return `:root {
  --fluid-loading-bone-bg: ${boneBg};
  --fluid-loading-duration: ${motionMode === 'reduced' ? '0ms' : `${duration}ms`};
  --fluid-loading-minimum-skeleton-duration: ${motionMode === 'reduced' ? '0ms' : `${minimumSkeletonDuration}ms`};
  --fluid-loading-radius: ${containerRadius}px;
  --fluid-loading-rect-radius: ${rectRadius}px;
  --fluid-loading-reveal-duration: ${motionMode === 'reduced' ? '0ms' : `${revealDuration}ms`};
  --fluid-loading-shimmer-color: ${shimmerColor};
  --fluid-loading-shimmer-duration: ${shimmerDuration}s;
  --fluid-loading-surface-bg: ${surfaceBg};
  --fluid-loading-text-radius: ${textRadius}px;
}`;
  };

  const getReactUsageCode = () => {
    const shimmerColor = hexToRgba(shimmerHex, shimmerOpacity);
    return `<FluidLoading
  loading={loading}
  estimatedHeight={${estimatedHeight}}
  boneBg="${boneBg}"
  duration={${motionMode === 'reduced' ? 0 : duration}}
  minimumSkeletonDuration={${motionMode === 'reduced' ? 0 : minimumSkeletonDuration}}
  radius={${containerRadius}}
  rectRadius={${rectRadius}}
  revealDuration={${motionMode === 'reduced' ? 0 : revealDuration}}
  shimmerColor="${shimmerColor}"
  shimmerDuration="${shimmerDuration}s"
  surfaceBg="${surfaceBg}"
  textRadius={${textRadius}}
>
  <YourContent />
</FluidLoading>`;
  };

  const copyActiveCode = () => {
    const code = exportTab === 'css' ? getCssVariablesCode() : getReactUsageCode();
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 2000);
    });
  };

  const runBenchmark = () => {
    setIsBenchmarking(true);
    const counts = [10, 100, 500, 1000];
    const results: BenchmarkResult[] = [];

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '600px';
    document.body.appendChild(container);

    for (const count of counts) {
      container.innerHTML = '';
      for (let i = 0; i < count; i++) {
        const item = document.createElement(i % 3 === 0 ? 'p' : i % 3 === 1 ? 'div' : 'img');
        item.style.width = `${100 + (i % 200)}px`;
        item.style.height = `${20 + (i % 40)}px`;
        if (i % 5 === 0) {
          item.style.borderRadius = '50%';
        }
        if (item.tagName === 'P') {
          item.textContent = `Sample text node ${i}`;
        }
        container.appendChild(item);
      }

      const t0 = performance.now();
      const snapshot = measureElement(container);
      const scanTimeMs = performance.now() - t0;

      const serialized = serializeSnapshot(snapshot);

      const t1 = performance.now();
      createSkeletonElement(snapshot);
      const skeletonDomTimeMs = performance.now() - t1;

      results.push({
        nodeCount: count,
        scanTimeMs: parseFloat(scanTimeMs.toFixed(2)),
        boneCount: snapshot.bones.length,
        snapshotBytes: new Blob([serialized]).size,
        skeletonDomTimeMs: parseFloat(skeletonDomTimeMs.toFixed(2)),
      });
    }

    document.body.removeChild(container);
    setBenchmarkResults(results);
    setIsBenchmarking(false);
  };

  const [copiedInstall, setCopiedInstall] = useState(false);
  const [copiedQuickstart, setCopiedQuickstart] = useState(false);

  const copyInstallCommand = (cmd = 'npm install @fluid-loading/react') => {
    navigator.clipboard.writeText(cmd).then(() => {
      setCopiedInstall(true);
      window.setTimeout(() => setCopiedInstall(false), 2000);
    });
  };

  const QUICKSTART_CODE = `import { FluidLoading } from '@fluid-loading/react';

export function UserCard({ user, loading, error }) {
  return (
    <FluidLoading
      loading={loading}
      error={error}
      estimatedHeight={320}
    >
      <article className="user-card">
        <img
          src={user?.avatar}
          alt={user?.name}
          data-fluid-loading-type="circle"
        />
        <h2>{user?.name}</h2>
        <p>{user?.bio}</p>
        <button data-fluid-loading-ignore>Contact</button>
      </article>
    </FluidLoading>
  );
}`;

  const copyQuickstartCode = () => {
    navigator.clipboard.writeText(QUICKSTART_CODE).then(() => {
      setCopiedQuickstart(true);
      window.setTimeout(() => setCopiedQuickstart(false), 2000);
    });
  };

  const isError = variation === 'error';

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="header-brand">
            <div className="header-logo-wrapper">
              <img src="/favicon.jpg" alt="fluid-loading logo" className="header-logo-img" />
            </div>
            <h1>fluid-loading</h1>
            <span className="version-pill">v0.1.0</span>
          </div>

          <div className="nav-links">
            <a href="#playground" className="nav-link">
              Playground
            </a>
            <a href="#features" className="nav-link">
              Features
            </a>
            <a href="#quickstart" className="nav-link">
              Quick Start
            </a>
          </div>

          <div className="nav-actions">
            <a
              href="https://github.com/rgdlr/fluid-loading"
              target="_blank"
              rel="noreferrer"
              className="nav-github-btn"
              aria-label="View on GitHub"
            >
              <svg
                height="16"
                width="16"
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </nav>

      <div className="playground-container">
        <section className="hero-section">
          <div className="hero-badge">
            <span>✨ Layout-Aware Transition Engine for React</span>
          </div>
          <h1 className="hero-title">
            Stop flashing generic skeletons.
            <br />
            <span className="hero-gradient-text">Morph smoothly into real layouts.</span>
          </h1>
          <p className="hero-subtitle">
            fluid-loading measures real DOM geometry in-flight, smoothly interpolates container
            dimensions, and reveals your content with zero visual jarring and 0.00 Cumulative Layout
            Shift.
          </p>

          <div className="hero-ctas">
            <button
              type="button"
              className={`hero-terminal-btn ${copiedInstall ? 'copied' : ''}`}
              onClick={() => copyInstallCommand('npm install @fluid-loading/react')}
              aria-label="Copy install command"
            >
              <span className="terminal-prompt">$</span>
              <code className="terminal-code">npm install @fluid-loading/react</code>
              <span className="terminal-copy-badge">
                <span className="terminal-copy-icon-wrap">
                  {copiedInstall ? (
                    <svg
                      className="terminal-copy-icon check-icon"
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg
                      className="terminal-copy-icon clipboard-icon"
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  )}
                </span>
              </span>
            </button>
          </div>

          <div className="hero-highlights-grid">
            <div className="highlight-card">
              <span className="highlight-value">0.00</span>
              <span className="highlight-label">CLS</span>
            </div>
            <div className="highlight-card">
              <span className="highlight-value">&lt; 1ms</span>
              <span className="highlight-label">Overhead</span>
            </div>
            <div className="highlight-card">
              <span className="highlight-value">Zero-Config</span>
              <span className="highlight-label">Styles Bundled</span>
            </div>
            <div className="highlight-card">
              <span className="highlight-value">100%</span>
              <span className="highlight-label">Accessible</span>
            </div>
          </div>
        </section>

        <section id="playground" className="playground-section">
          <div className="section-header">
            <span className="section-tag">Playground</span>
            <h2 className="section-title">Experience the Transition Live</h2>
            <p className="section-desc">
              Test in-flight geometry morphing, skeleton detection, and custom theme tokens in real
              time.
            </p>
          </div>

          <div className="sandbox-workbench">
            <div className="workbench-toolbar">
              <div className="workbench-toolbar-main">
                <div className="workbench-control-field workbench-control-layout">
                  <span className="workbench-field-label">Layout:</span>
                  <div className="segmented-control compact">
                    {(
                      [
                        'card',
                        'article',
                        'profile',
                        'dashboard',
                        'product',
                        'table',
                        'margins',
                        'list',
                        'bento',
                      ] as ContentType[]
                    ).map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={`segmented-button ${contentType === type ? 'active' : ''}`}
                        onClick={() => handleContentTypeChange(type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="workbench-controls-subgroup">
                  <div className="workbench-control-field">
                    <span className="workbench-field-label">Size:</span>
                    <div className="segmented-control compact">
                      {(['short', 'medium', 'long', 'error'] as ContentVariation[]).map((v) => (
                        <button
                          key={v}
                          type="button"
                          className={`segmented-button ${variation === v ? 'active' : ''}`}
                          onClick={() => handleVariationChange(v)}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="workbench-control-field">
                    <span className="workbench-field-label">Delay:</span>
                    <div className="segmented-control compact">
                      {([0, 350, 600, 1200] as const).map((d) => (
                        <button
                          key={d}
                          type="button"
                          className={`segmented-button ${networkDelay === d ? 'active' : ''}`}
                          onClick={() => {
                            setNetworkDelay(d);
                            if (timerRef.current) {
                              window.clearTimeout(timerRef.current);
                            }
                            setLoading(true);
                            setFluidState('loading');
                            setInternalState('loading');
                            timerRef.current = window.setTimeout(() => {
                              setLoading(false);
                            }, d);
                          }}
                        >
                          {d === 0 ? '0ms' : d < 1000 ? `${d}ms` : `${(d / 1000).toFixed(1)}s`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="workbench-toolbar-actions">
                <button
                  type="button"
                  className="workbench-toolbar-reload-btn"
                  onClick={triggerLoad}
                  title="Trigger loading and transition cycle"
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M21 3v5h-5" />
                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                    <path d="M16 21h5v-5" />
                  </svg>
                  <span>Reload</span>
                </button>

                <button
                  type="button"
                  className="workbench-toolbar-reset-btn"
                  onClick={resetAll}
                  title="Reset all settings to default"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                  </svg>
                  <span>Reset All</span>
                </button>
              </div>
            </div>

            <div className="workbench-body">
              <div className="workbench-stage">
                <div className="stage-action-bar">
                  <div className="stage-action-bar-left">
                    <div className="workbench-state-pill">
                      <span className={`status-indicator-dot ${internalState}`} />
                      <span className="status-indicator-text">{internalState}</span>
                    </div>
                  </div>

                  <div className="stage-action-bar-right">
                    {lastSnapshot && (
                      <div className="workbench-info-chip" title="Detected bones count">
                        <span>{lastSnapshot.bones.length} bones</span>
                      </div>
                    )}
                    <div className="workbench-info-chip" title="Simulated network latency">
                      <span>{networkDelay}ms delay</span>
                    </div>
                  </div>
                </div>
                <div className="stage-canvas-ambient" />
                <div className="stage-preview-area">
                  <FluidLoading
                    loading={loading}
                    error={isError ? new Error('Simulated network failure') : undefined}
                    estimatedHeight={estimatedHeight}
                    duration={motionMode === 'reduced' ? 0 : duration}
                    revealDuration={motionMode === 'reduced' ? 0 : revealDuration}
                    minimumSkeletonDuration={motionMode === 'reduced' ? 0 : minimumSkeletonDuration}
                    boneBg={boneBg}
                    surfaceBg={surfaceBg}
                    shimmerColor={hexToRgba(shimmerHex, shimmerOpacity)}
                    shimmerDuration={`${shimmerDuration}s`}
                    radius={containerRadius}
                    textRadius={textRadius}
                    rectRadius={rectRadius}
                    style={{ width: '100%' }}
                    onStateChange={setFluidState}
                    onInternalStateChange={setInternalState}
                    onSnapshot={setLastSnapshot}
                    errorFallback={
                      <div className="fluid-loading-error-container">
                        <p>Failed to load data. The container surface remained stable.</p>
                        <button type="button" className="content-card-action" onClick={triggerLoad}>
                          Retry
                        </button>
                      </div>
                    }
                  >
                    {renderContent(contentType, variation)}
                  </FluidLoading>
                </div>
              </div>

              <aside className="workbench-inspector">
                <div className="inspector-tab-bar">
                  <button
                    type="button"
                    className={`inspector-tab-btn ${sidebarTab === 'behavior' ? 'active' : ''}`}
                    onClick={() => setSidebarTab('behavior')}
                  >
                    Timing &amp; Motion
                  </button>
                  <button
                    type="button"
                    className={`inspector-tab-btn ${sidebarTab === 'styles' ? 'active' : ''}`}
                    onClick={() => setSidebarTab('styles')}
                  >
                    Theme &amp; Tokens
                  </button>
                </div>

                <div className="inspector-content">
                  {sidebarTab === 'behavior' ? (
                    <>
                      <div className="inspector-subhead">
                        <span className="subhead-title">Timing Presets</span>
                        <button
                          type="button"
                          className="inspector-reset-link"
                          onClick={applyDefaultPreset}
                          title="Reset timing and layout to defaults"
                        >
                          ↺ Reset Timing
                        </button>
                      </div>

                      <div className="timing-presets-pill-list">
                        {TIMING_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            className={`timing-pill-btn ${selectedTimingPreset === preset.id ? 'active' : ''}`}
                            onClick={() => applyTimingPreset(preset)}
                            title={`Apply ${preset.name} timing preset`}
                          >
                            <span className="timing-pill-icon">{preset.icon}</span>
                            <span>{preset.name}</span>
                          </button>
                        ))}
                      </div>

                      <div className="control-group">
                        <label>
                          Motion Preference{' '}
                          <span className="value">
                            {motionMode === 'normal' ? 'Normal' : 'Reduced'}
                          </span>
                        </label>
                        <div className="segmented-control">
                          {(['normal', 'reduced'] as MotionMode[]).map((m) => (
                            <button
                              key={m}
                              type="button"
                              className={`segmented-button ${motionMode === m ? 'active' : ''}`}
                              onClick={() => setMotionMode(m)}
                            >
                              {m === 'normal' ? 'Normal Motion' : 'Reduced Motion'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="control-group">
                        <label>
                          Estimated Height <span className="value">{estimatedHeight}px</span>
                        </label>
                        <input
                          type="range"
                          min="100"
                          max="600"
                          step="10"
                          value={estimatedHeight}
                          onChange={(e) => {
                            setSelectedTimingPreset('custom');
                            setEstimatedHeight(Number(e.target.value));
                          }}
                        />
                      </div>

                      <div className="control-group">
                        <label>
                          Morph Duration <span className="value">{duration}ms</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1500"
                          step="50"
                          value={duration}
                          onChange={(e) => {
                            setSelectedTimingPreset('custom');
                            setDuration(Number(e.target.value));
                          }}
                        />
                      </div>

                      <div className="control-group">
                        <label>
                          Min Skeleton Delay{' '}
                          <span className="value">{minimumSkeletonDuration}ms</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="2000"
                          step="50"
                          value={minimumSkeletonDuration}
                          onChange={(e) => {
                            setSelectedTimingPreset('custom');
                            setMinimumSkeletonDuration(Number(e.target.value));
                          }}
                        />
                      </div>

                      <div className="control-group">
                        <label>
                          Reveal Duration <span className="value">{revealDuration}ms</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="800"
                          step="25"
                          value={revealDuration}
                          onChange={(e) => {
                            setSelectedTimingPreset('custom');
                            setRevealDuration(Number(e.target.value));
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="inspector-subhead">
                        <span className="subhead-title">Theme Presets</span>
                        <button
                          type="button"
                          className="inspector-reset-link"
                          onClick={resetStylesToDefault}
                          title="Reset theme and styles to defaults"
                        >
                          ↺ Reset Theme
                        </button>
                      </div>

                      <div className="theme-presets-pill-list">
                        {THEME_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            className={`theme-pill-btn ${selectedPreset === preset.id ? 'active' : ''}`}
                            onClick={() => applyThemePreset(preset)}
                            title={`Apply ${preset.name} preset`}
                          >
                            <span
                              className="theme-pill-swatch"
                              style={{ backgroundColor: preset.shimmerHex }}
                            />
                            <span>{preset.name}</span>
                          </button>
                        ))}
                      </div>

                      <div className="control-group">
                        <label>
                          Bone Background <span className="value">{boneBg}</span>
                        </label>
                        <div className="color-picker-field">
                          <input
                            type="color"
                            className="color-swatch-input"
                            value={boneBg}
                            onChange={(e) => {
                              setSelectedPreset('custom');
                              setBoneBg(e.target.value);
                            }}
                          />
                          <span className="color-value-text">{boneBg}</span>
                        </div>
                      </div>

                      <div className="control-group">
                        <label>
                          Surface Background <span className="value">{surfaceBg}</span>
                        </label>
                        <div className="color-picker-field">
                          <input
                            type="color"
                            className="color-swatch-input"
                            value={surfaceBg}
                            onChange={(e) => {
                              setSelectedPreset('custom');
                              setSurfaceBg(e.target.value);
                            }}
                          />
                          <span className="color-value-text">{surfaceBg}</span>
                        </div>
                      </div>

                      <div className="control-group">
                        <label>
                          Shimmer Accent <span className="value">{shimmerHex}</span>
                        </label>
                        <div className="color-picker-field">
                          <input
                            type="color"
                            className="color-swatch-input"
                            value={shimmerHex}
                            onChange={(e) => {
                              setSelectedPreset('custom');
                              setShimmerHex(e.target.value);
                            }}
                          />
                          <span className="color-value-text">
                            {hexToRgba(shimmerHex, shimmerOpacity)}
                          </span>
                        </div>
                      </div>

                      <div className="control-group">
                        <label>
                          Shimmer Opacity <span className="value">{shimmerOpacity}%</span>
                        </label>
                        <input
                          type="range"
                          min="5"
                          max="90"
                          step="5"
                          value={shimmerOpacity}
                          onChange={(e) => {
                            setSelectedPreset('custom');
                            setShimmerOpacity(Number(e.target.value));
                          }}
                        />
                      </div>

                      <div className="control-group">
                        <label>
                          Shimmer Wave Speed <span className="value">{shimmerDuration}s</span>
                        </label>
                        <input
                          type="range"
                          min="0.6"
                          max="3.0"
                          step="0.1"
                          value={shimmerDuration}
                          onChange={(e) => {
                            setSelectedPreset('custom');
                            setShimmerDuration(Number(e.target.value));
                          }}
                        />
                      </div>

                      <div className="control-group">
                        <label>
                          Container Radius <span className="value">{containerRadius}px</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="32"
                          step="1"
                          value={containerRadius}
                          onChange={(e) => {
                            setSelectedPreset('custom');
                            setContainerRadius(Number(e.target.value));
                          }}
                        />
                      </div>

                      <div className="control-group">
                        <label>
                          Text Bone Radius <span className="value">{textRadius}px</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          step="1"
                          value={textRadius}
                          onChange={(e) => {
                            setSelectedPreset('custom');
                            setTextRadius(Number(e.target.value));
                          }}
                        />
                      </div>

                      <div className="control-group">
                        <label>
                          Rect Bone Radius <span className="value">{rectRadius}px</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="24"
                          step="1"
                          value={rectRadius}
                          onChange={(e) => {
                            setSelectedPreset('custom');
                            setRectRadius(Number(e.target.value));
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </aside>
            </div>

            <div className="workbench-export">
              <div className="workbench-export-header">
                <div className="workbench-control-field">
                  <span className="workbench-field-label">Export:</span>
                  <div className="segmented-control compact">
                    <button
                      type="button"
                      className={`segmented-button ${exportTab === 'css' ? 'active' : ''}`}
                      onClick={() => setExportTab('css')}
                    >
                      CSS Variables
                    </button>
                    <button
                      type="button"
                      className={`segmented-button ${exportTab === 'react' ? 'active' : ''}`}
                      onClick={() => setExportTab('react')}
                    >
                      React Component
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  className="workbench-copy-btn"
                  onClick={copyActiveCode}
                  title="Copy snippet to clipboard"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  <span>
                    {copiedCode
                      ? 'Copied!'
                      : exportTab === 'css'
                        ? 'Copy Variables'
                        : 'Copy Component'}
                  </span>
                </button>
              </div>

              <pre className="workbench-code-box">
                {exportTab === 'css' ? getCssVariablesCode() : getReactUsageCode()}
              </pre>
            </div>
          </div>
        </section>

        <section id="features" className="features-section">
          <div className="section-header">
            <span className="section-tag">Features</span>
            <h2 className="section-title">Architecture &amp; Real-time Verification</h2>
            <p className="section-desc">
              Inspect generated structural bone primitives, run in-browser layout benchmarks, and
              verify 0.00 CLS.
            </p>
          </div>

          <div className="bento-grid">
            <div className="bento-card">
              <div className="bento-card-header">
                <div className="bento-card-top-row">
                  <span className="bento-tag">Inspection</span>
                  {lastSnapshot && (
                    <span className="bento-count-badge">{lastSnapshot.bones.length} bones</span>
                  )}
                </div>
                <h2>Precise Skeleton Bones Detected</h2>
              </div>
              {lastSnapshot && lastSnapshot.bones.length > 0 ? (
                <>
                  <p className="bento-subtitle">
                    Snapshot:{' '}
                    <strong>
                      {lastSnapshot.width}×{lastSnapshot.height}px
                    </strong>{' '}
                    &bull; {lastSnapshot.bones.filter((b) => b.type === 'text').length} text,{' '}
                    {lastSnapshot.bones.filter((b) => b.type === 'rect').length} rect,{' '}
                    {lastSnapshot.bones.filter((b) => b.type === 'circle').length} circle
                  </p>
                  <div className="bones-pill-list">
                    {lastSnapshot.bones.map((b, i) => (
                      <span key={i} className={`bone-pill ${b.type}`}>
                        {b.type} {b.width}×{b.height} @ ({b.x},{b.y})
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="bento-empty-state">
                  <span>Waiting for initial render snapshot...</span>
                </div>
              )}
            </div>

            <div id="benchmark" className="bento-card">
              <div className="bento-card-header">
                <div className="bento-card-top-row">
                  <span className="bento-tag">Performance</span>
                  <button
                    className="content-card-action bento-action-button"
                    onClick={runBenchmark}
                    disabled={isBenchmarking}
                  >
                    {isBenchmarking ? 'Running...' : 'Run Benchmark'}
                  </button>
                </div>
                <h2>DOM Scalability Benchmark</h2>
              </div>
              <p className="bento-subtitle">
                Recursive element scanning, snapshot serialization, and skeleton generation.
              </p>

              {benchmarkResults.length > 0 ? (
                <div className="bento-table-wrapper">
                  <table className="benchmark-table">
                    <thead>
                      <tr>
                        <th>DOM Nodes</th>
                        <th>Scan Time</th>
                        <th>Bones</th>
                        <th>Snapshot Size</th>
                        <th>Skeleton Build</th>
                      </tr>
                    </thead>
                    <tbody>
                      {benchmarkResults.map((res) => (
                        <tr key={res.nodeCount}>
                          <td>{res.nodeCount} nodes</td>
                          <td>{res.scanTimeMs} ms</td>
                          <td>{res.boneCount}</td>
                          <td>{res.snapshotBytes} B</td>
                          <td>{res.skeletonDomTimeMs} ms</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bento-empty-state">
                  <span>
                    Click "Run Benchmark" to test throughput across 10, 100, 500, and 1,000 DOM
                    nodes.
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="features-trio">
            <div className="feature-mini-card">
              <span className="feature-mini-icon">🛡️</span>
              <h3 className="feature-mini-title">Zero Layout Shifts</h3>
              <p className="feature-mini-desc">
                By measuring actual rendered DOM geometry before reveal and animating container
                dimensions, content never abruptly shifts existing layout elements.
              </p>
            </div>

            <div className="feature-mini-card">
              <span className="feature-mini-icon">♿</span>
              <h3 className="feature-mini-title">Accessible by Default</h3>
              <p className="feature-mini-desc">
                Automatically manages aria-busy, marks skeletons with aria-hidden, and detects
                reduced motion preference to transition instantly without animation.
              </p>
            </div>

            <div className="feature-mini-card">
              <span className="feature-mini-icon">🎨</span>
              <h3 className="feature-mini-title">Zero Dependencies</h3>
              <p className="feature-mini-desc">
                Styles are bundled directly into @fluid-loading/react with no extra CSS imports
                required. Easily theme via CSS custom properties (--fluid-loading-*).
              </p>
            </div>
          </div>
        </section>

        <section id="quickstart" className="quickstart-section">
          <div className="section-header">
            <span className="section-tag">Quick Start</span>
            <h2 className="section-title">Integrate in Minutes</h2>
            <p className="section-desc">
              Install the React package and wrap your component. Zero manual CSS setup or
              placeholder drawings needed.
            </p>
          </div>

          <div className="quickstart-card">
            <div className="quickstart-header">
              <span className="quickstart-title">UserCard.tsx</span>
              <button type="button" className="copy-css-btn" onClick={copyQuickstartCode}>
                {copiedQuickstart ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <pre className="quickstart-pre">{QUICKSTART_CODE}</pre>
          </div>
        </section>

        <footer className="landing-footer">
          <div className="footer-brand">
            <div className="header-logo-wrapper" style={{ width: 32, height: 32 }}>
              <img src="/favicon.jpg" alt="fluid-loading logo" className="header-logo-img" />
            </div>
            <h2>fluid-loading</h2>
          </div>
          <p className="footer-text">
            A layout-aware skeleton and transition engine for React and the DOM.
          </p>
          <div className="footer-links">
            <a href="#playground" className="footer-link">
              Playground
            </a>
            <a href="#features" className="footer-link">
              Features
            </a>
            <a href="#quickstart" className="footer-link">
              Quick Start
            </a>
            <a
              href="https://github.com/rgdlr/fluid-loading"
              target="_blank"
              rel="noreferrer"
              className="footer-link"
            >
              GitHub
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}

function renderContent(type: ContentType, variation: ContentVariation) {
  if (variation === 'error') {
    return null;
  }

  switch (type) {
    case 'card':
      return (
        <div className="content-card">
          <img
            src="/banner.jpg"
            alt="fluid-loading banner"
            className="content-card-image"
            data-fluid-loading-type="rect"
            style={{
              height: variation === 'short' ? 140 : variation === 'long' ? 240 : 180,
            }}
          />
          <div className="content-card-body">
            <h2 className="content-card-title">Explore Ambient Computing</h2>
            <p className="content-card-desc">
              Building declarative layout transitions without visual shifts or abrupt jumps.
              {variation === 'long' && (
                <>
                  <br />
                  <br />
                  Fluid transitions coordinate between unknown server response latencies and known
                  final geometry.
                </>
              )}
            </p>
            <button type="button" className="content-card-action">
              Read Documentation
            </button>
          </div>
        </div>
      );

    case 'article':
      return (
        <article className="content-card" style={{ padding: '1.75rem' }}>
          <div className="content-card-meta">
            <div
              className="content-avatar"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '50%',
                boxShadow: '0 0 12px rgba(245, 158, 11, 0.35)',
              }}
              data-fluid-loading-type="circle"
            />
            <div>
              <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#f8fafc' }}>John Doe</h3>
              <small style={{ color: '#64748b' }}>Published 2 hours ago</small>
            </div>
          </div>
          <h1 className="content-card-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            Designing Fluid Loading Transitions in Modern Web Applications
          </h1>
          <p className="content-card-desc">
            Skeletons were supposed to replace spinners, but inaccurate skeletons created a new UX
            antipattern: layout shifts.
          </p>
          {variation !== 'short' && (
            <p className="content-card-desc">
              By measuring the real rendered surface in-flight and applying a morphing transition,
              we can eliminate layout shift entirely.
            </p>
          )}
          {variation === 'long' && (
            <p className="content-card-desc">
              The result is a perception of speed where the UI feels like it unfolds naturally
              rather than popping into existence.
            </p>
          )}
        </article>
      );

    case 'profile':
      return (
        <div className="content-card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div
            data-fluid-loading-type="circle"
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              margin: '0 auto 1rem',
              background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #b45309 100%)',
              boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)',
              border: '2px solid rgba(251, 191, 36, 0.3)',
            }}
          />
          <h2 className="content-card-title" style={{ margin: 0 }}>
            John Doe
          </h2>
          <p style={{ margin: '0.25rem 0 1rem', color: '#94a3b8', fontSize: '0.9rem' }}>@johndoe</p>
          <p className="content-card-desc" style={{ maxWidth: 400, margin: '0 auto 1.5rem' }}>
            Systems architect & UI engineer. Exploring layout engines and reactive primitives.
          </p>
          {variation !== 'short' && (
            <div className="stats-grid">
              <div className="stat-item">
                <div data-fluid-loading-ignore className="stat-value">
                  142
                </div>
                <div data-fluid-loading-ignore className="stat-label">
                  Projects
                </div>
              </div>
              <div className="stat-item">
                <div data-fluid-loading-ignore className="stat-value">
                  18.4k
                </div>
                <div data-fluid-loading-ignore className="stat-label">
                  Followers
                </div>
              </div>
              <div className="stat-item">
                <div data-fluid-loading-ignore className="stat-value">
                  890
                </div>
                <div data-fluid-loading-ignore className="stat-label">
                  Stars
                </div>
              </div>
            </div>
          )}
          <button type="button" className="content-card-action">
            Follow Profile
          </button>
        </div>
      );

    case 'dashboard':
      return (
        <div
          className="content-card"
          style={{ padding: '1.5rem', width: '100%', boxSizing: 'border-box' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#94a3b8' }}>Total Revenue</h3>
            <span style={{ color: '#fbbf24', fontSize: '0.85rem', fontWeight: 600 }}>+18.2%</span>
          </div>
          <div
            style={{ fontSize: '2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem' }}
          >
            $84,230.00
          </div>
          <div
            data-fluid-loading-type="rect"
            style={{
              height: variation === 'short' ? 60 : variation === 'long' ? 160 : 100,
              background:
                'linear-gradient(180deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.02) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: 8,
              marginBottom: '1rem',
            }}
          />
          {variation === 'long' && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                color: '#94a3b8',
                fontSize: '0.8rem',
              }}
            >
              <span>Jan: $24k</span>
              <span>Feb: $28k</span>
              <span>Mar: $32k</span>
            </div>
          )}
        </div>
      );

    case 'product':
      return (
        <div className="content-card" style={{ width: '100%', boxSizing: 'border-box' }}>
          <div
            data-fluid-loading-type="rect"
            style={{
              height: variation === 'short' ? 140 : 180,
              background:
                'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(217, 119, 6, 0.08) 100%)',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#fbbf24',
                background: 'rgba(245, 158, 11, 0.15)',
                padding: '0.2rem 0.6rem',
                borderRadius: 9999,
                border: '1px solid rgba(245, 158, 11, 0.3)',
              }}
            >
              Best Seller
            </span>
            <span style={{ fontSize: '3rem' }}>🎧</span>
          </div>
          <div style={{ padding: '1.5rem' }}>
            <span
              style={{
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#f59e0b',
                fontWeight: 600,
              }}
            >
              Audio & Acoustics
            </span>
            <h3
              className="content-card-title"
              style={{ margin: '0.4rem 0 0.5rem', fontSize: '1.25rem' }}
            >
              AeroPulse Wireless Studio Pro
            </h3>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem',
                fontSize: '0.85rem',
              }}
            >
              <span style={{ color: '#fbbf24' }}>★★★★★</span>
              <span style={{ color: '#94a3b8' }}>4.9 (1,248 reviews)</span>
            </div>
            {variation !== 'short' && (
              <p
                className="content-card-desc"
                style={{ marginBottom: '1rem', fontSize: '0.875rem' }}
              >
                Adaptive spatial audio with custom 40mm beryllium drivers and 38-hour ultra-low
                latency battery life.
              </p>
            )}
            {variation === 'long' && (
              <div
                style={{
                  display: 'flex',
                  gap: '0.5rem',
                  alignItems: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Finishes:</span>
                <span
                  data-fluid-loading-type="circle"
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: '#0f172a',
                    border: '2px solid #fbbf24',
                    display: 'inline-block',
                  }}
                />
                <span
                  data-fluid-loading-type="circle"
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: '#94a3b8',
                    display: 'inline-block',
                  }}
                />
                <span
                  data-fluid-loading-type="circle"
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: '#d97706',
                    display: 'inline-block',
                  }}
                />
              </div>
            )}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc' }}>$289</span>
                <span
                  style={{ fontSize: '0.9rem', color: '#64748b', textDecoration: 'line-through' }}
                >
                  $349
                </span>
              </div>
              <button
                type="button"
                className="content-card-action"
                style={{ margin: 0, padding: '0.5rem 1.25rem', width: 'auto' }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      );

    case 'table':
      return (
        <div
          className="content-card"
          style={{ padding: '1.5rem', width: '100%', boxSizing: 'border-box' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.25rem',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>
                Recent Transactions
              </h3>
              <small style={{ color: '#64748b' }}>Real-time treasury stream</small>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#10b981',
                background: 'rgba(16, 185, 129, 0.12)',
                padding: '0.25rem 0.6rem',
                borderRadius: 9999,
                border: '1px solid rgba(16, 185, 129, 0.25)',
                fontWeight: 600,
              }}
            >
              Live Sync
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  data-fluid-loading-type="circle"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'rgba(245, 158, 11, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    color: '#fbbf24',
                    fontWeight: 700,
                  }}
                >
                  S
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>
                    Stripe Payout
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Today, 14:32</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#10b981' }}>
                  +$4,820.00
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Completed</div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div
                  data-fluid-loading-type="circle"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: 'rgba(148, 163, 184, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.9rem',
                    color: '#94a3b8',
                    fontWeight: 700,
                  }}
                >
                  G
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>
                    GitHub Enterprise
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Yesterday, 09:15</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                  -$210.00
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Completed</div>
              </div>
            </div>

            {variation !== 'short' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    data-fluid-loading-type="circle"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'rgba(239, 68, 68, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.9rem',
                      color: '#f87171',
                      fontWeight: 700,
                    }}
                  >
                    A
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>
                      AWS Cloud Infrastructure
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Sep 22, 18:40</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fbbf24' }}>
                    -$1,420.50
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#fbbf24' }}>Processing</div>
                </div>
              </div>
            )}

            {variation === 'long' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '0.75rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    data-fluid-loading-type="circle"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'rgba(59, 130, 246, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.9rem',
                      color: '#60a5fa',
                      fontWeight: 700,
                    }}
                  >
                    F
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>
                      Figma Organization
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Sep 20, 11:22</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
                    -$180.00
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Completed</div>
                </div>
              </div>
            )}
          </div>
          <button type="button" className="content-card-action" style={{ marginTop: '1.25rem' }}>
            Export Full Statement
          </button>
        </div>
      );

    case 'margins':
      return (
        <div
          className="content-card"
          style={{ width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}
        >
          <div
            data-fluid-loading-type="rect"
            style={{
              height: 120,
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 45%, #0f172a 100%)',
              position: 'relative',
              overflow: 'hidden',
            }}
          />

          <div style={{ padding: '0 1.5rem 1.5rem', position: 'relative', zIndex: 2 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '0.75rem',
              }}
            >
              <div
                data-fluid-loading-type="circle"
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
                  border: '4px solid #141721',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.5)',
                  marginTop: '-42px',
                  position: 'relative',
                  zIndex: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  flexShrink: 0,
                }}
              >
                👨‍🔬
              </div>
              <div style={{ paddingTop: '0.85rem' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#38bdf8',
                    background: 'rgba(56, 189, 248, 0.12)',
                    padding: '0.3rem 0.75rem',
                    borderRadius: 9999,
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  Negative Margin (-42px)
                </span>
              </div>
            </div>

            <h2
              className="content-card-title"
              style={{ margin: '0.5rem 0 0.25rem', fontSize: '1.3rem' }}
            >
              Dr. Marcus Vance
            </h2>
            <p style={{ margin: '0.25rem 0 1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
              Staff Performance Engineer • @marcusvance
            </p>

            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                margin: '1rem 0',
              }}
            >
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.25rem' }}>
                Margin Collapsing Context
              </div>
              <p
                style={{
                  margin: '0.25rem 0 0.5rem',
                  fontSize: '0.85rem',
                  lineHeight: 1.5,
                  color: '#cbd5e1',
                }}
              >
                In standard CSS, adjacent vertical margins collapse into max(m1, m2). FluidLoading
                uses real DOM surface bounding boxes, automatically resolving exact collapsed
                geometry.
              </p>
            </div>

            {variation !== 'short' && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  margin: '1rem 0',
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Asymmetric Offsets:</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: 4,
                    background: 'rgba(245, 158, 11, 0.1)',
                    color: '#fbbf24',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                  }}
                >
                  margin-top: -40px
                </span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '0.2rem 0.5rem',
                    borderRadius: 4,
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.25)',
                  }}
                >
                  margin-left: auto
                </span>
              </div>
            )}

            {variation === 'long' && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                  margin: '1.25rem 0',
                }}
              >
                <div
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 8,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc' }}>
                    0.00ms
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Shift Jitter</div>
                </div>
                <div
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 8,
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>100%</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>BFC Contained</div>
                </div>
              </div>
            )}

            <button type="button" className="content-card-action" style={{ marginTop: '0.75rem' }}>
              Verify Margin Coordinates
            </button>
          </div>
        </div>
      );

    case 'list': {
      const listItems = [
        {
          id: 1,
          name: 'Sarah Connor',
          tag: 'core-runtime',
          status: 'Merged',
          time: '5m ago',
          badgeColor: '#10b981',
          avatarLetter: 'S',
          avatarBg: '#065f46',
        },
        {
          id: 2,
          name: 'David Heinemeier',
          tag: 'zero-cls',
          status: 'Review',
          time: '18m ago',
          badgeColor: '#f59e0b',
          avatarLetter: 'D',
          avatarBg: '#78350f',
        },
        {
          id: 3,
          name: 'Alexandre Russell',
          tag: 'ssr-hydration',
          status: 'Running',
          time: '42m ago',
          badgeColor: '#3b82f6',
          avatarLetter: 'A',
          avatarBg: '#1e3a8a',
        },
        {
          id: 4,
          name: 'Elena Rostova',
          tag: 'morph-engine',
          status: 'Merged',
          time: '1h ago',
          badgeColor: '#10b981',
          avatarLetter: 'E',
          avatarBg: '#065f46',
        },
        {
          id: 5,
          name: 'Liam Chen',
          tag: 'preact-adapter',
          status: 'Review',
          time: '2h ago',
          badgeColor: '#f59e0b',
          avatarLetter: 'L',
          avatarBg: '#78350f',
        },
        {
          id: 6,
          name: 'Maya Patel',
          tag: 'benchmarking',
          status: 'Merged',
          time: '3h ago',
          badgeColor: '#10b981',
          avatarLetter: 'M',
          avatarBg: '#065f46',
        },
        {
          id: 7,
          name: 'Tamas Szabo',
          tag: 'layout-engine',
          status: 'Running',
          time: '4h ago',
          badgeColor: '#3b82f6',
          avatarLetter: 'T',
          avatarBg: '#1e3a8a',
        },
        {
          id: 8,
          name: 'Chloe Dubois',
          tag: 'security-audit',
          status: 'Merged',
          time: '5h ago',
          badgeColor: '#10b981',
          avatarLetter: 'C',
          avatarBg: '#065f46',
        },
      ];

      const visibleListItems =
        variation === 'short'
          ? listItems.slice(0, 3)
          : variation === 'medium'
            ? listItems.slice(0, 5)
            : listItems;

      const chips = [
        'All Events',
        'Core Engine',
        'Adapters',
        'Performance',
        'Zero-CLS',
        'Security',
        'Docs',
      ];

      return (
        <div
          className="content-card"
          style={{ padding: '1.5rem', width: '100%', boxSizing: 'border-box' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>
                Engineering Activity
              </h3>
              <small style={{ color: '#64748b' }}>
                Dynamic list • {visibleListItems.length} active threads
              </small>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#38bdf8',
                background: 'rgba(56, 189, 248, 0.12)',
                padding: '0.25rem 0.6rem',
                borderRadius: 9999,
                border: '1px solid rgba(56, 189, 248, 0.25)',
                fontWeight: 600,
              }}
            >
              Live Feed
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '6px',
              marginBottom: '1.25rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            {chips.map((chip, idx) => (
              <span
                key={chip}
                style={{
                  fontSize: '0.72rem',
                  padding: '0.25rem 0.6rem',
                  borderRadius: 6,
                  background: idx === 0 ? '#f59e0b' : 'rgba(255, 255, 255, 0.05)',
                  color: idx === 0 ? '#000000' : '#94a3b8',
                  fontWeight: idx === 0 ? 600 : 400,
                  border: idx === 0 ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                {chip}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {visibleListItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 8,
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    data-fluid-loading-type="circle"
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      background: item.avatarBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: '#ffffff',
                    }}
                  >
                    {item.avatarLetter}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      #{item.tag} • {item.time}
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: '0.72rem',
                    color: item.badgeColor,
                    background: `${item.badgeColor}18`,
                    border: `1px solid ${item.badgeColor}33`,
                    padding: '0.2rem 0.5rem',
                    borderRadius: 9999,
                    fontWeight: 600,
                  }}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>

          <button type="button" className="content-card-action" style={{ marginTop: '1.25rem' }}>
            Load Next Batch
          </button>
        </div>
      );
    }

    case 'bento':
      return (
        <div
          className="content-card"
          style={{ padding: '1.5rem', width: '100%', boxSizing: 'border-box' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>
                Bento Grid Telemetry
              </h3>
              <small style={{ color: '#64748b' }}>Asymmetric 2D grid measuring</small>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#fbbf24',
                background: 'rgba(245, 158, 11, 0.12)',
                padding: '0.25rem 0.6rem',
                borderRadius: 9999,
                border: '1px solid rgba(245, 158, 11, 0.25)',
                fontWeight: 600,
              }}
            >
              2D Layout
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
            }}
          >
            <div
              style={{
                gridColumn: 'span 2',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 10,
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                CLS Score Stability
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#10b981' }}>0.000</div>
              <div
                data-fluid-loading-type="rect"
                style={{
                  height: 40,
                  marginTop: '0.5rem',
                  background:
                    'linear-gradient(90deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.05) 100%)',
                  borderRadius: 6,
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                }}
              />
            </div>

            <div
              style={{
                gridColumn: 'span 1',
                padding: '1rem',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 10,
                border: '1px solid rgba(255, 255, 255, 0.06)',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                data-fluid-loading-type="circle"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '3px solid #fbbf24',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#fbbf24',
                  marginBottom: '0.5rem',
                }}
              >
                99%
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Speed Index</div>
            </div>

            <div
              style={{
                gridColumn: 'span 1',
                padding: '0.85rem',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 10,
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Bundle</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>3.2 kB</div>
              <div style={{ fontSize: '0.68rem', color: '#10b981' }}>gzip minified</div>
            </div>

            <div
              style={{
                gridColumn: 'span 1',
                padding: '0.85rem',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 10,
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Dropped</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>0 fps</div>
              <div style={{ fontSize: '0.68rem', color: '#38bdf8' }}>60 fps smooth</div>
            </div>

            <div
              style={{
                gridColumn: 'span 1',
                padding: '0.85rem',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 10,
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Heap delta</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>+120 B</div>
              <div style={{ fontSize: '0.68rem', color: '#a855f7' }}>zero leak</div>
            </div>

            {variation !== 'short' && (
              <div
                style={{
                  gridColumn: 'span 3',
                  padding: '1rem',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: 10,
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                    Multi-Framework Tree
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Core engine runs framework-agnostic
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.5rem',
                      background: 'rgba(97, 218, 251, 0.1)',
                      color: '#61dafb',
                      borderRadius: 6,
                    }}
                  >
                    React
                  </span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.5rem',
                      background: 'rgba(65, 184, 131, 0.1)',
                      color: '#41b883',
                      borderRadius: 6,
                    }}
                  >
                    Vue
                  </span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.5rem',
                      background: 'rgba(78, 140, 203, 0.1)',
                      color: '#4e8ccb',
                      borderRadius: 6,
                    }}
                  >
                    Solid
                  </span>
                </div>
              </div>
            )}
          </div>

          <button type="button" className="content-card-action" style={{ marginTop: '1.25rem' }}>
            Inspect Bento Grid Metrics
          </button>
        </div>
      );
  }
}

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FluidLoading,
  measureElement,
  serializeSnapshot,
  createSkeletonElement,
  type FluidLoadingState,
  type InternalState,
  type LayoutSnapshot,
} from '@fluid-loading/react';
import './landing.css';

type ContentType = 'card' | 'article' | 'profile' | 'dashboard';
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

const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'amber',
    name: 'Amber Glow',
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
    name: 'Slate Minimal',
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
    name: 'Cyberpunk Violet',
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
    name: 'Emerald Matrix',
    boneBg: '#063828',
    surfaceBg: '#021e15',
    shimmerHex: '#34d399',
    shimmerOpacity: 30,
    shimmerDuration: 1.4,
    containerRadius: 12,
    textRadius: 4,
    rectRadius: 8,
  }
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
  const [selectedPreset, setSelectedPreset] = useState<string>('amber');
  const [boneBg, setBoneBg] = useState('#353d4f');
  const [surfaceBg, setSurfaceBg] = useState('#1c202b');
  const [shimmerHex, setShimmerHex] = useState('#fbbf24');
  const [shimmerOpacity, setShimmerOpacity] = useState(25);
  const [shimmerDuration, setShimmerDuration] = useState(1.5);
  const [containerRadius, setContainerRadius] = useState(14);
  const [textRadius, setTextRadius] = useState(5);
  const [rectRadius, setRectRadius] = useState(8);
  const [copiedCss, setCopiedCss] = useState(false);

  const [fluidState, setFluidState] = useState<FluidLoadingState>('loading');
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

  const applySlowMotionPreset = () => {
    setDuration(800);
    setMinimumSkeletonDuration(1000);
    setRevealDuration(400);
    triggerLoad();
  };

  const applyDefaultPreset = () => {
    setDuration(350);
    setMinimumSkeletonDuration(350);
    setRevealDuration(200);
    triggerLoad();
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

  const copyCssVariables = () => {
    const shimmerColor = hexToRgba(shimmerHex, shimmerOpacity);
    const css = `:root {
  --fluid-loading-bone-bg: ${boneBg};
  --fluid-loading-surface-bg: ${surfaceBg};
  --fluid-loading-shimmer-color: ${shimmerColor};
  --fluid-loading-shimmer-duration: ${shimmerDuration}s;
  --fluid-loading-radius: ${containerRadius}px;
  --fluid-loading-text-radius: ${textRadius}px;
  --fluid-loading-rect-radius: ${rectRadius}px;
}`;
    navigator.clipboard.writeText(css).then(() => {
      setCopiedCss(true);
      window.setTimeout(() => setCopiedCss(false), 2000);
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
            <a href="#demo" className="nav-link">Interactive Demo</a>
            <a href="#features" className="nav-link">Features</a>
            <a href="#benchmark" className="nav-link">Benchmark</a>
            <a href="#quickstart" className="nav-link">Quick Start</a>
          </div>

          <div className="nav-actions">
            <a
              href="https://github.com/rgdlr/fluid-loading"
              target="_blank"
              rel="noreferrer"
              className="nav-github-btn"
              aria-label="View on GitHub"
            >
              <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
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
            Stop flashing generic skeletons.<br />
            <span className="hero-gradient-text">Morph smoothly into real layouts.</span>
          </h1>
          <p className="hero-subtitle">
            fluid-loading measures real DOM geometry in-flight, smoothly interpolates container dimensions,
            and reveals your content with zero visual jarring and 0.00 Cumulative Layout Shift.
          </p>

          <div className="hero-ctas">
            <a href="#demo" className="hero-cta-btn">
              Explore Interactive Demo ↓
            </a>
            <button
              type="button"
              className="hero-terminal-btn"
              onClick={() => copyInstallCommand('npm install @fluid-loading/react')}
            >
              <code>npm install @fluid-loading/react</code>
              <span>{copiedInstall ? '✓ Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="hero-highlights-strip">
            <div className="highlight-item">
              <span className="highlight-value">0.00</span>
              <span className="highlight-label">Cumulative Layout Shift</span>
            </div>
            <div className="highlight-item">
              <span className="highlight-value">&lt; 1ms</span>
              <span className="highlight-label">Measurement Overhead</span>
            </div>
            <div className="highlight-item">
              <span className="highlight-value">Zero-Config</span>
              <span className="highlight-label">Styles Bundled in React</span>
            </div>
            <div className="highlight-item">
              <span className="highlight-value">100%</span>
              <span className="highlight-label">Accessible &amp; Reduced-Motion</span>
            </div>
          </div>
        </section>

        <section id="demo" className="demo-section">
          <div className="section-header">
            <span className="section-tag">Interactive Sandbox</span>
            <h2 className="section-title">Experience the Transition Live</h2>
            <p className="section-desc">
              Test in-flight geometry morphing, skeleton detection, and custom theme tokens in real time.
            </p>
          </div>

          <div className="main-layout">
        <aside className="sidebar">
          <div className="actions-row">
            <button className="trigger-button" onClick={triggerLoad}>
              Reload
            </button>
            <button className="preset-button" onClick={applySlowMotionPreset}>
              Slow Motion
            </button>
          </div>

          <div className="sidebar-tab-switcher">
            <button
              type="button"
              className={`sidebar-tab-btn ${sidebarTab === 'behavior' ? 'active' : ''}`}
              onClick={() => setSidebarTab('behavior')}
            >
              Timing & Layout
            </button>
            <button
              type="button"
              className={`sidebar-tab-btn ${sidebarTab === 'styles' ? 'active' : ''}`}
              onClick={() => setSidebarTab('styles')}
            >
              Styles & Theme
            </button>
          </div>

          {sidebarTab === 'behavior' ? (
            <>
              <button
                className="reset-button"
                onClick={applyDefaultPreset}
              >
                Reset Timing and Layout
              </button>

              <div className="control-group">
                <label>
                  Content Type: <span className="value">{contentType}</span>
                </label>
                <div className="segmented-control">
                  {(['card', 'article', 'profile', 'dashboard'] as ContentType[]).map((type) => (
                    <button
                      key={type}
                      className={`segmented-button ${contentType === type ? 'active' : ''}`}
                      onClick={() => handleContentTypeChange(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="control-group">
                <label>
                  Variation: <span className="value">{variation}</span>
                </label>
                <div className="segmented-control">
                  {(['short', 'medium', 'long', 'error'] as ContentVariation[]).map((v) => (
                    <button
                      key={v}
                      className={`segmented-button ${variation === v ? 'active' : ''}`}
                      onClick={() => handleVariationChange(v)}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <div className="control-group">
                <label>
                  Motion: <span className="value">{motionMode}</span>
                </label>
                <div className="segmented-control">
                  {(['normal', 'reduced'] as MotionMode[]).map((m) => (
                    <button
                      key={m}
                      className={`segmented-button ${motionMode === m ? 'active' : ''}`}
                      onClick={() => setMotionMode(m)}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div className="control-group">
                <label>
                  Estimated Height: <span className="value">{estimatedHeight}px</span>
                </label>
                <input
                  type="range"
                  min="100"
                  max="600"
                  step="10"
                  value={estimatedHeight}
                  onChange={(e) => setEstimatedHeight(Number(e.target.value))}
                />
              </div>

              <div className="control-group">
                <label>
                  Morph Duration: <span className="value">{duration}ms</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1500"
                  step="50"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                />
              </div>

              <div className="control-group">
                <label>
                  Min Skeleton Duration: <span className="value">{minimumSkeletonDuration}ms</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="50"
                  value={minimumSkeletonDuration}
                  onChange={(e) => setMinimumSkeletonDuration(Number(e.target.value))}
                />
              </div>

              <div className="control-group">
                <label>
                  Reveal Duration: <span className="value">{revealDuration}ms</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="800"
                  step="25"
                  value={revealDuration}
                  onChange={(e) => setRevealDuration(Number(e.target.value))}
                />
              </div>

              <div className="control-group">
                <label>
                  Network Delay: <span className="value">{networkDelay}ms</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="2000"
                  step="100"
                  value={networkDelay}
                  onChange={(e) => setNetworkDelay(Number(e.target.value))}
                />
              </div>
            </>
          ) : (
            <>
              <button
                className="reset-button"
                onClick={resetStylesToDefault}
              >
                Reset Styles and Theme
              </button>

              <div className="control-group">
                <label>Theme Presets</label>
                <div className="theme-presets-grid">
                  {THEME_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      className={`theme-preset-card ${selectedPreset === preset.id ? 'active' : ''}`}
                      onClick={() => applyThemePreset(preset)}
                    >
                      <span className="theme-preset-name">{preset.name}</span>
                      <div className="theme-preset-preview">
                        <span
                          className="theme-preset-swatch"
                          style={{ backgroundColor: preset.surfaceBg }}
                          title="Surface"
                        />
                        <span
                          className="theme-preset-swatch"
                          style={{ backgroundColor: preset.boneBg }}
                          title="Bone"
                        />
                        <span
                          className="theme-preset-swatch"
                          style={{ backgroundColor: preset.shimmerHex }}
                          title="Shimmer"
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="control-group">
                <label>
                  Bone Background: <span className="value">{boneBg}</span>
                </label>
                <span className="color-label-pill">--fluid-loading-bone-bg</span>
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
                  Surface Background: <span className="value">{surfaceBg}</span>
                </label>
                <span className="color-label-pill">--fluid-loading-surface-bg</span>
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
                  Shimmer Accent: <span className="value">{shimmerHex}</span>
                </label>
                <span className="color-label-pill">--fluid-loading-shimmer-color</span>
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
                  <span className="color-value-text">{hexToRgba(shimmerHex, shimmerOpacity)}</span>
                </div>
              </div>

              <div className="control-group">
                <label>
                  Shimmer Opacity: <span className="value">{shimmerOpacity}%</span>
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
                  Shimmer Wave Speed: <span className="value">{shimmerDuration}s</span>
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
                  Container Radius: <span className="value">{containerRadius}px</span>
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
                  Text Bone Radius: <span className="value">{textRadius}px</span>
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
                  Rect Bone Radius: <span className="value">{rectRadius}px</span>
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

              <div className="css-export-section">
                <button
                  type="button"
                  className="copy-css-btn"
                  onClick={copyCssVariables}
                >
                  {copiedCss ? '✓ Copied to Clipboard!' : 'Copy CSS Variables'}
                </button>
                <pre className="css-code-box">
                  {`:root {
  --fluid-loading-bone-bg: ${boneBg};
  --fluid-loading-surface-bg: ${surfaceBg};
  --fluid-loading-shimmer-color: ${hexToRgba(shimmerHex, shimmerOpacity)};
  --fluid-loading-shimmer-duration: ${shimmerDuration}s;
  --fluid-loading-radius: ${containerRadius}px;
  --fluid-loading-text-radius: ${textRadius}px;
  --fluid-loading-rect-radius: ${rectRadius}px;
}`}
                </pre>
              </div>
            </>
          )}
        </aside>

        <main className="stage-wrapper">
          <div className="stage-card">
            <div className="stage-header">
              <span className="stage-title">Transition Stage</span>
              <div className="state-indicators">
                <span className={`status-badge ${internalState}`}>
                  {internalState}
                </span>
              </div>
            </div>

            <div className="preview-wrapper">
              <FluidLoading
                loading={loading}
                error={isError ? new Error('Simulated network failure') : undefined}
                estimatedHeight={estimatedHeight}
                duration={motionMode === 'reduced' ? 0 : duration}
                revealDuration={motionMode === 'reduced' ? 0 : revealDuration}
                minimumSkeletonDuration={motionMode === 'reduced' ? 0 : minimumSkeletonDuration}
                onStateChange={setFluidState}
                onInternalStateChange={setInternalState}
                onSnapshot={setLastSnapshot}
                style={{
                  ['--fluid-loading-bone-bg' as string]: boneBg,
                  ['--fluid-loading-surface-bg' as string]: surfaceBg,
                  ['--fluid-loading-shimmer-color' as string]: hexToRgba(shimmerHex, shimmerOpacity),
                  ['--fluid-loading-shimmer-duration' as string]: `${shimmerDuration}s`,
                  ['--fluid-loading-radius' as string]: `${containerRadius}px`,
                  ['--fluid-loading-text-radius' as string]: `${textRadius}px`,
                  ['--fluid-loading-rect-radius' as string]: `${rectRadius}px`,
                }}
                errorFallback={
                  <div className="fluid-loading-error-container">
                    <p>Failed to load data. The container surface remained stable.</p>
                    <button className="content-card-action" onClick={triggerLoad}>
                      Retry
                    </button>
                  </div>
                }
              >
                {renderContent(contentType, variation)}
              </FluidLoading>
            </div>
          </div>
        </main>
        </div>
        </section>

        <section id="features" className="features-section">
          <div className="section-header">
            <span className="section-tag">Capabilities</span>
            <h2 className="section-title">Architecture &amp; Real-time Verification</h2>
            <p className="section-desc">
              Inspect generated structural bone primitives, run in-browser layout benchmarks, and verify 0.00 CLS.
            </p>
          </div>

          <div className="bento-grid">
            <div className="bento-card">
              <div className="bento-card-header">
                <div className="bento-card-title-group">
                  <span className="bento-tag">Inspection</span>
                  <h2>Precise Skeleton Bones Detected</h2>
                </div>
                {lastSnapshot && (
                  <span className="bento-count-badge">{lastSnapshot.bones.length} bones</span>
                )}
              </div>
              {lastSnapshot && lastSnapshot.bones.length > 0 ? (
                <>
                  <p className="bento-subtitle">
                    Snapshot: <strong>{lastSnapshot.width}×{lastSnapshot.height}px</strong> &bull;{' '}
                    {lastSnapshot.bones.filter((b) => b.type === 'text').length} text,{' '}
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
                <div className="bento-card-title-group">
                  <span className="bento-tag">Performance</span>
                  <h2>DOM Scalability Benchmark</h2>
                </div>
                <button
                  className="content-card-action bento-action-button"
                  onClick={runBenchmark}
                  disabled={isBenchmarking}
                >
                  {isBenchmarking ? 'Running...' : 'Run Benchmark'}
                </button>
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
                  <span>Click "Run Benchmark" to test throughput across 10, 100, 500, and 1,000 DOM nodes.</span>
                </div>
              )}
            </div>
          </div>

          <div className="features-trio">
            <div className="feature-mini-card">
              <span className="feature-mini-icon">🛡️</span>
              <h3 className="feature-mini-title">Zero Layout Shifts (0.00 CLS)</h3>
              <p className="feature-mini-desc">
                By measuring actual rendered DOM geometry before reveal and animating container dimensions, content never abruptly shifts existing layout elements.
              </p>
            </div>

            <div className="feature-mini-card">
              <span className="feature-mini-icon">♿</span>
              <h3 className="feature-mini-title">Accessible by Default</h3>
              <p className="feature-mini-desc">
                Automatically manages aria-busy, marks skeletons with aria-hidden, and detects @media (prefers-reduced-motion) to transition instantly without animation.
              </p>
            </div>

            <div className="feature-mini-card">
              <span className="feature-mini-icon">🎨</span>
              <h3 className="feature-mini-title">Zero CSS Dependencies</h3>
              <p className="feature-mini-desc">
                Styles are bundled directly into @fluid-loading/react with no extra CSS imports required. Easily theme via CSS custom properties (--fluid-loading-*).
              </p>
            </div>
          </div>
        </section>

        <section id="quickstart" className="quickstart-section">
          <div className="section-header">
            <span className="section-tag">Quick Start</span>
            <h2 className="section-title">Integrate in Minutes</h2>
            <p className="section-desc">
              Install the React package and wrap your component. Zero manual CSS setup or placeholder drawings needed.
            </p>
          </div>

          <div className="quickstart-card">
            <div className="quickstart-header">
              <span className="quickstart-title">UserCard.tsx</span>
              <button
                type="button"
                className="copy-css-btn"
                onClick={copyQuickstartCode}
              >
                {copiedQuickstart ? '✓ Copied!' : 'Copy Code'}
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
            <a href="#demo" className="footer-link">Playground</a>
            <a href="#features" className="footer-link">Features</a>
            <a href="#quickstart" className="footer-link">Quick Start</a>
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
                  <br /><br />
                  Fluid transitions coordinate between unknown server response latencies and known final geometry.
                </>
              )}
            </p>
            <button className="content-card-action">Read Documentation</button>
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
              <h3 style={{ margin: 0, fontSize: '0.95rem', color: '#f8fafc' }}>Elena Rostova</h3>
              <small style={{ color: '#64748b' }}>Published 2 hours ago</small>
            </div>
          </div>
          <h1 className="content-card-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            Designing Fluid Loading Transitions in Modern Web Applications
          </h1>
          <p className="content-card-desc">
            Skeletons were supposed to replace spinners, but inaccurate skeletons created a new UX antipattern: layout shifts.
          </p>
          {variation !== 'short' && (
            <p className="content-card-desc">
              By measuring the real rendered surface in-flight and applying a morphing transition, we can eliminate layout shift entirely.
            </p>
          )}
          {variation === 'long' && (
            <p className="content-card-desc">
              The result is a perception of speed where the UI feels like it unfolds naturally rather than popping into existence.
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
          <h2 className="content-card-title" style={{ margin: 0 }}>John Doe</h2>
          <p style={{ margin: '0.25rem 0 1rem', color: '#94a3b8', fontSize: '0.9rem' }}>@johndoe</p>
          <p className="content-card-desc" style={{ maxWidth: 400, margin: '0 auto 1.5rem' }}>
            Systems architect & UI engineer. Exploring layout engines and reactive primitives.
          </p>
          {variation !== 'short' && (
            <div className="stats-grid">
              <div className="stat-item">
                <div data-fluid-loading-ignore className="stat-value">142</div>
                <div data-fluid-loading-ignore className="stat-label">Projects</div>
              </div>
              <div className="stat-item">
                <div data-fluid-loading-ignore className="stat-value">18.4k</div>
                <div data-fluid-loading-ignore className="stat-label">Followers</div>
              </div>
              <div className="stat-item">
                <div data-fluid-loading-ignore className="stat-value">890</div>
                <div data-fluid-loading-ignore className="stat-label">Stars</div>
              </div>
            </div>
          )}
          <button className="content-card-action">Follow Profile</button>
        </div>
      );

    case 'dashboard':
      return (
        <div className="content-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#94a3b8' }}>Total Revenue</h3>
            <span style={{ color: '#fbbf24', fontSize: '0.85rem', fontWeight: 600 }}>+18.2%</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem' }}>
            $84,230.00
          </div>
          <div
            data-fluid-loading-type="rect"
            style={{
              height: variation === 'short' ? 60 : variation === 'long' ? 160 : 100,
              background: 'linear-gradient(180deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.02) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: 8,
              marginBottom: '1rem',
            }}
          />
          {variation === 'long' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '0.8rem' }}>
              <span>Jan: $24k</span>
              <span>Feb: $28k</span>
              <span>Mar: $32k</span>
            </div>
          )}
        </div>
      );
  }
}

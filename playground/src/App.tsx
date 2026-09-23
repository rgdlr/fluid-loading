import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Fluid } from '@fluid-loading/react';
import {
  measureElement,
  serializeSnapshot,
  createSkeletonElement,
  type FluidState,
  type InternalState,
  type LayoutSnapshot,
} from '@fluid-loading/core';
import '@fluid-loading/styles';
import './playground.css';

type ContentType = 'card' | 'article' | 'profile' | 'dashboard';
type ContentVariation = 'short' | 'medium' | 'long' | 'error';
type MotionMode = 'normal' | 'reduced';

interface BenchmarkResult {
  nodeCount: number;
  scanTimeMs: number;
  boneCount: number;
  snapshotBytes: number;
  skeletonDomTimeMs: number;
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

  const [fluidState, setFluidState] = useState<FluidState>('loading');
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

  const isError = variation === 'error';

  return (
    <div className="playground-container">
      <header className="header">
        <h1>Fluid Loading Playground</h1>
        <p>Layout-aware transition engine: Estimated Surface → Precise Skeleton → Smooth Reveal</p>
      </header>

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

          <button
            style={{
              background: 'transparent',
              border: '1px solid #334155',
              borderRadius: 6,
              color: '#94a3b8',
              padding: '6px',
              fontSize: '0.8rem',
              cursor: 'pointer',
            }}
            onClick={applyDefaultPreset}
          >
            Reset to Standard Timing
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
              <Fluid
                loading={loading}
                error={isError ? new Error('Simulated network failure') : undefined}
                estimatedHeight={estimatedHeight}
                duration={motionMode === 'reduced' ? 0 : duration}
                revealDuration={motionMode === 'reduced' ? 0 : revealDuration}
                minimumSkeletonDuration={motionMode === 'reduced' ? 0 : minimumSkeletonDuration}
                onStateChange={setFluidState}
                onInternalStateChange={setInternalState}
                onSnapshot={setLastSnapshot}
                errorFallback={
                  <div className="fluid-error-container">
                    <p>Failed to load data. The container surface remained stable.</p>
                    <button className="content-card-action" onClick={triggerLoad}>
                      Retry
                    </button>
                  </div>
                }
              >
                {renderContent(contentType, variation)}
              </Fluid>
            </div>
          </div>

          {lastSnapshot && lastSnapshot.bones.length > 0 && (
            <div className="benchmark-card">
              <h2>Precise Skeleton Bones Detected ({lastSnapshot.bones.length})</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 0.5rem 0' }}>
                Snapshot: {lastSnapshot.width}x{lastSnapshot.height}px |{' '}
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
            </div>
          )}

          <div className="benchmark-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>DOM Scalability Benchmark</h2>
              <button
                className="content-card-action"
                onClick={runBenchmark}
                disabled={isBenchmarking}
              >
                {isBenchmarking ? 'Running...' : 'Run Benchmark'}
              </button>
            </div>

            {benchmarkResults.length > 0 && (
              <table className="benchmark-table">
                <thead>
                  <tr>
                    <th>DOM Nodes</th>
                    <th>Measure Time</th>
                    <th>Bones Detected</th>
                    <th>Snapshot Size</th>
                    <th>Skeleton Build Time</th>
                  </tr>
                </thead>
                <tbody>
                  {benchmarkResults.map((res) => (
                    <tr key={res.nodeCount}>
                      <td>{res.nodeCount} nodes</td>
                      <td>{res.scanTimeMs} ms</td>
                      <td>{res.boneCount}</td>
                      <td>{res.snapshotBytes} bytes</td>
                      <td>{res.skeletonDomTimeMs} ms</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
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
          <div
            className="content-card-image"
            data-fluid-type="rect"
            style={{
              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
              height: variation === 'short' ? 120 : variation === 'long' ? 240 : 180,
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
              style={{ background: '#38bdf8', borderRadius: '50%' }}
              data-fluid-type="circle"
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
            data-fluid-type="circle"
            style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              margin: '0 auto 1rem',
              background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
            }}
          />
          <h2 className="content-card-title" style={{ margin: 0 }}>Sofia Mendes</h2>
          <p style={{ margin: '0.25rem 0 1rem', color: '#94a3b8', fontSize: '0.9rem' }}>@sofiamendes</p>
          <p className="content-card-desc" style={{ maxWidth: 400, margin: '0 auto 1.5rem' }}>
            Systems architect & UI engineer. Exploring layout engines and reactive primitives.
          </p>
          {variation !== 'short' && (
            <div className="stats-grid">
              <div className="stat-item">
                <div data-fluid-ignore className="stat-value">142</div>
                <div data-fluid-ignore className="stat-label">Projects</div>
              </div>
              <div className="stat-item">
                <div data-fluid-ignore className="stat-value">18.4k</div>
                <div data-fluid-ignore className="stat-label">Followers</div>
              </div>
              <div className="stat-item">
                <div data-fluid-ignore className="stat-value">890</div>
                <div data-fluid-ignore className="stat-label">Stars</div>
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
            <span style={{ color: '#4ade80', fontSize: '0.85rem', fontWeight: 600 }}>+18.2%</span>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem' }}>
            $84,230.00
          </div>
          <div
            data-fluid-type="rect"
            style={{
              height: variation === 'short' ? 60 : variation === 'long' ? 160 : 100,
              background: 'linear-gradient(180deg, rgba(56, 189, 248, 0.2) 0%, rgba(56, 189, 248, 0.02) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
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

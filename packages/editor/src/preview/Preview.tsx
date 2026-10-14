import type { Pattern } from '@gds/engine';

import { usePreview } from './usePreview';

interface PreviewProps {
  readonly pattern: Pattern | null;
}

export function Preview({ pattern }: PreviewProps) {
  const {
    containerRef,
    canvasRef,
    stats,
    paused,
    error,
    restart,
    togglePause,
    onMouseMove,
    onMouseLeave,
  } = usePreview(pattern);

  return (
    <section className="panel preview">
      <header className="panel-header">
        <h2>Preview</h2>
        <div className="toolbar">
          <button type="button" onClick={togglePause}>
            {paused ? 'Resume' : 'Pause'}
          </button>
          <button type="button" onClick={restart}>
            Restart
          </button>
        </div>
      </header>
      <div className="preview-canvas" ref={containerRef}>
        <canvas ref={canvasRef} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} />
      </div>
      {error ? <p className="error">{error}</p> : null}
      <dl className="stats">
        <div>
          <dt>FPS</dt>
          <dd>{stats.fps}</dd>
        </div>
        <div>
          <dt>Bullets</dt>
          <dd>{stats.bullets}</dd>
        </div>
        <div>
          <dt>Time</dt>
          <dd>{stats.time.toFixed(1)}s</dd>
        </div>
        <div>
          <dt>Hits</dt>
          <dd>{stats.hits}</dd>
        </div>
      </dl>
      <p className="hint">Move the mouse over the preview to place the player target.</p>
    </section>
  );
}

import { useMemo, useState, type ChangeEvent, type Dispatch } from 'react';

import { downloadText } from '../lib/download';
import type { EditorAction, PatternDraft } from '../state/patternReducer';
import { importPatternText, patternFileName, serializePattern } from './serialize';

interface JsonPanelProps {
  readonly draft: PatternDraft;
  readonly dispatch: Dispatch<EditorAction>;
}

export function JsonPanel({ draft, dispatch }: JsonPanelProps) {
  const text = useMemo(() => serializePattern(draft), [draft]);
  const [importText, setImportText] = useState('');
  const [importErrors, setImportErrors] = useState<readonly string[]>([]);
  const [status, setStatus] = useState('');

  const runImport = (source: string): void => {
    const result = importPatternText(source);
    if (result.ok) {
      dispatch({ type: 'load', draft: result.draft });
      setImportErrors([]);
      setStatus('Imported.');
    } else {
      setImportErrors(result.errors);
      setStatus('');
    }
  };

  const copy = (): void => {
    navigator.clipboard
      .writeText(text)
      .then(() => setStatus('Copied to clipboard.'))
      .catch(() => setStatus('Could not copy. Select the text and copy it manually.'));
  };

  const onFile = (event: ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;
    file
      .text()
      .then((content) => {
        setImportText(content);
        runImport(content);
      })
      .catch(() => setImportErrors(['pattern: could not read the file']));
    event.target.value = '';
  };

  return (
    <section className="panel json-panel">
      <header className="panel-header">
        <h2>JSON</h2>
        <div className="toolbar">
          <button type="button" onClick={copy}>
            Copy
          </button>
          <button type="button" onClick={() => downloadText(patternFileName(draft), text)}>
            Download
          </button>
        </div>
      </header>
      <textarea className="json-export" readOnly value={text} rows={12} spellCheck={false} />

      <h3>Import</h3>
      <textarea
        className="json-import"
        value={importText}
        onChange={(event) => setImportText(event.target.value)}
        placeholder="Paste pattern JSON here…"
        rows={6}
        spellCheck={false}
      />
      <div className="toolbar">
        <button
          type="button"
          disabled={importText.trim() === ''}
          onClick={() => runImport(importText)}
        >
          Import text
        </button>
        <label className="button">
          Open file…
          <input type="file" accept="application/json,.json" onChange={onFile} hidden />
        </label>
      </div>
      {status ? <p className="status ok">{status}</p> : null}
      {importErrors.length > 0 ? (
        <ul className="status error">
          {importErrors.map((error) => (
            <li key={error}>
              <code>{error}</code>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}

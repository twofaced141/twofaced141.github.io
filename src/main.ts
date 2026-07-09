import './style.css';
import CodeMirror from 'codemirror';
import 'codemirror/mode/sql/sql';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/material-darker.css';
import { parseParams } from './lib/parse';
import { injectParams } from './lib/inject';
import { formatSQL } from './lib/format';

// ─── DOM refs ──────────────────────────────────────────────────────────────

const sqlInput = document.getElementById('sqlInput') as HTMLTextAreaElement;
const paramsInput = document.getElementById('paramsInput') as HTMLTextAreaElement;
const formatBtn = document.getElementById('formatBtn') as HTMLButtonElement;
const copyBtn = document.getElementById('copyBtn') as HTMLButtonElement;
const clearBtn = document.getElementById('clearBtn') as HTMLButtonElement;

// ─── CodeMirror ────────────────────────────────────────────────────────────

const editor = CodeMirror(document.getElementById('editor')!, {
  mode: 'text/x-sql',
  theme: 'material-darker',
  readOnly: true,
  lineNumbers: true,
  viewportMargin: Infinity,
});

// ─── Core ──────────────────────────────────────────────────────────────────

let processTimer: ReturnType<typeof setTimeout> | null = null;

function process() {
  const rawSQL = sqlInput.value;
  const rawParams = paramsInput.value;

  if (!rawSQL.trim()) {
    editor.setValue('Enter a SQL query to format.');
    copyBtn.disabled = true;
    return;
  }

  let params: unknown[] | Record<string, unknown>;
  try {
    params = parseParams(rawParams);
  } catch (e: unknown) {
    editor.setValue('Error parsing parameters: ' + (e as Error).message);
    copyBtn.disabled = true;
    return;
  }

  let injected: string;
  try {
    injected = injectParams(rawSQL, params);
  } catch (e: unknown) {
    editor.setValue('Error injecting parameters: ' + (e as Error).message);
    copyBtn.disabled = true;
    return;
  }

  const formatted = formatSQL(injected);
  editor.setValue(formatted || '(empty result)');
  copyBtn.disabled = false;
}

function scheduleProcess() {
  if (processTimer) clearTimeout(processTimer);
  processTimer = setTimeout(process, 300);
}

// ─── Copy ──────────────────────────────────────────────────────────────────

function copySQL() {
  const text = editor.getValue();
  if (!text || text.startsWith('Enter') || text.startsWith('Error')) return;

  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => flashCopyBtn('Copied!')).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text: string) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
    flashCopyBtn('Copied!');
  } catch {
    flashCopyBtn('Failed');
  }
  document.body.removeChild(ta);
}

function flashCopyBtn(msg: string) {
  const orig = copyBtn.innerHTML;
  copyBtn.innerHTML = msg;
  copyBtn.disabled = true;
  setTimeout(() => {
    copyBtn.innerHTML = orig;
    copyBtn.disabled = false;
  }, 1800);
}

// ─── Clear ─────────────────────────────────────────────────────────────────

function clearAll() {
  sqlInput.value = '';
  paramsInput.value = '';
  editor.setValue('Enter a SQL query to format.');
  copyBtn.disabled = true;
  sqlInput.focus();
}

// ─── Events ────────────────────────────────────────────────────────────────

formatBtn.addEventListener('click', () => {
  if (processTimer) clearTimeout(processTimer);
  process();
});

copyBtn.addEventListener('click', copySQL);
clearBtn.addEventListener('click', clearAll);
sqlInput.addEventListener('input', scheduleProcess);
paramsInput.addEventListener('input', scheduleProcess);

document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    if (document.activeElement === sqlInput || document.activeElement === paramsInput) {
      if (processTimer) clearTimeout(processTimer);
      process();
    }
  }
});

// ─── CLI card copy buttons ────────────────────────────────────────────────

document.getElementById('cliCard')?.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest('.cli-copy') as HTMLElement | null;
  if (!btn) return;
  const text = btn.getAttribute('data-copy') || '';
  if (!text) return;
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).then(() => flashCLICopy(btn));
  } else {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    flashCLICopy(btn);
  }
});

function flashCLICopy(btn: HTMLElement) {
  const orig = btn.innerHTML;
  btn.innerHTML = 'Copied!';
  setTimeout(() => { btn.innerHTML = orig; }, 1200);
}

// ─── Init ──────────────────────────────────────────────────────────────────

process();

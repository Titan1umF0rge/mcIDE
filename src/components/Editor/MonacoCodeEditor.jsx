import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useWorkspace } from '../../context/WorkspaceContext';

export default function MonacoCodeEditor() {
  const { files, activeTab, updateCodeAndSyncForm } = useWorkspace();
  const editorRef = useRef(null);

  const getLanguage = (path) => {
    if (!path) return 'plaintext';
    if (path.endsWith('.java')) return 'java';
    if (path.endsWith('.json') || path.endsWith('.mcmeta')) return 'json';
    if (path.endsWith('.yml') || path.endsWith('.yaml')) return 'yaml';
    if (path.endsWith('.xml') || path.endsWith('.html')) return 'xml';
    if (path.endsWith('.vsh') || path.endsWith('.fsh')) return 'c'; // or glsl
    if (path.endsWith('.mcfunction')) return 'mcfunction';
    if (path.endsWith('.toml')) return 'ini';
    return 'plaintext';
  };

  const handleEditorWillMount = (monaco) => {
    // Define mcIDE Dark Theme matching exact spec #0f1011, #161719, #1c1d1f, #e2e8f0, #22c55e
    monaco.editor.defineTheme('mcide-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
        { token: 'keyword', foreground: '8b5cf6', fontStyle: 'bold' },
        { token: 'string', foreground: '22c55e' },
        { token: 'number', foreground: 'f59e0b' },
        { token: 'type', foreground: '38bdf8' },
        { token: 'annotation', foreground: 'f43f5e' },
        { token: 'delimiter', foreground: '94a3b8' },
        { token: 'variable', foreground: 'e2e8f0' }
      ],
      colors: {
        'editor.background': '#0f1011',
        'editor.foreground': '#cbd5e1',
        'editor.lineHighlightBackground': '#161719',
        'editorLineNumber.foreground': '#475569',
        'editorLineNumber.activeForeground': '#22c55e',
        'editor.selectionBackground': '#264f78',
        'editor.inactiveSelectionBackground': '#3a3d41',
        'editorCursor.foreground': '#22c55e',
        'editorWhitespace.foreground': '#27282b',
        'editorIndentGuide.background1': '#1e2024',
        'editorIndentGuide.activeBackground1': '#383a40',
        'scrollbarSlider.background': '#23252a80',
        'scrollbarSlider.hoverBackground': '#3e4147',
        'scrollbarSlider.activeBackground': '#22c55e60'
      }
    });

    // Custom language for Minecraft Function (.mcfunction)
    if (!monaco.languages.getLanguages().some(l => l.id === 'mcfunction')) {
      monaco.languages.register({ id: 'mcfunction' });
      monaco.languages.setMonarchTokensProvider('mcfunction', {
        keywords: [
          'execute', 'run', 'as', 'at', 'positioned', 'facing', 'rotated', 'in',
          'say', 'tellraw', 'title', 'subtitle', 'actionbar',
          'give', 'clear', 'item', 'replace',
          'summon', 'kill', 'tp', 'teleport',
          'scoreboard', 'objectives', 'players', 'add', 'set', 'remove',
          'particle', 'playsound', 'stopsound',
          'effect', 'give', 'clear',
          'gamemode', 'gamerule', 'time', 'weather',
          'function', 'tag', 'datapack', 'reload', 'schedule'
        ],
        tokenizer: {
          root: [
            [/#.*$/, 'comment'],
            [/@[aeprs]\[.*?\]/, 'variable'],
            [/@[aeprs]/, 'variable'],
            [/[a-zA-Z_]\w*/, {
              cases: {
                '@keywords': 'keyword',
                '@default': 'identifier'
              }
            }],
            [/"([^"\\]|\\.)*"/, 'string'],
            [/[0-9]+(\.[0-9]+)?[bdfs]?/, 'number'],
            [/~[0-9.-]*/, 'number'],
            [/\^[0-9.-]*/, 'number']
          ]
        }
      });
    }
  };

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
  };

  const currentContent = activeTab && files[activeTab] !== undefined ? files[activeTab] : '';
  const language = getLanguage(activeTab);

  return (
    <div className="flex-1 h-full w-full bg-[#0f1011] relative overflow-hidden">
      {activeTab ? (
        <Editor
          height="100%"
          language={language}
          value={currentContent}
          theme="mcide-dark"
          beforeMount={handleEditorWillMount}
          onMount={handleEditorDidMount}
          onChange={(val) => {
            if (activeTab && val !== undefined) {
              updateCodeAndSyncForm(activeTab, val);
            }
          }}
          options={{
            fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
            fontSize: 13,
            lineHeight: 20,
            lineNumbers: 'on',
            lineNumbersMinChars: 3,
            renderLineHighlight: 'all',
            minimap: { enabled: true, maxColumn: 80 },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            bracketPairColorization: { enabled: true },
            padding: { top: 8, bottom: 8 }
          }}
        />
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-muted select-none">
          <div className="text-sm font-medium text-slate-400">No file opened in workspace</div>
          <div className="text-xs text-slate-600 mt-1">Select a file from the explorer or create a new template</div>
        </div>
      )}
    </div>
  );
}

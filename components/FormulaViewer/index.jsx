import React, { useState, useMemo, useRef } from "react";
import MonacoEditor from "@monaco-editor/react";

/* ===========================
   Parser Helpers
=========================== */

function isAlphaNumeric(ch) {
  return /[A-Za-z0-9_\.]/.test(ch);
}

function isWhitespace(ch) {
  return ch === " " || ch === "\t" || ch === "\n" || ch === "\r";
}

/* ===========================
   Formula Parser
=========================== */

function parseFormula(str) {
  let i = 0;
  const len = str.length;

  function peek() { return str[i]; }
  function next() { return str[i++]; }
  function eof() { return i >= len; }
  function skipWhitespace() { while (!eof() && isWhitespace(peek())) i++; }

  function parsePrimary() {
    skipWhitespace();
    if (eof()) return null;
    const ch = peek();

    if (ch === "(") {
      next();
      const inner = parseExpression();
      skipWhitespace();
      if (peek() === ")") next();
      return { type: "group", children: [inner] };
    }

    if (/[A-Za-z_]/.test(ch)) {
      let ident = "";
      while (!eof() && isAlphaNumeric(peek())) ident += next();
      skipWhitespace();

      if (peek() === "(") {
        next();
        const args = [];
        if (peek() === ")") { next(); return { type: "function", name: ident, args }; }
        while (!eof()) {
          args.push(parseExpression());
          skipWhitespace();
          if (peek() === ",") next();
          else if (peek() === ")") { next(); break; }
        }
        return { type: "function", name: ident, args };
      }

      if (["TRUE", "FALSE"].includes(ident.toUpperCase()))
        return { type: "boolean", value: ident.toUpperCase() === "TRUE" };

      if (peek() === ":") {
        next();
        let right = "";
        while (!eof() && isAlphaNumeric(peek())) right += next();
        return { type: "range", value: ident + ":" + right };
      }

      return { type: "identifier", value: ident };
    }

    if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(str[i + 1]))) {
      let num = "";
      while (!eof() && /[0-9\.]/.test(peek())) num += next();
      return { type: "number", value: parseFloat(num) };
    }

    return { type: "unknown", value: next() };
  }

  function parseExpression() {
    const nodes = [];
    while (!eof()) {
      skipWhitespace();
      if (peek() === ")" || peek() === ",") break;
      const prim = parsePrimary();
      if (prim) nodes.push(prim);
      skipWhitespace();
      if (!eof() && "+-*/=<>".includes(peek())) nodes.push({ type: "operator", value: next() });
    }
    if (nodes.length === 1) return nodes[0];
    return { type: "sequence", children: nodes };
  }

  skipWhitespace();
  if (peek() === "=") next();
  return parseExpression();
}

/* ===========================
   RenderTree Component
=========================== */

function RenderTree({ node }) {
  if (!node) return null;

  if (["number", "string", "identifier", "boolean", "range"].includes(node.type)) {
    return (
      <span className="px-2 py-0.5 rounded border text-sm bg-gray-100 dark:bg-gray-800">
        {node.type === "string" ? `"${node.value}"` : node.value}
      </span>
    );
  }

  if (node.type === "operator") {
    return <span className="mx-1 font-bold text-black">{node.value}</span>;
  }

  if (node.type === "sequence") {
    return (
      <div className="flex flex-wrap gap-1">
        {node.children.map((c, i) => <RenderTree key={i} node={c} />)}
      </div>
    );
  }

  if (node.type === "group") {
    return <div className="pl-4 border-l">{node.children.map((c, i) => <RenderTree key={i} node={c} />)}</div>;
  }

  if (node.type === "function") {
    return (
      <div className="pl-4 border-l-2 border-gray-300 space-y-2">
        <div className="font-bold text-indigo-600">{node.name.toUpperCase()}</div>
        <div className="flex gap-2">
          <span className="font-semibold text-gray-500 w-28">Condition:</span>
          <RenderTree node={node.args[0]} />
        </div>
        <div className="flex gap-2">
          <span className="font-semibold text-green-600 w-28">When true:</span>
          <RenderTree node={node.args[1]} />
        </div>
        <div className="flex gap-2">
          <span className="font-semibold text-purple-600 w-28">When false:</span>
          <RenderTree node={node.args[2]} />
        </div>
      </div>
    );
  }

  return null;
}

/* ===========================
   FormulaViewer Component
=========================== */

export default function FormulaViewer() {
  const [formula, setFormula] = useState(
    '=IF(age>18, "Adult", IF(age>12, IF(policy.pt>1000, "Teen with Policy", "Teen"), "Child"))'
  );

  const [showLeftParsed, setShowLeftParsed] = useState(false);
  const [search, setSearch] = useState("");

  const editorRef = useRef(null);

  const fields = [
    { name: "pt", description: "Number - Policy Threshold" },
    { name: "name", description: "Text - Policy Holder Name" },
    { name: "startDate", description: "Date - Policy Start Date" },
    { name: "endDate", description: "Date - Policy End Date" },
  ];

  const { ast } = useMemo(() => ({ ast: parseFormula(formula) }), [formula]);

  const filteredFields = fields.filter(f =>
    (`policy.${f.name}`).toLowerCase().includes(search.toLowerCase())
  );

  const insertAtCursor = (text) => {
    const editor = editorRef.current;
    if (!editor) return;

    const position = editor.getPosition();

    editor.executeEdits("", [
      {
        range: {
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        },
        text,
        forceMoveMarkers: true,
      },
    ]);

    editor.focus();
  };

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    monaco.languages.registerCompletionItemProvider("plaintext", {
      provideCompletionItems: (model, position) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        });

        let suggestions = [];

        const policyMatch = textUntilPosition.match(/policy\.([A-Za-z0-9_]*)$/);
        if (policyMatch) {
          const typedAfterDot = policyMatch[1];
          suggestions = fields
            .filter(f => f.name.startsWith(typedAfterDot))
            .map(f => ({
              label: f.name,
              kind: monaco.languages.CompletionItemKind.Field,
              insertText: f.name,
              detail: f.description,
            }));
        } else {
          const genericMatch = textUntilPosition.match(/([A-Za-z0-9_]*)$/);
          const prefix = genericMatch ? genericMatch[1] : "";

          suggestions = fields
            .filter(f => ("policy." + f.name).startsWith(prefix))
            .map(f => ({
              label: `policy.${f.name}`,
              kind: monaco.languages.CompletionItemKind.Field,
              insertText: `policy.${f.name}`,
              detail: f.description,
            }));
        }

        return { suggestions };
      }
    });
  };

  return (
    <div className="min-h-screen w-screen flex flex-col bg-background-light dark:bg-background-dark">
      <header className="border-b bg-primary text-white py-6 shadow-lg">
        <div className="pl-5 flex justify-between items-center">
          <h1 className="text-3xl font-bold">Formula Viewer</h1>
          <div className="flex gap-4 pr-5">
            <span className="material-icons cursor-pointer" onClick={() => setShowLeftParsed(!showLeftParsed)}>settings</span>
            <span className="material-icons cursor-pointer">help_outline</span>
          </div>
        </div>
      </header>

      <main className="w-screen space-y-8 px-5 mt-5 flex flex-col">
        <section className="w-full bg-white rounded-xl shadow border p-4">
          <MonacoEditor
            height="50px"
            defaultLanguage="plaintext"
            value={formula}
            onChange={setFormula}
            onMount={handleEditorDidMount}
            options={{
              fontFamily: "monospace",
              fontSize: 14,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
            }}
          />
        </section>

        <div className={`${showLeftParsed ? "flex gap-4" : ""}`}>
          {showLeftParsed && (
            <section className="w-1/2 bg-white rounded-xl shadow border p-4 min-h-[450px] max-h-[450px] overflow-auto">
              <input
                type="text"
                placeholder="Search policy fields..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full mb-4 px-3 py-2 border rounded text-sm text-gray-700"
              />

              <div className="space-y-2">
                {search.trim() !== "" && filteredFields.map((f) => (
                  <div
                    key={f.name}
                    onClick={() => insertAtCursor(`policy.${f.name}`)}
                    className="cursor-pointer px-3 py-2 rounded bg-gray-100 hover:bg-indigo-100 text-sm"
                  >
                    <div className="font-mono text-indigo-700">
                      policy.{f.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {f.description}
                    </div>
                  </div>
                ))}

                {search.trim() !== "" && filteredFields.length === 0 && (
                  <div className="text-sm text-gray-400">
                    No matching fields
                  </div>
                )}
              </div>

            </section>
          )}

          <section className={`${showLeftParsed ? "w-1/2" : "w-full"} bg-white rounded-xl shadow border p-6 min-h-[450px] max-h-[450px] overflow-auto`}>
            <h2 className="text-black font-semibold mb-4 flex items-center gap-2">
              <span className="material-icons text-indigo-500">account_tree</span>
              Parsed Structure
            </h2>

            <div className="font-mono text-sm">
              <RenderTree node={ast} />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

import type { PatchVariant } from "@/lib/mirai/types";

function buildDiff(originalCode: string, patchedCode: string) {
  const originalLines = originalCode.split("\n");
  const patchedLines = patchedCode.split("\n");

  return {
    original: originalLines.map((line, index) => ({
      line,
      lineNumber: index + 1,
      changed: !patchedLines.includes(line),
    })),
    patched: patchedLines.map((line, index) => ({
      line,
      lineNumber: index + 1,
      changed: !originalLines.includes(line),
    })),
  };
}

export function CodeDiff({ patch }: { patch: PatchVariant }) {
  const diff = buildDiff(patch.originalCode, patch.patchedCode);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
        <header className="border-b border-border px-5 py-4">
          <h2 className="font-medium">Original code</h2>
        </header>
        <div className="overflow-auto p-5">
          <table className="w-full border-collapse font-mono text-sm">
            <tbody>
              {diff.original.map((line) => (
                <tr key={`original-${line.lineNumber}`} className={line.changed ? "bg-destructive/10" : ""}>
                  <td className="w-12 border-r border-border pr-3 text-right text-muted-foreground">{line.lineNumber}</td>
                  <td className={`pl-4 ${line.changed ? "text-destructive" : "text-foreground"}`}>{line.line || " "}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="overflow-hidden rounded-[2rem] border border-border bg-card shadow-sm">
        <header className="border-b border-border px-5 py-4">
          <h2 className="font-medium">Suggested patch</h2>
        </header>
        <div className="overflow-auto p-5">
          <table className="w-full border-collapse font-mono text-sm">
            <tbody>
              {diff.patched.map((line) => (
                <tr key={`patched-${line.lineNumber}`} className={line.changed ? "bg-primary/10" : ""}>
                  <td className="w-12 border-r border-border pr-3 text-right text-muted-foreground">{line.lineNumber}</td>
                  <td className={`pl-4 ${line.changed ? "text-primary" : "text-foreground"}`}>{line.line || " "}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

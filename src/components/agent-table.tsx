import Link from "next/link";
import { LicenseChip } from "@/components/ui-kit";
import { ScoreBar, ScoreLegend } from "@/components/score-bar";
import { fmtDate, fmtStars, type Agent, type Ranked } from "@/lib/data";

const th = "px-3 py-3 text-left font-mono text-[0.6875rem] font-normal uppercase tracking-[0.12em] text-muted-foreground";

export function AgentTable({ agents, showScore = false }: { agents: (Agent | Ranked)[]; showScore?: boolean }) {
  return (
    <div className="space-y-3">
      <div className="surface-lg overflow-x-auto p-2 sm:p-3">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-ink/[0.09]">
              {showScore && <th scope="col" className={`${th} w-12`}>#</th>}
              <th scope="col" className={th}>Agent</th>
              {showScore && <th scope="col" className={th}>Score</th>}
              <th scope="col" className={`${th} text-right`}>Stars</th>
              <th scope="col" className={th}>Last push</th>
              <th scope="col" className={th}>License</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((a, i) => (
              <tr key={a.slug} className="border-b border-ink/[0.05] transition-colors last:border-0 hover:bg-ink/[0.03]">
                {showScore && <td className="mono-num px-3 py-3 text-muted-foreground">{String(i + 1).padStart(2, "0")}</td>}
                <td className="px-3 py-3">
                  <Link href={`/agents/${a.slug}`} className="font-medium tracking-[-0.02em] outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring">
                    {a.name}
                  </Link>
                </td>
                {showScore && (
                  <td className="px-3 py-3">
                    {"score" in a ? <ScoreBar score={a.score} parts={a.parts} /> : <span className="text-muted-foreground">n/a</span>}
                  </td>
                )}
                <td className="mono-num px-3 py-3 text-right">{fmtStars(a.stars)}</td>
                <td className="mono-num px-3 py-3 text-muted-foreground">{fmtDate(a.lastPush)}</td>
                <td className="px-3 py-3"><LicenseChip agent={a} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showScore && <ScoreLegend />}
    </div>
  );
}

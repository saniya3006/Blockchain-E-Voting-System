import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { useTheme } from "../context/ThemeContext";

/** Reads the chart colour tokens from CSS so both themes use their own validated steps. */
function useChartTokens() {
  const { theme } = useTheme();
  const [tokens, setTokens] = useState(null);
  useEffect(() => {
    // wait one frame so the ThemeProvider has applied the new `dark` class
    const frame = requestAnimationFrame(() => {
      const css = getComputedStyle(document.documentElement);
      const read = (name) => css.getPropertyValue(name).trim();
      setTokens({
        series: Array.from({ length: 8 }, (_, i) => read(`--chart-${i + 1}`)),
        grid: read("--chart-grid"),
        axis: read("--chart-axis"),
        surface: read("--chart-surface"),
        text: read("--text"),
        muted: read("--text-muted"),
      });
    });
    return () => cancelAnimationFrame(frame);
  }, [theme]);
  return tokens;
}

function ChartTooltip({ active, payload, totalVotes }) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  const pct = totalVotes > 0 ? ((item.voteCount / totalVotes) * 100).toFixed(1) : "0.0";
  return (
    <div className="glass-strong px-3 py-2 text-xs shadow-xl">
      <p className="flex items-center gap-2 font-semibold">
        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: item.color }} />
        {item.name}
      </p>
      <p className="mt-1 text-muted">
        <span className="font-semibold text-[color:var(--text)]">{item.voteCount}</span> votes · {pct}%
      </p>
    </div>
  );
}

/**
 * Two complementary views of the same results:
 *  - horizontal bar chart: ranking by vote count (magnitude)
 *  - donut chart: each candidate's share of the total
 * Colours follow candidate IDs so a candidate keeps the same colour everywhere.
 */
export default function ResultsChart({ candidates, totalVotes }) {
  const tokens = useChartTokens();
  if (!tokens) return null;

  const data = candidates.map((c) => ({ ...c, color: tokens.series[c.id % 8] }));
  const ranked = [...data].sort((a, b) => b.voteCount - a.voteCount || a.id - b.id);
  const barHeight = Math.max(220, ranked.length * 56);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="glass flex flex-col p-5 lg:col-span-3">
        <h3 className="section-title">Votes per candidate</h3>
        <p className="text-xs text-faint">Ranked by total votes</p>
        <div className="mt-4 flex-1" style={{ minHeight: barHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ranked} layout="vertical" margin={{ top: 4, right: 48, bottom: 4, left: 4 }} barCategoryGap={14}>
              <CartesianGrid horizontal={false} stroke={tokens.grid} strokeWidth={1} />
              <XAxis type="number" allowDecimals={false} tick={{ fill: tokens.axis, fontSize: 12 }} axisLine={{ stroke: tokens.grid }} tickLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fill: tokens.muted, fontSize: 13 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip cursor={{ fill: "rgba(99,102,241,0.08)" }} content={<ChartTooltip totalVotes={totalVotes} />} />
              <Bar dataKey="voteCount" radius={[0, 4, 4, 0]} maxBarSize={28} isAnimationActive>
                {ranked.map((entry) => (
                  <Cell key={entry.id} fill={entry.color} />
                ))}
                <LabelList dataKey="voteCount" position="right" fill={tokens.text} fontSize={13} fontWeight={600} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass p-5 lg:col-span-2">
        <h3 className="section-title">Vote share</h3>
        <p className="text-xs text-faint">Percentage of all votes cast</p>
        <div className="relative mt-2 h-60">
          {totalVotes > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.filter((d) => d.voteCount > 0)}
                  dataKey="voteCount"
                  nameKey="name"
                  innerRadius="62%"
                  outerRadius="90%"
                  paddingAngle={1}
                  stroke={tokens.surface}
                  strokeWidth={2}
                  startAngle={90}
                  endAngle={-270}
                >
                  {data
                    .filter((d) => d.voteCount > 0)
                    .map((entry) => (
                      <Cell key={entry.id} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip content={<ChartTooltip totalVotes={totalVotes} />} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="h-44 w-44 rounded-full border-[18px] border-slate-500/15" />
            </div>
          )}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-3xl font-bold">{totalVotes}</p>
            <p className="text-xs text-muted">total votes</p>
          </div>
        </div>
        {/* legend - identity is never conveyed by colour alone */}
        <ul className="mt-4 space-y-2">
          {data.map((c) => (
            <li key={c.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2">
                <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: c.color }} />
                <span className="truncate">{c.name}</span>
              </span>
              <span className="tabular-nums text-muted">{totalVotes > 0 ? ((c.voteCount / totalVotes) * 100).toFixed(1) : "0.0"}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

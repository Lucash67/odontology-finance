"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

export function DashboardChart({
  data,
}: {
  data: { month: string; recebido: number; despesas: number }[];
}) {
  return (
    <div className="h-56 w-full min-w-0 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={6} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ebeae4" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#6b6b6b" }} axisLine={false} tickLine={false} />
          <YAxis
            width={42}
            tick={{ fontSize: 10, fill: "#6b6b6b" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${Math.round(Number(v) / 1000)}k`}
          />
          <Tooltip
            cursor={{ fill: "#f1efe8" }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #ebeae4",
              boxShadow: "0 8px 24px rgba(20,20,20,0.08)",
            }}
            formatter={(value) => formatCurrency(Number(value ?? 0))}
          />
          <Legend />
          <Bar dataKey="recebido" name="Recebido" fill="#009050" radius={[8, 8, 0, 0]} />
          <Bar dataKey="despesas" name="Despesas pagas" fill="#d97706" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

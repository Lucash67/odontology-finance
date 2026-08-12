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
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d7e0db" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
          <Legend />
          <Bar dataKey="recebido" name="Recebido" fill="#0f6b5c" radius={[6, 6, 0, 0]} />
          <Bar dataKey="despesas" name="Despesas pagas" fill="#c45c26" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

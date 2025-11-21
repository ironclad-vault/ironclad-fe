"use client";

import { useMemo } from "react";
import type { Vault } from "@/declarations/ironclad_vault_backend/ironclad_vault_backend.did";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  type TooltipItem,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartDataPoint {
  date: string;
  balance: number;
  timestamp: number;
}

interface PortfolioChartProps {
  vaults: readonly Vault[] | Vault[];
}

export function PortfolioChart({ vaults }: PortfolioChartProps) {
  const formatDate = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleDateString("en-US", { month: "short" });
    return `${day} ${month}`;
  };

  const chartData = useMemo(() => {
    if (!vaults || vaults.length === 0) return [];

    // Sort vaults by created_at (oldest first)
    const sortedVaults = [...vaults].sort(
      (a, b) => Number(a.created_at) - Number(b.created_at)
    );

    const dataPoints: ChartDataPoint[] = [];
    let runningTotal = BigInt(0);

    // Add a point for each vault created
    for (const vault of sortedVaults) {
      runningTotal += vault.balance;
      const vaultDate = new Date(Number(vault.created_at) * 1000);
      const balanceBTC = Number(runningTotal) / 100_000_000;

      const point: ChartDataPoint = {
        date: formatDate(vaultDate),
        balance: balanceBTC,
        timestamp: Number(vault.created_at),
      };

      dataPoints.push(point);
    }

    // Ensure we have at least 2 points for a meaningful chart
    if (dataPoints.length < 2) {
      // Add a point at today if only one vault
      const now = new Date();
      const balanceBTC = Number(runningTotal) / 100_000_000;

      const todayPoint: ChartDataPoint = {
        date: formatDate(now),
        balance: balanceBTC,
        timestamp: Math.floor(now.getTime() / 1000),
      };

      dataPoints.push(todayPoint);
    }

    return dataPoints;
  }, [vaults]);

  const totalBTC = useMemo(() => {
    if (vaults.length === 0) return 0;
    let total = BigInt(0);
    for (const vault of vaults) {
      total += vault.balance;
    }
    return Number(total) / 100_000_000;
  }, [vaults]);

  if (chartData.length === 0) {
    return null;
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    interaction: {
      mode: "index" as const,
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#FFFFFF",
        bodyColor: "#F7931A",
        borderColor: "#F7931A",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (context: TooltipItem<"line">[]) => {
            return context[0]?.label || "";
          },
          label: (context: TooltipItem<"line">) => {
            const value = context.parsed.y;
            return `${Number(value).toFixed(2)} BTC`;
          },
        },
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          color: "#A1A1AA",
          font: {
            size: 12,
          },
        },
      },
      y: {
        display: true,
        grid: {
          color: "rgba(39, 39, 42, 0.3)",
          drawBorder: false,
        },
        ticks: {
          color: "#A1A1AA",
          font: {
            size: 12,
          },
          callback: (value: string | number) => {
            return Number(value).toFixed(2);
          },
        },
      },
    },
  };

  const chartDataset = {
    labels: chartData.map((d) => d.date),
    datasets: [
      {
        label: "Portfolio Balance",
        data: chartData.map((d) => d.balance),
        borderColor: "#F7931A",
        backgroundColor: "rgba(247, 147, 26, 0.1)",
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: "#F7931A",
        pointBorderColor: "#F7931A",
        pointBorderWidth: 0,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: "#FCA311",
      },
    ],
  };

  return (
    <div className="space-y-6 mb-12!">
      {/* Net Worth Summary */}
      <div className="card-pro">
        <h3 className="heading-brutal text-sm font-semibold text-label mb-2!">
          NET WORTH
        </h3>
        <div className="flex items-baseline gap-3">
          <span className="text-5xl font-black text-white">
            {totalBTC.toFixed(2)}
          </span>
          <span className="text-2xl font-bold text-zinc-400">BTC</span>
        </div>
        <p className="text-xs text-zinc-500 mt-3">
          {vaults.length} {vaults.length === 1 ? "position" : "positions"} ·
          From {chartData[0]?.date}
        </p>
      </div>

      {/* Portfolio Chart */}
      <div className="card-pro p-6 flex flex-col">
        <h3 className="heading-brutal text-sm font-semibold text-label mb-6!">
          PORTFOLIO VALUE
        </h3>

        <div style={{ position: "relative", flex: 1, width: "100%" }}>
          <Line data={chartDataset} options={chartOptions} />
        </div>

        <p className="text-xs text-zinc-500 mt-6 text-center">
          Portfolio growth from {chartData[0]?.date} to{" "}
          {chartData[chartData.length - 1]?.date}
        </p>
      </div>
    </div>
  );
}

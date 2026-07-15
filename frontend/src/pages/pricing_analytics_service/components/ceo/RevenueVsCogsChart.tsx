import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RevenueVsCogsChartProps {
  data?: Array<{
    quarter: string;
    revenue_inr: number;
    cogs_inr: number;
    transactions?: number;
  }>;
}

const customLabelsPlugin = {
  id: 'customLabels',
  afterDatasetsDraw: (chart: any) => {
    const { ctx, data, chartArea: { top } } = chart;
    ctx.save();
    ctx.textAlign = 'center';

    const revenueMeta = chart.getDatasetMeta(0);
    const cogsMeta = chart.getDatasetMeta(1);
    
    data.labels.forEach((label: any, i: number) => {
      const revBar = revenueMeta.data[i];
      const cogsBar = cogsMeta.data[i];
      if (!revBar || !cogsBar) return;
      
      const transactions = data.datasets[0].transactionsData?.[i];


      if (transactions) {
        const midX = (revBar.x + cogsBar.x) / 2;
        const text = transactions.toLocaleString();
        
        ctx.font = 'bold 10px sans-serif';
        const textWidth = ctx.measureText(text).width;
        const paddingX = 10;
        const pillHeight = 20;
        const pillY = top + 5; 
        
        ctx.fillStyle = '#fee2e2'; 
        ctx.beginPath();
        const r = pillHeight / 2;
        const rx = midX - textWidth/2 - paddingX;
        const rw = textWidth + paddingX*2;
        ctx.moveTo(rx + r, pillY);
        ctx.arcTo(rx + rw, pillY, rx + rw, pillY + pillHeight, r);
        ctx.arcTo(rx + rw, pillY + pillHeight, rx, pillY + pillHeight, r);
        ctx.arcTo(rx, pillY + pillHeight, rx, pillY, r);
        ctx.arcTo(rx, pillY, rx + rw, pillY, r);
        ctx.fill();
        
        ctx.fillStyle = '#991b1b'; 
        ctx.textBaseline = 'middle';
        ctx.fillText(text, midX, pillY + pillHeight/2);
      }
    });
    ctx.restore();
  }
};

const RevenueVsCogsChart = ({ data: apiData }: RevenueVsCogsChartProps) => {
  const sortQuarters = (a: string, b: string) => {
    const matchA = a.match(/Q(\d) /);
    const matchB = b.match(/Q(\d) /);
    const yearA = a.match(/FY (\d+)/);
    const yearB = b.match(/FY (\d+)/);
    if (!matchA || !matchB || !yearA || !yearB) return 0;
    const qA = parseInt(matchA[1]);
    const yA = parseInt(yearA[1]);
    const qB = parseInt(matchB[1]);
    const yB = parseInt(yearB[1]);
    if (yA !== yB) return yA - yB;
    return qA - qB;
  };

  if (!apiData || apiData.length === 0) return null;
  
  const sortedApiData = [...apiData]
    .filter((item) => {
      const q = item?.quarter || "";
      const match = q.match(/Q(\d) /);
      const year = q.match(/FY (\d+)/);
      if (!match || !year) return false;
      const qNum = parseInt(match[1]);
      const yNum = parseInt(year[1]);
      const val = yNum * 10 + qNum;
      return val >= 244 && val <= 264;
    })
    .sort((a, b) => sortQuarters(a.quarter, b.quarter));
  const hasTransactions = sortedApiData.some(item => item.transactions !== undefined && item.transactions !== null);

  const chartData = {
    labels: sortedApiData.map((item) => item.quarter),
    datasets: [
      {
        label: "Revenue",
        data: sortedApiData.map((item) => item.revenue_inr / 10000000),
        backgroundColor: "#b91c1c",
        borderRadius: 4,
        transactionsData: sortedApiData.map(item => item.transactions),
      },
      {
        label: "COGS",
        data: sortedApiData.map((item) => item.cogs_inr / 10000000),
        backgroundColor: "#ea580c", 
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 40, 
      }
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#0f172a",
        titleColor: "#f8fafc",
        bodyColor: "#f8fafc",
        borderColor: "#e2e8f0",
        borderWidth: 1,
        padding: 10,
        cornerRadius: 6,
      },
    },
    scales: {
      y: {
        grace: '20%',
        ticks: {
          color: "#64748b",
          callback: (value: any) => `₹${value} Cr`,
        },
        grid: {
          color: "#e2e8f0",
        },
      },
      x: {
        ticks: {
          color: "#64748b",
        },
        grid: {
          display: false,
        },
      },
    },
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase">
          Revenue vs COGS
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#b91c1c]"></span>
            <span className="text-[10px] text-gray-500 font-bold uppercase">Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-[#ea580c]"></span>
            <span className="text-[10px] text-gray-500 font-bold uppercase">COGS</span>
          </div>
          {hasTransactions && (
            <div className="flex items-center gap-1.5">
              <span className="w-6 h-3 rounded-full bg-[#fee2e2]"></span>
              <span className="text-[10px] text-gray-500 font-bold uppercase">Transactions</span>
            </div>
          )}
        </div>
      </div>

      <div className="h-64">
        <Bar data={chartData} options={options} plugins={[customLabelsPlugin]} />
      </div>
    </div>
  );
};

export default RevenueVsCogsChart;

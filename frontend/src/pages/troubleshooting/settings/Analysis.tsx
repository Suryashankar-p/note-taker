import { useEffect, useMemo, useState } from "react";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import Text from "../../../components/Text";
import { ReadTroubleshootingAnalytics } from "../../../services/troubleshooting";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

type AssetIssue = { asset_number: string; count: number };
type ProblemCount = { problem: string; count: number };
type ProductDist = { product: string; count: number; problems: ProblemCount[] };
type WhyLevel = { why_level: number; count: number };
type TrendPoint = { label: string; count: number };

interface Analytics {
  from_date: string;
  to_date: string;
  total_chats: number;
  total_kb_queries: number;
  issues_by_asset: AssetIssue[];
  product_distribution: ProductDist[];
  why_levels: WhyLevel[];
  trend: TrendPoint[];
}

const PALETTE = [
  "#0061F3", "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0",
  "#9966FF", "#FF9F40", "#2ECC71", "#E74C3C", "#1ABC9C",
];

// Default window: trailing 6 months.
const defaultRange = () => {
  const to = new Date();
  const from = new Date(to.getFullYear(), to.getMonth() - 5, 1);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(to) };
};

const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
};

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white rounded-lg shadow border border-gray-200 p-4 flex flex-col">
    <Text type="body" className="font-medium text-primary_text mb-3">{title}</Text>
    {children}
  </div>
);

const Stat = ({ label, value }: { label: string; value: number | string }) => (
  <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
    <Text type="small" className="text-gray-500">{label}</Text>
    <Text type="header2" className="text-primary_text">{value}</Text>
  </div>
);

export default function Analysis() {
  const init = defaultRange();
  const [from, setFrom] = useState<string>(init.from);
  const [to, setTo] = useState<string>(init.to);
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [selectedProduct, setSelectedProduct] = useState<string>("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await ReadTroubleshootingAnalytics(from, to);
      if (res?.total_chats !== undefined) {
        setData(res);
        setSelectedProduct(res.product_distribution?.[0]?.product ?? "");
      } else {
        setData(null);
        setError(res?.detail || "No analytics available.");
      }
    } catch (err: any) {
      setData(null);
      setError(
        err?.response?.status === 403
          ? "Analytics is available to admins (owners) only."
          : "Failed to load analytics."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  const assetChart = useMemo(() => ({
    labels: data?.issues_by_asset.map((a) => a.asset_number) ?? [],
    datasets: [{
      label: "Sessions",
      data: data?.issues_by_asset.map((a) => a.count) ?? [],
      backgroundColor: "#0061F3",
      borderRadius: 4,
    }],
  }), [data]);

  const productChart = useMemo(() => ({
    labels: data?.product_distribution.map((p) => p.product) ?? [],
    datasets: [{
      label: "Sessions",
      data: data?.product_distribution.map((p) => p.count) ?? [],
      backgroundColor: PALETTE,
      borderRadius: 4,
    }],
  }), [data]);

  const problemChart = useMemo(() => {
    const product = data?.product_distribution.find((p) => p.product === selectedProduct);
    return {
      labels: product?.problems.map((p) => p.problem) ?? [],
      datasets: [{
        data: product?.problems.map((p) => p.count) ?? [],
        backgroundColor: PALETTE,
      }],
    };
  }, [data, selectedProduct]);

  const whyChart = useMemo(() => ({
    labels: data?.why_levels.map((w) => `Level ${w.why_level}`) ?? [],
    datasets: [{
      label: "Sessions",
      data: data?.why_levels.map((w) => w.count) ?? [],
      backgroundColor: "#9966FF",
      borderRadius: 4,
    }],
  }), [data]);

  const trendChart = useMemo(() => ({
    labels: data?.trend.map((t) => t.label) ?? [],
    datasets: [{
      label: "Sessions",
      data: data?.trend.map((t) => t.count) ?? [],
      borderColor: "#0061F3",
      backgroundColor: "rgba(0,97,243,0.15)",
      fill: true,
      tension: 0.35,
      pointRadius: 3,
    }],
  }), [data]);

  const deepestWhy = data?.why_levels.reduce((m, w) => Math.max(m, w.why_level), 0) ?? 0;
  const hasData = !!data && data.total_chats > 0;

  return (
    <div className="flex flex-col h-full md:mx-8 lg:mx-16 gap-6">
      {/* Header + date range */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Text type="header2">Analysis</Text>
          <Text type="small" className="text-gray-500">
            Admin reporting · one session = one troubleshooting conversation
          </Text>
        </div>
        <div className="flex items-end gap-3">
          <label className="flex flex-col text-xs text-gray-500">
            From
            <input
              type="date"
              value={from}
              max={to}
              onChange={(e) => setFrom(e.target.value)}
              className="mt-1 rounded-md border border-gray-300 p-2 text-sm text-primary_text"
            />
          </label>
          <label className="flex flex-col text-xs text-gray-500">
            To
            <input
              type="date"
              value={to}
              min={from}
              onChange={(e) => setTo(e.target.value)}
              className="mt-1 rounded-md border border-gray-300 p-2 text-sm text-primary_text"
            />
          </label>
        </div>
      </div>

      {loading && <Text type="small" className="text-gray-500">Loading analytics…</Text>}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3">
          <Text type="small">{error}</Text>
        </div>
      )}

      {!loading && !error && !hasData && (
        <div className="bg-white rounded-lg shadow border border-gray-200 p-8 text-center">
          <Text type="body" className="text-gray-500">
            No troubleshooting sessions in this period.
          </Text>
        </div>
      )}

      {!loading && hasData && (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Stat label="Total sessions" value={data!.total_chats} />
            <Stat label="KB queries" value={data!.total_kb_queries ?? 0} />
            <Stat label="Assets with issues" value={data!.issues_by_asset.length} />
            <Stat label="Products covered" value={data!.product_distribution.length} />
            <Stat label="Deepest why-level" value={deepestWhy} />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card title="Issue frequency by asset (top 10)">
              <div className="h-72">
                {assetChart.labels.length ? (
                  <Bar data={assetChart} options={{ ...baseOptions, indexAxis: "y" as const }} />
                ) : <EmptyMsg text="No asset numbers recorded." />}
              </div>
            </Card>

            <Card title="Session trend">
              <div className="h-72">
                <Line data={trendChart} options={baseOptions} />
              </div>
            </Card>

            <Card title="Product distribution">
              <div className="h-72">
                {productChart.labels.length ? (
                  <Bar data={productChart} options={baseOptions} />
                ) : <EmptyMsg text="No products resolved yet." />}
              </div>
            </Card>

            <Card title="Why-level (root-cause depth)">
              <div className="h-72">
                {whyChart.labels.length ? (
                  <Bar data={whyChart} options={baseOptions} />
                ) : <EmptyMsg text="No why-level data." />}
              </div>
            </Card>

            <Card title="Problem distribution by product">
              {data!.product_distribution.length > 0 ? (
                <>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="mb-3 rounded-md border border-gray-300 p-2 text-sm text-primary_text w-full md:w-2/3"
                  >
                    {data!.product_distribution.map((p) => (
                      <option key={p.product} value={p.product}>{p.product}</option>
                    ))}
                  </select>
                  <div className="h-64">
                    {problemChart.labels.length ? (
                      <Doughnut
                        data={problemChart}
                        options={{ ...baseOptions, plugins: { legend: { position: "right" as const } } }}
                      />
                    ) : <EmptyMsg text="No problems recorded for this product." />}
                  </div>
                </>
              ) : <EmptyMsg text="No products resolved yet." />}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

const EmptyMsg = ({ text }: { text: string }) => (
  <div className="h-full flex items-center justify-center">
    <Text type="small" className="text-gray-400">{text}</Text>
  </div>
);

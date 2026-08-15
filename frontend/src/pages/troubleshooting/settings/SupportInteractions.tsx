import { useEffect, useMemo, useState } from "react";
import { IoMdDownload } from "react-icons/io";

import Text from "../../../components/Text";
import DownloadFeedbackDetails from "../../../components/Modals/DownloadFeedbackDetails";
import {
  ReadSessionReport,
  DownloadSessionReport,
} from "../../../services/troubleshooting";

type ReportRow = {
  chat_id: number;
  ticket_id?: string | null;
  created_on: string;
  asset_name?: string | null;
  sf_asset_id?: string | null;
  account_name?: string | null;
  engineer_name?: string | null;
  engineer_email?: string | null;
  product?: string | null;
  problem?: string | null;
  first_question?: string | null;
  solution?: string | null;
  solution_source?: string | null;
  resolution_status: string;
  resolution_note?: string | null;
  resolved_on?: string | null;
  turn_count: number;
};

type Summary = {
  resolved: number;
  unresolved: number;
  open: number;
  by_source: Record<string, number>;
};

const SOURCE_LABELS: Record<string, string> = {
  DECISION_TREE: "Decision tree",
  KNOWLEDGE_BASE: "Knowledge base",
  WEB_SEARCH: "Web search",
  NONE: "No source found",
};

const STATUS_STYLES: Record<string, string> = {
  RESOLVED: "bg-green-100 text-green-800",
  UNRESOLVED: "bg-red-100 text-red-800",
  OPEN: "bg-gray-100 text-gray-700",
};

const PAGE_SIZE = 25;

const todayISO = () => new Date().toISOString().slice(0, 10);
const sixMonthsAgoISO = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 5);
  d.setDate(1);
  return d.toISOString().slice(0, 10);
};

const Stat = ({ label, value }: { label: string; value: number | string }) => (
  <div className="rounded-lg border border-grey px-4 py-3 min-w-[9rem]">
    <Text className="text-[12px] text-gray-500" type="small">
      {label}
    </Text>
    <Text className="text-[22px] font-medium text-primary_text">{String(value)}</Text>
  </div>
);

/**
 * Owner-only traceability report: every support interaction, end to end —
 * which asset, which engineer, which ticket, what was asked, what was answered,
 * and which knowledge source that answer came from.
 */
const SupportInteractions = () => {
  const [rows, setRows] = useState<ReportRow[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [fromDate, setFromDate] = useState(sixMonthsAgoISO());
  const [toDate, setToDate] = useState(todayISO());
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [downloadOpen, setDownloadOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const resp: any = await ReadSessionReport(
        fromDate,
        toDate,
        page * PAGE_SIZE,
        PAGE_SIZE,
        statusFilter || undefined,
        search || undefined,
      );
      setRows(resp?.result ?? []);
      setSummary(resp?.summary ?? null);
      setTotal(resp?.total ?? 0);
    } catch (err: any) {
      if (err?.response?.status === 403) {
        setError("This report is available to admins (owners) only.");
      } else {
        setError("Could not load the report. Please try again.");
      }
      setRows([]);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate, statusFilter, page]);

  // Reset to the first page whenever a filter changes the result set.
  useEffect(() => {
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fromDate, toDate, statusFilter]);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    load();
  };

  const handleDownload = async (from: string, to: string) => {
    try {
      const response: any = await DownloadSessionReport(from, to);
      if (!response) return;
      const stamp = (to || todayISO()).split("-").reverse().join("_");
      const blob = new Blob([response], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `Support_Interactions_${stamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Failed to download report:", err);
    }
  };

  const sourceStats = useMemo(() => {
    if (!summary) return [];
    return Object.entries(summary.by_source || {}).map(([key, value]) => ({
      label: SOURCE_LABELS[key] ?? key,
      value,
    }));
  }, [summary]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="w-full h-full overflow-y-auto px-2 pb-10">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-[12px] text-gray-500">From</label>
            <input
              type="date"
              value={fromDate}
              max={toDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="rounded-md border border-gray-300 px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-[12px] text-gray-500">To</label>
            <input
              type="date"
              value={toDate}
              min={fromDate}
              onChange={(e) => setToDate(e.target.value)}
              className="rounded-md border border-gray-300 px-2 py-1 text-sm"
            />
          </div>
          <div>
            <label className="block text-[12px] text-gray-500">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border border-gray-300 px-2 py-1 text-sm"
            >
              <option value="">All</option>
              <option value="RESOLVED">Resolved</option>
              <option value="UNRESOLVED">Unresolved</option>
              <option value="OPEN">Open</option>
            </select>
          </div>
          <form onSubmit={onSearchSubmit}>
            <label className="block text-[12px] text-gray-500">Search</label>
            <input
              type="text"
              value={search}
              placeholder="Ticket, asset or title"
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-md border border-gray-300 px-2 py-1 text-sm"
            />
          </form>
        </div>
        <button
          title="Download report"
          className="rounded-full bg-[#0061F3] p-2"
          onClick={() => setDownloadOpen(true)}
        >
          <IoMdDownload className="text-white w-5 h-5" />
        </button>
      </div>

      {summary && (
        <div className="flex flex-wrap gap-3 mb-5">
          <Stat label="Resolved" value={summary.resolved} />
          <Stat label="Unresolved" value={summary.unresolved} />
          <Stat label="Open" value={summary.open} />
          {sourceStats.map((s) => (
            <Stat key={s.label} label={s.label} value={s.value} />
          ))}
        </div>
      )}

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <div className="overflow-x-auto border border-grey rounded-lg">
        <table className="min-w-full text-left text-[13px]">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-3 py-2 whitespace-nowrap">Date</th>
              <th className="px-3 py-2 whitespace-nowrap">Ticket</th>
              <th className="px-3 py-2 whitespace-nowrap">Asset</th>
              <th className="px-3 py-2 whitespace-nowrap">Account</th>
              <th className="px-3 py-2 whitespace-nowrap">Engineer</th>
              <th className="px-3 py-2 whitespace-nowrap">Problem</th>
              <th className="px-3 py-2 whitespace-nowrap">Question</th>
              <th className="px-3 py-2 whitespace-nowrap">Source</th>
              <th className="px-3 py-2 whitespace-nowrap">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-3 py-6 text-center text-gray-500">
                  No support interactions in this range.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.chat_id} className="border-t border-grey align-top">
                  <td className="px-3 py-2 whitespace-nowrap">
                    {row.created_on?.slice(0, 10)}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">{row.ticket_id || "—"}</td>
                  <td className="px-3 py-2 max-w-[12rem] truncate" title={row.asset_name ?? ""}>
                    {row.asset_name || "—"}
                  </td>
                  <td className="px-3 py-2 max-w-[12rem] truncate" title={row.account_name ?? ""}>
                    {row.account_name || "—"}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap" title={row.engineer_email ?? ""}>
                    {row.engineer_name || "—"}
                  </td>
                  <td className="px-3 py-2 max-w-[14rem] truncate" title={row.problem ?? ""}>
                    {row.problem || "—"}
                  </td>
                  <td className="px-3 py-2 max-w-[16rem] truncate" title={row.first_question ?? ""}>
                    {row.first_question || "—"}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {row.solution_source ? SOURCE_LABELS[row.solution_source] ?? row.solution_source : "—"}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span
                      className={`rounded-full px-2 py-1 text-[11px] ${
                        STATUS_STYLES[row.resolution_status] ?? STATUS_STYLES.OPEN
                      }`}
                      title={row.resolution_note ?? ""}
                    >
                      {row.resolution_status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {total > PAGE_SIZE && (
        <div className="flex items-center justify-end gap-3 mt-3">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="rounded-md border border-grey px-3 py-1 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <Text type="small" className="text-gray-600">
            Page {page + 1} of {totalPages}
          </Text>
          <button
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-md border border-grey px-3 py-1 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}

      <DownloadFeedbackDetails
        isOpen={downloadOpen}
        onClose={() => setDownloadOpen(false)}
        onSubmit={handleDownload}
        title="Download Support Interactions"
      />
    </div>
  );
};

export default SupportInteractions;

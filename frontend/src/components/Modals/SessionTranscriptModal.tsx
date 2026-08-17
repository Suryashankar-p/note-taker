import { useEffect, useState } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

import Text from "../Text";
import Close from "../../assets/close.svg";
import { ReadChatHistories } from "../../services/troubleshooting";

type Turn = {
  id: number;
  human?: string | null;
  ai?: string | null;
  created_on?: string;
  citations?: { filename: string; page: number }[] | null;
  web_sources?: { url: string }[] | null;
  resolved_path?: { route?: string } | null;
};

export type TranscriptSession = {
  chat_id: number;
  ticket_id?: string | null;
  asset_name?: string | null;
  account_name?: string | null;
  engineer_name?: string | null;
  problem?: string | null;
  solution_source?: string | null;
  resolution_status?: string;
  resolution_note?: string | null;
};

interface Props {
  session: TranscriptSession | null;
  onClose: () => void;
}

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

const toHtml = (markdown: string) =>
  DOMPurify.sanitize(marked.parse(markdown, { gfm: true, breaks: true }) as string);

/**
 * Read-only transcript of one support session, opened from the owner report.
 *
 * Deliberately a modal rather than a navigation: the owner stays in the report
 * and can scan several sessions in a row, and "view only" is structural — there
 * is no composer to disable. The backend enforces the same thing independently
 * (owners may read any chat, but every write path still requires owning it).
 */
const SessionTranscriptModal: React.FC<Props> = ({ session, onClose }) => {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      setTurns([]);
      try {
        const resp: any = await ReadChatHistories(0, 100, String(session.chat_id));
        if (cancelled) return;
        // The list endpoint returns newest-first; a transcript reads chronologically.
        const rows: Turn[] = [...(resp?.result ?? [])].reverse();
        setTurns(rows);
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err?.response?.status === 403
              ? "You do not have access to this conversation."
              : "Could not load this conversation.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [session]);

  useEffect(() => {
    if (!session) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [session, onClose]);

  if (!session) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0061F3]/10"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header — the report row's context, so the owner knows whose session this is */}
        <div className="border-b border-grey px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <Text className="text-[20px] font-medium text-primary_text">
                {session.ticket_id ? `Ticket ${session.ticket_id}` : `Session #${session.chat_id}`}
              </Text>
              <p className="mt-1 text-[13px] text-gray-600">
                {[session.asset_name, session.account_name, session.engineer_name]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <button onClick={onClose} aria-label="Close">
              <img src={Close} alt="close" loading="lazy" />
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-2 py-1 text-[11px] ${
                STATUS_STYLES[session.resolution_status ?? "OPEN"] ?? STATUS_STYLES.OPEN
              }`}
            >
              {session.resolution_status ?? "OPEN"}
            </span>
            {session.solution_source && (
              <span className="rounded-full bg-blue-50 px-2 py-1 text-[11px] text-[#0061F3]">
                {SOURCE_LABELS[session.solution_source] ?? session.solution_source}
              </span>
            )}
            {session.problem && (
              <span className="rounded-full bg-gray-100 px-2 py-1 text-[11px] text-gray-700">
                {session.problem}
              </span>
            )}
            <span className="ml-auto text-[11px] text-gray-400">View only</span>
          </div>
          {session.resolution_note && (
            <p className="mt-2 text-[12px] text-gray-600">
              <span className="font-medium">Note:</span> {session.resolution_note}
            </p>
          )}
        </div>

        {/* Transcript */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading && <p className="text-sm text-gray-500">Loading conversation…</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}
          {!loading && !error && turns.length === 0 && (
            <p className="text-sm text-gray-500">This session has no messages.</p>
          )}
          {turns.map((turn) => (
            <div key={turn.id} className="mb-5">
              {turn.human && (
                <div className="mb-2 flex justify-end">
                  <div className="max-w-[80%] rounded-lg bg-[#0061F3] px-3 py-2 text-[13px] text-white">
                    {turn.human}
                  </div>
                </div>
              )}
              {turn.ai && (
                <div className="flex items-start gap-2">
                  <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-[11px] text-gray-600">
                    AI
                  </div>
                  <div className="min-w-0 flex-1">
                    <div
                      className="prose max-w-none text-[13px] text-primary_text"
                      dangerouslySetInnerHTML={{ __html: toHtml(turn.ai) }}
                    />
                    {(turn.citations?.length ?? 0) > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {turn.citations!.map((c, i) => (
                          <span
                            key={i}
                            className="rounded-full border border-grey px-2 py-1 text-[11px] text-gray-600"
                          >
                            {c.filename} · p.{c.page}
                          </span>
                        ))}
                      </div>
                    )}
                    {(turn.web_sources?.length ?? 0) > 0 && (
                      <div className="mt-2 space-y-1">
                        {turn.web_sources!.map((s, i) => (
                          <a
                            key={i}
                            href={s.url}
                            target="_blank"
                            rel="noreferrer"
                            className="block truncate text-[11px] text-[#0061F3] underline"
                          >
                            {s.url}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t border-grey px-6 py-3 text-right">
          <button
            onClick={onClose}
            className="rounded-md bg-[#0061F3] px-4 py-2 text-sm text-white"
          >
            <Text type="small">Close</Text>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTranscriptModal;

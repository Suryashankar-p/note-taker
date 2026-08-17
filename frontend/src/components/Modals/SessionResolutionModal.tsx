import { useState, useEffect } from "react";
import Text from "../Text";
import Close from "../../assets/close.svg";

interface Props {
  show: boolean;
  submitting?: boolean;
  onSubmit: (resolved: boolean, note?: string) => void;
  onClose: () => void;
}

/**
 * The session-ending protocol.
 *
 * Only asks the one thing the system cannot work out for itself — whether the
 * engineer's issue is actually fixed. Where the answer came from (decision tree,
 * knowledge base, web search) is already recorded per turn by the agent, so the
 * engineer is never asked to self-report it.
 */
const SessionResolutionModal: React.FC<Props> = ({
  show,
  submitting = false,
  onSubmit,
  onClose,
}) => {
  const [resolved, setResolved] = useState<boolean | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (show) {
      setResolved(null);
      setNote("");
      setError("");
    }
  }, [show]);

  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  if (!show) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resolved === null) {
      setError("Please tell us whether the issue was resolved");
      return;
    }
    onSubmit(resolved, note.trim() || undefined);
  };

  const optionClass = (active: boolean) =>
    `flex-1 rounded-lg border px-3 py-2 text-sm ${
      active
        ? "border-[#0061F3] bg-[#0061F3]/5 text-[#0061F3]"
        : "border-gray-300 text-primary_text hover:bg-gray-50"
    }`;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0061F3]/10"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[24px] relative text-black font-medium flex justify-between leading-6 text-gray-900">
          <Text>End session</Text>
          <button className="absolute -right-4 -top-5" onClick={onClose}>
            <img src={Close} alt="close" loading="lazy" />
          </button>
        </h3>

        <form onSubmit={handleSubmit}>
          <p className="mt-5 text-sm text-gray-700">
            Was your issue resolved?
          </p>
          <div className="mt-2 flex gap-3">
            <button
              type="button"
              className={optionClass(resolved === true)}
              onClick={() => {
                setResolved(true);
                setError("");
              }}
            >
              Yes, resolved
            </button>
            <button
              type="button"
              className={optionClass(resolved === false)}
              onClick={() => {
                setResolved(false);
                setError("");
              }}
            >
              No, still an issue
            </button>
          </div>

          {resolved === false && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">
                What is still outstanding? (optional)
              </label>
              <textarea
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#0061F3] focus:outline-none focus:ring-1 focus:ring-[#0061F3]"
                rows={3}
                placeholder="Anything that helps whoever picks this up next"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          )}

          {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

          <div className="mt-5 flex justify-end gap-4">
            <button
              type="button"
              className="inline-flex justify-center rounded-md border border-transparent bg-none text-primary_text px-4 py-2 text-sm font-medium"
              onClick={onClose}
            >
              <Text type="small">Cancel</Text>
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex justify-center rounded-md border border-transparent bg-[#0061F3] px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
            >
              <Text type="small">{submitting ? "Saving..." : "Confirm"}</Text>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionResolutionModal;

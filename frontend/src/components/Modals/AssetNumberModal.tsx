import { useEffect, useState } from "react";
import Text from "../Text";
import Close from "../../assets/close.svg";

interface Props {
  show: boolean;
  onSubmit: (assetNumber: string) => void;
  onClose: () => void;
  // When true the dialog cannot be dismissed (no Cancel/X/Esc/backdrop close).
  // Used to enforce the rule that a new chat must have an asset number.
  mandatory?: boolean;
}

const AssetNumberModal: React.FC<Props> = ({
  show,
  onSubmit,
  onClose,
  mandatory = false,
}) => {
  const [assetNumber, setAssetNumber] = useState("");
  const [error, setError] = useState("");

  const closeModal = () => {
    setAssetNumber("");
    setError("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetNumber.trim()) {
      setError("Asset Number is required");
      return;
    }
    onSubmit(assetNumber.trim());
    setAssetNumber("");
    setError("");
  };

  // Reset fields whenever the dialog is hidden.
  useEffect(() => {
    if (!show) {
      setAssetNumber("");
      setError("");
    }
  }, [show]);

  // Allow Escape to close only when dismissible.
  useEffect(() => {
    if (!show || mandatory) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, mandatory]);

  if (!show) return null;

  return (
    // Overlay sits ABOVE the chat area (z-0) so the message box stays blocked,
    // but BELOW the sidebar (z-40) and header (z-50) so the user can still pick
    // a recent chat — which sets chat_id and closes this dialog. No focus trap /
    // inert, unlike a Headless UI Dialog, which is what blocked the sidebar.
    <div
      className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-[#0061F3]/10"
      onClick={mandatory ? undefined : closeModal}
    >
      <div
        className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-[24px] relative text-black font-medium flex justify-between leading-6 text-gray-900">
          <Text>New Chat</Text>
          {!mandatory && (
            <button className="absolute -right-4 -top-5" onClick={closeModal}>
              <img src={Close} alt="close" loading="lazy" />
            </button>
          )}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 mt-5">
            <label className="block text-sm font-medium text-gray-700">
              Asset Number *
            </label>
            <input
              autoFocus
              type="text"
              value={assetNumber}
              onChange={(e) => {
                setAssetNumber(e.target.value);
                if (error) setError("");
              }}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2"
              placeholder="Enter the Asset Number"
              required
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
          <div className="mt-5 flex justify-end gap-4">
            {!mandatory && (
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-transparent bg-none text-primary_text px-4 py-2 text-sm font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                onClick={closeModal}
              >
                <Text type="small">Cancel</Text>
              </button>
            )}
            <button
              type="submit"
              className="inline-flex justify-center rounded-md border border-transparent bg-[#0061F3] px-4 py-2 text-sm font-medium text-background focus:outline-none focus-visible:ring-offset-2"
            >
              <Text type="small">Confirm</Text>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetNumberModal;

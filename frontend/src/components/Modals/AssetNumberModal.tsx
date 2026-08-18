import { useState, useEffect, useRef } from "react";
import Text from "../Text";
import Close from "../../assets/close.svg";
import SearchDropdown from "../Combobox.tsx";
import { SearchAssets } from "../../services/troubleshooting";

export interface SelectedAsset {
  sf_asset_id: string;
  asset_name: string;
  account_name?: string | null;
}

interface Props {
  show: boolean;
  onSubmit: (asset: SelectedAsset, ticketId: string) => void;
  onClose: () => void;
  // When true the dialog cannot be dismissed (no Cancel/X/Esc/backdrop close).
  // Used to enforce the rule that a new chat must have an asset.
  mandatory?: boolean;
}

type Option = {
  name: string;
  subname?: string | null;
  asset: SelectedAsset;
};

const AssetNumberModal: React.FC<Props> = ({
  show,
  onSubmit,
  onClose,
  mandatory = false,
}) => {
  const [selectedAsset, setSelectedAsset] = useState<SelectedAsset | null>(null);
  const [ticketId, setTicketId] = useState("");
  const [nameOptions, setNameOptions] = useState<Option[]>([]);
  const [idOptions, setIdOptions] = useState<Option[]>([]);
  const [error, setError] = useState("");

  const debounceIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runSearch = async (term: string) => {
    try {
      const resp: any = await SearchAssets(term);
      const rows = resp?.result ?? [];
      const options: Option[] = rows.map((r: any) => ({
        name: r.asset_name,
        subname: r.account_name,
        asset: {
          sf_asset_id: r.sf_asset_id,
          asset_name: r.asset_name,
          account_name: r.account_name,
        },
      }));
      setNameOptions(options);
      setIdOptions(
        options.map((o) => ({
          name: o.asset.sf_asset_id,
          subname: o.asset.account_name,
          asset: o.asset,
        }))
      );
    } catch {
      setNameOptions([]);
      setIdOptions([]);
    }
  };

  const onQueryChange = (query: string) => {
    if (debounceIdRef.current) clearTimeout(debounceIdRef.current);
    debounceIdRef.current = setTimeout(() => runSearch(query), 400);
  };

  const closeModal = () => {
    setSelectedAsset(null);
    setTicketId("");
    setError("");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) {
      setError("Please select an asset");
      return;
    }
    // Every support interaction has to be traceable to a ticket in the owner
    // report, so this is required rather than optional.
    if (!ticketId.trim()) {
      setError("Please enter a ticket ID");
      return;
    }
    onSubmit(selectedAsset, ticketId.trim());
    setSelectedAsset(null);
    setTicketId("");
    setError("");
  };

  // Reset fields and preload options whenever the dialog opens.
  useEffect(() => {
    if (show) {
      setSelectedAsset(null);
      setTicketId("");
      setError("");
      runSearch("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const selectedNameOption: Option | undefined = selectedAsset
    ? { name: selectedAsset.asset_name, subname: selectedAsset.account_name, asset: selectedAsset }
    : undefined;
  const selectedIdOption: Option | undefined = selectedAsset
    ? { name: selectedAsset.sf_asset_id, subname: selectedAsset.account_name, asset: selectedAsset }
    : undefined;

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
              Asset Name *
            </label>
            <SearchDropdown
              className="mt-1"
              placeholder="Search by asset name"
              listValues={nameOptions}
              initialValue={selectedNameOption}
              onQueryChange={onQueryChange}
              onChange={(option: Option) => {
                setSelectedAsset(option.asset);
                if (error) setError("");
              }}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Asset ID *
            </label>
            <SearchDropdown
              className="mt-1"
              placeholder="Search by asset ID"
              listValues={idOptions}
              initialValue={selectedIdOption}
              onQueryChange={onQueryChange}
              onChange={(option: Option) => {
                setSelectedAsset(option.asset);
                if (error) setError("");
              }}
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Ticket ID *
            </label>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#0061F3] focus:outline-none focus:ring-1 focus:ring-[#0061F3]"
              placeholder="e.g. TKT-10432"
              value={ticketId}
              onChange={(e) => {
                setTicketId(e.target.value);
                if (error) setError("");
              }}
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

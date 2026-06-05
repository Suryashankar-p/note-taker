import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import Text from "../../../components/Text";
import Close from "../../../assets/close.svg";
import LoaderIcon from "../../../components/LoaderIcon";
import {
  ReadProductTree,
  CreateNode,
  UpdateNode,
  DeleteNode,
  UploadNodeImage,
  DeleteNodeImage,
} from "../../../services/troubleshooting.ts";

interface ImageRef {
  id: number;
  url?: string;
  caption?: string;
  filename?: string;
}

interface TreeNode {
  id: number;
  product_id: number;
  parent_id: number | null;
  node_type: "PROBLEM" | "WHY" | "SOLUTION";
  content: string;
  description?: string | null;
  position: number;
  images: ImageRef[];
  children: TreeNode[];
}

interface Props {
  product: { id: number; product_title: string };
  isOwner: boolean;
  onClose: () => void;
}

const TYPE_STYLES: Record<string, string> = {
  PROBLEM: "bg-[#FDECEC] text-[#C0392B] border-[#F5C6CB]",
  WHY: "bg-[#FEF6E7] text-[#B7791F] border-[#FBE3B3]",
  SOLUTION: "bg-[#EAF7EE] text-[#1E7E34] border-[#C3E6CB]",
};

const TYPE_LABEL: Record<string, string> = {
  PROBLEM: "Problem",
  WHY: "Cause (Why)",
  SOLUTION: "Solution",
};

const ProductTree: React.FC<Props> = ({ product, isOwner, onClose }) => {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [newProblem, setNewProblem] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const resp = await ReadProductTree(product.id);
      setTree(Array.isArray(resp) ? resp : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const withRefresh = async (fn: () => Promise<any>) => {
    setBusy(true);
    try {
      await fn();
      await load();
    } finally {
      setBusy(false);
    }
  };

  const addProblem = async () => {
    const content = newProblem.trim();
    if (!content) return;
    await withRefresh(() =>
      CreateNode({ product_id: product.id, parent_id: null, node_type: "PROBLEM", content })
    );
    setNewProblem("");
  };

  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog as="div" className="relative z-20" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[#0061F3]/10" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-4xl max-h-[85vh] flex flex-col transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle as="div" className="flex justify-between items-center mb-4">
                  <Text type="header3">{product.product_title} — Troubleshooting tree</Text>
                  <button onClick={onClose}>
                    <img src={Close} alt="close" loading="lazy" />
                  </button>
                </DialogTitle>

                {isOwner && (
                  <div className="flex gap-2 mb-4">
                    <input
                      value={newProblem}
                      onChange={(e) => setNewProblem(e.target.value)}
                      placeholder="Add a new problem…"
                      className="flex-1 border rounded-lg px-3 py-2 text-sm"
                    />
                    <button
                      disabled={busy}
                      onClick={addProblem}
                      className="px-4 py-2 rounded-lg bg-[#F3F1FF] text-primary_text text-sm disabled:opacity-50"
                    >
                      Add problem
                    </button>
                  </div>
                )}

                <div className="overflow-y-auto flex-1 pr-1">
                  {loading ? (
                    <div className="flex justify-center py-10">
                      <LoaderIcon size={30} color="#42526e" />
                    </div>
                  ) : tree.length === 0 ? (
                    <Text className="text-gray-400 text-center py-10">
                      No problems yet. {isOwner ? "Add one above or upload an Excel file." : ""}
                    </Text>
                  ) : (
                    tree.map((node) => (
                      <NodeRow
                        key={node.id}
                        node={node}
                        depth={0}
                        isOwner={isOwner}
                        busy={busy}
                        withRefresh={withRefresh}
                      />
                    ))
                  )}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

interface NodeRowProps {
  node: TreeNode;
  depth: number;
  isOwner: boolean;
  busy: boolean;
  withRefresh: (fn: () => Promise<any>) => Promise<void>;
}

const NodeRow: React.FC<NodeRowProps> = ({ node, depth, isOwner, busy, withRefresh }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(node.content);
  const [draftDesc, setDraftDesc] = useState(node.description ?? "");
  const [addType, setAddType] = useState<null | "WHY" | "SOLUTION">(null);
  const [addContent, setAddContent] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);
  const [addingDesc, setAddingDesc] = useState(false);
  const [descDraft, setDescDraft] = useState("");

  const saveDesc = () =>
    withRefresh(() =>
      UpdateNode(node.id, { description: descDraft.trim() || null })
    ).then(() => { setAddingDesc(false); setDescDraft(""); });

  const saveEdit = () =>
    withRefresh(() =>
      UpdateNode(node.id, {
        content: draft.trim(),
        ...(node.node_type === "WHY" ? { description: draftDesc.trim() || null } : {}),
      })
    ).then(() => setEditing(false));

  const cancelEdit = () => {
    setEditing(false);
    setDraft(node.content);
    setDraftDesc(node.description ?? "");
  };

  const addChild = () => {
    const content = addContent.trim();
    if (!content || !addType) return;
    withRefresh(() =>
      CreateNode({
        product_id: node.product_id,
        parent_id: node.id,
        node_type: addType,
        content,
        description: addType === "WHY" ? (addDesc.trim() || null) : null,
      })
    ).then(() => {
      setAddContent("");
      setAddDesc("");
      setAddType(null);
    });
  };

  const onUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) withRefresh(() => UploadNodeImage(node.id, file));
    e.target.value = "";
  };

  const hasDescription = !!node.description;

  return (
    <div style={{ marginLeft: depth * 18 }} className="mb-2">
      <div className={`rounded-lg border px-3 py-2 ${TYPE_STYLES[node.node_type]}`}>
        <div className="flex items-start gap-2">
          <span className="text-[10px] uppercase font-semibold mt-1 shrink-0">
            {TYPE_LABEL[node.node_type]}
          </span>

          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="flex flex-col gap-1">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="w-full border rounded px-2 py-1 text-sm text-black"
                  rows={2}
                  placeholder="Content…"
                />
                {node.node_type === "WHY" && (
                  <textarea
                    value={draftDesc}
                    onChange={(e) => setDraftDesc(e.target.value)}
                    className="w-full border rounded px-2 py-1 text-xs text-black"
                    rows={2}
                    placeholder="Description / definition (optional)…"
                  />
                )}
              </div>
            ) : (
              <div className="flex items-start gap-1">
                <span className="text-sm text-black whitespace-pre-wrap">{node.content}</span>
                {hasDescription && (
                  <span className="shrink-0">
                    <button
                      type="button"
                      onMouseEnter={(e) => {
                        const r = e.currentTarget.getBoundingClientRect();
                        setTooltipPos({ top: r.bottom + 6, left: r.left });
                        setShowTooltip(true);
                      }}
                      onMouseLeave={() => { setShowTooltip(false); setTooltipPos(null); }}
                      onFocus={(e) => {
                        const r = e.currentTarget.getBoundingClientRect();
                        setTooltipPos({ top: r.bottom + 6, left: r.left });
                        setShowTooltip(true);
                      }}
                      onBlur={() => { setShowTooltip(false); setTooltipPos(null); }}
                      className="ml-1 mt-0.5 text-[11px] w-4 h-4 rounded-full border flex items-center justify-center leading-none opacity-60 hover:opacity-100 transition-opacity"
                      aria-label="Show description"
                    >
                      ℹ
                    </button>
                    {showTooltip && tooltipPos && (
                      <div
                        style={{ position: "fixed", top: tooltipPos.top, left: tooltipPos.left, zIndex: 9999 }}
                        className="w-64 rounded-lg border bg-white shadow-lg p-3 text-xs text-gray-700 whitespace-pre-wrap pointer-events-none"
                      >
                        <span className="block font-semibold text-[10px] uppercase mb-1 text-gray-400">
                          Definition
                        </span>
                        {node.description}
                      </div>
                    )}
                  </span>
                )}
              </div>
            )}
          </div>

          {isOwner && (
            <div className="flex gap-1 shrink-0 text-xs">
              {editing ? (
                <>
                  <button disabled={busy} onClick={saveEdit} className="underline">Save</button>
                  <button onClick={cancelEdit} className="underline">Cancel</button>
                </>
              ) : (
                <>
                  <button onClick={() => setEditing(true)} className="underline">Edit</button>
                  <button
                    disabled={busy}
                    onClick={() => withRefresh(() => DeleteNode(node.id))}
                    className="underline text-[#C0392B]"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Images (problems) */}
        {node.images?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {node.images.map((img) => (
              <div key={img.id} className="relative">
                <a href={img.url} target="_blank" rel="noopener noreferrer">
                  <img
                    src={img.url}
                    alt={img.caption || img.filename || "image"}
                    className="h-20 w-20 object-cover rounded border bg-white"
                    loading="lazy"
                  />
                </a>
                {isOwner && (
                  <button
                    disabled={busy}
                    onClick={() => withRefresh(() => DeleteNodeImage(img.id))}
                    className="absolute -top-2 -right-2 bg-white rounded-full border w-5 h-5 text-xs leading-none"
                    title="Remove image"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Owner actions: add children / upload image */}
        {isOwner && (
          <div className="flex flex-wrap gap-2 mt-2 text-xs">
            {node.node_type === "PROBLEM" && (
              <>
                <button onClick={() => setAddType("WHY")} className="underline">+ Cause</button>
                <label className="underline cursor-pointer">
                  + Image
                  <input type="file" accept="image/*" className="hidden" onChange={onUploadImage} />
                </label>
              </>
            )}
            {node.node_type === "WHY" && (
              <>
                <button onClick={() => setAddType("WHY")} className="underline">+ Deeper cause</button>
                <button onClick={() => setAddType("SOLUTION")} className="underline">+ Solution</button>
                {!node.description && !addingDesc && (
                  <button onClick={() => setAddingDesc(true)} className="underline">+ Description</button>
                )}
              </>
            )}
          </div>
        )}

        {addingDesc && (
          <div className="flex gap-2 mt-2">
            <input
              autoFocus
              value={descDraft}
              onChange={(e) => setDescDraft(e.target.value)}
              placeholder="Add definition / explanation…"
              className="flex-1 border rounded px-2 py-1 text-xs text-black"
            />
            <button disabled={busy} onClick={saveDesc} className="underline text-xs">Save</button>
            <button onClick={() => { setAddingDesc(false); setDescDraft(""); }} className="underline text-xs">Cancel</button>
          </div>
        )}

        {addType && (
          <div className="flex flex-col gap-1 mt-2">
            <div className="flex gap-2">
              <input
                autoFocus
                value={addContent}
                onChange={(e) => setAddContent(e.target.value)}
                placeholder={`New ${TYPE_LABEL[addType].toLowerCase()}…`}
                className="flex-1 border rounded px-2 py-1 text-sm text-black"
              />
              <button disabled={busy} onClick={addChild} className="underline text-xs">Add</button>
              <button
                onClick={() => { setAddType(null); setAddContent(""); setAddDesc(""); }}
                className="underline text-xs"
              >
                Cancel
              </button>
            </div>
            {addType === "WHY" && (
              <input
                value={addDesc}
                onChange={(e) => setAddDesc(e.target.value)}
                placeholder="Description / definition (optional)…"
                className="border rounded px-2 py-1 text-xs text-black"
              />
            )}
          </div>
        )}
      </div>

      {node.children?.map((child) => (
        <NodeRow key={child.id} node={child} depth={depth + 1} isOwner={isOwner} busy={busy} withRefresh={withRefresh} />
      ))}
    </div>
  );
};

export default ProductTree;

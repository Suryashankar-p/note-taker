import { Dialog, DialogPanel, Transition, TransitionChild } from "@headlessui/react";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import LoaderIcon from "../../../components/LoaderIcon";
import {
  ReadProductTree,
  CreateNode,
  UpdateNode,
  DeleteNode,
  UploadNodeImage,
  DeleteNodeImage,
} from "../../../services/troubleshooting.ts";

// ===========================================================================
//  Types
// ===========================================================================
interface ImageRef {
  id: number;
  url?: string;
  caption?: string;
  filename?: string;
}

type NodeType = "PROBLEM" | "WHY" | "SOLUTION";

interface TreeNode {
  id: number;
  product_id: number;
  parent_id: number | null;
  node_type: NodeType;
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

// ===========================================================================
//  Type config (Problem / Cause / Solution color system)
// ===========================================================================
interface TypeStyle {
  short: string;
  label: string;
  accent: string;
  tint: string;
  tintSoft: string;
  border: string;
  text: string;
}

const TYPE: Record<NodeType, TypeStyle> = {
  PROBLEM: { short: "Problem", label: "Problem", accent: "#ED3438", tint: "#FDECEC", tintSoft: "#FEF4F4", border: "#F3C9CB", text: "#B83232" },
  WHY: { short: "Cause", label: "Cause (Why)", accent: "#D98A1F", tint: "#FEF6E7", tintSoft: "#FFFBF1", border: "#F2DDB0", text: "#9C6A15" },
  SOLUTION: { short: "Solution", label: "Solution", accent: "#1E9E54", tint: "#EAF7EE", tintSoft: "#F4FBF6", border: "#BFE3C9", text: "#1B7E45" },
};

// ===========================================================================
//  Tree helpers
// ===========================================================================
const walk = (nodes: TreeNode[], fn: (n: TreeNode, parents: TreeNode[]) => void, parents: TreeNode[] = []) => {
  nodes.forEach((n) => {
    fn(n, parents);
    if (n.children?.length) walk(n.children, fn, [...parents, n]);
  });
};

const countDescendants = (node: TreeNode): number => {
  let c = 0;
  (node.children || []).forEach((ch) => {
    c += 1 + countDescendants(ch);
  });
  return c;
};

const matchesQuery = (node: TreeNode, q: string): boolean => {
  if (!q) return true;
  const ql = q.toLowerCase();
  const hit = (n: TreeNode): boolean =>
    (n.content || "").toLowerCase().includes(ql) ||
    (n.description || "").toLowerCase().includes(ql) ||
    (n.children || []).some(hit);
  return hit(node);
};

const highlight = (text: string, q: string): React.ReactNode => {
  if (!q) return text;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <mark style={{ background: "#fff2a8", color: "inherit", borderRadius: 3, padding: "0 1px" }}>
        {text.slice(i, i + q.length)}
      </mark>
      {text.slice(i + q.length)}
    </>
  );
};

// ===========================================================================
//  Icons (single-path stroke set)
// ===========================================================================
const PATHS: Record<string, string> = {
  chevron: "M9 6l6 6-6 6",
  plus: "M12 5v14M5 12h14",
  edit: "M4 20h4L18.5 9.5a2.12 2.12 0 0 0-3-3L5 17v3z",
  trash: "M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0v13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7",
  check: "M5 12l5 5L20 6",
  x: "M6 6l12 12M18 6L6 18",
  image: "M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-3.2-3.2",
  expand: "M9 6l6 6-6 6",
  collapse: "M6 9l6 6 6-6",
};

const Icon = ({ name, size = 16, style, strokeWidth = 1.7 }: { name: string; size?: number; style?: CSSProperties; strokeWidth?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={style}
    aria-hidden="true"
  >
    <path d={PATHS[name]} />
  </svg>
);

// ===========================================================================
//  Type chip
// ===========================================================================
const TypeChip = ({ type }: { type: NodeType }) => {
  const t = TYPE[type];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: ".06em",
        textTransform: "uppercase",
        color: t.text,
        whiteSpace: "nowrap",
        lineHeight: 1,
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: 2, background: t.accent }} />
      {t.short}
    </span>
  );
};

// ===========================================================================
//  Collapse caret
// ===========================================================================
const Caret = ({ open, onClick, count, accent }: { open: boolean; onClick: () => void; count: number; accent: string }) => (
  <button
    onClick={onClick}
    title={open ? "Collapse" : "Expand"}
    style={{ display: "inline-flex", alignItems: "center", gap: 4, border: "none", background: "none", cursor: "pointer", padding: 0, color: "#6b7280" }}
  >
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 18,
        height: 18,
        borderRadius: 5,
        background: open ? "transparent" : "#fff",
        border: open ? "1px solid transparent" : "1px solid #e3e4e7",
      }}
    >
      <Icon name="chevron" size={13} style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform .18s ease" }} />
    </span>
    {!open && count > 0 && <span style={{ fontSize: 11, fontWeight: 600, color: accent }}>{count}</span>}
  </button>
);

// ===========================================================================
//  Hover row actions (edit / delete / add)
// ===========================================================================
const actionBtn: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 4,
  height: 26,
  padding: "0 8px",
  borderRadius: 7,
  border: "1px solid #e6e7ea",
  background: "#fff",
  color: "#5a6069",
  fontSize: 12,
  fontWeight: 500,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const RowActions = ({
  node,
  show,
  onEdit,
  onDelete,
  onAddCause,
  onAddSolution,
  onAddImage,
}: {
  node: TreeNode;
  show: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAddCause: () => void;
  onAddSolution: () => void;
  onAddImage: () => void;
}) => {
  const isProblem = node.node_type === "PROBLEM";
  const isWhy = node.node_type === "WHY";
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        alignItems: "center",
        opacity: show ? 1 : 0,
        transition: "opacity .14s ease",
        pointerEvents: show ? "auto" : "none",
      }}
    >
      {(isProblem || isWhy) && (
        <button style={actionBtn} onClick={onAddCause}>
          <Icon name="plus" size={13} /> {isProblem ? "Cause" : "Deeper cause"}
        </button>
      )}
      {isWhy && (
        <button style={actionBtn} onClick={onAddSolution}>
          <Icon name="plus" size={13} /> Solution
        </button>
      )}
      {isProblem && (
        <button style={actionBtn} onClick={onAddImage} title="Attach image">
          <Icon name="image" size={13} />
        </button>
      )}
      <button style={actionBtn} onClick={onEdit} title="Edit">
        <Icon name="edit" size={13} />
      </button>
      <button style={{ ...actionBtn, color: "#c0392b" }} onClick={onDelete} title="Delete">
        <Icon name="trash" size={13} />
      </button>
    </div>
  );
};

// ===========================================================================
//  Inline content editor (content + optional WHY description)
// ===========================================================================
const taStyle: CSSProperties = {
  width: "100%",
  border: "1px solid #d7d8db",
  borderRadius: 8,
  padding: "8px 10px",
  fontSize: 13.5,
  fontFamily: "inherit",
  color: "#2b2d31",
  resize: "vertical",
  outline: "none",
  lineHeight: 1.5,
  background: "#fff",
};

const InlineEditor = ({
  initial,
  initialDesc,
  type,
  onSave,
  onCancel,
}: {
  initial?: string;
  initialDesc?: string | null;
  type: NodeType;
  onSave: (content: string, desc: string) => void;
  onCancel: () => void;
}) => {
  const [val, setVal] = useState(initial || "");
  const [desc, setDesc] = useState(initialDesc || "");
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.focus();
      ref.current.select?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }} onClick={(e) => e.stopPropagation()}>
      <textarea
        ref={ref}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        rows={2}
        style={taStyle}
        placeholder="Describe the item…"
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSave(val, desc);
          if (e.key === "Escape") onCancel();
        }}
      />
      {type === "WHY" && (
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={2}
          style={{ ...taStyle, fontSize: 12.5 }}
          placeholder="Definition / explanation (optional)…"
        />
      )}
      <div style={{ display: "flex", gap: 6 }}>
        <button
          onClick={() => onSave(val, desc)}
          style={{
            height: 28,
            padding: "0 12px",
            borderRadius: 7,
            border: "none",
            background: "#ED3438",
            color: "#fff",
            fontSize: 12.5,
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Icon name="check" size={13} /> Save
        </button>
        <button
          onClick={onCancel}
          style={{
            height: 28,
            padding: "0 12px",
            borderRadius: 7,
            border: "1px solid #e6e7ea",
            background: "#fff",
            color: "#6b7280",
            fontSize: 12.5,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
        <span style={{ alignSelf: "center", fontSize: 11, color: "#b0b4ba", marginLeft: 2 }}>⌘↵ to save</span>
      </div>
    </div>
  );
};

// ===========================================================================
//  Tree ops bound to the backend (all go through withRefresh)
// ===========================================================================
interface TreeOps {
  update: (id: number, patch: { content?: string; description?: string | null }) => void;
  remove: (id: number) => void;
  addChild: (parentId: number, productId: number, type: NodeType, content: string, desc?: string | null) => void;
  uploadImage: (id: number, file: File) => void;
  deleteImage: (imageId: number) => void;
}

// ===========================================================================
//  Outline view
// ===========================================================================
interface OutlineProps {
  tree: TreeNode[];
  ops: TreeOps;
  isOwner: boolean;
  collapsed: Set<number>;
  toggle: (id: number) => void;
  hoverPath: Set<number>;
  setHoverPath: (s: Set<number>) => void;
  query: string;
}

const OutlineView = (props: OutlineProps) => (
  <div onMouseLeave={() => props.setHoverPath(new Set())}>
    {props.tree.map((n) => (
      <OLNode key={n.id} node={n} ancestors={[]} {...props} />
    ))}
  </div>
);

interface OLNodeProps extends OutlineProps {
  node: TreeNode;
  ancestors: number[];
}

const OLNode = ({ node, ancestors, ops, isOwner, collapsed, toggle, hoverPath, setHoverPath, query, tree }: OLNodeProps) => {
  const t = TYPE[node.node_type];
  const [editing, setEditing] = useState(false);
  const [addType, setAddType] = useState<null | "WHY" | "SOLUTION">(null);
  const [showDesc, setShowDesc] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!matchesQuery(node, query)) return null;

  const hasChildren = (node.children || []).length > 0;
  const isOpen = !collapsed.has(node.id);
  const onPath = hoverPath.has(node.id);
  const ancIds = [...ancestors, node.id];
  const isProblem = node.node_type === "PROBLEM";

  const openAdd = (type: "WHY" | "SOLUTION") => {
    setAddType(type);
    if (!isOpen) toggle(node.id);
  };

  const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) ops.uploadImage(node.id, file);
    e.target.value = "";
  };

  return (
    <div className={`ol-node ${onPath ? "is-onpath" : ""}`} style={{ "--rail-hot": t.accent, marginBottom: 7 } as CSSProperties}>
      <div
        className="ol-card"
        onMouseEnter={() => setHoverPath(new Set(ancIds))}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          padding: "11px 14px",
          borderRadius: 10,
          background: onPath ? t.tint : t.tintSoft,
          border: `1px solid ${onPath ? t.border : "#ececed"}`,
          boxShadow: onPath ? `0 1px 0 ${t.border}` : "none",
        }}
      >
        {/* accent bar */}
        <span style={{ position: "absolute", left: 0, top: 8, bottom: 8, width: 3, borderRadius: 3, background: t.accent, opacity: isProblem ? 1 : 0.65 }} />

        {/* caret */}
        <div style={{ width: hasChildren ? "auto" : 0, paddingTop: 1, flexShrink: 0, marginLeft: 4 }}>
          {hasChildren && <Caret open={isOpen} onClick={() => toggle(node.id)} count={countDescendants(node)} accent={t.accent} />}
        </div>

        {/* body */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {!editing && node.description && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <button
                onClick={() => setShowDesc((s) => !s)}
                title="Definition"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  color: showDesc ? t.text : "#9aa0a6",
                  fontSize: 11,
                  padding: 0,
                }}
              >
                <span
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 99,
                    border: "1.3px solid currentColor",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontStyle: "italic",
                    fontWeight: 700,
                    fontSize: 9,
                  }}
                >
                  i
                </span>
              </button>
            </div>
          )}

          {editing ? (
            <InlineEditor
              initial={node.content}
              initialDesc={node.description}
              type={node.node_type}
              onSave={(v, d) => {
                ops.update(node.id, {
                  content: v.trim() || node.content,
                  ...(node.node_type === "WHY" ? { description: d.trim() || null } : {}),
                });
                setEditing(false);
              }}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <div style={{ fontSize: isProblem ? 15 : 13.5, fontWeight: isProblem ? 650 : 450, color: "#2b2d31", lineHeight: 1.5 }}>
              {highlight(node.content, query)}
            </div>
          )}

          {showDesc && node.description && !editing && (
            <div style={{ marginTop: 6, fontSize: 12.5, color: "#6b7079", lineHeight: 1.5, background: "#fff", border: "1px solid #eceef0", borderRadius: 8, padding: "8px 10px" }}>
              <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "#aab0b8", display: "block", marginBottom: 3 }}>Definition</span>
              {node.description}
            </div>
          )}

          {/* images */}
          {node.images?.length > 0 && !editing && (
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              {node.images.map((img) => (
                <div key={img.id} style={{ position: "relative" }}>
                  <a href={img.url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={img.url}
                      alt={img.caption || img.filename || "image"}
                      title={img.caption}
                      loading="lazy"
                      style={{ width: 86, height: 64, objectFit: "cover", borderRadius: 8, border: "1px solid #e6e7ea", background: "#fff", display: "block" }}
                    />
                  </a>
                  {isOwner && (
                    <button
                      onClick={() => ops.deleteImage(img.id)}
                      title="Remove image"
                      style={{
                        position: "absolute",
                        top: -7,
                        right: -7,
                        width: 20,
                        height: 20,
                        borderRadius: 99,
                        border: "1px solid #e6e7ea",
                        background: "#fff",
                        color: "#c0392b",
                        cursor: "pointer",
                        fontSize: 12,
                        lineHeight: 1,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 1px 3px rgba(0,0,0,.12)",
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* add child form */}
          {addType && isOwner && (
            <div style={{ marginTop: 8 }}>
              <div style={{ marginBottom: 4 }}>
                <TypeChip type={addType} />
              </div>
              <InlineEditor
                initial=""
                type={addType}
                onSave={(v, d) => {
                  if (v.trim()) ops.addChild(node.id, node.product_id, addType, v.trim(), addType === "WHY" ? d.trim() || null : null);
                  setAddType(null);
                }}
                onCancel={() => setAddType(null)}
              />
            </div>
          )}
        </div>

        {/* actions */}
        {isOwner && !editing && (
          <div style={{ flexShrink: 0 }}>
            <RowActions
              node={node}
              show={onPath}
              onEdit={() => setEditing(true)}
              onDelete={() => ops.remove(node.id)}
              onAddCause={() => openAdd("WHY")}
              onAddSolution={() => openAdd("SOLUTION")}
              onAddImage={() => fileRef.current?.click()}
            />
            {isProblem && <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickImage} />}
          </div>
        )}
      </div>

      {hasChildren && isOpen && (
        <div className="ol-children">
          {node.children.map((c) => (
            <OLNode
              key={c.id}
              node={c}
              ancestors={ancIds}
              tree={tree}
              ops={ops}
              isOwner={isOwner}
              collapsed={collapsed}
              toggle={toggle}
              hoverPath={hoverPath}
              setHoverPath={setHoverPath}
              query={query}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ===========================================================================
//  Small chrome helpers
// ===========================================================================
const Stat = ({ n, label, dot }: { n: number; label: string; dot: string }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
    <span style={{ width: 7, height: 7, borderRadius: 2, background: dot }} />
    <span style={{ fontSize: 13, fontWeight: 700, color: "#2b2d31" }}>{n}</span>
    <span style={{ fontSize: 12.5, color: "#8a8f96" }}>{label}</span>
  </div>
);

const Legend = ({ dot, label }: { dot: string; label: string }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#7a7f87" }}>
    <span style={{ width: 8, height: 8, borderRadius: 2, background: dot }} /> {label}
  </span>
);

const textBtn: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 5,
  height: 32,
  padding: "0 10px",
  borderRadius: 8,
  border: "1px solid #ececed",
  background: "#fff",
  color: "#6b7079",
  fontSize: 12.5,
  fontWeight: 500,
  cursor: "pointer",
};

const TextBtn = ({ children, onClick, icon }: { children: React.ReactNode; onClick: () => void; icon: string }) => (
  <button onClick={onClick} style={textBtn}>
    <Icon name={icon} size={13} strokeWidth={1.8} /> {children}
  </button>
);

const SearchBox = ({ query, setQuery }: { query: string; setQuery: (v: string) => void }) => (
  <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
    <span style={{ position: "absolute", left: 11, color: "#aab0b8", display: "flex" }}>
      <Icon name="search" size={15} />
    </span>
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search tree…"
      style={{
        height: 36,
        width: query ? 220 : 178,
        paddingLeft: 33,
        paddingRight: query ? 30 : 12,
        border: "1px solid #e3e4e7",
        borderRadius: 9,
        fontSize: 13,
        fontFamily: "inherit",
        color: "#2b2d31",
        outline: "none",
        background: "#fcfcfd",
        transition: "width .18s ease",
      }}
    />
    {query && (
      <button
        onClick={() => setQuery("")}
        style={{ position: "absolute", right: 8, border: "none", background: "none", color: "#aab0b8", cursor: "pointer", display: "flex", padding: 0 }}
      >
        <Icon name="x" size={14} />
      </button>
    )}
  </div>
);

// ===========================================================================
//  Modal
// ===========================================================================
const ProductTree: React.FC<Props> = ({ product, isOwner, onClose }) => {
  const [tree, setTree] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [newProblem, setNewProblem] = useState("");
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const [hoverPath, setHoverPath] = useState<Set<number>>(new Set());
  const [query, setQuery] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const resp = await ReadProductTree(product.id);
      const data = resp?.data ?? resp;
      setTree(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const withRefresh = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
      await load();
    } finally {
      setBusy(false);
    }
  };

  const ops: TreeOps = useMemo(
    () => ({
      update: (id, patch) => withRefresh(() => UpdateNode(id, patch)),
      remove: (id) => withRefresh(() => DeleteNode(id)),
      addChild: (parentId, productId, type, content, desc) =>
        withRefresh(() => CreateNode({ product_id: productId, parent_id: parentId, node_type: type, content, description: desc ?? null })),
      uploadImage: (id, file) => withRefresh(() => UploadNodeImage(id, file)),
      deleteImage: (imageId) => withRefresh(() => DeleteNodeImage(imageId)),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const toggle = (id: number) =>
    setCollapsed((c) => {
      const n = new Set(c);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const collapseAll = () => {
    const ids = new Set<number>();
    walk(tree, (n) => {
      if ((n.children || []).length) ids.add(n.id);
    });
    setCollapsed(ids);
  };
  const expandAll = () => setCollapsed(new Set());

  const addProblem = async () => {
    const content = newProblem.trim();
    if (!content) return;
    await withRefresh(() => CreateNode({ product_id: product.id, parent_id: null, node_type: "PROBLEM", content }));
    setNewProblem("");
  };

  const stats = useMemo(() => {
    let problems = 0,
      causes = 0,
      solutions = 0,
      maxDepth = 0;
    walk(tree, (n, parents) => {
      if (n.node_type === "PROBLEM") problems++;
      else if (n.node_type === "WHY") causes++;
      else solutions++;
      maxDepth = Math.max(maxDepth, parents.length);
    });
    return { problems, causes, solutions, maxDepth: tree.length ? maxDepth + 1 : 0 };
  }, [tree]);

  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog as="div" className="relative z-20" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0" style={{ background: "rgba(28,30,34,.45)", backdropFilter: "blur(2px)" }} />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel
                style={{
                  width: "min(1080px, 94vw)",
                  height: "90vh",
                  background: "#fff",
                  borderRadius: 18,
                  boxShadow: "0 24px 70px rgba(0,0,0,.32)",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                {/* ---- header ---- */}
                <div style={{ padding: "18px 22px 0", borderBottom: "1px solid #ececed" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".07em", textTransform: "uppercase", color: "#ED3438" }}>
                        Troubleshooting tree
                      </span>
                      <h2 style={{ margin: "5px 0 2px", fontSize: 21, fontWeight: 700, color: "#23252a", letterSpacing: "-.01em" }}>{product.product_title}</h2>
                      <div style={{ display: "flex", gap: 14, marginTop: 7, marginBottom: 14, flexWrap: "wrap" }}>
                        <Stat n={stats.problems} label="problems" dot="#ED3438" />
                        <Stat n={stats.causes} label="causes" dot="#D98A1F" />
                        <Stat n={stats.solutions} label="solutions" dot="#1E9E54" />
                        <Stat n={stats.maxDepth} label="levels deep" dot="#9aa0a6" />
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 9,
                        border: "1px solid #ececed",
                        background: "#fff",
                        color: "#7a7f87",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon name="x" size={17} />
                    </button>
                  </div>

                  {/* ---- toolbar ---- */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, paddingBottom: 14, flexWrap: "wrap" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <TextBtn onClick={expandAll} icon="expand">
                        Expand all
                      </TextBtn>
                      <TextBtn onClick={collapseAll} icon="collapse">
                        Collapse all
                      </TextBtn>
                    </div>
                    <SearchBox query={query} setQuery={setQuery} />
                  </div>

                  {/* ---- add problem (owner) ---- */}
                  {isOwner && (
                    <div style={{ display: "flex", gap: 8, paddingBottom: 14 }}>
                      <input
                        value={newProblem}
                        onChange={(e) => setNewProblem(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") addProblem();
                        }}
                        placeholder="Add a new problem…"
                        style={{
                          flex: 1,
                          height: 38,
                          padding: "0 12px",
                          border: "1px solid #e3e4e7",
                          borderRadius: 9,
                          fontSize: 13.5,
                          fontFamily: "inherit",
                          color: "#2b2d31",
                          outline: "none",
                          background: "#fcfcfd",
                        }}
                      />
                      <button
                        disabled={busy || !newProblem.trim()}
                        onClick={addProblem}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          height: 38,
                          padding: "0 16px",
                          borderRadius: 9,
                          border: "none",
                          background: "#ED3438",
                          color: "#fff",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: busy || !newProblem.trim() ? "default" : "pointer",
                          opacity: busy || !newProblem.trim() ? 0.5 : 1,
                          whiteSpace: "nowrap",
                        }}
                      >
                        <Icon name="plus" size={15} /> Add problem
                      </button>
                    </div>
                  )}
                </div>

                {/* ---- body ---- */}
                <div className="tt-scroll" style={{ flex: 1, overflow: "auto", background: "#fff" }}>
                  <div style={{ padding: "18px 22px 40px", maxWidth: 900, margin: "0 auto" }}>
                    {loading ? (
                      <div style={{ display: "flex", justifyContent: "center", padding: "48px 0" }}>
                        <LoaderIcon size={30} color="#42526e" />
                      </div>
                    ) : tree.length === 0 ? (
                      <div style={{ textAlign: "center", color: "#9aa0a6", padding: "48px 0", fontSize: 14 }}>
                        No problems yet. {isOwner ? "Add one above or upload an Excel file." : ""}
                      </div>
                    ) : (
                      <OutlineView
                        tree={tree}
                        ops={ops}
                        isOwner={isOwner}
                        collapsed={collapsed}
                        toggle={toggle}
                        hoverPath={hoverPath}
                        setHoverPath={setHoverPath}
                        query={query}
                      />
                    )}
                  </div>
                </div>

                {/* ---- footer legend ---- */}
                <div style={{ height: 46, borderTop: "1px solid #ececed", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px", flexShrink: 0 }}>
                  <div style={{ display: "flex", gap: 16 }}>
                    <Legend dot="#ED3438" label="Problem" />
                    <Legend dot="#D98A1F" label="Cause (Why)" />
                    <Legend dot="#1E9E54" label="Solution" />
                  </div>
                  <span style={{ fontSize: 11.5, color: "#aab0b8" }}>Hover a row to trace its path back to the problem</span>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ProductTree;

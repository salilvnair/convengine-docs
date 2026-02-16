import React, { useMemo, useState, useCallback } from "react";
import ReactFlow, {
  Background,
  Controls,
  Handle,
  MarkerType,
  MiniMap,
  Position,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";

function compactFilePath(path, maxLen = 34) {
  if (!path) return "";
  if (path.length <= maxLen) return path;
  const normalized = String(path).replaceAll("\\", "/");
  const parts = normalized.split("/").filter(Boolean);
  const fileName = parts[parts.length - 1] || normalized;
  return `.../../${fileName}`;
}

function DebugFlowNode({ data, selected }) {
  return (
    <div className={`ce-rf-node ${selected ? "ce-rf-node-active" : ""}`}>
      <Handle type="target" position={Position.Top} className="ce-rf-handle" />
      <div className="ce-rf-node-head">
        <span className="ce-rf-node-badge">{data.stepNo}</span>
        <span className="ce-rf-node-title">{data.label}</span>
      </div>
      {data.stage ? <div className="ce-rf-node-stage">{data.stage}</div> : null}
      <Handle type="source" position={Position.Bottom} className="ce-rf-handle" />
    </div>
  );
}

function EngineDebugFlowInner({ title, subtitle, nodes = [], edges = [], detailsById = {}, defaultSelectedId }) {
  const [selectedId, setSelectedId] = useState(defaultSelectedId || (nodes[0] && nodes[0].id));
  const rf = useReactFlow();
  const nodeIndex = useMemo(() => {
    const m = new Map();
    nodes.forEach((n, i) => m.set(n.id, i));
    return m;
  }, [nodes]);
  const byInputOrder = useCallback((a, b) => {
    const ai = nodeIndex.get(a?.id) ?? Number.MAX_SAFE_INTEGER;
    const bi = nodeIndex.get(b?.id) ?? Number.MAX_SAFE_INTEGER;
    return ai - bi;
  }, [nodeIndex]);

  const flowEdges = useMemo(
    () =>
      edges.map((e) => ({
        ...e,
        markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18 },
        type: "smoothstep",
        animated: true,
        style: { strokeWidth: 2.2, stroke: "#2f7dc7", ...e.style },
        label: e.label || detailsById[e.target]?.stage || "",
        labelBgPadding: [8, 3],
        labelBgBorderRadius: 8,
        labelBgStyle: { fill: "rgba(37, 99, 235, 0.22)", stroke: "#60a5fa" },
        labelStyle: { fill: "#ffffff", fontWeight: 800, fontSize: 10 },
      })),
    [edges, detailsById]
  );

  const baseNodes = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          label: n.data?.label || n.label || n.id,
        },
      })),
    [nodes]
  );

  const baseNodesById = useMemo(() => {
    const m = new Map();
    for (const n of baseNodes) m.set(n.id, n);
    return m;
  }, [baseNodes]);

  const orderedStepIds = useMemo(() => {
    if (baseNodes.length === 0) return [];

    const indegree = new Map();
    const adjacency = new Map();
    for (const node of baseNodes) {
      indegree.set(node.id, 0);
      adjacency.set(node.id, []);
    }
    for (const edge of flowEdges) {
      if (!indegree.has(edge.source) || !indegree.has(edge.target)) continue;
      adjacency.get(edge.source).push(edge.target);
      indegree.set(edge.target, (indegree.get(edge.target) || 0) + 1);
    }

    const roots = baseNodes
        .filter((n) => (indegree.get(n.id) || 0) === 0)
        .sort(byInputOrder)
        .map((n) => n.id);
    const queue = [...roots];
    const ordered = [];
    while (queue.length > 0) {
      const current = queue.shift();
      ordered.push(current);
      const children = (adjacency.get(current) || [])
        .map((id) => baseNodesById.get(id))
        .filter(Boolean)
        .sort(byInputOrder)
        .map((n) => n.id);
      for (const childId of children) {
        const next = (indegree.get(childId) || 0) - 1;
        indegree.set(childId, next);
        if (next === 0) {
          queue.push(childId);
        }
      }
    }

    if (ordered.length < baseNodes.length) {
      const seen = new Set(ordered);
      const remaining = baseNodes
        .filter((n) => !seen.has(n.id))
        .sort(byInputOrder)
        .map((n) => n.id);
      ordered.push(...remaining);
    }
    return ordered;
  }, [baseNodes, baseNodesById, flowEdges, byInputOrder]);

  const flowNodes = useMemo(() => {
    const order = new Map(orderedStepIds.map((id, i) => [id, i]));
    const baseX = 120;
    const rowGap = 142;
    return baseNodes
      .slice()
      .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
      .map((n) => {
        const idx = order.get(n.id) ?? 0;
        const label = n.data?.label || n.label || n.id;
        return {
          ...n,
          type: "debugNode",
          className: selectedId === n.id ? "ce-rf-node-wrap-active" : "ce-rf-node-wrap",
          position: { x: baseX, y: 30 + idx * rowGap },
          sourcePosition: Position.Bottom,
          targetPosition: Position.Top,
          draggable: false,
          data: {
            ...n.data,
            label,
            stepNo: idx + 1,
            stage: detailsById[n.id]?.stage || n.data?.stage || "",
          },
          style: {
            width: n.width || 420,
            ...n.style,
          },
        };
      });
  }, [baseNodes, orderedStepIds, selectedId, detailsById]);

  const nodesById = useMemo(() => {
    const m = new Map();
    for (const n of flowNodes) m.set(n.id, n);
    return m;
  }, [flowNodes]);

  const selectNode = useCallback(
    (id) => {
      setSelectedId(id);
      const n = nodesById.get(id);
      if (n?.position) {
        rf.setCenter(n.position.x + 100, n.position.y + 30, { zoom: 1, duration: 300 });
      }
    },
    [nodesById, rf]
  );

  const selected = detailsById[selectedId] || {};
  const nodeTypes = useMemo(() => ({ debugNode: DebugFlowNode }), []);

  return (
    <section className="ce-debug-flow-shell">
      <header className="ce-debug-flow-head">
        <h3>{title}</h3>
        {subtitle ? <p>{subtitle}</p> : null}
      </header>

      <div className="ce-debug-flow-grid">
        <aside className="ce-debug-tree-panel">
          <div className="ce-debug-tree-title">Execution Steps</div>
          <div className="ce-debug-tree-list">
            {orderedStepIds.map((id, idx) => {
              const n = nodesById.get(id);
              if (!n) return null;
              const active = selectedId === id;
              return (
                <button
                  key={id}
                  type="button"
                  className={`ce-debug-step-item ${active ? "ce-debug-step-item-active" : ""}`}
                  onClick={() => selectNode(id)}
                >
                  <span className="ce-debug-step-badge">{idx + 1}</span>
                  <span className="ce-debug-step-label">{n.data?.label || id}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="ce-debug-canvas-panel">
          <ReactFlow
            nodes={flowNodes}
            edges={flowEdges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.18, maxZoom: 1.05 }}
            onNodeClick={(_, node) => selectNode(node.id)}
            proOptions={{ hideAttribution: true }}
          >
            <MiniMap zoomable pannable nodeStrokeWidth={3} maskColor="rgba(2, 8, 23, 0.22)" />
            <Controls showInteractive={false} />
            <Background variant="dots" gap={18} size={1.2} />
          </ReactFlow>
        </div>

        <aside className="ce-debug-detail-panel">
          <div className="ce-debug-detail-title">Step Detail</div>
          <div className="ce-debug-detail-card ce-debug-detail-hero">
            <h4>{selected.title || selectedId || "-"}</h4>
            {selected.stage ? <div className="ce-debug-stage-pill">{selected.stage}</div> : null}
            {selected.summary ? <p>{selected.summary}</p> : null}
          </div>
          <div className="ce-debug-detail-card">
            {selected.file ? (
              <div className="ce-debug-kv">
                <span>file</span>
                <code className="ce-debug-path-code" title={selected.file}>
                  {compactFilePath(selected.file)}
                </code>
              </div>
            ) : null}
            {selected.method ? (
              <div className="ce-debug-kv">
                <span>method</span>
                <code className="ce-debug-method-code" title={selected.method}>
                  {selected.method}
                </code>
              </div>
            ) : null}
          </div>
          {selected.session ? (
            <div className="ce-debug-detail-card">
              <div className="ce-debug-detail-subtitle">Session Snapshot</div>
              <ul className="ce-debug-chip-list">
                {selected.session.map((s) => (
                  <li key={s} className="ce-debug-chip">
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {selected.tables ? (
            <div className="ce-debug-detail-card">
              <div className="ce-debug-detail-subtitle">Tables Touched</div>
              <ul className="ce-debug-chip-list">
                {selected.tables.map((t) => (
                  <li key={t} className="ce-debug-chip ce-debug-chip-db">
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
    </section>
  );
}

export function EngineDebugFlow(props) {
  return (
    <ReactFlowProvider>
      <EngineDebugFlowInner {...props} />
    </ReactFlowProvider>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { getTelemetrySocket } from '@/lib/socket';

interface NodeItem {
  id: string;
  name: string;
  hostname?: string;
  status: 'UP' | 'DEGRADED' | 'DOWN' | string;
  cpuThreshold: number;
  ramThreshold: number;
  latencyThresholdMs: number;
  lastSeenAt?: string;
}

interface AlertItem {
  id: string;
  nodeId: string;
  type: string;
  severity: string;
  message: string;
  observedValue: number;
  thresholdValue: number;
  isResolved: boolean;
  createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function DashboardPage() {
  const [nodes, setNodes] = useState<NodeItem[]>([]);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    async function loadInitialData() {
      try {
        const [nodesRes, alertsRes] = await Promise.all([
          fetch(`${API_URL}/nodes`),
          fetch(`${API_URL}/alerts`),
        ]);
        if (nodesRes.ok) {
          setNodes(await nodesRes.json());
        }
        if (alertsRes.ok) {
          setAlerts(await alertsRes.json());
        }
      } catch (err) {
        console.error('Erreur chargement initial :', err);
      }
    }

    loadInitialData();

    const socket = getTelemetrySocket();

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    const onMetricCreated = (payload: { metric?: unknown; node?: NodeItem }) => {
      if (payload?.node) {
        setNodes((prev) =>
          prev.map((n) => (n.id === payload.node!.id ? { ...n, ...payload.node } : n)),
        );
      }
    };

    const onAlertTriggered = (alert: AlertItem) => {
      setAlerts((prev) => [alert, ...prev]);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('metric.created', onMetricCreated);
    socket.on('alert.triggered', onAlertTriggered);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('metric.created', onMetricCreated);
      socket.off('alert.triggered', onAlertTriggered);
    };
  }, []);

  async function handleResolveAlert(alertId: string) {
    try {
      const res = await fetch(`${API_URL}/alerts/${alertId}/resolve`, {
        method: 'PATCH',
      });
      if (res.ok) {
        const updated: AlertItem = await res.json();
        setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      }
    } catch (err) {
      console.error('Erreur résolution alerte :', err);
    }
  }

  function getStatusClass(status: string) {
    if (status === 'UP') return 'status-pill status-up';
    if (status === 'DEGRADED') return 'status-pill status-degraded';
    if (status === 'DOWN') return 'status-pill status-down';
    return 'status-pill';
  }

  return (
    <main className="monitor-container min-h-screen bg-slate-950 text-slate-100 p-6">
      <header className="monitor-header">
        <div>
          <h1 className="monitor-title">Telemetry & Alerts Monitor</h1>
          <p className="monitor-subtitle">Supervision temps réel des nœuds et alertes</p>
        </div>
        <span className={`ws-badge ${connected ? 'ws-connected' : 'ws-disconnected'}`}>
          {connected ? 'WS Connecté' : 'WS Déconnecté'}
        </span>
      </header>

      <section className="section-block">
        <h2 className="section-title">Nœuds ({nodes.length})</h2>
        <div className="nodes-grid">
          {nodes.map((node) => (
            <div key={node.id} className="card-box">
              <div className="card-top">
                <span className="node-name">{node.name}</span>
                <span className={getStatusClass(node.status)}>{node.status}</span>
              </div>
              <p className="muted-text">{node.hostname || node.id}</p>
              <p className="muted-text">
                Seuils : CPU {node.cpuThreshold}% • RAM {node.ramThreshold}% • Latence{' '}
                {node.latencyThresholdMs}ms
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="section-block">
        <h2 className="section-title">Alertes</h2>
        <div className="alerts-list">
          {alerts.map((alert) => (
            <div key={alert.id} className="alert-row">
              <div>
                <div className="alert-meta">
                  <span className="alert-type">{alert.type}</span>
                  <span className="alert-state">
                    {alert.isResolved ? 'Résolue' : 'Active'}
                  </span>
                </div>
                <p className="alert-message">{alert.message}</p>
              </div>
              {!alert.isResolved && (
                <button
                  onClick={() => handleResolveAlert(alert.id)}
                  className="resolve-btn"
                >
                  Résoudre
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
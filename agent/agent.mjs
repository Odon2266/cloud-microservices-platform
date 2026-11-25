import os from 'node:os';
import { performance } from 'node:perf_hooks';

// Configuration de l'agent (modifiable via variables d'environnement)
const API_URL = process.env.API_URL || 'http://100.126.200.117:3000/metrics';
const NODE_ID = process.env.NODE_ID || 'c263bb43-0c06-45db-9721-df0233dc1e04';
const INTERVAL_MS = Number(process.env.INTERVAL_MS || 5000);

function snapshotCpu() {
  const cpus = os.cpus();
  let idle = 0;
  let total = 0;

  for (const cpu of cpus) {
    idle += cpu.times.idle;
    total +=
      cpu.times.user +
      cpu.times.nice +
      cpu.times.sys +
      cpu.times.idle +
      cpu.times.irq;
  }

  return { idle, total };
}

function getCpuUsagePercent(delayMs = 500) {
  return new Promise((resolve) => {
    const start = snapshotCpu();

    setTimeout(() => {
      const end = snapshotCpu();
      const idleDelta = end.idle - start.idle;
      const totalDelta = end.total - start.total;

      if (totalDelta <= 0) {
        resolve(0);
        return;
      }

      const usage = ((totalDelta - idleDelta) / totalDelta) * 100;
      resolve(Number(Math.max(0, Math.min(100, usage)).toFixed(1)));
    }, delayMs);
  });
}

function getRamUsagePercent() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  return Number(((usedMem / totalMem) * 100).toFixed(1));
}

async function sendTelemetry() {
  const cpuUsage = await getCpuUsagePercent(500);
  const ramUsage = getRamUsagePercent();

  const startTime = performance.now();
  let isHealthy = true;

  try {
    const initialResponse = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nodeId: NODE_ID,
        cpuUsage,
        ramUsage,
        latencyMs: 0,
        isHealthy: true,
      }),
    });

    const latencyMs = Math.max(1, Math.round(performance.now() - startTime));
    isHealthy = initialResponse.ok;

    if (!initialResponse.ok) {
      const errorText = await initialResponse.text();
      console.error(`[${new Date().toISOString()}] HTTP ${initialResponse.status} : ${errorText}`);
      return;
    }

    console.log(
      `[${new Date().toISOString()}] Envoyé -> CPU: ${cpuUsage}% | RAM: ${ramUsage}% | Latence HTTP: ${latencyMs}ms | Healthy: ${isHealthy}`,
    );
  } catch (err) {
    const latencyMs = Math.round(performance.now() - startTime);
    console.error(
      `[${new Date().toISOString()}] Échec d'envoi (latence: ${latencyMs}ms) : ${err.message}`,
    );
  }
}

console.log(`Démarrage de l'agent pour le nœud ${NODE_ID} vers ${API_URL} (toutes les ${INTERVAL_MS}ms)...`);
sendTelemetry();
setInterval(sendTelemetry, INTERVAL_MS);
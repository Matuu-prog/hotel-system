// utils/activityLog.js
export const ACTIVITY_KEY = "activityLogs";

export function getLogs() {
  return JSON.parse(localStorage.getItem(ACTIVITY_KEY)) || [];
}

export function addLog({ actor, action, details }) {
  const logs = getLogs();
  const entry = {
    id: Date.now(),
    ts: new Date().toISOString(),
    actor,         // ej: "Juan Pérez (operador)" o "Mateo (superadmin)"
    action,        // ej: "Reserva creada", "Pago procesado", "Reserva cancelada"
    details,       // texto libre
  };
  logs.unshift(entry);
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(logs));
  return entry;
}
export function logAction({ accion, detalle }) {
  const user = JSON.parse(localStorage.getItem("usuarioActual"));
  const logs = JSON.parse(localStorage.getItem("logs")) || [];
  logs.push({
    id: Date.now(),
    fecha: new Date().toISOString(),
    operador: user ? user.nombre : "Desconocido",
    rol: user ? user.rol : "N/A",
    accion,         // ej: "Cancelar reserva", "Procesar pago"
    detalle,        // texto libre
  });
  localStorage.setItem("logs", JSON.stringify(logs));
}
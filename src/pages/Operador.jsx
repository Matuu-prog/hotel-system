// src/pages/Operador.jsx
import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  ListGroup,
  Modal,
  Form,
  Table,
} from "react-bootstrap";
import NavbarUsuario from "../components/NavBarUsuario";

// Utils
const ymd = (d) =>
  new Date(d).toISOString().split("T")[0];

const rangeToArray = (start, end) => {
  const out = [];
  const a = new Date(start);
  const b = new Date(end);
  while (a <= b) {
    out.push(ymd(a));
    a.setDate(a.getDate() + 1);
  }
  return out;
};

// LocalStorage helpers
const load = (k, fallback) => {
  try {
    const raw = localStorage.getItem(k);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

// Libera fechas del calendario de una habitación
const liberarFechasDeHabitacion = (habitaciones, roomId, start, end) => {
  const aEliminar = new Set(rangeToArray(start, end));
  return habitaciones.map((h) => {
    if (String(h.id) !== String(roomId)) return h;
    const prev = new Set(h.reservedDates || []);
    for (const d of aEliminar) prev.delete(d);
    return { ...h, reservedDates: Array.from(prev) };
  });
};

export default function Operador() {
  // Sesión (para logs)
  const usuarioActual = load("usuarioActual", null);

  // Datos base
  const [habitaciones, setHabitaciones] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [logs, setLogs] = useState([]);

  // UI
  const [active, setActive] = useState("reservas"); // reservas | pagos | gestion
  const [show, setShow] = useState(false);
  const [reservaSel, setReservaSel] = useState(null);
  const [filtroPago, setFiltroPago] = useState("todas"); // todas | pendiente | pagado
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    // Habitaciones iniciales si no existen
    let habs = load("habitaciones", null);
    if (!habs) {
      habs = [
        {
          id: 1,
          nombre: "Habitación Deluxe",
          descripcion: "Cama King, vista al mar, aire acondicionado, TV, WiFi.",
          imagenes: ["/img/hab1a.jpg", "/img/hab1b.jpg", "/img/hab1c.jpg"],
          reservedDates: [],
        },
        {
          id: 2,
          nombre: "Habitación Familiar",
          descripcion: "2 camas Queen, ideal para 4 personas, balcón privado.",
          imagenes: ["/img/hab2a.jpg", "/img/hab2b.jpg", "/img/hab2c.jpg"],
          reservedDates: [],
        },
        {
          id: 3,
          nombre: "Suite Ejecutiva",
          descripcion: "Suite con escritorio, minibar, jacuzzi y servicio premium.",
          imagenes: ["/img/hab3a.jpg", "/img/hab3b.jpg", "/img/hab3c.jpg"],
          reservedDates: [],
        },
      ];
      save("habitaciones", habs);
    }
    setHabitaciones(habs);

    // Reservas (estructura prototipo)
    // Cada reserva: { id, roomId, roomName, start, end, cliente:{nombre,email,telefono,dni}, pago:{estado, metodo, monto, fecha?, oper?} }
    setReservas(load("reservas", []));

    // Logs
    setLogs(load("logs", []));
  }, []);

  const guardarReservas = (lista) => {
    setReservas(lista);
    save("reservas", lista);
  };
  const guardarHabitaciones = (lista) => {
    setHabitaciones(lista);
    save("habitaciones", lista);
  };
  const pushLog = (accion, extra = {}) => {
    const entrada = {
      id: Date.now(),
      fecha: new Date().toISOString(),
      operador: usuarioActual?.nombre || "Desconocido",
      accion,
      ...extra,
    };
    const nuevo = [entrada, ...logs];
    setLogs(nuevo);
    save("logs", nuevo);
  };

  // Derivados
  const reservasFiltradas = useMemo(() => {
    let r = [...reservas];
    if (filtroPago !== "todas") {
      r = r.filter((x) => (x.pago?.estado || "pendiente") === filtroPago);
    }
    if (busqueda.trim()) {
      const q = busqueda.toLowerCase();
      r = r.filter(
        (x) =>
          String(x.roomName).toLowerCase().includes(q) ||
          String(x.cliente?.nombre || "").toLowerCase().includes(q) ||
          String(x.cliente?.email || "").toLowerCase().includes(q) ||
          String(x.cliente?.dni || "").toLowerCase().includes(q)
      );
    }
    return r.sort((a, b) => new Date(a.start) - new Date(b.start));
  }, [reservas, filtroPago, busqueda]);

  const pendientesPago = useMemo(
    () => reservas.filter((r) => (r.pago?.estado || "pendiente") === "pendiente"),
    [reservas]
  );
  const pagadas = useMemo(
    () => reservas.filter((r) => (r.pago?.estado || "pendiente") === "pagado"),
    [reservas]
  );

  // Acciones
  const abrirDetalles = (reserva) => {
    setReservaSel(reserva);
    setShow(true);
  };
  const cerrarDetalles = () => {
    setShow(false);
    setReservaSel(null);
  };

  const procesarPago = (reserva) => {
    const monto = Number(reserva?.pago?.monto || 0);
    const upd = reservas.map((r) =>
      r.id === reserva.id
        ? {
            ...r,
            pago: {
              ...r.pago,
              estado: "pagado",
              fecha: new Date().toISOString(),
              operador: usuarioActual?.nombre || "Desconocido",
            },
          }
        : r
    );
    guardarReservas(upd);
    pushLog("Procesó pago", {
      reservaId: reserva.id,
      roomId: reserva.roomId,
      monto,
    });
  };

  const cancelarReserva = (reserva) => {
    if (!window.confirm(`¿Cancelar la reserva de ${reserva.roomName}?`)) return;

    // 1) Remover de "reservas"
    const updRes = reservas.filter((r) => r.id !== reserva.id);
    guardarReservas(updRes);

    // 2) Liberar fechas en "habitaciones"
    const habsUpd = liberarFechasDeHabitacion(
      habitaciones,
      reserva.roomId,
      reserva.start,
      reserva.end
    );
    guardarHabitaciones(habsUpd);

    pushLog("Canceló reserva", {
      reservaId: reserva.id,
      roomId: reserva.roomId,
      rango: `${reserva.start} → ${reserva.end}`,
    });

    // Si está abierto el modal, cerrarlo
    if (reservaSel?.id === reserva.id) cerrarDetalles();
  };

  // UI helpers
  const PagoBadge = ({ estado }) => {
    const st = (estado || "pendiente").toLowerCase();
    const v =
      st === "pagado" ? "success" : st === "rechazado" ? "danger" : "warning";
    return <Badge bg={v}>{st.toUpperCase()}</Badge>;
  };

  return (
    <>
      <NavbarUsuario />

      <Container fluid className="mt-4">
        <Row>
          {/* Sidebar */}
          <Col md={3} lg={2} className="mb-3">
            <Card className="shadow-sm">
              <Card.Header className="fw-bold">Panel del Operador</Card.Header>
              <ListGroup variant="flush">
                <ListGroup.Item
                  action
                  active={active === "reservas"}
                  onClick={() => setActive("reservas")}
                >
                  📅 Reservas
                </ListGroup.Item>
                <ListGroup.Item
                  action
                  active={active === "pagos"}
                  onClick={() => setActive("pagos")}
                >
                  💳 Pagos
                </ListGroup.Item>
                <ListGroup.Item
                  action
                  active={active === "gestion"}
                  onClick={() => setActive("gestion")}
                >
                  🛠️ Gestión
                </ListGroup.Item>
              </ListGroup>
            </Card>

            <Card className="shadow-sm mt-3">
              <Card.Body className="small">
                <div className="d-flex justify-content-between">
                  <span>Pendientes de pago</span>
                  <Badge bg="warning" text="dark">
                    {pendientesPago.length}
                  </Badge>
                </div>
                <div className="d-flex justify-content-between mt-2">
                  <span>Pagadas</span>
                  <Badge bg="success">{pagadas.length}</Badge>
                </div>
                <div className="d-flex justify-content-between mt-2">
                  <span>Total reservas</span>
                  <Badge bg="secondary">{reservas.length}</Badge>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Content */}
          <Col md={9} lg={10}>
            {/* RESERVAS */}
            {active === "reservas" && (
              <>
                <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
                  <h4 className="m-0">Reservas</h4>
                  <Form.Select
                    value={filtroPago}
                    onChange={(e) => setFiltroPago(e.target.value)}
                    style={{ maxWidth: 220 }}
                  >
                    <option value="todas">Todas</option>
                    <option value="pendiente">Sólo pendientes</option>
                    <option value="pagado">Sólo pagadas</option>
                  </Form.Select>
                  <Form.Control
                    placeholder="Buscar por cliente, email, DNI o habitación…"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    style={{ maxWidth: 360 }}
                  />
                </div>

                {reservasFiltradas.length === 0 ? (
                  <Card className="shadow-sm">
                    <Card.Body>No hay reservas para mostrar.</Card.Body>
                  </Card>
                ) : (
                  reservasFiltradas.map((r) => (
                    <Card key={r.id} className="shadow-sm mb-3">
                      <Card.Body className="d-flex flex-wrap gap-3 align-items-start justify-content-between">
                        <div>
                          <div className="fw-bold">{r.roomName}</div>
                          <div className="text-muted small">
                            {r.start} → {r.end} ({rangeToArray(r.start, r.end).length} noches)
                          </div>
                          <div className="mt-1 small">
                            Cliente: <strong>{r.cliente?.nombre}</strong> — {r.cliente?.email} — {r.cliente?.dni}
                          </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <PagoBadge estado={r.pago?.estado} />
                          <Button variant="outline-secondary" size="sm" onClick={() => abrirDetalles(r)}>
                            Ver detalles
                          </Button>
                          {(r.pago?.estado || "pendiente") === "pendiente" && (
                            <Button variant="success" size="sm" onClick={() => procesarPago(r)}>
                              Procesar pago
                            </Button>
                          )}
                          <Button variant="danger" size="sm" onClick={() => cancelarReserva(r)}>
                            Cancelar
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  ))
                )}
              </>
            )}

            {/* PAGOS */}
            {active === "pagos" && (
              <>
                <h4 className="mb-3">Pagos</h4>
                <Card className="shadow-sm mb-3">
                  <Card.Header className="fw-bold">Pendientes</Card.Header>
                  <Card.Body className="p-0">
                    <Table responsive className="m-0">
                      <thead>
                        <tr>
                          <th>Habitación</th>
                          <th>Cliente</th>
                          <th>Rango</th>
                          <th>Monto</th>
                          <th>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendientesPago.length === 0 && (
                          <tr>
                            <td colSpan={5} className="text-center p-3">
                              No hay pagos pendientes.
                            </td>
                          </tr>
                        )}
                        {pendientesPago.map((r) => (
                          <tr key={`pend-${r.id}`}>
                            <td>{r.roomName}</td>
                            <td>{r.cliente?.nombre}</td>
                            <td>
                              {r.start} → {r.end}
                            </td>
                            <td>${r.pago?.monto || 0}</td>
                            <td>
                              <Button size="sm" variant="success" onClick={() => procesarPago(r)}>
                                Procesar
                              </Button>{" "}
                              <Button size="sm" variant="outline-secondary" onClick={() => abrirDetalles(r)}>
                                Detalles
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>

                <Card className="shadow-sm">
                  <Card.Header className="fw-bold">Pagadas</Card.Header>
                  <Card.Body className="p-0">
                    <Table responsive className="m-0">
                      <thead>
                        <tr>
                          <th>Habitación</th>
                          <th>Cliente</th>
                          <th>Rango</th>
                          <th>Monto</th>
                          <th>Fecha pago</th>
                          <th>Operador</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagadas.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center p-3">
                              No hay pagos registrados.
                            </td>
                          </tr>
                        )}
                        {pagadas.map((r) => (
                          <tr key={`pay-${r.id}`}>
                            <td>{r.roomName}</td>
                            <td>{r.cliente?.nombre}</td>
                            <td>
                              {r.start} → {r.end}
                            </td>
                            <td>${r.pago?.monto || 0}</td>
                            <td>{r.pago?.fecha ? r.pago.fecha.split("T")[0] : "-"}</td>
                            <td>{r.pago?.operador || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </>
            )}

            {/* GESTIÓN */}
            {active === "gestion" && (
              <>
                <h4 className="mb-3">Gestión rápida</h4>
                <Card className="shadow-sm mb-3">
                  <Card.Header>Habitaciones con fechas ocupadas</Card.Header>
                  <Card.Body>
                    {habitaciones.every((h) => (h.reservedDates || []).length === 0) ? (
                      <div className="text-muted">No hay fechas ocupadas.</div>
                    ) : (
                      habitaciones.map((h) => (
                        <div key={h.id} className="mb-3">
                          <div className="fw-bold">{h.nombre}</div>
                          <div className="small">
                            {(h.reservedDates || []).join(", ")}
                          </div>
                        </div>
                      ))
                    )}
                  </Card.Body>
                </Card>

                <Card className="shadow-sm">
                  <Card.Header>Últimas acciones</Card.Header>
                  <Card.Body className="p-0">
                    <Table responsive className="m-0">
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Operador</th>
                          <th>Acción</th>
                          <th>Detalle</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.length === 0 && (
                          <tr>
                            <td colSpan={4} className="text-center p-3">
                              Aún no hay acciones registradas.
                            </td>
                          </tr>
                        )}
                        {logs.map((l) => (
                          <tr key={l.id}>
                            <td>{l.fecha.split("T")[0]}</td>
                            <td>{l.operador}</td>
                            <td>{l.accion}</td>
                            <td className="small text-muted">
                              {l.rango ? `Rango: ${l.rango}` : ""}
                              {l.monto ? ` Monto: $${l.monto}` : ""}
                              {l.roomId ? ` Hab: ${l.roomId}` : ""}
                              {l.reservaId ? ` Res: ${l.reservaId}` : ""}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </>
            )}
          </Col>
        </Row>
      </Container>

      {/* Modal de detalles */}
      <Modal show={show} onHide={cerrarDetalles} centered>
        <Modal.Header closeButton>
          <Modal.Title>Detalles de la reserva</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {reservaSel ? (
            <>
              <div className="mb-2">
                <strong>Habitación: </strong> {reservaSel.roomName}
              </div>
              <div className="mb-2">
                <strong>Rango: </strong> {reservaSel.start} → {reservaSel.end} (
                {rangeToArray(reservaSel.start, reservaSel.end).length} noches)
              </div>
              <div className="mb-2">
                <strong>Cliente: </strong> {reservaSel.cliente?.nombre} —{" "}
                {reservaSel.cliente?.email} — {reservaSel.cliente?.dni}
              </div>
              <div className="mb-2">
                <strong>Pago: </strong>{" "}
                <Badge bg={(reservaSel.pago?.estado || "pendiente") === "pagado" ? "success" : "warning"}>
                  {(reservaSel.pago?.estado || "pendiente").toUpperCase()}
                </Badge>
              </div>
              <div className="small text-muted">
                {reservaSel.pago?.metodo ? `Método: ${reservaSel.pago.metodo}` : ""}
                {reservaSel.pago?.monto ? ` — Monto: $${reservaSel.pago.monto}` : ""}
                {reservaSel.pago?.fecha ? ` — Fecha pago: ${reservaSel.pago.fecha.split("T")[0]}` : ""}
              </div>
            </>
          ) : (
            <div>No hay datos.</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {reservaSel && (reservaSel.pago?.estado || "pendiente") === "pendiente" && (
            <Button variant="success" onClick={() => procesarPago(reservaSel)}>
              Procesar pago
            </Button>
          )}
          {reservaSel && (
            <Button variant="danger" onClick={() => cancelarReserva(reservaSel)}>
              Cancelar reserva
            </Button>
          )}
          <Button variant="secondary" onClick={cerrarDetalles}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

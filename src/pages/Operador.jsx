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

const formatoFechaHora = (iso) => {
  if (!iso) return "-";
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return iso;
  return fecha.toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
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
  const [mensajes, setMensajes] = useState([]);
  const [estadosPuertas, setEstadosPuertas] = useState({});

  // UI
  const [active, setActive] = useState("reservas"); // reservas | pagos | gestion
  const [show, setShow] = useState(false);
  const [reservaSel, setReservaSel] = useState(null);
  const [filtroPago, setFiltroPago] = useState("todas"); // todas | pendiente | pagado
  const [busqueda, setBusqueda] = useState("");
  const [mensajeSel, setMensajeSel] = useState(null);
  const [respuesta, setRespuesta] = useState(""); 


  useEffect(() => {
    // Habitaciones iniciales si no existen
    let habs = load("habitaciones", null);
    if (!habs) {
      habs = [
        {
          id: 1,
          nombre: "Habitación Deluxe",
          piso: 1,
          descripcion: "Cama King, vista al mar, aire acondicionado, TV, WiFi.",
          imagenes: ["/img/hab1a.jpg", "/img/hab1b.jpg", "/img/hab1c.jpg"],
          reservedDates: [],
        },
        {
          id: 2,
          nombre: "Habitación Familiar",
          piso: 2,
          descripcion: "2 camas Queen, ideal para 4 personas, balcón privado.",
          imagenes: ["/img/hab2a.jpg", "/img/hab2b.jpg", "/img/hab2c.jpg"],
          reservedDates: [],
        },
        {
          id: 3,
          nombre: "Suite Ejecutiva",
          piso: 3,
          descripcion: "Suite con escritorio, minibar, jacuzzi y servicio premium.",
          imagenes: ["/img/hab3a.jpg", "/img/hab3b.jpg", "/img/hab3c.jpg"],
          reservedDates: [],
        },
      ];
      save("habitaciones", habs);
    }
    setHabitaciones(habs);

    // Estados iniciales de las puertas
    const guardados = load("estadosPuertas", {});
    const normalizados = {};
    habs.forEach((hab) => {
      const previo = String(guardados?.[hab.id] || "cerrada").toLowerCase();
      normalizados[hab.id] = previo === "abierta" ? "abierta" : "cerrada";
    });
    setEstadosPuertas(normalizados);
    save("estadosPuertas", normalizados);

    // Reservas (estructura prototipo)
    // Cada reserva: { id, roomId, roomName, start, end, cliente:{nombre,email,telefono,dni}, pago:{estado, metodo, monto, fecha?, oper?} }
    setReservas(load("reservas", []));

    // Logs
    setLogs(load("logs", []));

    // Mensajes de contacto
    setMensajes(load("mensajesContacto", []));
  }, []);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === "mensajesContacto") {
        try {
          const nuevos = event.newValue ? JSON.parse(event.newValue) : [];
          setMensajes(nuevos);
        } catch {
          setMensajes([]);
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);

  }, []);

  const guardarReservas = (lista) => {
    setReservas(lista);
    save("reservas", lista);
  };
  const guardarHabitaciones = (lista) => {
    setHabitaciones(lista);
    save("habitaciones", lista);
  };
  const guardarMensajes = (lista) => {
    setMensajes(lista);
    save("mensajesContacto", lista);
  };
  const guardarEstadosPuertas = (estados) => {
    setEstadosPuertas(estados);
    save("estadosPuertas", estados);
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

  const puertasAbiertas = useMemo(
    () =>
      Object.entries(estadosPuertas).reduce(
        (acc, [, estado]) => acc + (estado === "abierta" ? 1 : 0),
        0
      ),
    [estadosPuertas]
  );
  const puertasCerradas = Math.max(
    habitaciones.length - puertasAbiertas,
    0
  );

  const mensajesPendientes = useMemo(
    () => mensajes.filter((m) => !(m.respuesta || "").trim()).length,
    [mensajes]
  );

  const seleccionarMensaje = (mensaje) => {
    setMensajeSel(mensaje);
    setRespuesta(mensaje?.respuesta || "");
  };

  const responderMensaje = (event) => {
    event.preventDefault();
    if (!mensajeSel) return;
    const texto = respuesta.trim();
    if (!texto) return;

    const listaActualizada = mensajes.map((m) =>
      m.id === mensajeSel.id
        ? {
            ...m,
            respuesta: texto,
            respondidoEn: new Date().toISOString(),
            respondidoPor: usuarioActual?.nombre || "Operador",
          }
        : m
    );
    guardarMensajes(listaActualizada);
    const actualizado = listaActualizada.find((m) => m.id === mensajeSel.id) || null;
    setMensajeSel(actualizado);
    setRespuesta(actualizado?.respuesta || "");
  };

  const limpiarRespuesta = () => {
    if (!mensajeSel) return;
    const listaActualizada = mensajes.map((m) =>
      m.id === mensajeSel.id
        ? {
            ...m,
            respuesta: "",
            respondidoEn: null,
            respondidoPor: null,
          }
        : m
    );
    guardarMensajes(listaActualizada);
    const actualizado = listaActualizada.find((m) => m.id === mensajeSel.id) || null;
    setMensajeSel(actualizado);
    setRespuesta("");
  };

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

  const cambiarEstadoPuerta = (habitacion, nuevoEstado) => {
    const estadoNormalizado = nuevoEstado === "abierta" ? "abierta" : "cerrada";
    const actualizados = {
      ...estadosPuertas,
      [habitacion.id]: estadoNormalizado,
    };
    guardarEstadosPuertas(actualizados);
    pushLog(`Puerta ${estadoNormalizado === "abierta" ? "abierta" : "cerrada"}`, {
      roomId: habitacion.id,
      roomName: habitacion.nombre,
    });
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
                  active={active === "mensajes"}
                  onClick={() => setActive("mensajes")}
                >
                  ✉️ Mensajes
                </ListGroup.Item>
                <ListGroup.Item
                  action
                  active={active === "puertas"}
                  onClick={() => setActive("puertas")}
                >
                  🚪 Puertas
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
                <div className="d-flex justify-content-between mt-2">
                  <span>Mensajes pendientes</span>
                  <Badge bg={mensajesPendientes > 0 ? "info" : "secondary"}>
                    {mensajesPendientes}
                  </Badge>
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

             {/* MENSAJES */}
            {active === "mensajes" && (
              <>
                <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
                  <h4 className="m-0">Mensajes de contacto</h4>
                  <Badge bg="secondary">{mensajes.length}</Badge>
                  {mensajesPendientes > 0 ? (
                    <Badge bg="warning" text="dark">{`${mensajesPendientes} pendientes`}</Badge>
                  ) : (
                    <Badge bg="success">Todos respondidos</Badge>
                  )}
                </div>
                {mensajes.length === 0 ? (
                  <Card className="shadow-sm">
                    <Card.Body>No hay mensajes recibidos por el momento.</Card.Body>
                  </Card>
                ) : (
                  <Row className="g-3">
                    <Col lg={5}>
                      <Card className="shadow-sm h-100">
                        <Card.Header className="fw-semibold">Bandeja de entrada</Card.Header>
                        <ListGroup variant="flush" className="flex-grow-1 overflow-auto" style={{ maxHeight: "60vh" }}>
                          {mensajes.map((msg) => (
                            <ListGroup.Item
                              key={msg.id}
                              action
                              active={mensajeSel?.id === msg.id}
                              onClick={() => seleccionarMensaje(msg)}
                              className="d-flex justify-content-between align-items-start"
                            >
                              <div>
                                <div className="fw-semibold">{msg.nombre}</div>
                                <div className="small text-muted">{msg.email}</div>
                                <div className="small text-muted">{formatoFechaHora(msg.enviadoEn)}</div>
                              </div>
                              <Badge bg={(msg.respuesta || "").trim() ? "success" : "secondary"}>
                                {(msg.respuesta || "").trim() ? "Respondido" : "Pendiente"}
                              </Badge>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </Card>
                    </Col>
                    <Col lg={7}>
                      <Card className="shadow-sm h-100">
                        <Card.Header className="fw-semibold">Detalle del mensaje</Card.Header>
                        <Card.Body className="d-flex flex-column">
                          {mensajeSel ? (
                            <>
                              <div className="mb-3">
                                <div className="fw-semibold">{mensajeSel.nombre}</div>
                                <div className="text-muted">{mensajeSel.email}</div>
                                <div className="small text-muted mt-1">
                                  Enviado: {formatoFechaHora(mensajeSel.enviadoEn)}
                                </div>
                              </div>
                              <div className="mb-3">
                                <div className="fw-semibold mb-1">Mensaje</div>
                                <Card className="bg-light border-0">
                                  <Card.Body className="py-2">{mensajeSel.mensaje}</Card.Body>
                                </Card>
                              </div>
                              {mensajeSel.respuesta && (
                                <div className="mb-3">
                                  <div className="fw-semibold mb-1 d-flex align-items-center gap-2">
                                    Respuesta enviada
                                    <Badge bg="success">{formatoFechaHora(mensajeSel.respondidoEn)}</Badge>
                                  </div>
                                  <div className="small text-muted mb-2">
                                    Por: {mensajeSel.respondidoPor || "Operador"}
                                  </div>
                                  <Card className="bg-light border-0">
                                    <Card.Body className="py-2">{mensajeSel.respuesta}</Card.Body>
                                  </Card>
                                </div>
                              )}
                              <Form onSubmit={responderMensaje} className="mt-auto">
                                <Form.Group className="mb-3" controlId="respuestaContacto">
                                  <Form.Label>Escribir respuesta</Form.Label>
                                  <Form.Control
                                    as="textarea"
                                    rows={4}
                                    value={respuesta}
                                    onChange={(e) => setRespuesta(e.target.value)}
                                    placeholder="Redactá tu respuesta para el cliente"
                                  />
                                </Form.Group>
                                <div className="d-flex justify-content-between gap-2">
                                  {mensajeSel.respuesta && (
                                    <Button variant="outline-secondary" type="button" onClick={limpiarRespuesta}>
                                      Limpiar respuesta
                                    </Button>
                                  )}
                                  <div className="ms-auto d-flex gap-2">
                                    <Button variant="primary" type="submit" disabled={!respuesta.trim()}>
                                      Guardar respuesta
                                    </Button>
                                  </div>
                                </div>
                              </Form>
                            </>
                          ) : (
                            <div className="text-muted">Seleccioná un mensaje para ver los detalles.</div>
                          )}
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
            )}
            </>
        )}

        {/* PUERTAS */}
        {active === "puertas" && (
          <>
            <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
              <h4 className="m-0">Control de puertas</h4>
              <Badge bg="success">Abiertas: {puertasAbiertas}</Badge>
              <Badge bg="secondary">Cerradas: {puertasCerradas}</Badge>
            </div>

            {habitaciones.length === 0 ? (
              <Card className="shadow-sm">
                <Card.Body>No hay habitaciones registradas.</Card.Body>
              </Card>
            ) : (
              <Row className="g-3">
                {habitaciones.map((habitacion) => {
                  const estadoActual = estadosPuertas[habitacion.id] || "cerrada";
                  const esAbierta = estadoActual === "abierta";
                  const pisoTexto =
                    habitacion.piso === undefined || habitacion.piso === null || habitacion.piso === ""
                      ? "No asignado"
                      : typeof habitacion.piso === "number"
                      ? `Piso ${habitacion.piso}`
                      : habitacion.piso;
                  return (
                    <Col key={habitacion.id} xs={12} sm={6} lg={4}>
                      <Card
                        className={`shadow-sm h-100 border-${esAbierta ? "success" : "secondary"}`}
                      >
                        <Card.Body className="d-flex flex-column gap-3">
                          <div>
                            <div className="fw-bold">{habitacion.nombre}</div>
                            <div className="text-muted small">Piso: {pisoTexto}</div>
                            <div>
                              Estado:{" "}
                              <strong className={esAbierta ? "text-success" : "text-secondary"}>
                                {esAbierta ? "Abierta" : "Cerrada"}
                              </strong>
                            </div>
                          </div>
                          <div className="d-flex gap-2 mt-auto">
                            <Button
                              variant="success"
                              onClick={() => cambiarEstadoPuerta(habitacion, "abierta")}
                              disabled={esAbierta}
                            >
                              Abrir
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={() => cambiarEstadoPuerta(habitacion, "cerrada")}
                              disabled={!esAbierta}
                            >
                              Cerrar
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            )}
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

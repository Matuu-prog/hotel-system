import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Button, Row, Col, Modal, Carousel, Alert } from "react-bootstrap";
import NavbarUsuario from "../components/NavBarUsuario";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./Habitaciones.css";
import { ensureHabitaciones } from "../utils/habitaciones";

function Habitaciones() {
  const [habitaciones, setHabitaciones] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [range, setRange] = useState([null, null]); // [startDate, endDate]

  const navigate = useNavigate();

  // Cargar/sembrar habitaciones
  useEffect(() => {
   const disponibles = ensureHabitaciones();
    setHabitaciones(disponibles);
  }, []);

  // Abrir modal con la room seleccionada
  const handleReservar = (habitacion) => {
    setSelectedRoom(habitacion);
    setRange([null, null]);
    setShowModal(true);
  };

  // Helper: formato YYYY-MM-DD
  const toYMD = (d) => {
    const dt = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    return dt.toISOString().split("T")[0];
  };

  // Deshabilita días ya reservados
  const tileDisabled = ({ date }) => {
    if (!selectedRoom?.reservedDates) return false;
    const ymd = toYMD(date);
    return selectedRoom.reservedDates.includes(ymd);
  };

  // ✅ Acá está el handleConfirmarReserva que pedías
  const handleConfirmarReserva = () => {
    const [start, end] = range || [];
    if (!selectedRoom || !start || !end) return;

    // Navega directo a Datos del Cliente con roomId + rango
    navigate("/datos-cliente", {
      state: {
        roomId: selectedRoom.id,
        startDate: toYMD(start),
        endDate: toYMD(end),
      },
    });

    setShowModal(false);
    setSelectedRoom(null);
    setRange([null, null]);
  };

  const precioSeleccionado = useMemo(
    () => Number(selectedRoom?.precio ?? selectedRoom?.tarifa ?? 0),
    [selectedRoom]
  );

  const nochesSeleccionadas = useMemo(() => {
    const [start, end] = range || [];
    if (!start || !end) return 0;
    const ms = Math.max(0, end.getTime() - start.getTime());
    const diff = Math.round(ms / (1000 * 60 * 60 * 24));
    return Math.max(1, diff || 0);
  }, [range]);

  const subtotalSeleccionado = precioSeleccionado * nochesSeleccionadas;

  return (
    <>
      <NavbarUsuario />

      <Container className="mt-5 rooms-section">
        <h2 className="mb-4 rooms-title">Habitaciones Disponibles</h2>
        <Row className="gy-4">
          {habitaciones.map((hab) => (
            <Col key={hab.id} xs={12}>
              <Card className="shadow-sm room-card">
                <Row className="g-0 align-items-stretch">
                  {/* Carrusel lateral con el mismo look & feel que Servicios */}
                  <Col md={4} className="room-carousel-wrapper">
                    <Carousel
                      indicators={hab.imagenes.length > 1}
                      controls={hab.imagenes.length > 1}
                      interval={null}
                      fade
                      className="room-carousel"
                    >
                      {hab.imagenes.map((img, idx) => (
                        <Carousel.Item key={idx}>
                          <div className="room-image-wrapper">
                            <img
                              src={img}
                              className="d-block w-100 room-image"
                              alt={`Habitación ${hab.nombre} imagen ${idx + 1}`}
                            />
                          </div>
                        </Carousel.Item>
                      ))}
                    </Carousel>
                  </Col>

                  {/* Descripción + botón */}
                  <Col md={8} className="d-flex">
                    <Card.Body className="d-flex flex-column justify-content-center room-info">
                        <Card.Title>{hab.nombre}</Card.Title>
                        <Card.Text>{hab.descripcion}</Card.Text>
                        <Card.Text className="fw-semibold">
                          ${Number(hab.precio ?? hab.tarifa ?? 0).toLocaleString("es-AR")} por noche
                        </Card.Text>
                        <Card.Text className="room-extra">
                          <em>Seleccioná fechas para ver disponibilidad y tarifas.</em>
                        </Card.Text>
                        <div className="mt-3">
                          <Button variant="primary" onClick={() => handleReservar(hab)}>
                          Reservar
                        </Button>
                      </div>
                  </Card.Body>
                  </Col>
                </Row>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Modal de selección de fechas */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Reservar {selectedRoom ? selectedRoom.nombre : ""}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedRoom && (
            <>
              <p>
                Seleccioná el rango de fechas. Tarifa: ${precioSeleccionado.toLocaleString("es-AR")} por noche.
              </p>
              <Calendar
                selectRange
                onChange={setRange}
                value={range}
                tileDisabled={tileDisabled}
                minDate={new Date()}
              />
              <small className="text-muted">Las fechas bloqueadas ya están reservadas.</small>
            {nochesSeleccionadas > 0 && (
                <Alert variant="light" className="mt-3 border">
                  <div className="mb-1">
                    <strong>Noches:</strong> {nochesSeleccionadas}
                  </div>
                  <div>
                    <strong>Subtotal estimado:</strong> ${subtotalSeleccionado.toLocaleString("es-AR")}
                  </div>
                </Alert>
              )}
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleConfirmarReserva}>
            Confirmar reserva
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Habitaciones;

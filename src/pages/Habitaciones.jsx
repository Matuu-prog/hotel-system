import { useState, useEffect } from "react";
import { Container, Card, Button, Row, Col, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import NavbarUsuario from "../components/NavBarUsuario";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

function Habitaciones() {
  const [habitaciones, setHabitaciones] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [range, setRange] = useState([null, null]); // [startDate, endDate]

  const navigate = useNavigate();

  // Cargar/sembrar habitaciones
  useEffect(() => {
    const saved = localStorage.getItem("habitaciones");
    if (saved) {
      setHabitaciones(JSON.parse(saved));
    } else {
      const iniciales = [
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
      localStorage.setItem("habitaciones", JSON.stringify(iniciales));
      setHabitaciones(iniciales);
    }
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

  return (
    <>
      <NavbarUsuario />

      <Container className="mt-4">
        <h2 className="text-center mb-4">Habitaciones Disponibles</h2>

        {habitaciones.map((hab) => (
          <Card className="mb-4 shadow-sm" key={hab.id}>
            <Row className="g-0">
              {/* Carrusel lateral simple con Bootstrap */}
              <Col md={4}>
                <div id={`carousel-${hab.id}`} className="carousel slide" data-bs-ride="carousel">
                  <div className="carousel-inner">
                    {hab.imagenes.map((img, idx) => (
                      <div className={`carousel-item ${idx === 0 ? "active" : ""}`} key={idx}>
                        <img src={img} className="d-block w-100" alt={`Habitación ${hab.id}`} />
                      </div>
                    ))}
                  </div>
                  <button className="carousel-control-prev" type="button" data-bs-target={`#carousel-${hab.id}`} data-bs-slide="prev">
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                  </button>
                  <button className="carousel-control-next" type="button" data-bs-target={`#carousel-${hab.id}`} data-bs-slide="next">
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                  </button>
                </div>
              </Col>

              {/* Descripción + botón */}
              <Col md={8} className="p-3">
                <Card.Body>
                  <Card.Title>{hab.nombre}</Card.Title>
                  <Card.Text>{hab.descripcion}</Card.Text>
                  <Card.Text>
                    <em>Información de reserva pendiente de diseño...</em>
                  </Card.Text>
                  <Button variant="primary" onClick={() => handleReservar(hab)}>
                    Reservar
                  </Button>
                </Card.Body>
              </Col>
            </Row>
          </Card>
        ))}
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
              <p>Seleccioná el rango de fechas:</p>
              <Calendar
                selectRange
                onChange={setRange}
                value={range}
                tileDisabled={tileDisabled}
                minDate={new Date()}
              />
              <small className="text-muted">Las fechas bloqueadas ya están reservadas.</small>
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

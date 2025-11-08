import { useState, useEffect } from "react";
import { Container, Card, Button, Row, Col, Modal } from "react-bootstrap";
import NavbarUsuario from "../components/NavbarUsuario";
import DatePicker from "react-datepicker";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "react-datepicker/dist/react-datepicker.css";

function Habitaciones() {
  // Estado global de habitaciones (simula base de datos)
  const [habitaciones, setHabitaciones] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);
  const [range, setRange] = useState([null, null]); // Estado para rango de fechas
  

  // 🔹 Cargar habitaciones desde localStorage o crear iniciales
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
          reservedDates: []
        },
        {
          id: 2,
          nombre: "Habitación Familiar",
          descripcion: "2 camas Queen, ideal para 4 personas, balcón privado.",
          imagenes: ["/img/hab2a.jpg", "/img/hab2b.jpg", "/img/hab2c.jpg"],
          reservedDates: []
        },
        {
          id: 3,
          nombre: "Suite Ejecutiva",
          descripcion: "Suite con escritorio, minibar, jacuzzi y servicio premium.",
          imagenes: ["/img/hab3a.jpg", "/img/hab3b.jpg", "/img/hab3c.jpg"],
          reservedDates: []
        },
      ];
      localStorage.setItem("habitaciones", JSON.stringify(iniciales));
      setHabitaciones(iniciales);
    }
  }, []);

  // 🔹 Guardar en LocalStorage cada vez que cambia
  useEffect(() => {
    if (habitaciones.length > 0) {
      localStorage.setItem("habitaciones", JSON.stringify(habitaciones));
    }
  }, [habitaciones]);

  // 🔹 Abrir modal con calendario
  const handleReservar = (habitacion) => {
    setSelectedRoom(habitacion);
    setRange([null, null]); 
    setShowModal(true);
  };

  // 🔹 Confirmar reserva → guarda fechas en localStorage
 const handleConfirmarReserva = (startDate, endDate) => {
  if (!startDate || !endDate) {
    alert("Seleccioná un rango válido de fechas");
    return;
  }

  // Generar todas las fechas del rango seleccionado
  const dateArray = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    dateArray.push(currentDate.toISOString().split("T")[0]);
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Actualizar la habitación correspondiente
  const updatedRooms = habitaciones.map((hab) => {
    if (hab.id === selectedRoom.id) {
      return {
        ...hab,
        reservedDates: [
          ...(hab.reservedDates || []),
          ...dateArray.filter(
            (date) => !(hab.reservedDates || []).includes(date)
          ), // evita duplicados
        ],
      };
    }
    return hab;
  });

  // Guardar en estado y localStorage
  setHabitaciones(updatedRooms);
  localStorage.setItem("habitaciones", JSON.stringify(updatedRooms));

  setShowModal(false);
  setRange([null, null]);
  alert(
    `Reserva confirmada para ${selectedRoom.nombre} del ${dateArray[0]} al ${
      dateArray[dateArray.length - 1]
    }`
  );
};

  // 🔹 Deshabilitar fechas ya reservadas
  const isDateReserved = (date) => {
    if (!selectedRoom) return false;
    const fechas = selectedRoom.reservedDates.map((d) => new Date(d).toDateString());
    return fechas.includes(date.toDateString());
  };

  return (
    <>
    <NavbarUsuario />
    <Container className="mt-4">
      <h2 className="text-center mb-4">Habitaciones Disponibles</h2>
      {habitaciones.map((hab) => (
        <Card className="mb-4 shadow-sm" key={hab.id}>
          <Row className="g-0">
            {/* Carrusel lateral */}
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

      {/* Modal con calendario */}
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
        tileDisabled={({ date }) =>
          selectedRoom.reservedDates?.includes(
            date.toISOString().split("T")[0]
          )
        }
      />
    </>
  )}
</Modal.Body>

  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowModal(false)}>
      Cancelar
    </Button>
    <Button
      variant="primary"
      onClick={() => handleConfirmarReserva(range?.[0], range?.[1])}
    >
      Confirmar reserva
    </Button>
  </Modal.Footer>
</Modal>
    </Container>
    </>
  );
}

export default Habitaciones;
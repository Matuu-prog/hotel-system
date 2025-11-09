import NavbarUsuario from "../components/NavBarUsuario";
import { useState, useEffect } from "react";
import { Container, Table, Button, Modal } from "react-bootstrap";

function Operador() {
  const [habitaciones, setHabitaciones] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // 🔹 Cargar datos desde localStorage
  useEffect(() => {
    const data = localStorage.getItem("habitaciones");
    if (data) setHabitaciones(JSON.parse(data));
  }, []);

  // 🔹 Guardar cambios en localStorage
  const updateLocalStorage = (updatedRooms) => {
    setHabitaciones(updatedRooms);
    localStorage.setItem("habitaciones", JSON.stringify(updatedRooms));
  };

  // 🔹 Cancelar reserva completa
  const handleCancelarReserva = (habitacion) => {
    const confirm = window.confirm(
      `¿Desea cancelar todas las reservas de ${habitacion.nombre}?`
    );
    if (!confirm) return;

    const updatedRooms = habitaciones.map((hab) =>
      hab.id === habitacion.id ? { ...hab, reservedDates: [] } : hab
    );
    updateLocalStorage(updatedRooms);
  };

  // 🔹 Ver fechas reservadas
  const handleVerReservas = (habitacion) => {
    setSelectedRoom(habitacion);
    setShowModal(true);
  };

  // 🔹 Cancelar fecha individual
  const handleCancelarFecha = (fecha) => {
    const updatedRooms = habitaciones.map((hab) => {
      if (hab.id === selectedRoom.id) {
        return {
          ...hab,
          reservedDates: hab.reservedDates.filter((d) => d !== fecha),
        };
      }
      return hab;
    });

    updateLocalStorage(updatedRooms);

    // Actualizar modal en tiempo real
    const updatedRoom = {
      ...selectedRoom,
      reservedDates: selectedRoom.reservedDates.filter((d) => d !== fecha),
    };
    setSelectedRoom(updatedRoom);
  };

  // 🔹 Solo mostrar habitaciones con reservas
  const habitacionesConReservas = habitaciones.filter(
    (hab) => hab.reservedDates && hab.reservedDates.length > 0
  );

  return (
    <>
    <NavbarUsuario/>
    <Container className="mt-4">
      <h2 className="text-center mb-4">Panel del Operador</h2>
      {habitacionesConReservas.length === 0 ? (
        <p className="text-center">No hay reservas activas actualmente.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Habitación</th>
              <th>Fechas reservadas</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {habitacionesConReservas.map((hab) => (
              <tr key={hab.id}>
                <td>{hab.id}</td>
                <td>{hab.nombre}</td>
                <td>{hab.reservedDates.join(", ")}</td>
                <td>
                  <Button
                    variant="info"
                    size="sm"
                    className="me-2"
                    onClick={() => handleVerReservas(hab)}
                  >
                    Ver detalles
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleCancelarReserva(hab)}
                  >
                    Cancelar reserva
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal con fechas individuales */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reservas de {selectedRoom?.nombre}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRoom?.reservedDates?.length > 0 ? (
            selectedRoom.reservedDates.map((fecha, idx) => (
              <div
                key={idx}
                className="d-flex justify-content-between align-items-center mb-2"
              >
                <span>{fecha}</span>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleCancelarFecha(fecha)}
                >
                  Cancelar fecha
                </Button>
              </div>
            ))
          ) : (
            <p>No hay fechas reservadas.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
    </>
  );
}

export default Operador;
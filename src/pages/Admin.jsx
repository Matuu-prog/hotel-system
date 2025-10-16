import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";

function Admin() {
  return (
    <Container className="mt-5">
      <Link to="/" className="btn btn-outline-secondary mb-3">
        ← Volver al HUB
      </Link>
      <h2>⚙️ Panel del Administrador</h2>
      <p>Se gestionarán habitaciones y operadores (CRUD).</p>
    </Container>
  );
}

export default Admin;
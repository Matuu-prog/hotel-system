import { useNavigate } from "react-router-dom";
import { Container, Button } from "react-bootstrap";

function Admin() {
  const navigate = useNavigate();

  return (
    <Container className="text-center mt-5">
      <h2>Panel del Administrador</h2>
      <p>Desde aquí podés registrar nuevos operadores o gestionar el sistema.</p>

      <div className="d-flex justify-content-center gap-3 mt-4">
        <Button variant="success" onClick={() => navigate("/registrar-operador")}>
          Registrar nuevo operador
        </Button>

        <Button variant="secondary" onClick={() => navigate("/operador-login")}>
          Ir al login de operador
        </Button>
      </div>
    </Container>
  );
}

export default Admin;
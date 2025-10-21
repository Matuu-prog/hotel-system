import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Card } from "react-bootstrap";

function OperadorLogin() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    const operadores = JSON.parse(localStorage.getItem("operadores")) || [];
    const operadorEncontrado = operadores.find(
      (op) => op.usuario === usuario && op.password === password
    );

    if (operadorEncontrado) {
      localStorage.setItem("operadorActivo", JSON.stringify(operadorEncontrado));
      alert(`Bienvenido ${operadorEncontrado.nombre}`);
      navigate("/operador");
    } else {
      alert("Usuario o contraseña incorrectos");
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card style={{ width: "25rem" }} className="shadow p-4">
        <Card.Body>
          <h3 className="text-center mb-4">Login Operador</h3>
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3">
              <Form.Label>Usuario</Form.Label>
              <Form.Control
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Ingresa tu usuario"
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                required
              />
            </Form.Group>

            <Button type="submit" variant="primary" className="w-100">
              Iniciar sesión
            </Button>

            <Button
              variant="link"
              className="mt-3 w-100"
              onClick={() => navigate("/admin")}
            >
              Ir al panel de administrador
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default OperadorLogin;
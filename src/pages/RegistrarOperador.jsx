import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Card } from "react-bootstrap";

function RegistrarOperador() {
  const [nombre, setNombre] = useState("");
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegistrar = (e) => {
    e.preventDefault();

    const operadores = JSON.parse(localStorage.getItem("operadores")) || [];
    const existe = operadores.find((op) => op.usuario === usuario);

    if (existe) {
      alert("Ese usuario ya existe");
      return;
    }

    const nuevoOperador = {
      id: Date.now(),
      nombre,
      usuario,
      password,
    };

    operadores.push(nuevoOperador);
    localStorage.setItem("operadores", JSON.stringify(operadores));

    alert(`Operador ${nombre} registrado con éxito`);
    navigate("/admin");
  };

  return (
    <Container className="d-flex justify-content-center align-items-center vh-100">
      <Card style={{ width: "25rem" }} className="shadow p-4">
        <Card.Body>
          <h3 className="text-center mb-4">Registrar Operador</h3>
          <Form onSubmit={handleRegistrar}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre completo</Form.Label>
              <Form.Control
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Usuario</Form.Label>
              <Form.Control
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Button type="submit" variant="success" className="w-100">
              Registrar operador
            </Button>

            <Button
              variant="link"
              className="mt-3 w-100"
              onClick={() => navigate("/admin")}
            >
              Volver
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default RegistrarOperador;
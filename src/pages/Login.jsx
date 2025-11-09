import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Card, Container } from "react-bootstrap";
import NavbarUsuario from "../components/NavBarUsuario";

function Login() {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

const handleLogin = (e) => {
  e.preventDefault();

  const usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];
  // OJO: el usuario es sensible a mayús/minús. Debe ser "Mateo"
  const user = usuarios.find(
    (u) => u.usuario === usuario && u.password === password
  );

  if (!user) {
    alert("Usuario o contraseña incorrectos");
    return;
  }

  localStorage.setItem("usuarioActual", JSON.stringify(user));

  if (user.rol === "superadmin" || user.rol === "admin") {
    navigate("/admin");
  } else if (user.rol === "operador") {
    navigate("/operador");
  } else {
    navigate("/");
  }
};

  return (
    <>
      <NavbarUsuario />
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Card style={{ width: "25rem" }} className="shadow p-4">
          <Card.Body>
            <h3 className="text-center mb-4">Iniciar sesión</h3>
            <Form onSubmit={handleLogin}>
              <Form.Group className="mb-3">
                <Form.Label>Usuario</Form.Label>
                <Form.Control
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="Ingrese su usuario"
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Contraseña</Form.Label>
                <Form.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese su contraseña"
                  required
                />
              </Form.Group>

              <Button type="submit" variant="primary" className="w-100">
                Iniciar sesión
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </>
  );
}

export default Login;
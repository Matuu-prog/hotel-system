import { useState, useEffect } from "react";
import { Container, Table, Button, Form, Row, Col } from "react-bootstrap";
import NavbarUsuario from "../components/NavbarUsuario";

function Admin() {
  const [usuarios, setUsuarios] = useState([]);
  const [nombre, setNombre] = useState("");
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const usuarioActual = JSON.parse(localStorage.getItem("usuarioActual"));

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("usuarios")) || [];
    setUsuarios(data);
  }, []);

  const guardarUsuarios = (lista) => {
    setUsuarios(lista);
    localStorage.setItem("usuarios", JSON.stringify(lista));
  };

  const handleCrearOperador = (e) => {
    e.preventDefault();

    const nuevo = {
      id: Date.now(),
      nombre,
      usuario,
      password,
      rol: "operador",
    };

    const listaActualizada = [...usuarios, nuevo];
    guardarUsuarios(listaActualizada);

    setNombre("");
    setUsuario("");
    setPassword("");
  };

  const handleEliminar = (id) => {
    const target = usuarios.find((u) => u.id === id);

    // Solo el superadmin puede eliminar admins
    if (target.rol === "admin" && usuarioActual.rol !== "superadmin") {
      alert("Solo el SuperAdmin puede eliminar administradores.");
      return;
    }

    const listaActualizada = usuarios.filter((u) => u.id !== id);
    guardarUsuarios(listaActualizada);
  };

  const handlePromover = (id) => {
    const target = usuarios.find((u) => u.id === id);

    // Solo el superadmin puede promover a admin
    if (usuarioActual.rol !== "superadmin") {
      alert("Solo el SuperAdmin puede hacer administradores.");
      return;
    }

    const listaActualizada = usuarios.map((u) =>
      u.id === id ? { ...u, rol: "admin" } : u
    );
    guardarUsuarios(listaActualizada);
  };

  const handleDegradar = (id) => {
    const target = usuarios.find((u) => u.id === id);

    // Solo el superadmin puede degradar administradores
    if (target.rol === "admin" && usuarioActual.rol !== "superadmin") {
      alert("Solo el SuperAdmin puede degradar administradores.");
      return;
    }

    const listaActualizada = usuarios.map((u) =>
      u.id === id ? { ...u, rol: "operador" } : u
    );
    guardarUsuarios(listaActualizada);
  };

  return (
    <>
      <NavbarUsuario />
      <Container className="mt-5">
        <h2 className="mb-4">Panel del Administrador</h2>

        {/* Crear nuevo operador */}
        <Form onSubmit={handleCrearOperador} className="mb-4">
          <Row>
            <Col>
              <Form.Control
                placeholder="Nombre completo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </Col>
            <Col>
              <Form.Control
                placeholder="Usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                required
              />
            </Col>
            <Col>
              <Form.Control
                placeholder="Contraseña"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Col>
            <Col>
              <Button type="submit" variant="success">
                Crear operador
              </Button>
            </Col>
          </Row>
        </Form>

        {/* Lista de usuarios */}
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id}>
                <td>{u.nombre}</td>
                <td>{u.usuario}</td>
                <td>{u.rol}</td>
                <td>
                  {u.rol !== "superadmin" && (
                    <>
                      {u.rol === "operador" && (
                        <Button
                          variant="warning"
                          size="sm"
                          onClick={() => handlePromover(u.id)}
                          className="me-2"
                        >
                          Hacer admin
                        </Button>
                      )}
                      {u.rol === "admin" && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDegradar(u.id)}
                          className="me-2"
                        >
                          Hacer operador
                        </Button>
                      )}
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleEliminar(u.id)}
                      >
                        Eliminar
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Container>
    </>
  );
}

export default Admin;
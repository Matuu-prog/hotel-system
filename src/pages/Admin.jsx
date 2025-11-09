import { useEffect, useMemo, useState } from "react";
import { Container, Table, Button, Form, Row, Col, Alert, Badge } from "react-bootstrap";
import NavBarUsuario from "../components/NavBarUsuario";

// Helpers seguros para leer/escribir localStorage
const safeParse = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(fallback) && !Array.isArray(parsed) ? fallback : (parsed ?? fallback);
  } catch {
    return fallback;
  }
};

const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));

export default function Admin() {
  const [usuarios, setUsuarios] = useState(() => safeParse("usuarios", []));
  const [nombre, setNombre] = useState("");
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState({ type: "", text: "" });

  // usuarioActual: puede ser admin o superadmin
  const usuarioActual = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("usuarioActual")) || null;
    } catch {
      return null;
    }
  }, []);

  const isSuperAdmin = usuarioActual?.rol === "superadmin";
  const isAdmin = isSuperAdmin || usuarioActual?.rol === "admin";

  // Si por algún motivo usuarios cambió en otra pestaña, sincronizamos
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "usuarios") {
        setUsuarios(safeParse("usuarios", []));
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const guardarUsuarios = (lista) => {
    setUsuarios(lista);
    save("usuarios", lista);
  };

  // 🔐 Bloqueo básico: si no es admin/superadmin, mostramos aviso (RutaPrivada igual protege)
  if (!isAdmin) {
    return (
      <>
        <NavBarUsuario />
        <Container className="mt-5">
          <Alert variant="warning">
            Acceso restringido. Iniciá sesión como administrador para ver esta sección.
          </Alert>
        </Container>
      </>
    );
  }

  // 👤 Crear operador
  const handleCrearOperador = (e) => {
    e.preventDefault();
    setMsg({ type: "", text: "" });

    if (!nombre.trim() || !usuario.trim() || !password.trim()) {
      setMsg({ type: "danger", text: "Completá todos los campos." });
      return;
    }

    const yaExiste = usuarios.some((u) => u.usuario === usuario);
    if (yaExiste) {
      setMsg({ type: "danger", text: "Ese nombre de usuario ya existe." });
      return;
    }

    const nuevo = {
      id: Date.now(),
      nombre: nombre.trim(),
      usuario: usuario.trim(),
      password: password, // en real iría hasheado
      rol: "operador",
    };

    const lista = [...usuarios, nuevo];
    guardarUsuarios(lista);
    setNombre("");
    setUsuario("");
    setPassword("");
    setMsg({ type: "success", text: `Operador "${nuevo.nombre}" creado.` });
  };

  // 🗑️ Eliminar usuario (reglas: solo superadmin puede eliminar admins; nadie borra al usuario logueado)
  const handleEliminar = (id) => {
    const target = usuarios.find((u) => u.id === id);
    if (!target) return;

    if (target.id === usuarioActual?.id) {
      setMsg({ type: "danger", text: "No podés eliminar tu propio usuario." });
      return;
    }

    if (target.rol === "superadmin") {
      setMsg({ type: "danger", text: "No se puede eliminar al SuperAdmin." });
      return;
    }

    if (target.rol === "admin" && !isSuperAdmin) {
      setMsg({ type: "danger", text: "Solo el SuperAdmin puede eliminar administradores." });
      return;
    }

    const lista = usuarios.filter((u) => u.id !== id);
    guardarUsuarios(lista);
    setMsg({ type: "success", text: `Usuario "${target.nombre}" eliminado.` });
  };

  // ⬆️ Promover a admin (solo superadmin)
  const handlePromover = (id) => {
    if (!isSuperAdmin) {
      setMsg({ type: "danger", text: "Solo el SuperAdmin puede promover a administrador." });
      return;
    }
    const target = usuarios.find((u) => u.id === id);
    if (!target) return;

    if (target.rol === "admin" || target.rol === "superadmin") {
      setMsg({ type: "info", text: "Ese usuario ya es administrador (o superadmin)." });
      return;
    }

    const lista = usuarios.map((u) => (u.id === id ? { ...u, rol: "admin" } : u));
    guardarUsuarios(lista);
    setMsg({ type: "success", text: `Usuario "${target.nombre}" ahora es administrador.` });
  };

  // ⬇️ Degradar a operador (solo superadmin; no se puede degradar superadmin)
  const handleDegradar = (id) => {
    if (!isSuperAdmin) {
      setMsg({ type: "danger", text: "Solo el SuperAdmin puede degradar administradores." });
      return;
    }
    const target = usuarios.find((u) => u.id === id);
    if (!target) return;

    if (target.rol === "superadmin") {
      setMsg({ type: "danger", text: "No se puede degradar al SuperAdmin." });
      return;
    }

    const lista = usuarios.map((u) => (u.id === id ? { ...u, rol: "operador" } : u));
    guardarUsuarios(lista);
    setMsg({ type: "success", text: `Usuario "${target.nombre}" ahora es operador.` });
  };

  return (
    <>
      <NavBarUsuario />

      <Container className="mt-5">
        <h2 className="mb-3">
          Panel del Administrador{" "}
          {isSuperAdmin && <Badge bg="warning" text="dark">SuperAdmin</Badge>}
        </h2>

        {msg.text && (
          <Alert variant={msg.type} onClose={() => setMsg({ type: "", text: "" })} dismissible>
            {msg.text}
          </Alert>
        )}

        {/* Crear nuevo operador */}
        <Form onSubmit={handleCrearOperador} className="mb-4">
          <Row className="g-2">
            <Col md={3}>
              <Form.Control
                placeholder="Nombre completo"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Form.Control
                placeholder="Usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Form.Control
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Col>
            <Col md={3} className="d-grid">
              <Button type="submit" variant="success">Crear operador</Button>
            </Col>
          </Row>
        </Form>

        {/* Lista de usuarios */}
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Usuario</th>
              <th>Rol</th>
              <th style={{ minWidth: 260 }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(usuarios || []).map((u) => (
              <tr key={u.id}>
                <td>{u.nombre}</td>
                <td>{u.usuario}</td>
                <td>
                  {u.rol === "superadmin" ? (
                    <Badge bg="warning" text="dark">SuperAdmin</Badge>
                  ) : u.rol === "admin" ? (
                    <Badge bg="primary">Admin</Badge>
                  ) : (
                    <Badge bg="secondary">Operador</Badge>
                  )}
                </td>
                <td className="d-flex flex-wrap gap-2">
                  {u.rol !== "superadmin" && (
                    <>
                      {u.rol === "operador" && (
                        <Button
                          size="sm"
                          variant="warning"
                          onClick={() => handlePromover(u.id)}
                        >
                          Hacer admin
                        </Button>
                      )}
                      {u.rol === "admin" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDegradar(u.id)}
                        >
                          Hacer operador
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleEliminar(u.id)}
                        disabled={u.id === usuarioActual?.id}
                        title={u.id === usuarioActual?.id ? "No podés eliminarte a vos mismo" : ""}
                      >
                        Eliminar
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center">No hay usuarios aún.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Container>
    </>
  );
}
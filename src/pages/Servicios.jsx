import NavbarUsuario from "../components/NavBarUsuario";
import { Container, Row, Col, Card } from "react-bootstrap";

const servicios = [
  { titulo: "Restaurante", desc: "Cocina internacional y local.", emoji: "🍽️" },
  { titulo: "Piscina", desc: "Climatizada y al aire libre.", emoji: "🏊" },
  { titulo: "Spa & Wellness", desc: "Masajes, sauna y relax.", emoji: "💆" },
  { titulo: "Golf", desc: "Campo privado 18 hoyos.", emoji: "⛳" },
  { titulo: "Room Service", desc: "24/7 para tu comodidad.", emoji: "🛎️" },
  { titulo: "Traslados", desc: "Aeropuerto ↔ Hotel.", emoji: "🚐" },
];

export default function Servicios() {
  return (
    <>
      <NavbarUsuario />
      <Container className="mt-5">
        <h2 className="mb-4">Nuestros Servicios</h2>
        <Row>
          {servicios.map((s, i) => (
            <Col md={4} className="mb-4" key={i}>
              <Card className="shadow-sm h-100">
                <Card.Body>
                  <Card.Title>{s.emoji} {s.titulo}</Card.Title>
                  <Card.Text>{s.desc}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
}

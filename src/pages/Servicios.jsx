import NavbarUsuario from "../components/NavBarUsuario";
import { Container, Row, Col, Card } from "react-bootstrap";
import "./Servicios.css";

const servicios = [
  {
    titulo: "Restaurante",
    desc: "Sabores internacionales, maridajes de autor y un ambiente acogedor.",
    emoji: "🍽️",
    imagen:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
  },
  {
    titulo: "Piscina",
    desc: "Piscina climatizada con solárium y vistas panorámicas del hotel.",
    emoji: "🏊",
    imagen:
      "https://images.unsplash.com/photo-1575429198097-0414ec08e8cd?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
  },
  {
    titulo: "Spa & Wellness",
    desc: "Masajes relajantes, sauna seca y circuito de aguas revitalizante.",
    emoji: "💆",
    imagen:
      "https://images.unsplash.com/photo-1583416750470-965b2707b355?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
  },
  {
    titulo: "Golf",
    desc: "Campo privado de 18 hoyos rodeado de un paisaje natural único.",
    emoji: "⛳",
    imagen:
      "https://images.unsplash.com/photo-1632946269126-0f8edbe8b068?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1131",
  },
  {
    titulo: "Room Service",
    desc: "Atención personalizada las 24 horas para lo que necesites.",
    emoji: "🛎️",
    imagen:
      "https://images.unsplash.com/photo-1529169436040-836f3d93f0f8?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
  },
  {
    titulo: "Traslados",
    desc: "Servicio de chofer privado aeropuerto ↔ hotel, disponible a toda hora.",
    emoji: "🚐",
    imagen:
      "https://images.unsplash.com/photo-1676107773690-9d670f8b1afa?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170",
  },
];

export default function Servicios() {
  return (
    <>
      <NavbarUsuario />
      <Container className="mt-5 service-section">
        <h2 className="mb-4 section-title">Nuestros Servicios</h2>
        <Row className="gy-4">
          {servicios.map((s, i) => (
            <Col key={i} xs={12}>
              <Card className="shadow-sm service-card">
                <Row className="g-0 align-items-stretch">
                  <Col md={4} className="service-image-wrapper">
                    <div
                      className="service-image"
                      role="img"
                      aria-label={`${s.titulo}`}
                      style={{ backgroundImage: `url(${s.imagen})` }}
                    ></div>
                  </Col>
                  <Col md={8} className="d-flex">
                    <Card.Body className="d-flex flex-column justify-content-center">
                      <Card.Title>
                        <span className="service-emoji" aria-hidden="true">
                          {s.emoji}
                        </span>{" "}
                        {s.titulo}
                      </Card.Title>
                      <Card.Text>{s.desc}</Card.Text>
                    </Card.Body>
                  </Col>
                </Row>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
}


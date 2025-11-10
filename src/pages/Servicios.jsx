import NavbarUsuario from "../components/NavBarUsuario";
import { Container, Row, Col, Card } from "react-bootstrap";
import "./Servicios.css";

const servicios = [
  {
    titulo: "Restaurante",
    desc: "Sabores internacionales, maridajes de autor y un ambiente acogedor.",
    emoji: "🍽️",
    imagen:
      "https://images.unsplash.com/photo-1555992336-cbfddb8e6f83?auto=format&fit=crop&w=900&q=80",
  },
  {
    titulo: "Piscina",
    desc: "Piscina climatizada con solárium y vistas panorámicas del hotel.",
    emoji: "🏊",
    imagen:
      "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80",
  },
  {
    titulo: "Spa & Wellness",
    desc: "Masajes relajantes, sauna seca y circuito de aguas revitalizante.",
    emoji: "💆",
    imagen:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80",
  },
  {
    titulo: "Golf",
    desc: "Campo privado de 18 hoyos rodeado de un paisaje natural único.",
    emoji: "⛳",
    imagen:
      "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=900&q=80",
  },
  {
    titulo: "Room Service",
    desc: "Atención personalizada las 24 horas para lo que necesites.",
    emoji: "🛎️",
    imagen:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=900&q=80",
  },
  {
    titulo: "Traslados",
    desc: "Servicio de chofer privado aeropuerto ↔ hotel, disponible a toda hora.",
    emoji: "🚐",
    imagen:
      "https://images.unsplash.com/photo-1521737604893-ff0b6f92b6f6?auto=format&fit=crop&w=900&q=80",
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


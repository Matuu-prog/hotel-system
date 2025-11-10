// CarouselHotel.jsx
// Muestra imágenes destacadas del hotel con una breve descripción visual.

import { Carousel } from "react-bootstrap";

function CarouselHotel() {
  return (
    <Carousel fade interval={3000}>
      <Carousel.Item>
        <img
          className="d-block w-100"
          src="https://images.unsplash.com/photo-1590447158019-883d8d5f8bc7?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1332"
          alt="Hotel exterior"
          height="450"
          style={{ objectFit: "cover" }}
        />
        <Carousel.Caption>
          <h3>Bienvenido a Hotel Paradise</h3>
          <p>Confort, elegancia y vistas inigualables.</p>
        </Carousel.Caption>
      </Carousel.Item>

      <Carousel.Item>
        <img
          className="d-block w-100"
          src="https://images.unsplash.com/photo-1506059612708-99d6c258160e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1169"
          alt="Habitaciones modernas"
          height="450"
          style={{ objectFit: "cover" }}
        />
        <Carousel.Caption>
          <h3>Habitaciones modernas</h3>
          <p>Diseñadas para tu descanso y comodidad.</p>
        </Carousel.Caption>
      </Carousel.Item>

      <Carousel.Item>
        <img
          className="d-block w-100"
          src="https://images.unsplash.com/photo-1495365200479-c4ed1d35e1aa?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1170"
          alt="Piscina y servicios"
          height="450"
          style={{ objectFit: "cover" }}
        />
        <Carousel.Caption>
          <h3>Disfrutá nuestros servicios exclusivos</h3>
          <p>Gastronomía, spa, golf y mucho más.</p>
        </Carousel.Caption>
      </Carousel.Item>
    </Carousel>
  );
}

export default CarouselHotel;
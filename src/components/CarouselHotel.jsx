// CarouselHotel.jsx
// Muestra imágenes destacadas del hotel con una breve descripción visual.

import { Carousel } from "react-bootstrap";

function CarouselHotel() {
  return (
    <Carousel fade interval={3000}>
      <Carousel.Item>
        <img
          className="d-block w-100"
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c"
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
          src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa"
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
          src="https://images.unsplash.com/photo-1501117716987-c8e1ecb21055"
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
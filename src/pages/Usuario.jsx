// Usuario.jsx
// Página principal para el rol "Usuario Comercial".
// Incluye la Navbar superior y el carrusel de imágenes del hotel.

import NavbarUsuario from "../components/NavbarUsuario";
import CarouselHotel from "../components/CarouselHotel";
import { Container } from "react-bootstrap";

function Usuario() {
  return (
    <>
      <NavbarUsuario />
      <CarouselHotel />
      <Container className="mt-4 text-center">
        <h2>Bienvenido a Hotel Paradise 🌴</h2>
        <p>
          Explorá nuestras habitaciones, servicios y hacé tu reserva fácilmente desde nuestra página.
        </p>
      </Container>
    </>
  );
}

export default Usuario;
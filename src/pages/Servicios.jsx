import NavbarUsuario from "../components/NavBarUsuario";
import { Container } from "react-bootstrap";

function Servicios() {
  return (
    <>
      <NavbarUsuario />
      <Container className="mt-5">
        <h2>Nuestros servicios</h2>
        <ul>
          <li>Restaurante gourmet</li>
          <li>Piscina climatizada</li>
          <li>Campo de golf</li>
          <li>Spa & Wellness</li>
          <li>Wi-Fi gratuito</li>
        </ul>
      </Container>
    </>
  );
}

export default Servicios;
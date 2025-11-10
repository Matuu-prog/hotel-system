import { useEffect, useState } from "react";
import { Card, Row, Col, Spinner } from "react-bootstrap";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { WiDaySunny, WiCloudy, WiRain } from "react-icons/wi";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "./InfoExtraHotel.css";

// Ícono del marcador del mapa
const iconHotel = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3179/3179068.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

export default function InfoExtraHotel() {
  const [clima, setClima] = useState(null);
  const [cambio, setCambio] = useState(null);
  const [errorClima, setErrorClima] = useState(false);
  const [errorCambio, setErrorCambio] = useState(false);

  // Coordenadas ficticias del hotel (Salta Capital)
  const ubicacion = { lat: -24.782932, lon: -65.412155 };

  // 🌤️ Obtener clima desde Open-Meteo
  useEffect(() => {
    fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${ubicacion.lat}&longitude=${ubicacion.lon}&current_weather=true`
    )
      .then((res) => res.json())
      .then((data) => {
        const climaActual = data.current_weather;
        if (!climaActual) throw new Error("No hay datos de clima");
        setClima({
          temp: Math.round(climaActual.temperature),
          desc: "Clima actual",
        });
      })
      .catch(() => setErrorClima(true));
  }, []);

  // 💱 Obtener cotización ARS → USD desde Open ER API
  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/ARS")
      .then((res) => res.json())
      .then((data) => {
        if (!data?.rates?.USD) throw new Error("No hay datos de cambio");
        setCambio(data.rates.USD);
      })
      .catch(() => setErrorCambio(true));
  }, []);

  // Selección de ícono climático dinámico
  const iconoClima = clima
    ? clima.temp > 25
      ? <WiDaySunny color="#ffb703" size={64} />
      : clima.temp > 15
      ? <WiCloudy color="#8ecae6" size={64} />
      : <WiRain color="#219ebc" size={64} />
    : null;

  return (
    <div className="my-5">
     <h3 className="info-extra-heading text-center mb-4 fw-semibold">
        Datos que te pueden interesar para una perfecta estadía en Salta, <br />
        en el maravilloso <span className="info-extra-highlight">Hotel Paradise 🏖️</span>
      </h3>

      <Row className="justify-content-center g-4">
        {/* Clima */}
        <Col md={4}>
          <Card className="shadow-sm text-center p-3 border-0 bg-light">
            <h5 className="fw-bold mb-3">☀️ Clima Actual</h5>
            {errorClima ? (
              <p className="text-muted">No se pudo obtener el clima 🌦️</p>
            ) : !clima ? (
              <Spinner animation="border" />
            ) : (
              <>
  <div className="d-flex justify-content-center mb-2">
    {iconoClima}
  </div>
  <h2>{clima.temp}°C</h2>
  <p className="text-capitalize">{clima.desc}</p>
</>
            )}
          </Card>
        </Col>

        {/* Cotización */}
        <Col md={4}>
          <Card className="shadow-sm text-center p-3 border-0 bg-light">
            <h5 className="fw-bold mb-3">💱 Cotización del Dólar</h5>
            {errorCambio ? (
              <p className="text-muted">No se pudo cargar la cotización 💸</p>
            ) : !cambio ? (
              <Spinner animation="border" />
            ) : (
              <>
                <p className="fs-4">
                  <strong>1 USD</strong> ≈ {(1 / cambio).toFixed(2)} ARS
                </p>
                <small className="text-muted">Fuente: open.er-api.com</small>
              </>
            )}
          </Card>
        </Col>

        {/* Mapa */}
        <Col md={8} className="mt-4">
          <Card className="shadow-sm border-0">
            <MapContainer
              center={[ubicacion.lat, ubicacion.lon]}
              zoom={14}
              style={{ height: "300px", borderRadius: "0.75rem" }}
            >
              <TileLayer
                attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[ubicacion.lat, ubicacion.lon]} icon={iconHotel}>
                <Popup>
                  <b>Hotel Paradise</b> <br /> Salta Capital, Argentina
                </Popup>
              </Marker>
            </MapContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
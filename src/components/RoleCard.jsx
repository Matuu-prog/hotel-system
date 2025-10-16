import { Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

/**
 * Tarjeta para representar cada rol en el HUB.
 */
function RoleCard({ title, description, icon, path }) {
  const navigate = useNavigate();

  return (
    <Card
      className="shadow-sm role-card"
      onClick={() => navigate(path)}
      style={{ cursor: "pointer", borderRadius: "15px" }}
    >
      <Card.Body>
        <h4>{icon} {title}</h4>
        <p className="text-muted">{description}</p>
      </Card.Body>
    </Card>
  );
}

export default RoleCard;
// Simula una base de datos usando localStorage
// Guarda las habitaciones y reservas.

const STORAGE_KEY = "hotel_habitaciones";

// Datos iniciales si no existen en localStorage
const defaultRooms = [
  {
    id: 1,
    nombre: "A101",
    tipo: "Suite Deluxe",
    precio: 180,
    disponible: true,
    fotos: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32",
    ],
  },
  {
    id: 2,
    nombre: "B202",
    tipo: "Suite Familiar",
    precio: 220,
    disponible: false,
    fotos: [
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa",
      "https://images.unsplash.com/photo-1551776235-dde6d4829808",
    ],
  },
  {
    id: 3,
    nombre: "C303",
    tipo: "Vista al mar",
    precio: 250,
    disponible: true,
    fotos: [
      "https://images.unsplash.com/photo-1501117716987-c8e1ecb21055",
      "https://images.unsplash.com/photo-1600585153939-198502b945b6",
    ],
  },
];

export const getHabitaciones = () => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : defaultRooms;
};

export const saveHabitaciones = (habitaciones) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(habitaciones));
};

export const updateDisponibilidad = (id, disponible) => {
  const habitaciones = getHabitaciones();
  const actualizadas = habitaciones.map((h) =>
    h.id === id ? { ...h, disponible } : h
  );
  saveHabitaciones(actualizadas);
};
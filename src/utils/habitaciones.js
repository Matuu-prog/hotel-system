export const HABITACIONES_BASE = [
  {
    id: 1,
    nombre: "Habitación Deluxe",
    piso: 1,
    descripcion: "Cama King, vista al mar, aire acondicionado, TV, WiFi.",
    imagenes: ["/img/hab1a.jpg", "/img/hab1b.jpg", "/img/hab1c.jpg"],
    precio: 220,
    reservedDates: [],
  },
  {
    id: 2,
    nombre: "Habitación Familiar",
    piso: 2,
    descripcion: "2 camas Queen, ideal para 4 personas, balcón privado.",
    imagenes: ["/img/hab2a.jpg", "/img/hab2b.jpg", "/img/hab2c.jpg"],
    precio: 180,
    reservedDates: [],
  },
  {
    id: 3,
    nombre: "Suite Ejecutiva",
    piso: 3,
    descripcion: "Suite con escritorio, minibar, jacuzzi y servicio premium.",
    imagenes: ["/img/hab3a.jpg", "/img/hab3b.jpg", "/img/hab3c.jpg"],
    precio: 260,
    reservedDates: [],
  },
];

const cloneBase = () => HABITACIONES_BASE.map((hab) => ({ ...hab, reservedDates: [...hab.reservedDates] }));

export const normalizarHabitaciones = (habitaciones = []) => {
  const baseMap = new Map(cloneBase().map((h) => [String(h.id), h]));
  const normalizadas = Array.isArray(habitaciones)
    ? habitaciones.map((hab, idx) => {
        const base = baseMap.get(String(hab?.id)) || cloneBase()[idx] || {};
        const precioBase = Number(hab?.precio ?? hab?.tarifa ?? base?.precio ?? 0);
        return {
          ...base,
          ...hab,
          precio: precioBase > 0 ? precioBase : base?.precio ?? 0,
          imagenes:
            Array.isArray(hab?.imagenes) && hab.imagenes.length > 0
              ? hab.imagenes
              : base?.imagenes || [],
          reservedDates: Array.isArray(hab?.reservedDates) ? hab.reservedDates : [],
        };
      })
    : cloneBase();

  cloneBase().forEach((base) => {
    if (!normalizadas.some((hab) => String(hab.id) === String(base.id))) {
      normalizadas.push({ ...base });
    }
  });

  return normalizadas;
};

export const ensureHabitaciones = () => {
  const base = cloneBase();
  if (typeof window === "undefined" || typeof window.localStorage === "undefined") {
    return base;
  }

  try {
    const raw = window.localStorage.getItem("habitaciones");
    if (!raw) {
      window.localStorage.setItem("habitaciones", JSON.stringify(base));
      return base;
    }
    const parsed = JSON.parse(raw);
    const normalizadas = normalizarHabitaciones(parsed);
    window.localStorage.setItem("habitaciones", JSON.stringify(normalizadas));
    return normalizadas;
  } catch {
    window.localStorage.setItem("habitaciones", JSON.stringify(base));
    return base;
  }
};
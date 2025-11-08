// utils/initData.js
export function initUsuarios() {
  let usuarios = JSON.parse(localStorage.getItem("usuarios")) || [];

  // Si no hay usuarios, crear al superadmin
  if (usuarios.length === 0) {
    usuarios = [
      {
        id: 1,
        nombre: "Mateo",
        usuario: "Mateo",     // <- sensible a mayúsculas/minúsculas
        password: "matu123",
        rol: "superadmin",
      },
    ];
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
    return;
  }

  // Si ya hay usuarios, aseguramos que "Mateo" sea superadmin
  let changed = false;
  usuarios = usuarios.map((u) => {
    if (u.usuario === "Mateo") {
      if (u.rol !== "superadmin" || u.password !== "matu123") {
        changed = true;
        return { ...u, rol: "superadmin", password: "matu123" };
      }
    }
    return u;
  });

  if (changed) {
    localStorage.setItem("usuarios", JSON.stringify(usuarios));
  }
}
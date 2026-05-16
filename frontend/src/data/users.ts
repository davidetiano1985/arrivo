export type UserRole = "user" | "restaurant_admin" | "super_admin";

export type DemoUser = {
  id: string;
  nome: string;
  email: string;
  ruolo: UserRole;
  restaurantIds: string[];
};

export const users: DemoUser[] = [
  {
    id: "user-001",
    nome: "Marco Rossi",
    email: "marco.rossi@example.com",
    ruolo: "user",
    restaurantIds: []
  },
  {
    id: "restaurant-admin-001",
    nome: "Giulia Bianchi",
    email: "giulia.bianchi@pizzerianapoli.demo",
    ruolo: "restaurant_admin",
    restaurantIds: ["pizzeria-napoli"]
  },
  {
    id: "super-admin-davide-tiano",
    nome: "Davide Tiano",
    email: "davidetiano1985@gmail.com",
    ruolo: "super_admin",
    restaurantIds: []
  },
  {
    id: "super-admin-001",
    nome: "Admin Arrivo",
    email: "admin@arrivo.demo",
    ruolo: "super_admin",
    restaurantIds: ["pizzeria-napoli", "sushi-zen"]
  }
];

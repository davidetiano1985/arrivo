export type UserRole = "super_admin" | "gestore_locale" | "manager" | "staff" | "cliente";

export type DemoUser = {
  id: string;
  nome: string;
  email: string;
  ruolo: UserRole;
  restaurantIds: string[];
  stato: "attivo" | "sospeso";
  emailVerificata: boolean;
};

export const users: DemoUser[] = [
  {
    id: "user-001",
    nome: "Marco Rossi",
    email: "marco.rossi@example.com",
    ruolo: "cliente",
    restaurantIds: [],
    stato: "attivo",
    emailVerificata: false
  },
  {
    id: "restaurant-admin-001",
    nome: "Giulia Bianchi",
    email: "giulia.bianchi@pizzerianapoli.demo",
    ruolo: "gestore_locale",
    restaurantIds: ["pizzeria-napoli"],
    stato: "attivo",
    emailVerificata: true
  },
  {
    id: "super-admin-davide-tiano",
    nome: "Davide Tiano",
    email: "davidetiano1985@gmail.com",
    ruolo: "super_admin",
    restaurantIds: [],
    stato: "attivo",
    emailVerificata: true
  },
  {
    id: "super-admin-001",
    nome: "Admin Arrivo",
    email: "admin@arrivo.demo",
    ruolo: "super_admin",
    restaurantIds: ["pizzeria-napoli", "sushi-zen"],
    stato: "attivo",
    emailVerificata: true
  }
];

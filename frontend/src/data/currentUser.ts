import type { DemoUser } from "./users";
import { users } from "./users";

// null = non autenticato | DemoUser = autenticato
// Sostituire con getServerSession() o useSession() quando NextAuth sarà attivo.
export const currentDemoUser: DemoUser | null =
  users.find((u) => u.id === "super-admin-davide-tiano") ?? null;

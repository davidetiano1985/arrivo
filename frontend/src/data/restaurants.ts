export type MenuItem = {
  nome: string;
  descrizione: string;
  prezzo: string;
};

export type Restaurant = {
  slug: string;
  nome: string;
  categoria: string;
  indirizzo: string;
  rating: number;
  tempoStimato: string;
  descrizione: string;
  immaginePlaceholder: string;
  menu: MenuItem[];
};

export const restaurants: Restaurant[] = [
  {
    slug: "pizzeria-napoli",
    nome: "Pizzeria Napoli",
    categoria: "Pizza napoletana",
    indirizzo: "Via Torino 24, Milano",
    rating: 4.8,
    tempoStimato: "18-25 min",
    descrizione:
      "Pizza contemporanea con impasto leggero, forno caldo e ingredienti italiani selezionati.",
    immaginePlaceholder: "placeholder-pizzeria-napoli",
    menu: [
      {
        nome: "Margherita",
        descrizione: "Pomodoro San Marzano, mozzarella fiordilatte e basilico.",
        prezzo: "EUR 8"
      },
      {
        nome: "Diavola",
        descrizione: "Pomodoro, mozzarella fiordilatte e salame piccante.",
        prezzo: "EUR 10"
      },
      {
        nome: "Napoli",
        descrizione: "Pomodoro, mozzarella, acciughe, capperi e origano.",
        prezzo: "EUR 11"
      }
    ]
  },
  {
    slug: "sushi-zen",
    nome: "Sushi Zen",
    categoria: "Sushi e cucina giapponese",
    indirizzo: "Corso Garibaldi 18, Milano",
    rating: 4.9,
    tempoStimato: "22-30 min",
    descrizione:
      "Sushi essenziale, bowl fresche e selezione di rolls preparati al momento.",
    immaginePlaceholder: "placeholder-sushi-zen",
    menu: [
      {
        nome: "Salmon Roll",
        descrizione: "Roll con salmone, avocado, sesamo e salsa ponzu.",
        prezzo: "EUR 12"
      },
      {
        nome: "Zen Bowl",
        descrizione: "Riso, salmone, edamame, avocado e verdure croccanti.",
        prezzo: "EUR 14"
      },
      {
        nome: "Nigiri Mix",
        descrizione: "Selezione di nigiri salmone, tonno e gambero.",
        prezzo: "EUR 13"
      }
    ]
  }
];

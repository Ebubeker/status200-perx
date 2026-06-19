import type { Category, Offer } from "./types";

export const CATEGORY_LABEL: Record<Category, string> = {
  wellness: "Wellness",
  fitness: "Fitness",
  food: "Food",
  health: "Health",
  travel: "Travel",
  learning: "Learning",
  culture: "Culture",
  telecom: "Telecom",
};

// Seeded Albanian catalog (Tirana). Prices in Lek.
export const catalog: Offer[] = [
  { id: "o_nobis_massage", providerId: "p_nobis", providerName: "Nobis Wellness", title: "60-min deep-tissue massage", category: "wellness", priceLek: 3500, area: "Blloku", taxFree: true },
  { id: "o_yoga_pass", providerId: "p_yoga", providerName: "Yoga Tirana", title: "5-class yoga pass", category: "wellness", priceLek: 2800, area: "Pazari i Ri", taxFree: true },
  { id: "o_fitzone_month", providerId: "p_fitzone", providerName: "Fitness Zone", title: "1-month gym membership", category: "fitness", priceLek: 4200, area: "Blloku", taxFree: true },
  { id: "o_fitzone_day", providerId: "p_fitzone", providerName: "Fitness Zone", title: "Day pass + sauna", category: "fitness", priceLek: 1200, area: "Blloku", taxFree: true },
  { id: "o_greenbowl_lunch", providerId: "p_greenbowl", providerName: "Green Bowl", title: "5 healthy lunches", category: "food", priceLek: 3000, area: "Rr. Myslym Shyri", taxFree: false },
  { id: "o_mulliri_coffee", providerId: "p_mulliri", providerName: "Mulliri i Vjetër", title: "Coffee + dessert for two", category: "food", priceLek: 900, area: "Komuna e Parisit", taxFree: false },
  { id: "o_salus_physio", providerId: "p_salus", providerName: "Salus Clinic", title: "Physiotherapy session", category: "health", priceLek: 4000, area: "Rr. e Kavajës", taxFree: true },
  { id: "o_salus_checkup", providerId: "p_salus", providerName: "Salus Clinic", title: "Annual health check-up", category: "health", priceLek: 5500, area: "Rr. e Kavajës", taxFree: true },
  { id: "o_pharma_credit", providerId: "p_pharma", providerName: "Farmacia Plus", title: "Pharmacy credit", category: "health", priceLek: 1500, area: "Tiranë", taxFree: true },
  { id: "o_dajti_cable", providerId: "p_dajti", providerName: "Dajti Ekspres", title: "Cable car + mountain lunch", category: "culture", priceLek: 1800, area: "Mali i Dajtit", taxFree: false },
  { id: "o_bunkart", providerId: "p_bunkart", providerName: "Bunk'Art", title: "Museum entry for two", category: "culture", priceLek: 1000, area: "Tiranë", taxFree: false },
  { id: "o_riviera_weekend", providerId: "p_riviera", providerName: "Riviera Escapes", title: "Weekend night in Dhërmi", category: "travel", priceLek: 6500, area: "Riviera", taxFree: false },
  { id: "o_academy_course", providerId: "p_academy", providerName: "Tirana Academy", title: "Online course credit", category: "learning", priceLek: 3500, area: "Online", taxFree: true },
  { id: "o_telecom_data", providerId: "p_telecom", providerName: "ONE Albania", title: "Monthly data top-up", category: "telecom", priceLek: 1500, area: "Tiranë", taxFree: false },
];

const byId = new Map(catalog.map((o) => [o.id, o]));
export function offerById(id: string): Offer | undefined {
  return byId.get(id);
}

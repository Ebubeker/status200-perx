export type Category =
  | "wellness"
  | "fitness"
  | "food"
  | "health"
  | "travel"
  | "learning"
  | "culture"
  | "telecom";

export interface Offer {
  id: string;
  providerId: string;
  providerName: string;
  title: string;
  category: Category;
  priceLek: number;
  area: string;
  taxFree: boolean;
}

export interface Voucher {
  id: string;
  offerId: string;
  code: string;
  status: "issued" | "redeemed";
  packageId: string;
}

export interface StoredPackage {
  id: string;
  label: string;
  rationale: string;
  itemIds: string[];
  totalLek: number;
  status: "draft" | "pending" | "approved";
  employee: string;
}

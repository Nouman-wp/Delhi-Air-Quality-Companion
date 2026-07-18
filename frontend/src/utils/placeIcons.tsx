import { Landmark, ShoppingBag, Plane, Utensils, Building2, Store, MapPin } from "lucide-react";
import type { RecommendedCategory } from "../data/recommendedPlaces";

const ICONS: Record<RecommendedCategory, typeof Landmark> = {
  landmark: Landmark,
  shopping: ShoppingBag,
  transport: Plane,
  dining: Utensils,
  business: Building2,
  market: Store,
};

export function categoryIcon(category: RecommendedCategory | undefined, size = 16, className = "text-accent") {
  const Icon = category ? ICONS[category] : MapPin;
  return <Icon size={size} className={className} />;
}

import { FontAwesome } from "@expo/vector-icons";

export interface Product {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  image: any;
  rating: number;
  sold: number;
  location: string;
}

export interface Category {
  id: string;
  name: string;
  icon: keyof typeof FontAwesome.glyphMap;
  color: string;
}

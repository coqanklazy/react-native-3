import { Product, Category } from "../types/product";

export const CATEGORIES: Category[] = [
  { id: "1", name: "Đặc sản Bắc", icon: "map-marker", color: "#EF4444" },
  { id: "2", name: "Đặc sản Trung", icon: "sun-o", color: "#F59E0B" },
  { id: "3", name: "Đặc sản Nam", icon: "leaf", color: "#10B981" },
  { id: "4", name: "Quà biếu", icon: "gift", color: "#8B5CF6" },
  { id: "5", name: "Đồ khô", icon: "cubes", color: "#EC4899" },
  { id: "6", name: "Đồ uống", icon: "coffee", color: "#3B82F6" },
  { id: "7", name: "Gia vị", icon: "spoon", color: "#6366F1" },
  { id: "8", name: "Khác", icon: "ellipsis-h", color: "#6B7280" },
];

export const FLASH_SALE_PRODUCTS: Product[] = [
  {
    id: "fs1",
    name: "Bánh Pía Sóc Trăng Trứng Muối",
    price: "89.000₫",
    originalPrice: "120.000₫",
    discount: "-25%",
    image: require("../assets/dacsanvietLogo.webp"),
    rating: 4.8,
    sold: 1200,
    location: "Sóc Trăng",
  },
  {
    id: "fs2",
    name: "Cà Phê Buôn Ma Thuột K",
    price: "150.000₫",
    originalPrice: "200.000₫",
    discount: "-25%",
    image: require("../assets/dacsanvietLogo.webp"),
    rating: 4.9,
    sold: 840,
    location: "Đắk Lắk",
  },
  {
    id: "fs3",
    name: "Trâu Gác Bếp Tây Bắc",
    price: "850.000₫",
    originalPrice: "950.000₫",
    discount: "-10%",
    image: require("../assets/dacsanvietLogo.webp"),
    rating: 5.0,
    sold: 156,
    location: "Sơn La",
  },
];

export const RECOMMENDED_PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Nem Chua Thanh Hóa (10 cái)",
    price: "45.000₫",
    image: require("../assets/dacsanvietLogo.webp"),
    rating: 4.5,
    sold: 5200,
    location: "Thanh Hóa",
  },
  {
    id: "p2",
    name: "Mè Xửng Huế Thượng Hạng",
    price: "35.000₫",
    image: require("../assets/dacsanvietLogo.webp"),
    rating: 4.7,
    sold: 3100,
    location: "Huế",
  },
  {
    id: "p3",
    name: "Chả Mực Hạ Long Giã Tay",
    price: "420.000₫",
    image: require("../assets/dacsanvietLogo.webp"),
    rating: 4.9,
    sold: 890,
    location: "Quảng Ninh",
  },
  {
    id: "p4",
    name: "Kẹo Dừa Bến Tre Sầu Riêng",
    price: "55.000₫",
    image: require("../assets/dacsanvietLogo.webp"),
    rating: 4.6,
    sold: 12000,
    location: "Bến Tre",
  },
];

import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import Table from "./models/Table.js";
import MenuItem from "./models/MenuItem.js";
import { generateTableToken } from "./utils/crypto.js";

dotenv.config();

const menuItems = [
  {
    name: "Paneer Tikka Shaslik",
    description: "Char-grilled clay oven cottage cheese cubes marinated in heritage spices with peppers and green mint dip.",
    price: 280,
    category: "Starters",
    veg: true,
    nonVeg: false,
    jain: true,
    bestseller: true,
    available: true,
    prepTimeMinutes: 12,
    spiceLevel: "medium",
    image: "/ambika-pure-veg-img4.avif",
    displayOrder: 1,
  },
  {
    name: "Hara Bhara Kebab",
    description: "Delicate spinach and fresh green pea patties, blended with aromatic herbs and pan-fried with pure ghee.",
    price: 240,
    category: "Starters",
    veg: true,
    nonVeg: false,
    jain: false,
    bestseller: false,
    available: true,
    prepTimeMinutes: 10,
    spiceLevel: "low",
    image: "/ambika-pure-veg-img2.avif",
    displayOrder: 2,
  },
  {
    name: "Royal Dal Makhani",
    description: "Slow-cooked black lentils simmered overnight on clay ovens, finished with fresh churning butter and cream.",
    price: 260,
    category: "Main Course",
    veg: true,
    nonVeg: false,
    jain: false,
    bestseller: true,
    available: true,
    prepTimeMinutes: 15,
    spiceLevel: "low",
    image: "/ambika-pure-veg-img3.avif",
    displayOrder: 3,
  },
  {
    name: "Veg Kolhapuri",
    description: "Medley of fresh seasonal farm vegetables cooked in spicy, roasted red chili coconut paste and traditional dry spices.",
    price: 320,
    category: "Main Course",
    veg: true,
    nonVeg: false,
    jain: false,
    bestseller: false,
    available: true,
    prepTimeMinutes: 18,
    spiceLevel: "high",
    image: "/ambika-pure-veg-img5.avif",
    displayOrder: 4,
  },
  {
    name: "Subz Palak Paneer",
    description: "Fresh spinach puree slow-cooked with garlic, ginger, and cubes of fresh local cottage cheese.",
    price: 290,
    category: "Main Course",
    veg: true,
    nonVeg: false,
    jain: true,
    bestseller: false,
    available: true,
    prepTimeMinutes: 16,
    spiceLevel: "medium",
    image: "/ambika-pure-veg-img3.avif",
    displayOrder: 5,
  },
  {
    name: "Traditional Butter Naan",
    description: "Heritage wheat flatbread hand-stretched and baked in wood-fired clay tandoor, brushed with premium white butter.",
    price: 60,
    category: "Breads",
    veg: true,
    nonVeg: false,
    jain: true,
    bestseller: true,
    available: true,
    prepTimeMinutes: 8,
    spiceLevel: "none",
    image: "/ambika-pure-veg-img7.avif",
    displayOrder: 6,
  },
  {
    name: "Tandoori Roti",
    description: "Whole wheat rustic flatbread baked in traditional tandoor.",
    price: 40,
    category: "Breads",
    veg: true,
    nonVeg: false,
    jain: true,
    bestseller: false,
    available: true,
    prepTimeMinutes: 7,
    spiceLevel: "none",
    image: "/ambika-pure-veg-img7.avif",
    displayOrder: 7,
  },
  {
    name: "Heritage Gulab Jamun",
    description: "Warm milk-solid spherical dumplings, deep-fried and soaked in delicate rose and cardamom sugar syrup.",
    price: 120,
    category: "Desserts",
    veg: true,
    nonVeg: false,
    jain: true,
    bestseller: true,
    available: true,
    prepTimeMinutes: 5,
    spiceLevel: "none",
    image: "/ambika-pure-veg-img8.avif",
    displayOrder: 8,
  },
  {
    name: "Saffron Kesari Kulfi",
    description: "Rich slow-reduced traditional milk ice cream infused with Kashmiri saffron, almonds, and pistachios.",
    price: 150,
    category: "Desserts",
    veg: true,
    nonVeg: false,
    jain: true,
    bestseller: false,
    available: true,
    prepTimeMinutes: 5,
    spiceLevel: "none",
    image: "/ambika-pure-veg-img8.avif",
    displayOrder: 9,
  },
  {
    name: "Masala Chai",
    description: "Traditional tea leaves brewed with ginger, cardamom, and fresh buffalo milk.",
    price: 50,
    category: "Beverages",
    veg: true,
    nonVeg: false,
    jain: true,
    bestseller: true,
    available: true,
    prepTimeMinutes: 5,
    spiceLevel: "none",
    image: "/ambika-pure-veg-img1.webp",
    displayOrder: 10,
  },
  {
    name: "Fresh Lime Soda",
    description: "Freshly squeezed sweet or salted lime juice topped with carbonated soda.",
    price: 80,
    category: "Beverages",
    veg: true,
    nonVeg: false,
    jain: true,
    bestseller: false,
    available: true,
    prepTimeMinutes: 3,
    spiceLevel: "none",
    image: "/ambika-pure-veg-img2.avif",
    displayOrder: 11,
  },
];

const seed = async () => {
  await connectDB();

  await Promise.all([
    User.deleteMany(),
    Table.deleteMany(),
    MenuItem.deleteMany(),
  ]);

  await User.create([
    {
      name: "Admin Manager",
      email: "admin@ambika.com",
      password: "admin123",
      role: "admin",
    },
    {
      name: "Kitchen Head",
      email: "kitchen@ambika.com",
      password: "kitchen123",
      role: "kitchen",
    },
    {
      name: "Floor Waiter",
      email: "waiter@ambika.com",
      password: "waiter123",
      role: "waiter",
    },
  ]);

  // Seed default Tables 1-6 with valid qrTokens
  await Table.create([
    { tableNumber: 1, capacity: 4, status: "available", qrToken: generateTableToken(1) },
    { tableNumber: 2, capacity: 2, status: "available", qrToken: generateTableToken(2) },
    { tableNumber: 3, capacity: 6, status: "available", qrToken: generateTableToken(3) },
    { tableNumber: 4, capacity: 4, status: "available", qrToken: generateTableToken(4) },
    { tableNumber: 5, capacity: 2, status: "available", qrToken: generateTableToken(5) },
    { tableNumber: 6, capacity: 8, status: "available", qrToken: generateTableToken(6) },
  ]);

  await MenuItem.insertMany(menuItems);

  console.log("Seed complete — demo accounts and tables initialized with valid tokens.");
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

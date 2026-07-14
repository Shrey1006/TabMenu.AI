import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import Table from "./models/Table.js";
import MenuItem from "./models/MenuItem.js";
import { generateTableToken } from "./utils/crypto.js";

dotenv.config();

const menuItems = [
  {
    name: "Paneer Tikka",
    description: "Char-grilled cottage cheese with mint chutney",
    price: 280,
    category: "starters",
    dietary: ["jain"],
    prepTimeMinutes: 12,
  },
  {
    name: "Hara Bhara Kebab",
    description: "Spinach and green pea patties, lightly spiced",
    price: 240,
    category: "starters",
    dietary: ["vegan"],
    prepTimeMinutes: 10,
  },
  {
    name: "Veg Kolhapuri",
    description: "Mixed vegetables in fiery Kolhapuri masala",
    price: 320,
    category: "main",
    dietary: ["spicy"],
    prepTimeMinutes: 18,
  },
  {
    name: "Dal Makhani",
    description: "Slow-cooked black lentils with cream and butter",
    price: 260,
    category: "main",
    dietary: [],
    prepTimeMinutes: 15,
  },
  {
    name: "Palak Paneer",
    description: "Cottage cheese cubes in creamy spinach gravy",
    price: 290,
    category: "main",
    dietary: ["gluten-free"],
    prepTimeMinutes: 16,
  },
  {
    name: "Butter Naan",
    description: "Soft leavened bread brushed with butter",
    price: 60,
    category: "breads",
    dietary: [],
    prepTimeMinutes: 8,
  },
  {
    name: "Tandoori Roti",
    description: "Whole wheat flatbread from the tandoor",
    price: 40,
    category: "breads",
    dietary: ["vegan"],
    prepTimeMinutes: 7,
  },
  {
    name: "Gulab Jamun",
    description: "Warm milk-solid dumplings in rose-cardamom syrup",
    price: 120,
    category: "desserts",
    dietary: [],
    prepTimeMinutes: 5,
  },
  {
    name: "Masala Chai",
    description: "Traditional spiced tea brewed fresh",
    price: 50,
    category: "beverages",
    dietary: ["vegan"],
    prepTimeMinutes: 5,
  },
  {
    name: "Fresh Lime Soda",
    description: "Sweet or salted lime refresher",
    price: 80,
    category: "beverages",
    dietary: ["vegan", "gluten-free"],
    prepTimeMinutes: 3,
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

  // No default tables seeded. Admin should create tables manually via the dashboard.
  // If you want development seed data, you may add tables here.

  await MenuItem.insertMany(menuItems);

  console.log("Seed complete — demo accounts:");
  console.log("  admin@ambika.com / admin123");
  console.log("  kitchen@ambika.com / kitchen123");
  console.log("  waiter@ambika.com / waiter123");
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

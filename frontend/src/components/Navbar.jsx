import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/90 backdrop-blur-md dark:border-stone-800 dark:bg-stone-900/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Ambika Pure Veg Logo"
            className="h-10 w-10 rounded-full object-cover ring-2 ring-brand-200 dark:ring-brand-900"
          />
          <div>
            <p className="text-sm font-bold text-brand-800 dark:text-brand-400">Ambika Pure Veg</p>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              B2B Smart Restaurant Platform
            </p>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-stone-600 dark:text-stone-300 md:flex">
          <a href="#features" className="hover:text-brand-700 dark:hover:text-brand-400">
            Features
          </a>
          <a href="#roles" className="hover:text-brand-700 dark:hover:text-brand-400">
            Roles
          </a>
          <Link to="/roi" className="hover:text-brand-700 dark:hover:text-brand-400">
            ROI Calculator
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className={`rounded-full px-3 py-2 text-sm font-medium ${isDark ? "bg-stone-800 text-stone-100" : "bg-stone-100 text-stone-700"}`}
          >
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>
          <Link
            to="/login"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Staff Login
          </Link>
        </div>
      </div>
    </header>
  );
}

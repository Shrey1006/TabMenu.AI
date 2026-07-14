import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Ambika Pure Veg Logo"
            className="h-10 w-10 rounded-full object-cover ring-2 ring-brand-200"
          />
          <div>
            <p className="text-sm font-bold text-brand-800">Ambika Pure Veg</p>
            <p className="text-xs text-stone-500">
              B2B Smart Restaurant Platform
            </p>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-stone-600 md:flex">
          <a href="#features" className="hover:text-brand-700">
            Features
          </a>
          <a href="#roles" className="hover:text-brand-700">
            Roles
          </a>
          <Link to="/roi" className="hover:text-brand-700">
            ROI Calculator
          </Link>
        </nav>
        <div className="flex items-center gap-2">
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

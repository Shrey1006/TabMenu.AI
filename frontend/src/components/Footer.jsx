import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-stone-200 bg-stone-900 text-stone-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div>
            <div className="mb-4 flex items-center gap-2">
              <img
                src="/logo.png"
                alt="Ambika Pure Veg Logo"
                className="h-10 w-10 rounded-full object-cover ring-2 ring-brand-400"
              />
              <div>
                <p className="font-bold text-white">Ambika Pure Veg</p>
                <p className="text-xs">Smart Restaurant Platform</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed">
              Next-generation dining operations powered by cryptographic
              routing, real-time communication, and AI-driven insights.
            </p>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="mb-4 font-semibold text-white">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/customer" className="hover:text-brand-400">
                  Customer Portal
                </Link>
              </li>
              <li>
                <Link to="/kitchen" className="hover:text-brand-400">
                  Kitchen System
                </Link>
              </li>
              <li>
                <Link to="/waiter" className="hover:text-brand-400">
                  Waiter Interface
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-brand-400">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="mb-4 font-semibold text-white">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/roi" className="hover:text-brand-400">
                  ROI Calculator
                </Link>
              </li>
              <li>
                <a href="#features" className="hover:text-brand-400">
                  Feature Overview
                </a>
              </li>
              <li>
                <a href="#roles" className="hover:text-brand-400">
                  Dashboards
                </a>
              </li>
              <li>
                <a href="#benefits" className="hover:text-brand-400">
                  Why Choose Us
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 font-semibold text-white">Get Started</h3>
            <p className="mb-4 text-sm">
              Ready to transform your restaurant operations?
            </p>
            <Link
              to="/login"
              className="inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Book a Demo
            </Link>
          </div>
        </div>

        <div className="mt-12 border-t border-stone-700 pt-8 text-center text-sm">
          <p>
            &copy; {currentYear} Ambika Pure Veg Smart Restaurant Platform. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

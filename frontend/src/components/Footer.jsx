import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-brand-200 dark:border-stone-850 bg-stone-900 dark:bg-[#120b08] text-stone-300 transition-colors duration-150">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Brand & Philosophy */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Ambika Pure Veg Logo"
                className="h-12 w-12 rounded-full object-cover ring-2 ring-brand-500/50"
              />
              <div>
                <h3 className="font-serif text-xl font-bold tracking-wide text-white">
                  Ambika Pure Veg
                </h3>
                <p className="text-[10px] uppercase tracking-widest text-[#b69234]">
                  Heritage Cuisine
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-stone-400">
              Delivering wholesome, 100% pure-vegetarian culinary treasures crafted with love, ancestral recipes, and absolute devotion to purity since 1995.
            </p>
            <div className="flex gap-4 pt-2">
              {["facebook", "instagram", "tripadvisor"].map((social) => (
                <a
                  key={social}
                  href={`https://${social}.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-750 text-stone-400 transition-colors hover:border-[#b69234] hover:text-[#b69234]"
                  aria-label={`Follow us on ${social}`}
                >
                  <span className="capitalize text-xs font-semibold">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold tracking-wide text-white mb-6 border-b border-stone-800 pb-2">
              Menu & Ordering
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/customer" className="text-stone-400 hover:text-[#b69234] transition-colors">
                  Order Online
                </Link>
              </li>
              <li>
                <a href="#specialities" className="text-stone-400 hover:text-[#b69234] transition-colors">
                  Our Specialities
                </a>
              </li>
              <li>
                <a href="#ambience" className="text-stone-400 hover:text-[#b69234] transition-colors">
                  Restaurant Ambience
                </a>
              </li>
              <li>
                <a href="#about" className="text-stone-400 hover:text-[#b69234] transition-colors">
                  Our Heritage
                </a>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="font-serif text-lg font-semibold tracking-wide text-white mb-6 border-b border-stone-800 pb-2">
              Opening Hours
            </h4>
            <ul className="space-y-3 text-sm text-stone-400">
              <li className="flex justify-between">
                <span>Monday - Friday</span>
                <span className="text-white">11:00 AM - 11:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday - Sunday</span>
                <span className="text-white">11:00 AM - 11:30 PM</span>
              </li>
              <li className="border-t border-stone-800/60 pt-2 flex flex-col">
                <span className="text-xs uppercase text-[#b69234] font-medium tracking-wider">
                  Jain Special Menu
                </span>
                <span className="mt-1 text-xs">Available daily during lunch & dinner hours.</span>
              </li>
            </ul>
          </div>

          {/* Contact & Location */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold tracking-wide text-white border-b border-stone-800 pb-2 mb-2">
              Reservations
            </h4>
            <p className="text-sm text-stone-400 leading-relaxed">
              Opp. Heritage Fort, Palace Road,<br />
              Jaipur, Rajasthan - 302001
            </p>
            <div className="text-sm text-stone-400 space-y-1">
              <p>
                Phone: <a href="tel:+911412345678" className="text-white hover:text-[#b69234] transition-colors">+91 141 234 5678</a>
              </p>
              <p>
                Email: <a href="mailto:reservations@ambikapureveg.com" className="text-white hover:text-[#b69234] transition-colors">reservations@ambikapureveg.com</a>
              </p>
            </div>
            <div className="pt-2">
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-[#b69234] px-4 py-2 text-xs font-semibold text-[#b69234] hover:bg-[#b69234] hover:text-white transition-all duration-300"
              >
                📍 Find Us on Maps
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 border-t border-stone-800/80 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
          <p>
            &copy; {currentYear} Ambika Pure Veg. All rights reserved. Crafted for Fine Vegetarian Dining.
          </p>
          <div className="flex gap-4">
            <Link to="/login" className="hover:text-stone-300 transition-colors">
              Staff Portal
            </Link>
            <span>·</span>
            <Link to="/roi" className="hover:text-stone-300 transition-colors">
              ROI Details
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

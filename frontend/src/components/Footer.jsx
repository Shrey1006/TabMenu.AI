import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-cream-200 dark:border-espresso-800 bg-espresso-900 dark:bg-espresso-950 text-espresso-50 transition-colors duration-150">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* Brand & Philosophy */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Ambika Pure Veg Logo"
                className="h-12 w-12 rounded-full object-cover ring-2 ring-gold-500/50"
              />
              <div>
                <h3 className="font-serif text-xl font-bold tracking-wide text-white">
                  Ambika Pure Veg
                </h3>
                <p className="text-[10px] uppercase tracking-widest text-gold-400">
                  Heritage Cuisine
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-espresso-100/70">
              Delivering wholesome, 100% pure-vegetarian culinary treasures crafted with love, ancestral recipes, and absolute devotion to purity since 1995.
            </p>
            <div className="flex gap-4 pt-2">
              {["facebook", "instagram", "tripadvisor"].map((social) => (
                <a
                  key={social}
                  href={`https://${social}.com`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-espresso-800 text-espresso-100/60 transition-colors hover:border-gold-400 hover:text-gold-400"
                  aria-label={`Follow us on ${social}`}
                >
                  <span className="capitalize text-xs font-semibold">{social[0]}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold tracking-wide text-white mb-6 border-b border-espresso-800 pb-2">
              Menu & Ordering
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/customer" className="text-espresso-100/70 hover:text-gold-400 transition-colors">
                  Order Online
                </Link>
              </li>
              <li>
                <a href="#specialities" className="text-espresso-100/70 hover:text-gold-400 transition-colors">
                  Our Specialities
                </a>
              </li>
              <li>
                <a href="#ambience" className="text-espresso-100/70 hover:text-gold-400 transition-colors">
                  Restaurant Ambience
                </a>
              </li>
              <li>
                <a href="#about" className="text-espresso-100/70 hover:text-gold-400 transition-colors">
                  Our Heritage
                </a>
              </li>
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="font-serif text-lg font-semibold tracking-wide text-white mb-6 border-b border-espresso-800 pb-2">
              Opening Hours
            </h4>
            <ul className="space-y-3 text-sm text-espresso-100/70">
              <li className="flex justify-between">
                <span>Monday - Friday</span>
                <span className="text-white">11:00 AM - 11:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Saturday - Sunday</span>
                <span className="text-white">11:00 AM - 11:30 PM</span>
              </li>
              <li className="border-t border-espresso-800 pt-2 flex flex-col">
                <span className="text-xs uppercase text-gold-400 font-medium tracking-wider">
                  Jain Special Menu
                </span>
                <span className="mt-1 text-xs">Available daily during lunch & dinner hours.</span>
              </li>
            </ul>
          </div>

          {/* Contact & Location */}
          <div className="space-y-4">
            <h4 className="font-serif text-lg font-semibold tracking-wide text-white border-b border-espresso-800 pb-2 mb-2">
              Reservations
            </h4>
            <p className="text-sm text-espresso-100/70 leading-relaxed">
              Krishna Radha Society, Near Bangalore Iyengar Bakery,<br />
              Phadke Road, Dombivli East, Thane-421201, Maharashtra
            </p>
            <div className="text-sm text-espresso-100/70 space-y-1">
              <p>
                Phone: <a href="tel:7738638937" className="text-white hover:text-gold-400 transition-colors">+91 77386 38937</a>
              </p>
              <p>
                Email: <a href="mailto:reservations@ambikapureveg.com" className="text-white hover:text-gold-400 transition-colors">reservations@ambikapureveg.com</a>
              </p>
            </div>
            <div className="pt-2">
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-gold-500 px-4 py-2 text-xs font-semibold text-gold-500 hover:bg-gold-500 hover:text-white transition-all duration-300"
              >
                📍 Find Us on Maps
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 border-t border-espresso-800 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-espresso-100/50 gap-4">
          <p>
            &copy; {currentYear} Ambika Pure Veg. All rights reserved. Crafted for Fine Vegetarian Dining.
          </p>
          <div className="flex gap-4">
            <Link to="/login" className="hover:text-espresso-50 transition-colors">
              Staff Portal
            </Link>
            <span>·</span>
            <Link to="/roi" className="hover:text-espresso-50 transition-colors">
              ROI Details
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

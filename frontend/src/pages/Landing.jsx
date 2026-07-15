import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";

const timelineEvents = [
  {
    year: "1995",
    title: "The Humble Beginning",
    description: "Founder Chef Raghavan starts a traditional spice kitchen near the palace gates, dedicated to South Indian heritage specialties.",
  },
  {
    year: "2005",
    title: "Expanding the Horizon",
    description: "Introduced traditional clay oven (Tandoor) and Gujarati delicacies, expanding the dining room to seat up to 100 guests.",
  },
  {
    year: "2015",
    title: "Heritage Recognition",
    description: "Awarded Thane's 'Best Vegetarian Heritage Cuisine' title. Added our signature royal private dining room.",
  },
  {
    year: "Today",
    title: "Modern Dining Sanctuary",
    description: "Offering premium fine-dining aesthetics while keeping our ancestral recipes, live kitchen, and 100% purity values unchanged.",
  },
];

const specialities = [
  {
    icon: "🥞",
    title: "Authentic South Indian",
    description: "Stone-ground rice batters, organic local coconut, and ancestral spices for perfectly crisp dosas and fluffy idlis.",
  },
  {
    icon: "🍢",
    title: "Tandoori Masterpieces",
    description: "Slow-baked flatbreads and marinated cottage cheese (Paneer) grilled over natural wood charcoal tandoors.",
  },
  {
    icon: "🌾",
    title: "Wholesome Jain Specials",
    description: "Prepared strictly without onion, garlic, or root vegetables, honoring absolute purity and non-violence values.",
  },
  {
    icon: "🍧",
    title: "Traditional Heritage Desserts",
    description: "Slow-reduced milk, Kashmiri saffron, organic jaggery, and green cardamom sweet delicacies prepared fresh daily.",
  },
  {
    icon: "🔥",
    title: "Live Kitchen Experience",
    description: "Witness the theater of hot naans leaving the clay ovens and local chefs tossing spices in our open hygiene kitchen.",
  },
  {
    icon: "👑",
    title: "Royal Private Dining",
    description: "Immersive group dining setups curated with traditional tableware for family celebrations and private gatherings.",
  },
];

const strengths = [
  {
    title: "100% Pure & Organic",
    desc: "Strictly vegetarian kitchen with hand-ground spices and absolutely no MSG or artificial food coloring.",
  },
  {
    title: "Ancestral Recipes",
    desc: "Passed down through generations, preserving the traditional medicinal benefits of Indian herbs.",
  },
  {
    title: "Daily Sourced Produce",
    desc: "Sourced fresh from Thane's local organic farmers and sustainable vegetable cooperatives every morning.",
  },
  {
    title: "Immaculate Hygiene",
    desc: "Certified food handling with an open design that allows guests to view the entire cooking workflow.",
  },
];

const testimonials = [
  {
    name: "Aishwarya Sharma",
    role: "Local Food Critic",
    review: "The Paneer Tikka was incredibly soft, and the heritage ambience transported me back to royal dining halls. An absolute gem in Dombivli.",
    rating: 5,
  },
  {
    name: "Rajesh Jain",
    role: "Regular Visitor",
    review: "Finding authentic Jain food that maintains this level of purity and rich heritage flavors is rare. Our family dining destination of choice.",
    rating: 5,
  },
  {
    name: "Sarah Jenkins",
    role: "Culinary Travel Writer",
    review: "The live kitchen experience was breathtaking, and the traditional hospitality was incredibly warm. Authentic recipes presented with elegance.",
    rating: 5,
  },
];

const galleryImages = [
  { src: "/ambika-pure-veg-img2.avif", alt: "Traditional Courtyard Dining" },
  { src: "/ambika-pure-veg-img3.avif", alt: "Warm Royal Seating" },
  { src: "/ambika-pure-veg-img4.avif", alt: "Signature Paneer Tikka Platter" },
  { src: "/ambika-pure-veg-img5.avif", alt: "Heritage Inner Dining Hall" },
  { src: "/ambika-pure-veg-img7.avif", alt: "Fresh Tandoori Breads" },
  { src: "/ambika-pure-veg-img8.avif", alt: "Traditional Brass Tableware" },
];

export default function Landing() {
  const { isDark, toggleTheme } = useTheme();


  return (
    <div className="relative min-h-screen bg-cream-50 dark:bg-espresso-950 text-chocolate-900 dark:text-[#f7f3ec] transition-colors duration-200">
      
      {/* Floating Theme Medallion */}
      <button
        onClick={toggleTheme}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-gold-400 to-gold-500 text-white shadow-xl hover:shadow-gold-500/30 hover:scale-110 active:scale-95 transition-all duration-300 border border-white/20 cursor-pointer"
        title="Toggle Theme"
        aria-label="Toggle Theme"
      >
        <span className="text-xl">{isDark ? "☀️" : "🌙"}</span>
      </button>

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center">
        {/* Background Image with Dark Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 ease-out scale-105"
          style={{ backgroundImage: `url('/ambika-pure-veg-img1.webp')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#120b08]/85 via-[#120b08]/75 to-[#120b08]/95" />

        {/* Hero Content */}
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <div className="mb-6 flex justify-center animate-fade-in">
            <img
              src="/logo.png"
              alt="Ambika Pure Veg Logo"
              className="h-28 w-28 rounded-full object-cover shadow-2xl ring-4 ring-gold-500/60 bg-white"
            />
          </div>
          
          <p className="font-serif text-sm font-semibold uppercase tracking-[0.3em] text-gold-400 mb-4">
            Established 1995
          </p>

          <h1 className="font-serif text-5xl font-bold tracking-wide text-white sm:text-7xl lg:text-8xl mb-6 leading-tight">
            Ambika Pure Veg
          </h1>

          <p className="font-serif text-lg italic text-[#decbba] mb-6 tracking-wider">
            "A sanctuary of wholesome ancestral recipes & pure-vegetarian heritage."
          </p>

          <p className="mx-auto max-w-2xl text-xs sm:text-sm text-gold-400 font-semibold tracking-wider mb-6 flex items-center justify-center gap-1.5 bg-[#120b08]/50 py-2.5 px-4 rounded-xl border border-gold-500/20">
            📍 Krishna Radha Society, Near Bangalore Iyengar Bakery, Phadke Road, Dombivli East, Thane-421201, Maharashtra
          </p>

          <p className="mx-auto max-w-2xl text-sm sm:text-base leading-relaxed text-stone-300 mb-10">
            Immerse yourself in authentic Indian dining. We craft every dish with daily organic harvests, hand-milled spice grinds, and absolute culinary devotion. No artificial flavorings, just traditional purity.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="#booking"
              className="rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 hover:from-gold-600 hover:to-gold-500 px-8 py-4 text-sm font-bold uppercase tracking-wider text-white shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0"
            >
              Reserve A Table
            </a>
            <Link
              to="/customer"
              className="rounded-lg border-2 border-gold-500 bg-[#120b08]/40 px-8 py-4 text-sm font-bold uppercase tracking-wider text-white hover:bg-gradient-to-r hover:from-gold-500 hover:to-gold-400 hover:border-transparent transition-all duration-300"
            >
              Order Online / View Menu
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-stone-400">
          <span className="text-[10px] uppercase tracking-widest text-gold-400">Scroll to explore</span>
          <div className="h-8 w-[1px] bg-gradient-to-b from-gold-400 to-transparent animate-pulse" />
        </div>
      </section>

      {/* ==================== ABOUT US SECTION ==================== */}
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          
          {/* Left Text Block */}
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-gold-500 font-semibold">Our Origin Story</span>
              <h2 className="font-serif text-4xl sm:text-5xl font-bold tracking-wide text-chocolate-900 dark:text-white">
                Three Decades of Purity
              </h2>
              <div className="h-[2px] w-20 bg-gold-500" />
            </div>
            
            <p className="text-base sm:text-lg leading-relaxed text-chocolate-850 dark:text-espresso-100">
              Founded in Maharashtra in 1995, Ambika Pure Veg was born from a singular vision: to serve traditional, wholesome Indian cuisine that honors the body and respects the soul.
            </p>
            <p className="text-sm leading-relaxed text-chocolate-800 dark:text-espresso-100/80">
              We reject modern shortcuts. Our kitchen does not utilize processed ingredients, artificial preservatives, or chemical coloring. Spices are hand-ground in mortar pestles every morning, wheat is stone-milled to preserve its nutrients, and fresh produce is sourced before sunrise from local farmers.
            </p>

            <div className="grid gap-6 sm:grid-cols-3 pt-6">
              <div className="rounded-xl bg-white dark:bg-espresso-900 p-4 border border-cream-200 dark:border-espresso-750 text-center shadow-sm">
                <p className="font-serif text-3xl font-bold text-gold-500">1995</p>
                <p className="text-xs uppercase tracking-wider text-chocolate-700 dark:text-espresso-100/70 mt-1">Year Founded</p>
              </div>
              <div className="rounded-xl bg-white dark:bg-espresso-900 p-4 border border-cream-200 dark:border-espresso-750 text-center shadow-sm">
                <p className="font-serif text-3xl font-bold text-gold-500">100%</p>
                <p className="text-xs uppercase tracking-wider text-chocolate-700 dark:text-espresso-100/70 mt-1">Vegetarian</p>
              </div>
              <div className="rounded-xl bg-white dark:bg-espresso-900 p-4 border border-cream-200 dark:border-espresso-750 text-center shadow-sm">
                <p className="font-serif text-3xl font-bold text-gold-500">Zero</p>
                <p className="text-xs uppercase tracking-wider text-chocolate-700 dark:text-espresso-100/70 mt-1">MSG / Preservatives</p>
              </div>
            </div>
          </div>

          {/* Right Image Block */}
          <div className="relative">
            <div className="absolute -inset-2 rounded-2xl border-2 border-dashed border-gold-500/30" />
            <img
              src="/ambika-pure-veg-img2.avif"
              alt="Ambika Courtyard Dining"
              className="relative z-10 w-full rounded-xl object-cover shadow-2xl transition-transform duration-500 hover:scale-[1.02]"
            />
            {/* Absolute badge */}
            <div className="absolute -bottom-6 -left-6 z-25 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-500 p-6 text-white shadow-xl hidden sm:block">
              <p className="font-serif text-xl font-bold">Raghavan</p>
              <p className="text-xs uppercase tracking-widest text-[#fdfbf7] opacity-80">Founder & Chief Chef</p>
            </div>
          </div>

        </div>

        {/* Mission Vision Values Cards */}
        <div className="grid gap-6 sm:grid-cols-3 mt-20">
          <div className="rounded-2xl bg-white dark:bg-espresso-900 p-8 border border-cream-200 dark:border-espresso-750 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <span className="text-3xl">🕊️</span>
            <h3 className="font-serif text-xl font-bold text-chocolate-900 dark:text-white">Our Mission</h3>
            <p className="text-sm leading-relaxed text-[#5c443c] dark:text-espresso-100">
              To serve authentic, organic, pure-vegetarian recipes prepared strictly with ancient culinary traditions that feed the body and bring peace to the mind.
            </p>
          </div>
          <div className="rounded-2xl bg-white dark:bg-espresso-900 p-8 border border-cream-200 dark:border-espresso-750 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <span className="text-3xl">🏺</span>
            <h3 className="font-serif text-xl font-bold text-chocolate-900 dark:text-white">Our Vision</h3>
            <p className="text-sm leading-relaxed text-[#5c443c] dark:text-espresso-100">
              To preserve ancestral Indian culinary heritages, keeping traditional vegetarian cooking methods alive for future generations in an atmosphere of royal comfort.
            </p>
          </div>
          <div className="rounded-2xl bg-white dark:bg-espresso-900 p-8 border border-cream-200 dark:border-espresso-750 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <span className="text-3xl">☀️</span>
            <h3 className="font-serif text-xl font-bold text-chocolate-900 dark:text-white">Core Values</h3>
            <p className="text-sm leading-relaxed text-[#5c443c] dark:text-espresso-100">
              Absolute Purity (100% natural, no additives), Ancient Authenticity, Respect for Life (non-violence & full Jain support), and Heartfelt Hospitality.
            </p>
          </div>
        </div>
      </section>

      {/* ==================== OUR TIMELINE SECTION ==================== */}
      <section className="bg-cream-100 dark:bg-espresso-900 py-24 px-4 sm:px-6 transition-colors duration-150">
        <div className="max-w-5xl mx-auto">
          <div className="mb-16 text-center space-y-2">
            <span className="text-xs uppercase tracking-widest text-gold-500 font-semibold">Our Journey</span>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold tracking-wide text-chocolate-900 dark:text-white">
              The Heritage Timeline
            </h2>
            <div className="h-[2px] w-20 bg-gold-500 mx-auto" />
          </div>

          {/* Timeline Wrapper */}
          <div className="relative border-l border-cream-200 dark:border-espresso-700 ml-4 sm:ml-32 pl-8 sm:pl-12 space-y-12">
            {timelineEvents.map((event, idx) => (
              <div key={idx} className="relative group">
                {/* Year tag left aligned on desktops */}
                <div className="absolute -left-[45px] sm:-left-[185px] top-0.5 text-center hidden sm:block w-32">
                  <span className="font-serif text-2xl font-bold text-gold-500 group-hover:scale-105 inline-block transition-transform">
                    {event.year}
                  </span>
                </div>

                {/* Dot indicator */}
                <div className="absolute -left-[41px] sm:-left-[57px] top-2 h-4 w-4 rounded-full bg-gold-500 border-4 border-cream-100 dark:border-espresso-900 group-hover:scale-125 transition-transform" />

                {/* Mobile Year Badge */}
                <span className="font-serif text-lg font-bold text-gold-500 block sm:hidden mb-1">
                  {event.year}
                </span>

                <div className="rounded-2xl bg-white dark:bg-espresso-800 p-6 border border-cream-200 dark:border-espresso-700 shadow-sm group-hover:shadow-md transition-shadow">
                  <h3 className="font-serif text-xl font-bold text-chocolate-900 dark:text-white mb-2">
                    {event.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-chocolate-800 dark:text-espresso-100">
                    {event.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== OWNER SECTION ==================== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          
          {/* Portrait Container with Gold frame effect */}
          <div className="relative max-w-md mx-auto lg:mx-0">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-500 translate-x-4 translate-y-4" />
            <div className="relative z-10 overflow-hidden rounded-2xl border-4 border-white dark:border-[#120b08] shadow-2xl">
              <img
                src="/ambika-pure-veg-img6.jpg"
                alt="Chef Raghavan, Founder"
                className="w-full h-[500px] object-cover object-center transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>

          {/* Biography Block */}
          <div className="space-y-6">
            <span className="text-xs uppercase tracking-widest text-gold-500 font-semibold">The Master Chef</span>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold tracking-wide text-chocolate-900 dark:text-white">
              Chef Raghavan
            </h2>
            <div className="h-[2px] w-20 bg-gold-500" />

            <div className="relative bg-cream-100 dark:bg-espresso-900 p-6 rounded-2xl border-l-4 border-gold-500 italic text-chocolate-850 dark:text-espresso-100 text-base leading-relaxed">
              <span className="absolute top-2 left-2 text-5xl text-gold-500/25 font-serif">“</span>
              <p className="relative z-10 pl-4">
                Cooking is not just the assembly of ingredients. It is a sacred art, a devotion to health, and a pure offering to the divine spark in every guest who graces our tables.
              </p>
            </div>

            <p className="text-sm leading-relaxed text-chocolate-800 dark:text-espresso-100/85">
              For over thirty-five years, Chef Raghavan travelled the subcontinental hinterlands, learning the secret spice blends of rural grandmothers and the culinary disciplines of royal temples. At Ambika, he applies these ancestral techniques with modern precision, personally overseeing the spice grinding every single morning.
            </p>
            <p className="text-sm leading-relaxed text-chocolate-800 dark:text-espresso-100/85">
              Under his guidance, our kitchen preserves ancient secrets of ayurvedic cooking—ensuring that every meal is not just delicious but deeply nourishing and easy to digest.
            </p>
          </div>

        </div>
      </section>

      {/* ==================== SPECIALITIES SECTION ==================== */}
      <section id="specialities" className="bg-cream-100 dark:bg-espresso-900 py-24 px-4 sm:px-6 transition-colors duration-150">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 text-center space-y-2">
            <span className="text-xs uppercase tracking-widest text-gold-500 font-semibold">Culinary Highlights</span>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold tracking-wide text-chocolate-900 dark:text-white">
              Our House Specialities
            </h2>
            <div className="h-[2px] w-20 bg-gold-500 mx-auto" />
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {specialities.map((spec, idx) => (
              <div 
                key={idx} 
                className="group rounded-2xl bg-white dark:bg-[#1c120e] p-8 border border-cream-200 dark:border-espresso-750 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-cream-50 dark:bg-[#1c120e] text-3xl shadow-inner group-hover:scale-110 transition-transform">
                  {spec.icon}
                </div>
                <h3 className="font-serif text-xl font-bold text-chocolate-900 dark:text-white mb-2">
                  {spec.title}
                </h3>
                <p className="text-sm leading-relaxed text-[#5c443c] dark:text-espresso-100">
                  {spec.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== AMBIENCE GALLERY SECTION ==================== */}
      <section id="ambience" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-16 text-center space-y-2">
          <span className="text-xs uppercase tracking-widest text-gold-500 font-semibold">Visual Sanctuary</span>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold tracking-wide text-chocolate-900 dark:text-white">
            Our Ambience & Gallery
          </h2>
          <div className="h-[2px] w-20 bg-gold-500 mx-auto" />
        </div>

        {/* Gallery Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {galleryImages.map((img, idx) => (
            <div 
              key={idx} 
              className="relative overflow-hidden rounded-2xl group shadow-md"
            >
              {/* Image */}
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-72 object-cover object-center transition-transform duration-700 group-hover:scale-110"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-[#120b08]/85 opacity-0 group-hover:opacity-100 flex items-center justify-center p-6 text-center transition-opacity duration-300 z-20">
                <div>
                  <h4 className="font-serif text-lg font-bold text-gold-400">{img.alt}</h4>
                  <p className="text-xs text-stone-300 mt-2 uppercase tracking-widest">Ambika Pure Veg</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== WHY CHOOSE US ==================== */}
      <section className="bg-cream-100 dark:bg-espresso-900 py-24 px-4 sm:px-6 transition-colors duration-150">
        <div className="max-w-7xl mx-auto grid gap-12 lg:grid-cols-2 items-center">
          
          {/* Left Text Block */}
          <div className="space-y-6">
            <span className="text-xs uppercase tracking-widest text-gold-500 font-semibold">Unmatched Excellence</span>
            <h2 className="font-serif text-4xl sm:text-5xl font-bold tracking-wide text-chocolate-900 dark:text-white">
              Why Dining at Ambika is Sacred
            </h2>
            <div className="h-[2px] w-20 bg-gold-500" />
            <p className="text-sm sm:text-base leading-relaxed text-chocolate-800 dark:text-espresso-100">
              We treat guest hospitality as a devotional pathway, ensuring every element of ingredients, hygiene, atmosphere, and service is curated with strict integrity.
            </p>
            <div className="grid gap-6 sm:grid-cols-2 pt-4">
              {strengths.map((str, idx) => (
                <div key={idx} className="space-y-1">
                  <h4 className="font-serif text-lg font-bold text-chocolate-900 dark:text-white flex items-center gap-2">
                    <span className="text-gold-500">✦</span> {str.title}
                  </h4>
                  <p className="text-xs text-chocolate-700 dark:text-espresso-100/70 leading-relaxed">
                    {str.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Image with borders */}
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-500 translate-x-4 -translate-y-4" />
            <img
              src="/ambika-pure-veg-img5.avif"
              alt="Ambika Dining Interior"
              className="relative z-10 w-full h-[400px] object-cover rounded-2xl shadow-2xl"
            />
          </div>

        </div>
      </section>

      {/* ==================== TESTIMONIALS SECTION ==================== */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-16 text-center space-y-2">
          <span className="text-xs uppercase tracking-widest text-gold-500 font-semibold">Voices of Delight</span>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold tracking-wide text-chocolate-900 dark:text-white">
            Guest Testimonials
          </h2>
          <div className="h-[2px] w-20 bg-gold-500 mx-auto" />
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {testimonials.map((test, idx) => (
            <div 
              key={idx}
              className="rounded-2xl bg-white dark:bg-[#1c120e] p-8 border border-cream-200 dark:border-espresso-750 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="space-y-4">
                {/* Gold Stars */}
                <div className="flex text-gold-500">
                  {Array.from({ length: test.rating }).map((_, i) => (
                    <span key={i} className="text-lg">★</span>
                  ))}
                </div>
                <p className="text-sm leading-relaxed italic text-chocolate-850 dark:text-espresso-100">
                  “{test.review}”
                </p>
              </div>
              <div className="border-t border-cream-50 dark:border-[#271a15] pt-4 mt-6">
                <p className="font-serif font-bold text-chocolate-900 dark:text-white">{test.name}</p>
                <p className="text-xs text-chocolate-700 dark:text-espresso-100/70">{test.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== RESERVATION CTA SECTION ==================== */}
      <section id="booking" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden flex items-center justify-center">
        {/* Background Image with Dark Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('/ambika-pure-veg-img3.avif')` }}
        />
        <div className="absolute inset-0 bg-[#120b08]/85" />

        {/* Content Container */}
        <div className="relative z-10 mx-auto max-w-lg w-full">
          <div className="rounded-3xl bg-cream-50 dark:bg-espresso-900 p-8 sm:p-10 shadow-2xl border border-cream-200 dark:border-espresso-700 text-chocolate-900 dark:text-espresso-50 transition-colors duration-150">
            
            <div className="text-center mb-6 space-y-2">
              <span className="text-xs uppercase tracking-widest text-gold-500 font-semibold">Reserve A Table</span>
              <h3 className="font-serif text-3xl font-bold tracking-wide">Table Reservations</h3>
              <div className="h-[2px] w-12 bg-gold-500 mx-auto" />
            </div>

            <p className="text-center text-sm text-chocolate-850 dark:text-espresso-100/80 mb-6 leading-relaxed">
              Connect with our dining hosts directly via phone call or WhatsApp messaging to secure your premium table arrangements.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6 text-center text-xs">
              <a
                href="tel:7738638937"
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-cream-100 dark:bg-espresso-800 border border-cream-200 dark:border-espresso-750 py-4 text-chocolate-900 dark:text-espresso-50 font-bold uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                📞 Call Host: 7738638937
              </a>
              <a
                href="https://api.whatsapp.com/send/?phone=917738638937&text&type=phone_number&app_absent=0"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-green-600 hover:bg-green-700 py-4 text-white font-bold uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all shadow-md cursor-pointer"
              >
                💬 WhatsApp Book
              </a>
            </div>

            <div className="mt-8 border-t border-cream-100 dark:border-espresso-800/80 pt-6 text-center">
              <p className="text-xs text-chocolate-700 dark:text-espresso-100/70">Prefer to order to your table directly?</p>
              <Link
                to="/customer"
                className="mt-2 inline-block text-xs font-bold uppercase tracking-wider text-gold-500 hover:text-gold-600 transition-colors"
              >
                ⚡ Start Online Table Order →
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}

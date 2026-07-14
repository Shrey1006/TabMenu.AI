import { Link } from "react-router-dom";
import FeatureCard from "../components/FeatureCard";
import DashboardCard from "../components/DashboardCard";
import StatCard from "../components/StatCard";
import BenefitCard from "../components/BenefitCard";
import Footer from "../components/Footer";

const keyMetrics = [
  {
    value: "90s",
    label: "Average Wait Time Reduction",
    description: "Per order through real-time synchronization",
    icon: "⏱️",
  },
  {
    value: "40%",
    label: "Faster Issue Detection",
    description: "Before customers leave their tables",
    icon: "🎯",
  },
  {
    value: "4",
    label: "Unified Operational Roles",
    description: "Perfectly orchestrated dashboards",
    icon: "👥",
  },
];

const coreFeatures = [
  {
    id: "routing",
    icon: "🔐",
    badge: "Security & Routing",
    title: "Cryptographic QR Table Mappings",
    description:
      "Every table at Ambika Pure Veg receives a uniquely signed cryptographic QR token that anchors the entire guest experience to their physical location.",
    points: [
      {
        label: "Secure Location Binding",
        desc: "Cryptographically verified QR codes eliminate table mix-ups",
      },
      {
        label: "Role-Based Routing",
        desc: "Automatically multiplexes to correct dashboard (Customer/Kitchen/Waiter/Admin)",
      },
      {
        label: "Session Integrity",
        desc: "Tamper-proof session tokens prevent order fraud",
      },
      {
        label: "Scalable Architecture",
        desc: "Supports unlimited concurrent table sessions",
      },
    ],
    highlight: true,
  },
  {
    id: "socket",
    icon: "⚡",
    badge: "Real-Time Communication",
    title: "Real-Time Socket.io Pipeline",
    description:
      "Persistent bidirectional WebSocket communication ensures millisecond-level latency across all kitchen, table, and staff touchpoints.",
    points: [
      {
        label: "Sub-100ms Latency",
        desc: "Bidirectional event dispatch across entire restaurant",
      },
      {
        label: "Zero Dropped Orders",
        desc: "Persistent connections with automatic reconnection",
      },
      {
        label: "Live Kitchen Updates",
        desc: "Instant prep status propagation to waitstaff",
      },
      {
        label: "Queue Management",
        desc: "Dynamic priority-based order sequencing",
      },
    ],
  },
  {
    id: "ai",
    icon: "🤖",
    badge: "AI & Analytics",
    title: "AI-Powered Customer Sentiment Engine",
    description:
      "PyTorch-based NLP classifier instantly analyzes guest feedback, flagging service bottlenecks and kitchen issues in real-time.",
    points: [
      {
        label: "Real-Time Sentiment Analysis",
        desc: "Identifies negative feedback before customer departs",
      },
      {
        label: "Bottleneck Detection",
        desc: "40% faster identification of service or kitchen issues",
      },
      {
        label: "Actionable Alerts",
        desc: "Instant notification to management dashboards",
      },
      {
        label: "Brand Protection",
        desc: "Proactive issue resolution boosts customer satisfaction",
      },
    ],
  },
];

const dashboards = [
  {
    title: "Customer Portal",
    icon: "📱",
    description: "Seamless contactless ordering experience",
    path: "/customer",
    color: "border-brand-200 bg-brand-50 dark:border-brand-900/60 dark:bg-brand-950/20",
    textColor: "text-brand-800 dark:text-brand-400",
    features: [
      "Browse pure-vegetarian menu with images",
      "Filter by dietary preferences & allergies",
      "Customize dishes in real-time",
      "Live order status tracking",
      "Digital feedback submission",
    ],
  },
  {
    title: "Kitchen Display System",
    icon: "👨‍🍳",
    description: "Optimize food preparation workflow",
    path: "/kitchen",
    color: "border-orange-200 bg-orange-50 dark:border-orange-900/60 dark:bg-orange-950/20",
    textColor: "text-orange-850 dark:text-orange-400",
    features: [
      "Priority-ordered ticket queue",
      "Live preparation timers",
      "Ingredient availability alerts",
      "Order fulfillment status",
      "Peak rush management tools",
    ],
  },
  {
    title: "Waiter Interface",
    icon: "💼",
    description: "Instant service alerts & coordination",
    path: "/waiter",
    color: "border-blue-200 bg-blue-50 dark:border-blue-900/60 dark:bg-blue-950/20",
    textColor: "text-blue-800 dark:text-blue-400",
    features: [
      "Ready-to-serve food alerts",
      "Table assignment mapping",
      "Customer request notifications",
      "Service speed optimization",
      "Guest communication tools",
    ],
  },
  {
    title: "Admin Dashboard",
    icon: "📊",
    description: "Real-time operational intelligence",
    path: "/admin",
    color: "border-purple-200 bg-purple-50 dark:border-purple-900/60 dark:bg-purple-950/20",
    textColor: "text-purple-800 dark:text-purple-400",
    features: [
      "Floor-wide analytics overview",
      "Table turnover metrics",
      "Staff performance tracking",
      "Revenue & order analytics",
      "Sentiment trend monitoring",
    ],
  },
];

const businessBenefits = [
  {
    number: "1",
    title: "Maximize Table Turnover",
    description:
      "Real-time order processing and kitchen synchronization dramatically reduce time between customer departure and table reset, enabling 15-20% more covers per service.",
    metric: "+18% Revenue",
  },
  {
    number: "2",
    title: "Optimize Staff Deployment",
    description:
      "Intelligent alerts and priority systems eliminate wait times for staff. Waiters spend more time delivering excellent service, less time searching for order status.",
    metric: "30% Efficiency Gain",
  },
  {
    number: "3",
    title: "Capture Automated Insights",
    description:
      "AI sentiment analysis provides actionable, real-time feedback on service quality and kitchen performance, enabling immediate corrective action before negative reviews.",
    metric: "40% Issue Detection",
  },
  {
    number: "4",
    title: "Eliminate Order Confusion",
    description:
      "Cryptographic table routing and real-time synchronization completely eliminate order mix-ups, reducing remakes and customer dissatisfaction to near-zero levels.",
    metric: "99.9% Accuracy",
  },
  {
    number: "5",
    title: "Reduce Customer Wait Times",
    description:
      "From menu browsing to order delivery, customers experience frictionless, contactless service. Average wait time reduction of 90 seconds per order cycle.",
    metric: "-90 Seconds",
  },
  {
    number: "6",
    title: "Protect Brand Reputation",
    description:
      "Proactive issue detection and instant resolution prevent negative experiences from becoming negative reviews. Improve online ratings and customer retention.",
    metric: "↑ NPS Score",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 via-white to-warm-50 dark:from-brand-950/20 dark:via-stone-950 dark:to-stone-900 transition-colors duration-150">
      {/* ==================== HERO SECTION ==================== */}
      <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-7xl">
          {/* Logo Section */}
          <div className="mb-8 flex justify-center">
            <img
              src="/logo.png"
              alt="Ambika Pure Veg Logo"
              className="h-24 w-24 rounded-full object-cover shadow-lg ring-4 ring-brand-200 dark:ring-brand-900"
            />
          </div>

          {/* Main Headline & Subheadline */}
          <div className="text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-brand-600 dark:text-brand-400">
              Smart Restaurant Operations Platform
            </p>

            <h1 className="text-5xl font-extrabold tracking-tight text-stone-900 dark:text-white sm:text-6xl lg:text-7xl">
              Maximize Table Turnover.
              <br />
              <span className="text-brand-700 dark:text-brand-400">Optimize Operations.</span>
              <br />
              <span className="text-warm-600 dark:text-warm-450">Delight Guests.</span>
            </h1>

            <p className="mx-auto mt-8 max-w-3xl text-xl leading-relaxed text-stone-600 dark:text-stone-300">
              Transform Ambika Pure Veg into a frictionless dining experience
              with cryptographic table routing, real-time kitchen
              synchronization, and AI-powered guest insights. Reduce customer
              wait times by 90 seconds. Detect service issues 40% faster. Scale
              operational efficiency without hiring more staff.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                to="/customer"
                className="rounded-xl bg-brand-600 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-brand-200 transition hover:bg-brand-700 hover:shadow-xl dark:shadow-none"
              >
                Open Customer Portal
              </Link>
              <Link
                to="/roi"
                className="rounded-xl border-2 border-brand-300 bg-white px-8 py-4 text-lg font-semibold text-brand-700 transition hover:bg-brand-50 dark:border-brand-800 dark:bg-stone-900 dark:text-brand-400 dark:hover:bg-stone-850"
              >
                Calculate ROI
              </Link>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="mt-16 grid gap-6 sm:grid-cols-3">
            {keyMetrics.map((stat) => (
              <StatCard
                key={stat.label}
                value={stat.value}
                label={stat.label}
                description={stat.description}
                icon={stat.icon}
              />
            ))}
          </div>

          {/* Visual Representation Area */}
          <div className="mt-16 rounded-3xl border-2 border-dashed border-brand-300 bg-gradient-to-b from-brand-50 to-white p-12 dark:border-brand-800 dark:from-brand-950/20 dark:to-stone-900">
            <div className="text-center">
              <p className="mb-6 text-sm font-medium text-stone-600 dark:text-stone-300">
                ✨ Synchronized Multi-Role Dashboard Ecosystem
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {dashboards.map((dashboard) => (
                  <div
                    key={dashboard.title}
                    className="animate-pulse-ring rounded-full bg-brand-600 px-5 py-3 text-xs font-bold text-white shadow-lg"
                  >
                    {dashboard.icon} {dashboard.title}
                  </div>
                ))}
              </div>
              <p className="mt-8 text-xs text-stone-500 dark:text-stone-400">
                Powered by Cryptographic QR Tokens • Socket.io Real-Time
                Pipelines • PyTorch AI Sentiment Engine
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CORE FEATURES SECTION ==================== */}
      <section id="features" className="bg-white dark:bg-stone-950 px-4 py-20 sm:px-6 transition-colors duration-150">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-bold text-stone-900 dark:text-stone-100">
              The Technical Foundation
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-stone-600 dark:text-stone-400">
              Three pillars of operational excellence, proven to transform
              high-volume restaurant management
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {coreFeatures.map((feature) => (
              <FeatureCard
                key={feature.id}
                icon={feature.icon}
                badge={feature.badge}
                title={feature.title}
                description={feature.description}
                points={feature.points}
                highlight={feature.highlight}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ==================== 4 OPERATIONAL DASHBOARDS SECTION ==================== */}
      <section
        id="roles"
        className="bg-gradient-to-b from-stone-50 to-white dark:from-stone-900 dark:to-stone-950 px-4 py-20 sm:px-6 transition-colors duration-150"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-bold text-stone-900 dark:text-stone-100">
              Four Unified Dashboards
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-stone-600 dark:text-stone-400">
              Each role experiences a perfectly orchestrated interface, powered
              by shared real-time data and cryptographic routing
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {dashboards.map((dashboard) => (
              <DashboardCard
                key={dashboard.title}
                title={dashboard.title}
                icon={dashboard.icon}
                description={dashboard.description}
                features={dashboard.features}
                path={dashboard.path}
                color={dashboard.color}
                textColor={dashboard.textColor}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ==================== BUSINESS BENEFITS SECTION ==================== */}
      <section id="benefits" className="bg-white dark:bg-stone-950 px-4 py-20 sm:px-6 transition-colors duration-150">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-bold text-stone-900 dark:text-stone-100">
              Business Impact & ROI
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-stone-600 dark:text-stone-400">
              Concrete operational improvements that directly impact your bottom
              line
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {businessBenefits.map((benefit) => (
              <BenefitCard
                key={benefit.number}
                number={benefit.number}
                title={benefit.title}
                description={benefit.description}
                metric={benefit.metric}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ==================== TECHNICAL ARCHITECTURE SECTION ==================== */}
      {/* ==================== TECHNICAL ARCHITECTURE SECTION ==================== */}
      <section className="bg-gradient-to-b from-stone-50 to-white dark:from-stone-900 dark:to-stone-950 px-4 py-20 sm:px-6 transition-colors duration-150">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border-2 border-brand-300 bg-gradient-to-r from-brand-50 to-warm-50 dark:border-brand-800 dark:from-brand-950/20 dark:to-stone-900 p-12">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
              {/* Left Content */}
              <div>
                <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-100">
                  Enterprise-Grade Architecture
                </h2>
                <p className="mt-4 leading-relaxed text-stone-600 dark:text-stone-300">
                  Built from the ground up for high-volume, fast-paced
                  restaurant environments. Our stack combines cutting-edge
                  security, real-time responsiveness, and intelligent
                  automation.
                </p>

                <div className="mt-8 space-y-4">
                  <div className="rounded-lg bg-white dark:bg-stone-900 p-4 shadow-sm">
                    <h4 className="font-bold text-stone-900 dark:text-stone-100">
                      🔐 Security Layer
                    </h4>
                    <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                      Cryptographic token validation, end-to-end encryption, and
                      role-based access control
                    </p>
                  </div>
                  <div className="rounded-lg bg-white dark:bg-stone-900 p-4 shadow-sm">
                    <h4 className="font-bold text-stone-900 dark:text-stone-100">
                      ⚡ Real-Time Layer
                    </h4>
                    <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                      Socket.io bidirectional pipelines with sub-100ms latency
                      across all nodes
                    </p>
                  </div>
                  <div className="rounded-lg bg-white dark:bg-stone-900 p-4 shadow-sm">
                    <h4 className="font-bold text-stone-900 dark:text-stone-100">
                      🤖 Intelligence Layer
                    </h4>
                    <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                      PyTorch NLP models for sentiment analysis and automated
                      issue detection
                    </p>
                  </div>
                  <div className="rounded-lg bg-white dark:bg-stone-900 p-4 shadow-sm">
                    <h4 className="font-bold text-stone-900 dark:text-stone-100">
                      📊 Analytics Layer
                    </h4>
                    <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                      Real-time dashboards with operational KPIs, revenue
                      tracking, and performance metrics
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Content - Tech Stack */}
              <div>
                <h3 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                  Modern Tech Stack
                </h3>

                <div className="mt-8 space-y-4">
                  <div className="rounded-xl bg-white dark:bg-stone-900 p-6 shadow-sm">
                    <h4 className="font-bold text-brand-700 dark:text-brand-400">Frontend</h4>
                    <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                      React 19 with Tailwind CSS for responsive, accessible
                      interfaces
                    </p>
                  </div>
                  <div className="rounded-xl bg-white dark:bg-stone-900 p-6 shadow-sm">
                    <h4 className="font-bold text-brand-700 dark:text-brand-400">Backend</h4>
                    <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                      Node.js/Express with persistent Socket.io connections
                    </p>
                  </div>
                  <div className="rounded-xl bg-white dark:bg-stone-900 p-6 shadow-sm">
                    <h4 className="font-bold text-brand-700 dark:text-brand-400">Database</h4>
                    <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                      MongoDB for flexible, scalable document storage
                    </p>
                  </div>
                  <div className="rounded-xl bg-white dark:bg-stone-900 p-6 shadow-sm">
                    <h4 className="font-bold text-brand-700 dark:text-brand-400">AI/ML</h4>
                    <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                      PyTorch sentiment analysis pipeline for real-time feedback
                      processing
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== IMPLEMENTATION TIMELINE SECTION ==================== */}
      <section className="bg-white dark:bg-stone-950 px-4 py-20 sm:px-6 transition-colors duration-150">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-bold text-stone-900 dark:text-stone-100">
              Ready to Transform Your Operations?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-stone-600 dark:text-stone-400">
              Get started with a personalized demo and ROI analysis for Ambika
              Pure Veg
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm dark:border-stone-850 dark:bg-stone-900">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-950/65 text-2xl">
                📋
              </span>
              <h3 className="mt-4 text-xl font-bold text-stone-900 dark:text-stone-100">
                Schedule Demo
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                Experience all four dashboards with live data showcasing real
                restaurant operations
              </p>
              <Link
                to="/login"
                className="mt-4 inline-block font-semibold text-brand-700 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300"
              >
                Book Now →
              </Link>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm dark:border-stone-850 dark:bg-stone-900">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-950/65 text-2xl">
                💰
              </span>
              <h3 className="mt-4 text-xl font-bold text-stone-900 dark:text-stone-100">
                Calculate ROI
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                Input your metrics and see projected revenue impact, cost
                savings, and payback period
              </p>
              <Link
                to="/roi"
                className="mt-4 inline-block font-semibold text-brand-700 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300"
              >
                Calculate →
              </Link>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm dark:border-stone-850 dark:bg-stone-900">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-950/65 text-2xl">
                💬
              </span>
              <h3 className="mt-4 text-xl font-bold text-stone-900 dark:text-stone-100">
                Get Support
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-stone-600 dark:text-stone-300">
                Dedicated onboarding team ensures smooth implementation and
                staff training
              </p>
              <a
                href="mailto:support@ambikarestaurant.com"
                className="mt-4 inline-block font-semibold text-brand-700 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300"
              >
                Contact Us →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== CLOSING CTA SECTION ==================== */}
      <section className="bg-gradient-to-r from-brand-700 to-brand-800 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-white">
            Stop Leaving Money on the Table
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-brand-100">
            Every minute of wasted customer time is lost revenue. Every order
            mix-up is a damaged reputation. Every service bottleneck is a missed
            opportunity to impress. The Ambika Pure Veg Smart Platform
            eliminates all three.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/login"
              className="rounded-xl bg-white px-8 py-4 font-semibold text-brand-700 shadow-lg transition hover:shadow-xl hover:scale-105"
            >
              Staff Login
            </Link>
            <Link
              to="/roi"
              className="rounded-xl border-2 border-white bg-transparent px-8 py-4 font-semibold text-white transition hover:bg-white hover:text-brand-700"
            >
              See Your ROI
            </Link>
          </div>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <Footer />
    </div>
  );
}

import { useState } from 'react';

export default function ROICalculator() {
  const [tables, setTables] = useState(12);
  const [dailyCovers, setDailyCovers] = useState(200);
  const [avgTicket, setAvgTicket] = useState(450);
  const [turnsPerDay, setTurnsPerDay] = useState(3);

  const waitReductionSec = 90;
  const extraTurns = Math.floor((waitReductionSec * dailyCovers) / (45 * 60));
  const newTurns = turnsPerDay + extraTurns / tables;
  const monthlyRevenue = dailyCovers * avgTicket * 30;
  const upliftRevenue = extraTurns * avgTicket * 30;
  const issueSavings = monthlyRevenue * 0.04;
  const platformCost = tables * 500;
  const netBenefit = upliftRevenue + issueSavings - platformCost;
  const roi = platformCost > 0 ? Math.round((netBenefit / platformCost) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-warm-50 to-white px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <img src="/logo.png" alt="Logo" className="mx-auto h-16 w-16 rounded-full ring-2 ring-brand-200" />
          <h1 className="mt-4 text-3xl font-bold text-stone-900">Business ROI Calculator</h1>
          <p className="mt-2 text-stone-600">
            Model projected returns from 90s wait-time reduction and 40% issue detection boost at Ambika Pure Veg.
          </p>
        </div>

        <div className="mt-10 space-y-6 rounded-2xl border border-stone-200 bg-white p-8 shadow-sm">
          {[
            { label: 'Number of Tables', value: tables, set: setTables, min: 4, max: 50 },
            { label: 'Daily Covers', value: dailyCovers, set: setDailyCovers, min: 50, max: 1000 },
            { label: 'Average Ticket (₹)', value: avgTicket, set: setAvgTicket, min: 200, max: 2000 },
            { label: 'Table Turns / Day', value: turnsPerDay, set: setTurnsPerDay, min: 1, max: 8 },
          ].map((f) => (
            <div key={f.label}>
              <div className="flex justify-between text-sm font-medium">
                <span>{f.label}</span>
                <span className="text-brand-700">{f.value}</span>
              </div>
              <input
                type="range"
                min={f.min}
                max={f.max}
                value={f.value}
                onChange={(e) => f.set(Number(e.target.value))}
                className="mt-2 w-full accent-brand-600"
              />
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-brand-50 p-5">
            <p className="text-sm text-stone-500">Extra Table Turns / Month</p>
            <p className="text-2xl font-bold text-brand-800">+{Math.round(extraTurns * 30)}</p>
          </div>
          <div className="rounded-xl bg-brand-50 p-5">
            <p className="text-sm text-stone-500">Revenue Uplift / Month</p>
            <p className="text-2xl font-bold text-brand-800">₹{upliftRevenue.toLocaleString('en-IN')}</p>
          </div>
          <div className="rounded-xl bg-warm-50 p-5">
            <p className="text-sm text-stone-500">Issue Prevention Savings</p>
            <p className="text-2xl font-bold text-warm-600">₹{Math.round(issueSavings).toLocaleString('en-IN')}</p>
          </div>
          <div className="rounded-xl bg-stone-900 p-5 text-white">
            <p className="text-sm text-stone-300">Projected ROI</p>
            <p className="text-2xl font-bold">{roi}%</p>
            <p className="mt-1 text-xs text-stone-400">Net benefit: ₹{Math.round(netBenefit).toLocaleString('en-IN')}/mo</p>
          </div>
        </div>
      </div>
    </div>
  );
}

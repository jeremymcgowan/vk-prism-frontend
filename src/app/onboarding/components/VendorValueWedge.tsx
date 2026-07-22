'use client';

interface VendorValueWedgeProps {
  vendorName: string;
  data: { satisfaction: string; costPerception: string };
  onChange: (field: 'satisfaction' | 'costPerception', value: string) => void;
}

export default function VendorValueWedge({ vendorName, data, onChange }: VendorValueWedgeProps) {
  if (!vendorName || vendorName === 'NONE' || vendorName === 'UNKNOWN') return null;

  return (
    <div className="mt-3 p-4 bg-slate-950/90 border border-slate-800 rounded-xl space-y-3 animate-fade-in shadow-inner">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
          💡 {vendorName} Spend & Delivery Audit
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Service Satisfaction */}
        <div>
          <label className="block text-slate-400 mb-1.5 font-medium">Service Satisfaction</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'GREAT', label: '🟢 Great', color: 'bg-emerald-500/20 border-emerald-500 text-emerald-300' },
              { id: 'MEH', label: '🟡 Meh', color: 'bg-amber-500/20 border-amber-500 text-amber-300' },
              { id: 'UNHAPPY', label: '🔴 Unhappy', color: 'bg-rose-500/20 border-rose-500 text-rose-300' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange('satisfaction', item.id)}
                className={`py-2 px-1 rounded-lg border text-center transition-all ${
                  data.satisfaction === item.id
                    ? `${item.color} font-semibold`
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing Confidence */}
        <div>
          <label className="block text-slate-400 mb-1.5 font-medium">Pricing Confidence</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'FAIR', label: '🟢 Fair', color: 'bg-emerald-500/20 border-emerald-500 text-emerald-300' },
              { id: 'OVERPAYING', label: '🔴 High', color: 'bg-rose-500/20 border-rose-500 text-rose-300' },
              { id: 'UNSURE', label: '🟡 Unsure', color: 'bg-amber-500/20 border-amber-500 text-amber-300' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange('costPerception', item.id)}
                className={`py-2 px-1 rounded-lg border text-center transition-all ${
                  data.costPerception === item.id
                    ? `${item.color} font-semibold`
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
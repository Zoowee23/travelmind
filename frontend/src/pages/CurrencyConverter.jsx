import { useState, useEffect } from "react";
import { convertCurrency, getAllRates } from "../services/api";
import toast from "react-hot-toast";
import { ArrowLeftRight, TrendingUp, RefreshCw } from "lucide-react";
import currencyBg from "../assets/destinations/currency-bg.jpg";

const CURRENCIES = [
  { code: "USD", name: "US Dollar", symbol: "$", flag: "🇺🇸" },
  { code: "EUR", name: "Euro", symbol: "€", flag: "🇪🇺" },
  { code: "GBP", name: "British Pound", symbol: "£", flag: "🇬🇧" },
  { code: "INR", name: "Indian Rupee", symbol: "₹", flag: "🇮🇳" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥", flag: "🇯🇵" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ", flag: "🇦🇪" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", flag: "🇦🇺" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$", flag: "🇨🇦" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$", flag: "🇸🇬" },
  { code: "CHF", name: "Swiss Franc", symbol: "Fr", flag: "🇨🇭" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥", flag: "🇨🇳" },
  { code: "MYR", name: "Malaysian Ringgit", symbol: "RM", flag: "🇲🇾" },
  { code: "THB", name: "Thai Baht", symbol: "฿", flag: "🇹🇭" },
  { code: "IDR", name: "Indonesian Rupiah", symbol: "Rp", flag: "🇮🇩" },
  { code: "KRW", name: "South Korean Won", symbol: "₩", flag: "🇰🇷" },
  { code: "TRY", name: "Turkish Lira", symbol: "₺", flag: "🇹🇷" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$", flag: "🇧🇷" },
  { code: "ZAR", name: "South African Rand", symbol: "R", flag: "🇿🇦" },
  { code: "MXN", name: "Mexican Peso", symbol: "$", flag: "🇲🇽" },
  { code: "SEK", name: "Swedish Krona", symbol: "kr", flag: "🇸🇪" },
];

// Popular travel destination currencies to show in the multi-converter
const TRAVEL_CURRENCIES = ["EUR", "GBP", "JPY", "AED", "AUD", "SGD", "THB", "IDR", "TRY", "MYR"];

export default function CurrencyConverter() {
  const [amount, setAmount] = useState("1000");
  const [from, setFrom] = useState("INR");
  const [to, setTo] = useState("EUR");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allRates, setAllRates] = useState(null);
  const [ratesLoading, setRatesLoading] = useState(false);

  const handleConvert = async () => {
    if (!amount || isNaN(amount)) return toast.error("Enter a valid amount");
    setLoading(true);
    try {
      const res = await convertCurrency(parseFloat(amount), from, to);
      setResult(res.data);
    } catch {
      toast.error("Conversion failed — check your connection");
    } finally {
      setLoading(false);
    }
  };

  const loadAllRates = async () => {
    setRatesLoading(true);
    try {
      const res = await getAllRates(from);
      setAllRates(res.data);
    } catch {
      toast.error("Failed to load rates");
    } finally {
      setRatesLoading(false);
    }
  };

  useEffect(() => { loadAllRates(); }, [from]);

  const swap = () => { setFrom(to); setTo(from); setResult(null); };

  const getCurrency = (code) => CURRENCIES.find((c) => c.code === code) || { code, symbol: code, flag: "🌍" };
  const fromC = getCurrency(from);
  const toC = getCurrency(to);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 page-enter">
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden mb-8 shadow-xl text-white" style={{ height: 160 }}>
        <img src={currencyBg} alt="Currency"
          className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 to-teal-900/80" />
        <div className="relative z-10 p-8 flex items-end h-full">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><ArrowLeftRight size={22} />Currency Converter</h1>
            <p className="text-green-100 text-sm mt-1">Live rates · Plan your international budget</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main converter */}
        <div className="card space-y-4">

          <div>
            <label className="label">Amount</label>
            <input
              type="number"
              className="input text-lg font-semibold"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="0"
            />
          </div>

          <div className="grid grid-cols-5 gap-2 items-end">
            <div className="col-span-2">
              <label className="label">From</label>
              <select className="input" value={from} onChange={(e) => setFrom(e.target.value)}>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-center pb-1">
              <button onClick={swap} className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                <ArrowLeftRight size={18} className="text-blue-500" />
              </button>
            </div>
            <div className="col-span-2">
              <label className="label">To</label>
              <select className="input" value={to} onChange={(e) => setTo(e.target.value)}>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.flag} {c.code} — {c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <button onClick={handleConvert} className="btn-primary w-full py-2.5" disabled={loading}>
            {loading ? "Converting..." : "Convert"}
          </button>

          {result && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-gray-500 mb-1">Result</p>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {toC.symbol}{result.converted?.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {fromC.symbol}{parseFloat(amount).toLocaleString()} {from} = {toC.symbol}{result.converted} {to}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                1 {from} = {result.rate} {to}
              </p>
            </div>
          )}
        </div>

        {/* Multi-currency travel view */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <TrendingUp size={16} className="text-orange-500" />
              {amount || "1"} {from} in travel currencies
            </h2>
            <button onClick={loadAllRates} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <RefreshCw size={14} className={ratesLoading ? "animate-spin text-blue-500" : "text-gray-400"} />
            </button>
          </div>

          {ratesLoading ? (
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : allRates ? (
            <div className="space-y-2">
              {TRAVEL_CURRENCIES.filter((c) => c !== from && allRates.rates[c]).map((code) => {
                const rate = allRates.rates[code];
                const converted = (parseFloat(amount || 1) * rate).toFixed(2);
                const curr = getCurrency(code);
                return (
                  <div key={code} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
                    onClick={() => { setTo(code); setResult({ converted: parseFloat(converted), rate }); }}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{curr.flag}</span>
                      <div>
                        <p className="text-sm font-medium">{code}</p>
                        <p className="text-xs text-gray-400">{curr.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">{curr.symbol}{parseFloat(converted).toLocaleString()}</p>
                      <p className="text-xs text-gray-400">1 {from} = {rate.toFixed(4)}</p>
                    </div>
                  </div>
                );
              })}
              <p className="text-xs text-gray-400 text-center pt-1">Rates from {allRates.date} · Frankfurter API</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">Failed to load rates</p>
          )}
        </div>
      </div>

      {/* Budget planning tip */}
      <div className="card mt-6" style={{ background: "color-mix(in srgb, var(--accent) 6%, var(--surface))", borderColor: "color-mix(in srgb, var(--accent) 20%, transparent)" }}>
        <p className="text-sm font-semibold mb-2" style={{ color: "var(--accent)" }}>Budget Planning Tip</p>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          When planning an international trip, always add a 10–15% buffer for unexpected expenses.
          Trip itineraries automatically convert your budget to the destination's local currency
          so all cost estimates are shown in what you'll actually spend.
        </p>
      </div>
    </div>
  );
}

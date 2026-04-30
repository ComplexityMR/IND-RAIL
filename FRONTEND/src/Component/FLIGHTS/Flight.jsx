import { useNavigate } from "react-router-dom";
import { useState } from "react";
// Ensure this path matches your project structure
import AIRLINES from "./components/airlines.jsx";

/* ─── SHIMMER SCREEN ─────────────────────────────────────────────────────── */
const ShimmerScreen = ({ visible }) => (
  <div
    className={`fixed inset-0 z-[9999] bg-[#080808] overflow-hidden transition-opacity duration-300 ${
      visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
    }`}
  >
    {/* Sweep gradient */}
    <div
      className={`absolute inset-0 ${visible ? "animate-shimmer-sweep" : ""}`}
      style={{
        background:
          "linear-gradient(105deg, transparent 30%, rgba(245,158,11,0.12) 50%, transparent 70%)",
        backgroundSize: "250% 100%",
      }}
    />

    {/* Skeleton content — responsive */}
    <div className="max-w-4xl mx-auto pt-16 sm:pt-20 md:pt-24 px-4 sm:px-6 space-y-3 sm:space-y-4">
      <div className="h-8 sm:h-10 md:h-11 w-4/5 rounded-xl bg-white/5 animate-pulse" />
      <div className="h-3 sm:h-4 w-1/2 rounded-lg bg-white/5 animate-pulse" />
      <div className="h-3 sm:h-4 w-2/3 rounded-lg bg-white/5 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 pt-6 sm:pt-8 md:pt-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 sm:h-36 md:h-40 rounded-2xl bg-white/[0.04] animate-pulse" />
        ))}
      </div>
      {/* Extra rows for larger screens */}
      <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 sm:h-12 rounded-xl bg-white/[0.03] animate-pulse" />
        ))}
      </div>
    </div>
  </div>
);

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────── */
const FlightHome = () => {
  const navigate = useNavigate();

  const [flightNumber, setFlightNumber] = useState("");
  const [fromAirport, setFromAirport] = useState("");
  const [toAirport, setToAirport] = useState("");
  const [shimmer, setShimmer] = useState(false);
  const [popup,setpopup]=useState(false);

  /* Helper: show shimmer then navigate */
  const shimmerNavigate = (path, delay = 600) => {
    setShimmer(true);
    setTimeout(() => navigate(path), delay);
  };

  const getICAOPlusFlight = (flightNumber) => {
    const code = flightNumber.trim().toUpperCase();
    if (code.length < 3) return null;
    const iata = code.slice(0, 2);
    const number = code.slice(2);
    const airline = AIRLINES.find(
      (a) => a.IATA && a.IATA.toUpperCase() === iata
    );
    if (!airline) return null;
    return airline.ICAO + number;
  };

  const handlesearchFlight = (flightNumber) => {
    if (!flightNumber.trim()) {
      alert("Please enter a flight number.");
      return;
    }
    const icaoplusnum = getICAOPlusFlight(flightNumber);
    if (!icaoplusnum) {
      alert("Airline not found. Please check your flight number.");
      return;
    }
    shimmerNavigate(`/flights/livestatus/${icaoplusnum}`);
  };

  const handlesearchRoute = () => {
    setpopup(true);
  };

  const swapAirports = () => {
    const temp = fromAirport;
    setFromAirport(toAirport);
    setToAirport(temp);
  };

  return (
    <div className="min-h-screen md:h-screen w-full bg-[#0a0f1a] text-slate-200 font-sans flex flex-col md:overflow-hidden selection:bg-blue-500/30 overflow-y-auto">

      {/* Shimmer overlay */}
      <ShimmerScreen visible={shimmer} />

      {/* 1. Navbar */}
      <nav className="shrink-0 bg-[#0f172a] border-b border-slate-800 px-6 py-2.5 shadow-md z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => shimmerNavigate("/")}
          >
            <img
              className="h-9 w-9 rounded-lg"
              src="https://cdn-icons-png.flaticon.com/128/2200/2200326.png"
              alt="logo"
            />
            <span className="text-xl font-bold tracking-tight text-white">
              TripingBUDDY
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setpopup(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
              Book Flights
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-4 flex flex-col gap-4 min-h-0">

        {/* Header */}
        <div className="text-center relative bottom-2.5 shrink-0">
          <h1 className="text-sm md:text-xl font-bold tracking-tight text-white">
            Welcome to TrippingBuddy
          </h1>
          <p className="text-slate-400 text-sm font-medium mt-1">
            Live tracking • Seamless Search Experience • Elite experiences
          </p>
        </div>

        {/* Live Flight Map Card */}
        <div className="shrink-0 relative bottom-3 bg-emerald-600/20 border border-slate-800 px-3 py-2 rounded-xl flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/10 p-2.5 rounded-lg text-emerald-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" />
              </svg>
            </div>
            <div>
              <h2 className="text-xs md:text-base font-bold flex items-center gap-2 text-white">
                Live Flight Map
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                  Live
                </span>
              </h2>
            </div>
            <p className="text-slate-400 text-xs md:text-sm hidden sm:block">
              (Track global aviation traffic in real-time)
            </p>
          </div>
          <button
            onClick={() => shimmerNavigate("/flight/map")}
            className="bg-green-400/60 hover:bg-slate-700 border border-slate-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm shrink-0"
          >
            View Map
          </button>
        </div>

        {/* 3. Animated Border Box */}
        <div className="shrink-0 relative bottom-4 rounded-[20px] mt-1px p-[1px] animated-border-box shadow-[0_0_40px_rgba(59,130,246,0.15)] flex flex-col">
          <div className="bg-[#0f172a] rounded-[18px] flex flex-col overflow-hidden">

            {/* Section 1: Where is My Flight */}
            <section className="p-4 md:p-4 border-b border-slate-800/60 flex flex-col relative">
              <div className="flex items-center gap-2 mb-2 shrink-0">
                <div className="p-1.5 bg-blue-500/10 rounded-md text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-white">Where is My Flight?</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                <div className="md:col-span-7 relative">
                  <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
                    Flight Number
                  </label>
                  <input
                    type="text"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handlesearchFlight(flightNumber); }}
                    placeholder="e.g., AI101 or 6E534"
                    className="w-full bg-[#1e293b] border border-slate-700 p-3.5 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-500 text-white text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <button
                    onClick={() => handlesearchFlight(flightNumber)}
                    className="ml-[275px] w-full bg-blue-600 hover:bg-blue-500 py-3.5 rounded-lg font-semibold text-sm transition-colors text-white shadow-md active:scale-[0.98]"
                  >
                    Search Flight
                  </button>
                </div>
              </div>
            </section>

            {/* Section 2: Between Airports */}
            <section className="p-4 md:p-4 flex flex-col relative">
              <div className="flex items-center gap-2 mb-3 shrink-0">
                <div className="p-1.5 bg-indigo-500/10 rounded-md text-indigo-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </div>
                <h2 className="text-base font-bold text-white">Find Flights Between Airports</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto] gap-3 items-end relative w-full">
                <div className="relative w-full">
                  <label className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
                    From Airport
                  </label>
                  <input
                    type="text"
                    value={fromAirport}
                    onChange={(e) => setFromAirport(e.target.value)}
                    placeholder="Departure airport"
                    className="w-full bg-[#1e293b] border border-slate-700 p-3.5 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-500 text-white text-sm"
                  />
                </div>

                <div className="flex justify-center pb-1 md:px-1 z-10">
                  <button
                    type="button"
                    onClick={swapAirports}
                    className="p-2.5 rounded-full bg-[#1e293b] hover:bg-slate-700 border border-slate-600 transition-all duration-300 hover:rotate-180 text-white shadow-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </button>
                </div>

                <div className="relative w-full">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
                    To Airport
                  </label>
                  <input
                    type="text"
                    value={toAirport}
                    onChange={(e) => setToAirport(e.target.value)}
                    placeholder="Destination airport"
                    className="w-full bg-[#1e293b] border border-slate-700 p-3.5 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-500 text-white text-sm"
                  />
                </div>

                <div className="w-full md:w-32">
                  <button
                    onClick={handlesearchRoute}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 py-3.5 rounded-lg font-semibold text-sm transition-colors text-white active:scale-[0.98]"
                  >
                    Search Route
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>

      </main>
      {popup && (
  <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
    <div className="bg-white p-6 rounded-2xl shadow-lg text-center max-w-sm w-full mx-4">
      <h2 className="text-xl font-semibold !text-red-400 mb-2">
        Under Maintenance 🚧
      </h2>
      <p className="text-gray-600 mb-4">
        We're working on this feature. Please check back later.
      </p>
      <button
        onClick={() => setpopup(false)}
        className="px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 transition-colors"
      >
        Close
      </button>
    </div>
  </div>
)}

      {/* GLOBAL STYLES */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes runningGradient {
            0%   { background-position: 0% 50%; }
            100% { background-position: 200% 50%; }
          }
          .animated-border-box {
            background: linear-gradient(90deg,
              #ff595e, #ffca3a, #8ac926, #1982c4, #6a4c93,
              #ff595e, #ffca3a, #8ac926, #1982c4, #6a4c93
            );
            background-size: 200% auto;
            animation: runningGradient 4s linear infinite;
          }

          @keyframes shimmerSweep {
            0%   { background-position: -250% 0; }
            100% { background-position: 250% 0; }
          }
          .animate-shimmer-sweep {
            animation: shimmerSweep 1.4s ease-in-out infinite;
          }

          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: #1e293b; border-radius: 6px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 6px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
        `
      }} />
    </div>
  );
};

export default FlightHome;

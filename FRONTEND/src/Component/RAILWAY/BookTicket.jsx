import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { station } from "./components/indian-railway-stations-2026-03-21";

/* ─── SHIMMER SCREEN ─────────────────────────────────────────────────────── */
const ShimmerScreen = ({ visible }) => (
  <div className={`fixed inset-0 z-[9999] bg-[#080808] overflow-hidden transition-opacity duration-300 ${visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
    <div
      className="absolute inset-0"
      style={{
        background: "linear-gradient(105deg, transparent 30%, rgba(245,158,11,0.12) 50%, transparent 70%)",
        backgroundSize: "250% 100%",
        animation: visible ? "shimmerSweep 1.4s ease-in-out infinite" : "none",
      }}
    />
    <div className="w-[90%] max-w-3xl mx-auto pt-[15vh] space-y-4">
      <div className="h-[6vh] w-[75%] rounded-xl bg-white/5 animate-pulse" />
      <div className="h-[3vh] w-[50%] rounded-lg bg-white/5 animate-pulse" />
      <div className="h-[3vh] w-[65%] rounded-lg bg-white/5 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-[4vh]">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-[15vh] rounded-2xl bg-white/[0.04] animate-pulse" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[1, 2].map(i => (
          <div key={i} className="h-[6vh] rounded-xl bg-white/[0.03] animate-pulse" />
        ))}
      </div>
    </div>
    <style>{`
      @keyframes shimmerSweep {
        0%   { background-position: -250% 0; }
        100% { background-position: 250% 0; }
      }
    `}</style>
  </div>
);

export default function TrainBookingSearch() {
  const inputRef = useRef(null);
  const suggestionRef1 = useRef(null);
  const inputRef2 = useRef(null);
  const suggestionRef2 = useRef(null);

  const [suggestions, setSuggestions] = useState([]);
  const [suggestions2, setSuggestions2] = useState([]);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [from2, setfrom2] = useState("");
  const [to2, setto2] = useState("");
  const [shimmer, setShimmer] = useState(false);

  const navigate = useNavigate();

  const shimmerNavigate = (path, delay = 600) => {
    setShimmer(true);
    setTimeout(() => navigate(path), delay);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target) && suggestionRef1.current && !suggestionRef1.current.contains(event.target)) setSuggestions([]);
      if (inputRef2.current && !inputRef2.current.contains(event.target) && suggestionRef2.current && !suggestionRef2.current.contains(event.target)) setSuggestions2([]);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSwap = () => { setFrom(to); setTo(from); };

  const handleSearchinput = (e) => {
    const value = e.target.value.toUpperCase();
    setFrom(value);
    if (!value) return setSuggestions([]);
    const filtered = station.filter(([code, name]) => code.includes(value) || name.toUpperCase().includes(value)).slice(0, 5);
    setSuggestions(filtered);
  };

  const handleSearchinput2 = (e) => {
    const value = e.target.value.toUpperCase();
    setTo(value);
    if (!value) return setSuggestions2([]);
    const filtered = station.filter(([code, name]) => code.includes(value) || name.toUpperCase().includes(value)).slice(0, 5);
    setSuggestions2(filtered);
  };

  const handleSelect = (no, name) => { setFrom(name); setfrom2(no); setSuggestions([]); };
  const handleSelect2 = (no, name) => { setTo(name); setto2(no); setSuggestions2([]); };

  const handleSearch = () => {
    if (!from || !to || !date) return;
    shimmerNavigate(`/railway/tickets/bookings/true/${from2}/${to2}/${date}`);
  };

  return (
    <div className="relative min-h-screen flex backdrop-blur-3xl items-center justify-center px-4 overflow-hidden font-saira">

      <ShimmerScreen visible={shimmer} />

      {/* BACKGROUND */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#626886] via-[#06090e] to-[#081030] scale-110 -z-10"></div>

      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[32px] w-full max-w-3xl relative z-10">

        {/* HEADER */}
        <div className="flex items-center justify-center mb-6">
          <h1 className="text-4xl md:text-5xl font-bold text-center leading-tight text-white">
            Check Live Price & <br /> Seat Availability
          </h1>
        </div>

        <div className="flex flex-col gap-5">
          <div className="flex flex-col md:flex-row items-center gap-3 relative">

            {/* FROM */}
            <div className="w-full relative">
              <input
                ref={inputRef}
                type="text"
                value={from}
                onChange={handleSearchinput}
                placeholder="Origin Station"
                className="w-full pt-6 pb-2.5 px-4 rounded-2xl bg-[#1c1c1e]/80 text-white uppercase"
              />
              {suggestions.length > 0 && inputRef.current && createPortal(
                <ul ref={suggestionRef1} style={{ position: "absolute", top: suggestions.length > 3 ? inputRef.current.getBoundingClientRect().top + window.scrollY - 90 : inputRef.current.getBoundingClientRect().top + window.scrollY + 0, left: inputRef.current.getBoundingClientRect().left, width: inputRef.current.offsetWidth, transform: "translateY(calc(-70% - 2px))" }}
                  className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] z-[9999] max-h-60 overflow-y-auto animate-fadeIn">
                  {suggestions.map(([no, name]) => (
                    <li key={no} onClick={() => handleSelect(no, name)} className="p-3 hover:bg-blue-500/20 cursor-pointer border-b border-gray-800 last:border-none flex justify-between items-center transition-all duration-200">
                      <span className="text-white font-medium">{name}</span>
                      <span className="text-blue-300 font-mono text-xs bg-black/40 px-2 py-1 rounded">{no}</span>
                    </li>
                  ))}
                </ul>, document.body
              )}
            </div>

            {/* SWAP */}
            <button onClick={handleSwap} className="absolute md:relative top-1/2 left-1/2 md:top-auto md:left-auto -translate-x-1/2 -translate-y-1/2 md:translate-x-0 md:translate-y-0 p-2.5 rounded-full bg-[#2c2c2e] hover:bg-blue-500 border border-white/10 shadow-lg z-10">
              ⇄
            </button>

            {/* TO */}
            <div className="w-full relative">
              <input
                ref={inputRef2}
                type="text"
                value={to}
                onChange={handleSearchinput2}
                placeholder="Destination"
                className="w-full pt-6 pb-2.5 px-4 rounded-2xl bg-[#1c1c1e]/80 text-white uppercase"
              />
              {suggestions2.length > 0 && inputRef2.current && createPortal(
                <ul ref={suggestionRef2} style={{ position: "absolute", top: suggestions2.length > 3 ? inputRef2.current.getBoundingClientRect().top + window.scrollY - 90 : inputRef2.current.getBoundingClientRect().top + window.scrollY + 0, left: inputRef2.current.getBoundingClientRect().left, width: inputRef2.current.offsetWidth, transform: "translateY(calc(-70% - 2px))" }}
                  className="bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] z-[9999] max-h-60 overflow-y-auto animate-fadeIn">
                  {suggestions2.map(([no, name]) => (
                    <li key={no} onClick={() => handleSelect2(no, name)} className="p-3 hover:bg-blue-500/20 cursor-pointer border-b border-gray-800 last:border-none flex justify-between items-center transition-all duration-200">
                      <span className="text-white font-medium">{name}</span>
                      <span className="text-blue-300 font-mono text-xs bg-black/40 px-2 py-1 rounded">{no}</span>
                    </li>
                  ))}
                </ul>, document.body
              )}
            </div>
          </div>

          {/* DATE */}
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full pt-6 pb-2.5 px-4 rounded-2xl bg-[#1c1c1e]/80 text-white" />

          <button className="bg-blue-500 p-3 rounded-xl text-white font-bold" onClick={handleSearch}>
            Search Trains
          </button>
        </div>
      </div>
    </div>
  );
}

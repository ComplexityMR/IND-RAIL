import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TRAIN_DATA } from './components/indian-railways-trains-2026-03-21.jsx';
import useDateRange from '../Hotel/Calendarhook.js';
import { station } from './components/indian-railway-stations-2026-03-21.jsx';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, addMonths, subMonths, startOfWeek, endOfWeek } from "date-fns";
import { Calendar } from "lucide-react";

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
    <div className="w-[90%] max-w-4xl mx-auto pt-[12vh] space-y-4">
      <div className="h-[6vh] w-[70%] rounded-xl bg-white/5 animate-pulse" />
      <div className="h-[3vh] w-[45%] rounded-lg bg-white/5 animate-pulse" />
      <div className="h-[3vh] w-[60%] rounded-lg bg-white/5 animate-pulse" />
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

const RailRadarApp = () => {
  const navigate = useNavigate();
  const [shimmer, setShimmer] = useState(false);

  const shimmerNavigate = (path, delay = 600) => {
    setShimmer(true);
    setTimeout(() => navigate(path), delay);
  };

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const start = startOfWeek(startOfMonth(currentMonth));
  const end = endOfWeek(endOfMonth(currentMonth));
  const days = eachDayOfInterval({ start, end });

  const nextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
  const prevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));

  const { checkIn, onDateClick, isStart, isDisabled } = useDateRange();
  const [showCalendar, setShowCalendar] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShowCalendar(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const inputRef = useRef(null);
  const inputRef2 = useRef(null);
  const inputRef3 = useRef(null);
  const suggestionRef1 = useRef(null);
  const suggestionRef2 = useRef(null);
  const suggestionRef3 = useRef(null);

  const [query, setQuery] = useState("");
  const [query2, setQuery2] = useState("");
  const [query3, setQuery3] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [suggestions2, setSuggestions2] = useState([]);
  const [suggestions3, setSuggestions3] = useState([]);

  const [selectedTrain, setSelectedTrain] = useState(null);
  const [selectedFromStation, setSelectedFromStation] = useState("");
  const [selectedToStation, setSelectedToStation] = useState("");

  const handleSearch = () => {
    if (selectedTrain && checkIn) {
      shimmerNavigate(`/railway/${selectedTrain}/${format(checkIn, "yyyy-MM-dd")}`);
    } else {
      alert("Please select a train and date before searching.");
    }
  };

  const handleSearch2 = () => {
    if (selectedFromStation && selectedToStation) shimmerNavigate(`/railway/:find/${selectedFromStation}/${selectedToStation}`);
    else alert("Please select both departure and destination stations before searching.");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target) && suggestionRef1.current && !suggestionRef1.current.contains(event.target)) setSuggestions([]);
      if (inputRef2.current && !inputRef2.current.contains(event.target) && suggestionRef2.current && !suggestionRef2.current.contains(event.target)) setSuggestions2([]);
      if (inputRef3.current && !inputRef3.current.contains(event.target) && suggestionRef3.current && !suggestionRef3.current.contains(event.target)) setSuggestions3([]);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length) {
      const filtered = TRAIN_DATA.filter(([no, name]) => no.includes(value) || name.toLowerCase().includes(value.toLowerCase())).slice(0, 10);
      setSuggestions(filtered);
    } else setSuggestions([]);
  };

  const handlinstations = (e) => {
    const value = e.target.value;
    setQuery2(value);
    if (value.length > 0) {
      const filtered = station.filter(([code, name]) => code.toLowerCase().includes(value.toLowerCase()) || name.toLowerCase().includes(value.toLowerCase())).slice(0, 10);
      setSuggestions2(filtered);
    } else setSuggestions2([]);
  };

  const handlinstations3 = (e) => {
    const value = e.target.value;
    setQuery3(value);
    if (value.length > 0) {
      const filtered = station.filter(([code, name]) => code.toLowerCase().includes(value.toLowerCase()) || name.toLowerCase().includes(value.toLowerCase())).slice(0, 10);
      setSuggestions3(filtered);
    } else setSuggestions3([]);
  };

  const handleSelect = (number, name) => { setQuery(`${number} - ${name}`); setSelectedTrain(number); setSuggestions([]); };
  const handleSelect2 = (code, name) => { setQuery2(`${code} - ${name}`); setSelectedFromStation(code); setSuggestions2([]); };
  const handleSelect3 = (code, name) => { setQuery3(`${code} - ${name}`); setSelectedToStation(code); setSuggestions3([]); };

  const swapStations = () => {
    const tempFrom = selectedFromStation;
    const tempTo = selectedToStation;
    setSelectedFromStation(tempTo);
    setSelectedToStation(tempFrom);
    const tempQuery = query2;
    setQuery2(query3);
    setQuery3(tempQuery);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0f1a] text-slate-200 font-sans flex flex-col md:overflow-visible selection:bg-blue-500/30 overflow-x-hidden">

      <ShimmerScreen visible={shimmer} />

      {/* 1. Navbar */}
      <nav className="shrink-0 bg-[#0f172a] border-b border-slate-800 px-4 md:px-6 py-3 shadow-md z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => shimmerNavigate("/")}>
            <img className="h-8 w-8 md:h-9 md:w-9 rounded-lg" src="https://cdn-icons-png.flaticon.com/128/2200/2200326.png" alt="logo" />
            <span className="text-lg md:text-xl font-bold tracking-tight text-white">TripingBUDDY</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => shimmerNavigate('/railway/pnrstatus/:pnr')} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-colors shadow-sm">
              PNR Status
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 flex flex-col gap-6">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">Welcome to TrippingBuddy</h1>
          <p className="text-slate-400 text-xs md:text-sm font-medium mt-1">Live tracking • Seamless Search Experience • Elite experiences</p>
        </div>

        {/* Live Train Map Card */}
    {/* Live Train Map Card */}
        <div className="bg-emerald-600/20 border border-slate-800 p-3 md:px-5 md:py-3 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className="bg-emerald-500/10 p-2 md:p-2.5 rounded-lg text-emerald-400 shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            
            {/* Text Content: Stacked on mobile (flex-col), Side-by-side on desktop (md:flex-row) */}
            <div className="flex flex-col md:flex-row md:items-center gap-0.5 md:gap-3">
              <h2 className="text-sm md:text-base font-bold flex items-center gap-2 text-white whitespace-nowrap">
                Live Train Map
                <span className="text-[9px] md:text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">Live</span>
              </h2>
              <p className="text-slate-400 text-xs md:text-sm">(Track 14000+ trains LIVE on Live Map)</p>
            </div>
          </div>

          {/* Button */}
          <button onClick={() => shimmerNavigate('/railway/livemap')} className="w-full md:w-auto shrink-0 bg-green-400/60 hover:bg-slate-700 border border-slate-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm">
            View Map
          </button>
        </div>

        {/* 3. Animated Border Wrapper */}
        <div className="rounded-[20px] p-[1px] animated-border-box shadow-[0_0_40px_rgba(59,130,246,0.15)] flex flex-col">
          <div className="bg-[#0f172a] rounded-[18px] flex flex-col">

            {/* Section 1: Where is My Train */}
            <section className="p-4 md:p-6 border-b border-slate-800/60 flex flex-col relative z-20">
              <div className="flex items-center gap-2 mb-4 shrink-0">
                <div className="p-1.5 bg-blue-500/10 rounded-md text-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect width="16" height="16" x="4" y="3" rx="2"></rect><path d="M4 11h16"></path><path d="M12 3v8"></path><path d="m8 19-2 3"></path><path d="m18 22-2-3"></path><path d="M8 15h.01"></path><path d="M16 15h.01"></path></svg>
                </div>
                <h2 className="text-sm md:text-base font-bold text-white">Where is My Train?</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                {/* Train Input */}
                <div ref={inputRef} className="md:col-span-7 relative">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Train Number or Name</label>
                  <input type="text" value={query} onChange={handleInputChange} placeholder="Search train number or name" className="w-full bg-[#1e293b] border border-slate-700 p-3.5 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-500 text-white text-sm" />
                  
                  {/* Dropdown removed from portal, anchored safely bottom-full (upward) on mobile, top-full (downward) on desktop */}
                  {suggestions.length > 0 && (
                    <ul ref={suggestionRef1} className="absolute bottom-full mb-2 md:bottom-auto md:top-full md:mt-2 left-0 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 z-[9999] max-h-48 overflow-y-auto custom-scrollbar">
                      {suggestions.map(([no, name]) => (
                        <li key={no} onClick={() => handleSelect(no, name)} className="p-3 hover:bg-slate-700 cursor-pointer border-b border-slate-700/50 last:border-none flex justify-between items-center text-sm transition-colors">
                          <span className="text-slate-200 font-medium truncate pr-2">{name}</span>
                          <span className="text-blue-400 font-mono text-[11px] bg-blue-500/10 px-1.5 py-0.5 rounded shrink-0">{no}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Date Input */}
                <div className="md:col-span-3 relative">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Journey Date</label>
                  <div ref={wrapperRef} className="relative w-full">
                    <div onClick={() => setShowCalendar(!showCalendar)} className="w-full p-3.5 rounded-lg cursor-pointer bg-[#1e293b] border border-slate-700 text-sm text-white flex justify-between items-center">
                      <span className={!checkIn ? "text-slate-400" : ""}>{checkIn ? format(checkIn, "dd MMM yyyy") : "Select date"}</span>
                      <span><Calendar className="h-4 w-4 text-slate-400" /></span>
                    </div>
                    {/* Fixed Calendar Positioning */}
                    {showCalendar && (
                      <div className="absolute top-full mt-2 left-0 md:right-0 md:left-auto w-full md:w-[260px] bg-[#0f172a] border border-slate-700 rounded-lg p-3 z-[90] text-[11px] shadow-2xl">
                        <div className="flex items-center justify-between mb-1 px-1">
                          <button onClick={prevMonth} className="text-gray-400 hover:text-white text-sm px-1">‹</button>
                          <div className="text-gray-300 text-xs font-medium">{format(currentMonth, "MMM yyyy")}</div>
                          <button onClick={nextMonth} className="text-gray-400 hover:text-white text-sm px-1">›</button>
                        </div>
                        <div className="grid grid-cols-7 text-gray-500 text-center mb-1 text-[9px]">
                          {["S","M","T","W","T","F","S"].map((d, i) => <div key={i}>{d}</div>)}
                        </div>
                        <div className="grid grid-cols-7">
                          {days.map((day, i) => (
                            <div key={i} onClick={() => { if (!isDisabled(day)) { onDateClick(day); setShowCalendar(false); } }}
                              className={`h-8 md:h-7 flex items-center justify-center rounded cursor-pointer text-[12px] md:text-[11px] ${isStart(day) ? "bg-blue-500 text-white" : ""} ${isDisabled(day) ? "text-gray-600 cursor-not-allowed" : "text-gray-300 hover:bg-blue-500/20"}`}>
                              {format(day, "d")}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2 mt-1 md:mt-0">
                  <button onClick={handleSearch} className="w-full bg-blue-600 hover:bg-blue-500 py-3.5 rounded-lg font-semibold text-sm transition-colors text-white shadow-md active:scale-[0.98]">
                    Search Train
                  </button>
                </div>
              </div>
            </section>

            {/* Section 2: Between Stations */}
            <section className="p-4 md:p-6 flex flex-col relative z-10">
              <div className="flex items-center gap-2 mb-4 shrink-0">
                <div className="p-1.5 bg-indigo-500/10 rounded-md text-indigo-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M8 3 4 7l4 4"></path><path d="M4 7h16"></path><path d="m16 21 4-4-4-4"></path><path d="M20 17H4"></path></svg>
                </div>
                <h2 className="text-sm md:text-base font-bold text-white">Find Trains Between Stations</h2>
              </div>

              <div className="flex flex-col md:flex-row gap-2 md:gap-3 items-center md:items-end relative w-full">
                
                {/* From Station */}
                <div ref={inputRef2} className="relative w-full md:flex-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">From Station</label>
                  <input type="text" value={query2} onChange={handlinstations} placeholder="Departure station" className="w-full bg-[#1e293b] border border-slate-700 p-3.5 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-500 text-white text-sm" />
                  
                  {suggestions2.length > 0 && (
                    <ul ref={suggestionRef2} className="absolute bottom-full mb-2 md:bottom-auto md:top-full md:mt-2 left-0 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 z-[9999] max-h-48 overflow-y-auto custom-scrollbar">
                      {suggestions2.map(([from, to]) => (
                        <li key={from} onClick={() => handleSelect2(from, to)} className="p-3 hover:bg-slate-700 cursor-pointer border-b border-slate-700/50 last:border-none flex justify-between items-center text-sm transition-colors">
                          <span className="text-slate-200 font-medium truncate pr-2">{from}</span>
                          <span className="text-indigo-400 font-mono text-[11px] bg-indigo-500/10 px-1.5 py-0.5 rounded shrink-0">{to}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Swap Button (Overlaps slightly vertically on mobile, horizontally on desktop) */}
                <div className="flex justify-center -my-3 md:my-0 md:pb-1 shrink-0 z-20">
                  <button type="button" className="p-2 md:p-2.5 rounded-full bg-[#1e293b] hover:bg-slate-700 border border-slate-500 md:border-slate-600 transition-all duration-300 hover:rotate-180 text-white shadow-lg" onClick={swapStations}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 rotate-90 md:rotate-0 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                  </button>
                </div>

                {/* To Station */}
                <div ref={inputRef3} className="relative w-full md:flex-1">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">To Station</label>
                  <input type="text" value={query3} onChange={handlinstations3} placeholder="Destination station" className="w-full bg-[#1e293b] border border-slate-700 p-3.5 rounded-lg focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-500 text-white text-sm" />
                  
                  {suggestions3.length > 0 && (
                    <ul ref={suggestionRef3} className="absolute bottom-full mb-2 md:bottom-auto md:top-full md:mt-2 left-0 w-full bg-slate-800 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 z-[9999] max-h-48 overflow-y-auto custom-scrollbar">
                      {suggestions3.map(([from, to]) => (
                        <li key={from} onClick={() => handleSelect3(from, to)} className="p-3 hover:bg-slate-700 cursor-pointer border-b border-slate-700/50 last:border-none flex justify-between items-center text-sm transition-colors">
                          <span className="text-slate-200 font-medium truncate pr-2">{from}</span>
                          <span className="text-indigo-400 font-mono text-[11px] bg-indigo-500/10 px-1.5 py-0.5 rounded shrink-0">{to}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="w-full md:w-32 mt-3 md:mt-0 shrink-0">
                  <button className="w-full bg-indigo-600 hover:bg-indigo-500 py-3.5 rounded-lg font-semibold text-sm transition-colors text-white active:scale-[0.98] shadow-md" onClick={() => handleSearch2()}>
                    Search Route
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* GLOBAL STYLES */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes runningGradient {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .animated-border-box {
          background: linear-gradient(90deg, #ff595e, #ffca3a, #8ac926, #1982c4, #6a4c93, #ff595e, #ffca3a, #8ac926, #1982c4, #6a4c93);
          background-size: 200% auto;
          animation: runningGradient 4s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1e293b; border-radius: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}} />
    </div>
  );
};

export default RailRadarApp;
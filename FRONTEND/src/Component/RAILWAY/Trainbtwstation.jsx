import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Trainbtwstation = () => {
    const [liveStatus, setLiveStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [dayFilter, setDayFilter] = useState("ALL");
    const [maxHalts, setMaxHalts] = useState("");
    const [sortBy, setSortBy] = useState("");

    const [showFilters, setShowFilters] = useState(false);

    const data = useParams();
    const fromstation = data.fromstation;
    const tostation = data.tostation;

    useEffect(() => {
        const fetchTrains = async () => {
            try {
                const response = await axios.get(
  `http://localhost:5000/api/trainbtwstation/${fromstation}/${tostation}`
);
                setLiveStatus(response.data);
                setLoading(false);
            } catch (err) {
                setError("Failed to fetch live status.");
                setLoading(false);
            }
        };

        if (fromstation && tostation) {
            fetchTrains();
        }
    }, [fromstation, tostation]);

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex justify-center items-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                    <h2 className="text-zinc-400 animate-pulse font-medium">Finding the best trains...</h2>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-zinc-950 flex justify-center items-center px-4">
                <h2 className="text-red-400 bg-red-400/10 px-6 py-3 rounded-lg border border-red-400/20 text-center">{error}</h2>
            </div>
        );
    }

    const trains = liveStatus?.data?.trains || [];

    // ✅ Filter Logic
    const filteredTrains = trains
        .filter(train => {
            if (typeFilter !== "ALL" && train.type !== typeFilter) return false;

            if (
                dayFilter !== "ALL" &&
                !train.runningDays?.days?.includes(dayFilter)
            ) return false;

            if (maxHalts && train.totalHalts > Number(maxHalts)) return false;

            return true;
        })
        .sort((a, b) => {
            if (sortBy === "speed") return b.avgSpeedKmph - a.avgSpeedKmph;
            if (sortBy === "distance") return a.distanceKm - b.distanceKm;
            return 0;
        });

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-200 px-3 py-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-500/30">

            {/* HEADER - COMPACTED */}
            <div className="max-w-6xl mx-auto mb-6 flex flex-col items-center text-center mt-2">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">
                    Trains Between Stations
                </h1>
                <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-zinc-400">
                    <span className="bg-zinc-900 px-3 py-1 rounded-md text-xs sm:text-sm border border-zinc-800 font-medium">{fromstation}</span>
                    <span className="text-zinc-600">→</span>
                    <span className="bg-zinc-900 px-3 py-1 rounded-md text-xs sm:text-sm border border-zinc-800 font-medium">{tostation}</span>
                </div>
                
                {/* TOOLBAR: COUNT & FILTERS */}
                <div className="w-full flex justify-between items-center mt-6 border-b border-zinc-800/50 pb-3">
                    <span className="text-xs sm:text-sm text-zinc-500">
                        Showing <strong className="text-zinc-300">{filteredTrains.length}</strong> of {trains.length}
                    </span>
                    <button
                        onClick={() => setShowFilters(true)}
                        className="bg-white/5 border border-white/10 px-3 py-1.5 sm:px-4 rounded-lg text-xs sm:text-sm font-medium hover:bg-white/10 hover:border-white/20 transition-all active:scale-95 flex items-center gap-1.5 sm:gap-2"
                    >
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
                        </svg>
                        Filters
                    </button>
                </div>
            </div>

            {/* FILTER MODAL */}
            {showFilters && (
                <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 backdrop-blur-md p-3 sm:p-4">
                    <div className="bg-zinc-900 w-full max-w-lg rounded-2xl p-4 sm:p-6 border border-zinc-800 shadow-2xl shadow-black/50 max-h-[90vh] overflow-y-auto">

                        {/* HEADER */}
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg sm:text-xl font-semibold text-zinc-100">Filter & Sort</h2>
                            <button 
                                className="text-zinc-500 hover:text-zinc-300 bg-zinc-800/50 hover:bg-zinc-800 w-8 h-8 rounded-full flex items-center justify-center transition" 
                                onClick={() => setShowFilters(false)}
                            >
                                ✖
                            </button>
                        </div>

                        {/* TYPE */}
                        <div className="mb-5">
                            <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider mb-3 text-zinc-500">Train Type</p>
                            <div className="flex flex-wrap gap-2">
                                {["ALL", "Rajdhani Express", "Duronto Express", "Superfast Express", "Mail/Express"].map(type => (
                                    <button
                                        key={type}
                                        onClick={() => setTypeFilter(type)}
                                        className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                                            typeFilter === type
                                                ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20 border-transparent"
                                                : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                                        }`}
                                    >
                                        {type === "ALL" ? "All Types" : type.split(" ")[0]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* DAY */}
                        <div className="mb-5">
                            <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider mb-3 text-zinc-500">Running Day</p>
                            <div className="flex flex-wrap gap-2">
                                {["ALL", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(day => (
                                    <button
                                        key={day}
                                        onClick={() => setDayFilter(day)}
                                        className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                                            dayFilter === day
                                                ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20 border-transparent"
                                                : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
                                        }`}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* HALTS & SORTING (Stacked on mobile, Side-by-side on sm+) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <div>
                                <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider mb-2 sm:mb-3 text-zinc-500">Max Halts</p>
                                <input
                                    type="number"
                                    value={maxHalts}
                                    onChange={(e) => setMaxHalts(e.target.value)}
                                    placeholder="e.g. 10"
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 sm:px-4 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                                />
                            </div>
                            <div>
                                <p className="text-[10px] sm:text-xs font-medium uppercase tracking-wider mb-2 sm:mb-3 text-zinc-500">Sort By</p>
                                <select 
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3 sm:px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none"
                                >
                                    <option value="">Default</option>
                                    <option value="speed">Fastest Speed</option>
                                    <option value="distance">Shortest Distance</option>
                                </select>
                            </div>
                        </div>

                        {/* ACTIONS */}
                        <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 pt-4 border-t border-zinc-800">
                            <button
                                onClick={() => {
                                    setTypeFilter("ALL");
                                    setDayFilter("ALL");
                                    setMaxHalts("");
                                    setSortBy("");
                                }}
                                className="text-sm font-medium text-zinc-400 hover:text-zinc-200 transition w-full sm:w-auto py-2 sm:py-0"
                            >
                                Reset All
                            </button>

                            <button
                                onClick={() => setShowFilters(false)}
                                className="bg-zinc-100 text-zinc-950 font-semibold px-6 py-2 rounded-xl text-sm hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/10 w-full sm:w-auto"
                            >
                                Apply Filters
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* GRID */}
            <div className="max-w-6xl mx-auto grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

                {filteredTrains.length > 0 ? (
                    filteredTrains.map((train, index) => (
                        <div
                            key={index}
                            className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-3 sm:p-4 hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="pr-2">
                                    <h2 className="text-sm sm:text-base font-semibold text-zinc-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
                                        {train.trainName}
                                    </h2>
                                    <p className="text-xs font-mono text-zinc-500 mt-0.5">
                                        #{train.trainNumber}
                                    </p>
                                </div>

                                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-md border border-indigo-500/20 whitespace-nowrap">
                                    {train.type}
                                </span>
                            </div>

                            <div className="flex items-center justify-between text-xs sm:text-sm font-medium bg-zinc-950 p-2 sm:p-2.5 rounded-xl border border-zinc-800/50 mb-4">
                                <span className="text-zinc-200">{train.sourceStationCode}</span>
                                <div className="flex-1 px-2 sm:px-4 flex items-center">
                                    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-zinc-600 to-transparent"></div>
                                </div>
                                <span className="text-zinc-200">{train.destinationStationCode}</span>
                            </div>

                            <div className="flex flex-wrap justify-between gap-y-2 text-[11px] sm:text-xs text-zinc-400 font-medium mb-3 px-1">
                                <span className="flex items-center gap-1">⏱ {train.totalHalts} halts</span>
                                <span className="flex items-center gap-1">📏 {train.distanceKm} km</span>
                                <span className="flex items-center gap-1">⚡ {train.avgSpeedKmph} km/h</span>
                            </div>

                            <div className="flex flex-wrap gap-1 sm:gap-1.5">
                                {train.runningDays?.days?.map((day, i) => (
                                    <span
                                        key={i}
                                        className="text-[9px] sm:text-[10px] font-medium px-1.5 sm:px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded border border-zinc-700/50"
                                    >
                                        {day}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-12 sm:py-16 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/50 px-4 text-center">
                        <span className="text-3xl sm:text-4xl mb-3">🚂</span>
                        <h3 className="text-zinc-300 font-medium text-base sm:text-lg">No trains found</h3>
                        <p className="text-zinc-500 text-xs sm:text-sm mt-1">Try adjusting your filters to see more results.</p>
                        <button 
                            onClick={() => { setTypeFilter("ALL"); setDayFilter("ALL"); setMaxHalts(""); }}
                            className="mt-4 text-indigo-400 text-xs sm:text-sm font-medium hover:text-indigo-300 transition"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Trainbtwstation;
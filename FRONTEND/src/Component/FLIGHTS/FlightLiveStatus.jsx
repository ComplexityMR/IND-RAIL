import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import {
  Plane,
  Gauge,
  MapPin,
  Navigation
} from "lucide-react";

/* ─── SHIMMER SCREEN ─────────────────────────────────────────────────────── */
const ShimmerScreen = ({ visible }) => (
  <div
    className={`fixed inset-0 z-[9999] bg-[#080808] overflow-hidden transition-opacity duration-300 ${
      visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
    }`}
  >
    <div
      className={`absolute inset-0 ${visible ? "animate-shimmer-sweep" : ""}`}
      style={{
        background:
          "linear-gradient(105deg, transparent 30%, rgba(245,158,11,0.12) 50%, transparent 70%)",
        backgroundSize: "250% 100%",
      }}
    />
    <div className="max-w-4xl mx-auto pt-16 sm:pt-20 md:pt-24 px-4 sm:px-6 space-y-3 sm:space-y-4">
      <div className="h-8 sm:h-10 md:h-11 w-4/5 rounded-xl bg-white/5 animate-pulse" />
      <div className="h-3 sm:h-4 w-1/2 rounded-lg bg-white/5 animate-pulse" />
      <div className="h-3 sm:h-4 w-2/3 rounded-lg bg-white/5 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 pt-6 sm:pt-8 md:pt-10">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 sm:h-36 md:h-40 rounded-2xl bg-white/[0.04] animate-pulse" />
        ))}
      </div>
      <div className="hidden sm:grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 sm:h-12 rounded-xl bg-white/[0.03] animate-pulse" />
        ))}
      </div>
    </div>
  </div>
);

/* ─── DISTANCE HELPERS ───────────────────────────────────────────────────── */
const deg2rad = (deg) => deg * (Math.PI / 180);

const getDistance = (lat1, lon1, lat2, lon2) => {
  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined)
    return 0;
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/* ─── MAIN COMPONENT ─────────────────────────────────────────────────────── */
const FlightLiveStatus = () => {
  const { flightNumber } = useParams();
  const navigate = useNavigate();

  const [flightData, setFlightData]     = useState(null);
  const [sourceAirport, setSourceAirport] = useState(null);
  const [destAirport, setDestAirport]   = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [currentLocation, setCurrentLocation] = useState("Unknown Location");
  const [shimmer, setShimmer]           = useState(false);

  const shimmerNavigate = (path, delay = 600) => {
    setShimmer(true);
    setTimeout(() => navigate(path), delay);
  };

  /* ── Fetch flight ── */
  useEffect(() => {
    const fetchFlightStatus = async () => {
      if (!flightNumber) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/flight/${flightNumber}`);
        setFlightData(res.data);
        setCurrentLocation(res.data.currentLocation || "Unknown Location");
        setError(null);
      } catch {
        setError("Unable to fetch flight data");
      } finally {
        setLoading(false);
      }
    };
    fetchFlightStatus();
    const interval = setInterval(fetchFlightStatus, 15000);
    return () => clearInterval(interval);
  }, [flightNumber]);

  /* ── Fetch airports ── */
  useEffect(() => {
    const fetchAirports = async () => {
      const srcIcao  = flightData?.src  || flightData?.estDepartureAirport;
      const destIcao = flightData?.dest || flightData?.estArrivalAirport;
      if (srcIcao) {
        try { const res = await axios.get(`http://localhost:5000/api/airport/${srcIcao}`); setSourceAirport(res.data); } catch {}
      }
      if (destIcao) {
        try { const res = await axios.get(`http://localhost:5000/api/airport/${destIcao}`); setDestAirport(res.data); } catch {}
      }
    };
    if (flightData) fetchAirports();
  }, [flightData]);

  /* ── Distances ── */
  const getDistances = () => {
    if (!sourceAirport || !destAirport || !flightData) return { total: 0, covered: 0, remaining: 0 };
    const total    = getDistance(sourceAirport.latitude_deg, sourceAirport.longitude_deg, destAirport.latitude_deg, destAirport.longitude_deg);
    const covered  = getDistance(sourceAirport.latitude_deg, sourceAirport.longitude_deg, flightData.lat, flightData.lon);
    const remaining = Math.max(total - covered, 0);
    return { total, covered, remaining };
  };

  const { total, covered, remaining } = getDistances();

  /* ── Progress ── */
  const getProgress = () => {
    if (!sourceAirport || !destAirport || !flightData) return 0;
    const total   = getDistance(sourceAirport.latitude_deg, sourceAirport.longitude_deg, destAirport.latitude_deg, destAirport.longitude_deg);
    const covered = getDistance(sourceAirport.latitude_deg, sourceAirport.longitude_deg, flightData.lat, flightData.lon);
    if (total === 0) return 0;
    return Math.min((covered / total) * 100, 100);
  };

  const progress = getProgress();

  /* ── UI states ── */
  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#121417] text-slate-400 animate-pulse">
        📡 Connecting to aircraft...
      </div>
    );

  if (error)
    return (
      <div className="h-screen flex items-center justify-center bg-[#121417] text-red-500">
        {error}
      </div>
    );

  if (!flightData) return null;

  /* ── Main UI ── */
  return (
    <div className="min-h-screen bg-[#121417] text-white p-4 sm:p-6">
      {/* Shimmer overlay */}
      <ShimmerScreen visible={shimmer} />

      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes shimmerSweep {
            0%   { background-position: -250% 0; }
            100% { background-position: 250% 0; }
          }
          .animate-shimmer-sweep {
            animation: shimmerSweep 1.4s ease-in-out infinite;
          }
        `
      }} />

      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-6 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold">Live Flight Tracker</h1>
        </div>

        <div className="bg-[#1c1f24] rounded-3xl p-5 sm:p-8 shadow-xl">

          {/* TITLE */}
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold">{flightData.callsign}</h2>
            <p className="text-slate-400 mt-2 text-sm sm:text-base">
              {sourceAirport?.name} ({flightData.src}) →{" "}
              {destAirport?.name} ({flightData.dest})
            </p>
          </div>

          {/* CURRENT LOCATION */}
          <div className="flex flex-col sm:flex-row justify-between mb-4 sm:mb-6 text-sm sm:text-lg text-purple-400 gap-1 sm:gap-0">
            <span>📍 {currentLocation}</span>
            <span>{new Date().toLocaleTimeString()}</span>
          </div>

          {/* PROGRESS BAR */}
          <div className="mb-8 sm:mb-10">
            <div className="flex justify-between text-xs mb-2">
              <span>{flightData.src}</span>
              <span>{progress.toFixed(1)}%</span>
              <span>{flightData.dest}</span>
            </div>
            <div className="relative w-full h-3 bg-gray-700 rounded-full">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-green-400 rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute top-[-10px] text-lg transition-all duration-1000"
                style={{ left: `calc(${progress}% - 10px)` }}
              >
                <Plane size={32} className="rotate-45 text-yellow-400 w-10 h-8" />
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-[#252a30] p-3 sm:p-4 rounded-xl flex items-center gap-2 sm:gap-3">
              <Plane />
              <div>
                <p className="text-xs text-slate-400">Altitude</p>
                <p className="font-bold text-sm sm:text-base">{flightData.alt} ft</p>
              </div>
            </div>

            <div className="bg-[#252a30] p-3 sm:p-4 rounded-xl flex items-center gap-2 sm:gap-3">
              <Gauge />
              <div>
                <p className="text-xs text-slate-400">Speed</p>
                <p className="font-bold text-sm sm:text-base">{flightData.gs} kt</p>
              </div>
            </div>

            <div className="bg-[#252a30] p-3 sm:p-4 rounded-xl flex items-center gap-2 sm:gap-3 col-span-2 sm:col-span-1">
              <MapPin />
              <div>
                <p className="text-xs text-slate-400">Country</p>
                <p className="font-bold text-sm sm:text-base">{flightData.country}</p>
              </div>
            </div>

            <div className="bg-[#252a30] p-3 sm:p-4 rounded-xl flex items-center gap-2 sm:gap-3">
              <Navigation />
              <div>
                <p className="text-xs text-slate-400">Total Distance</p>
                <p className="font-bold text-sm sm:text-base">{total.toFixed(0)} km</p>
              </div>
            </div>

            <div className="bg-[#252a30] p-3 sm:p-4 rounded-xl flex items-center gap-2 sm:gap-3">
              <Navigation className="rotate-180" />
              <div>
                <p className="text-xs text-slate-400">Distance to Destination</p>
                <p className="font-bold text-sm sm:text-base">{remaining.toFixed(0)} km</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default FlightLiveStatus;

import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';

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
    </div>
    <style>{`
      @keyframes shimmerSweep {
        0%   { background-position: -250% 0; }
        100% { background-position: 250% 0; }
      }
    `}</style>
  </div>
);

// ─── 1. ICON CACHE ────────────────────────────────────────────────────────────
const iconCache = {};
const getRotatedTrainIcon = (angle, color) => {
    const roundedAngle = Math.round(angle) % 360;
    const cacheKey = `${roundedAngle}-${color}`;
    if (iconCache[cacheKey]) return iconCache[cacheKey];
    const icon = new L.divIcon({
        className: 'custom-train-icon',
        html: `<div style="transform: rotate(${roundedAngle}deg) translateZ(0); transform-origin: center; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                   <path d="M12 2L2 22l10-4 10 4L12 2z" fill="${color}33"/>
                 </svg>
               </div>`,
        iconSize: [18, 18], iconAnchor: [9, 9], popupAnchor: [0, -10],
    });
    iconCache[cacheKey] = icon;
    return icon;
};

// ─── 2. CATEGORIZATION ────────────────────────────────────────────────────────
const getTrainDetails = (type, name) => {
    const t = (type || '').toLowerCase();
    const n = (name || '').toLowerCase();
    if (n.includes('palace on wheel') || n.includes('vande bharat') || n.includes('rajdhani') || n.includes('shatabdi') || t.includes('premium')) return { category: 'Premium', color: '#ef4444' };
    if (t.includes('local') || t.includes('memu') || t.includes('emu') || t.includes('suburban')) return { category: 'Local/MEMU', color: '#22c55e' };
    if (t.includes('passenger') || t.includes('ordinary') || t.includes('demu')) return { category: 'Passenger', color: '#f59e0b' };
    return { category: 'Express', color: '#2563eb' };
};

// ─── 3. SMART LAYER ───────────────────────────────────────────────────────────
function SmartTrainLayer({ trains }) {
    const map = useMap();
    const [renderedTrains, setRenderedTrains] = useState([]);

    const updateVisibleTrains = useCallback(() => {
        if (!map || !trains) return;
        const bounds = map.getBounds();
        const zoom = map.getZoom();
        let onScreen = trains.filter(t => bounds.contains([t.lat, t.lng]));
        if (zoom <= 5) onScreen = onScreen.slice(0, 150);
        else if (zoom <= 7) onScreen = onScreen.slice(0, 400);
        setRenderedTrains(onScreen);
    }, [map, trains]);

    useMapEvents({ moveend: updateVisibleTrains, zoomend: updateVisibleTrains });
    useEffect(() => { updateVisibleTrains(); }, [updateVisibleTrains, trains]);

    return (
        <>
            {renderedTrains.map((train) => (
                <Marker key={train.id} position={[train.lat, train.lng]} icon={getRotatedTrainIcon(train.angle, train.color)}>
                    <Popup>
                        <div style={{ fontFamily: 'sans-serif' }}>
                            <strong style={{ color: train.color }}>{train.number}</strong> — {train.category}<br/>
                            <div style={{ fontWeight: 'bold', marginTop: '4px' }}>{train.name}</div>
                            <hr style={{ margin: '8px 0', border: '0', borderTop: '1px solid #eee' }} />
                            <div style={{ fontSize: '11px', color: '#666' }}>Next: {train.nextStation}</div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </>
    );
}

// ─── 4. MAIN COMPONENT ───────────────────────────────────────────────────────
export default function Livetrainmap() {
    const [allTrains, setAllTrains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [shimmer, setShimmer] = useState(true); // show on initial load
    const [selectedFilters, setSelectedFilters] = useState(['Premium', 'Express', 'Local/MEMU', 'Passenger']);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/livetrains`);
                const raw = res.data;
                const rawData = Array.isArray(raw) ? raw : Array.isArray(raw.data) ? raw.data : Array.isArray(raw.trains) ? raw.trains : Array.isArray(raw.result) ? raw.result : typeof raw === 'object' && raw !== null ? Object.values(raw) : [];

                if (rawData.length === 0) { setLoading(false); setShimmer(false); return; }

                const formatted = rawData.filter(t => t?.current_lat && t?.current_lng).map((t, i) => {
                    const { category, color } = getTrainDetails(t.type, t.train_name);
                    const toRad = (deg) => (deg * Math.PI) / 180;
                    const toDeg = (rad) => (rad * 180) / Math.PI;
                    const nextLat = t.next_lat ?? t.current_lat;
                    const nextLng = t.next_lng ?? t.current_lng;
                    const dLng = toRad(nextLng - t.current_lng);
                    const y = Math.sin(dLng) * Math.cos(toRad(nextLat));
                    const x = Math.cos(toRad(t.current_lat)) * Math.sin(toRad(nextLat)) - Math.sin(toRad(t.current_lat)) * Math.cos(toRad(nextLat)) * Math.cos(dLng);
                    const angle = (toDeg(Math.atan2(y, x)) + 360) % 360;
                    return { id: `${t.train_number ?? i}-${i}`, number: t.train_number, name: t.train_name, lat: t.current_lat, lng: t.current_lng, nextStation: t.next_station_name ?? 'N/A', angle, category, color };
                });

                setAllTrains(formatted);
            } catch (e) {
                console.error("Train fetch error:", e);
            } finally {
                setLoading(false);
                setShimmer(false); // hide shimmer once data arrives
            }
        };

        fetchData();
        const timer = setInterval(fetchData, 60000);
        return () => clearInterval(timer);
    }, []);

    const filteredTrains = allTrains.filter(t => selectedFilters.includes(t.category));
    const toggleFilter = (val) => {
        setSelectedFilters(prev => prev.includes(val) ? prev.filter(item => item !== val) : [...prev, val]);
    };

    const filterOptions = [
        { label: 'Premium/Luxury', val: 'Premium',    color: '#ef4444' },
        { label: 'Express (Mail)', val: 'Express',    color: '#2563eb' },
        { label: 'Local/MEMU',    val: 'Local/MEMU', color: '#22c55e' },
        { label: 'Passenger',     val: 'Passenger',  color: '#f59e0b' },
    ];

    return (
        <div className="relative h-screen w-full overflow-hidden">

            <ShimmerScreen visible={shimmer} />

            <MapContainer center={[22.59, 78.96]} zoom={5} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <SmartTrainLayer trains={filteredTrains} />
            </MapContainer>

            {/* Toggle button — responsive */}
            <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="absolute z-[1001] text-stone-800 bg-white border border-gray-200 rounded-[50px] font-bold cursor-pointer flex items-center gap-2 shadow-lg transition-all duration-300"
                style={{ bottom: 'clamp(16px, 3vw, 30px)', right: 'clamp(12px, 2.5vw, 20px)', padding: 'clamp(8px,1.5vw,12px) clamp(14px,2.5vw,24px)', fontSize: 'clamp(12px,1.8vw,14px)' }}
            >
                <span style={{ fontSize: 'clamp(14px,2.5vw,18px)' }}>{isMenuOpen ? '✕' : '⚙️'}</span>
                <span>{isMenuOpen ? 'Hide Filters' : 'Filter Trains'}</span>
            </button>

            {/* Filter menu — responsive width */}
            {isMenuOpen && (
                <div
                    className="absolute z-[1000] bg-white/95 backdrop-blur-xl border border-gray-100 rounded-3xl shadow-2xl flex flex-col gap-1.5"
                    style={{ bottom: 'clamp(60px,10vw,85px)', right: 'clamp(12px,2.5vw,20px)', padding: 'clamp(12px,2vw,16px)', width: 'clamp(200px,40vw,230px)' }}
                >
                    <div className="text-[10px] font-black text-gray-400 tracking-widest mb-2 pl-2">TRACK CATEGORIES</div>

                    {filterOptions.map(f => {
                        const isChecked = selectedFilters.includes(f.val);
                        return (
                            <button key={f.val} onClick={() => toggleFilter(f.val)}
                                className="flex items-center justify-between rounded-2xl border-none cursor-pointer transition-all duration-200"
                                style={{ padding: 'clamp(8px,1.5vw,10px) 14px', background: isChecked ? `${f.color}10` : 'transparent' }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: f.color }} />
                                    <span className="text-sm transition-colors" style={{ color: isChecked ? '#000' : '#888', fontWeight: isChecked ? '700' : '400' }}>{f.label}</span>
                                </div>
                                <div className="w-5 h-5 rounded-md flex items-center justify-center text-white text-xs transition-all duration-200"
                                    style={{ border: `2px solid ${isChecked ? f.color : '#ddd'}`, background: isChecked ? f.color : 'transparent' }}>
                                    {isChecked ? '✓' : ''}
                                </div>
                            </button>
                        );
                    })}

                    <div className="mt-2.5 flex justify-between px-2">
                        <button onClick={() => setSelectedFilters(['Premium', 'Express', 'Local/MEMU', 'Passenger'])} className="bg-transparent border-none text-blue-500 text-[11px] font-bold cursor-pointer">Select All</button>
                        <button onClick={() => setSelectedFilters([])} className="bg-transparent border-none text-red-500 text-[11px] font-bold cursor-pointer">Clear</button>
                    </div>
                </div>
            )}

            <style>{`.leaflet-marker-icon { transition: transform 0.8s ease-out !important; will-change: transform; }`}</style>
        </div>
    );
}
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import axios from "axios";
import useDateRange from "./Calendarhook2";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths
} from "date-fns";

const countryNameToCode = {
  "Afghanistan": "AF", "Albania": "AL", "Algeria": "DZ", "Andorra": "AD", "Angola": "AO",
  "Antigua and Barbuda": "AG", "Argentina": "AR", "Armenia": "AM", "Australia": "AU",
  "Austria": "AT", "Azerbaijan": "AZ", "Bahamas": "BS", "Bahrain": "BH", "Bangladesh": "BD",
  "Barbados": "BB", "Belarus": "BY", "Belgium": "BE", "Belize": "BZ", "Benin": "BJ",
  "Bhutan": "BT", "Bolivia": "BO", "Bosnia and Herzegovina": "BA", "Botswana": "BW",
  "Brazil": "BR", "Brunei": "BN", "Bulgaria": "BG", "Burkina Faso": "BF", "Burundi": "BI",
  "Cabo Verde": "CV", "Cambodia": "KH", "Cameroon": "CM", "Canada": "CA",
  "Central African Republic": "CF", "Chad": "TD", "Chile": "CL", "China": "CN",
  "Colombia": "CO", "Comoros": "KM", "Congo": "CG", "Costa Rica": "CR", "Croatia": "HR",
  "Cuba": "CU", "Cyprus": "CY", "Czechia": "CZ", "Czech Republic": "CZ", "Denmark": "DK",
  "Djibouti": "DJ", "Dominica": "DM", "Dominican Republic": "DO", "Ecuador": "EC",
  "Egypt": "EG", "El Salvador": "SV", "Equatorial Guinea": "GQ", "Eritrea": "ER",
  "Estonia": "EE", "Eswatini": "SZ", "Ethiopia": "ET", "Fiji": "FJ", "Finland": "FI",
  "France": "FR", "Gabon": "GA", "Gambia": "GM", "Georgia": "GE", "Germany": "DE",
  "Ghana": "GH", "Greece": "GR", "Grenada": "GD", "Guatemala": "GT", "Guinea": "GN",
  "Guinea-Bissau": "GW", "Guyana": "GY", "Haiti": "HT", "Honduras": "HN", "Hungary": "HU",
  "Iceland": "IS", "India": "IN", "Indonesia": "ID", "Iran": "IR", "Iraq": "IQ",
  "Ireland": "IE", "Israel": "IL", "Italy": "IT", "Jamaica": "JM", "Japan": "JP",
  "Jordan": "JO", "Kazakhstan": "KZ", "Kenya": "KE", "Kiribati": "KI", "Kuwait": "KW",
  "Kyrgyzstan": "KG", "Laos": "LA", "Latvia": "LV", "Lebanon": "LB", "Lesotho": "LS",
  "Liberia": "LR", "Libya": "LY", "Liechtenstein": "LI", "Lithuania": "LT",
  "Luxembourg": "LU", "Madagascar": "MG", "Malawi": "MW", "Malaysia": "MY",
  "Maldives": "MV", "Mali": "ML", "Malta": "MT", "Marshall Islands": "MH",
  "Mauritania": "MR", "Mauritius": "MU", "Mexico": "MX", "Micronesia": "FM",
  "Moldova": "MD", "Monaco": "MC", "Mongolia": "MN", "Montenegro": "ME", "Morocco": "MA",
  "Mozambique": "MZ", "Myanmar": "MM", "Namibia": "NA", "Nauru": "NR", "Nepal": "NP",
  "Netherlands": "NL", "New Zealand": "NZ", "Nicaragua": "NI", "Niger": "NE",
  "Nigeria": "NG", "North Korea": "KP", "North Macedonia": "MK", "Norway": "NO",
  "Oman": "OM", "Pakistan": "PK", "Palau": "PW", "Palestine": "PS", "Panama": "PA",
  "Papua New Guinea": "PG", "Paraguay": "PY", "Peru": "PE", "Philippines": "PH",
  "Poland": "PL", "Portugal": "PT", "Qatar": "QA", "Romania": "RO", "Russia": "RU",
  "Rwanda": "RW", "Saint Kitts and Nevis": "KN", "Saint Lucia": "LC",
  "Saint Vincent and the Grenadines": "VC", "Samoa": "WS", "San Marino": "SM",
  "Sao Tome and Principe": "ST", "Saudi Arabia": "SA", "Senegal": "SN", "Serbia": "RS",
  "Seychelles": "SC", "Sierra Leone": "SL", "Singapore": "SG", "Slovakia": "SK",
  "Slovenia": "SI", "Solomon Islands": "SB", "Somalia": "SO", "South Africa": "ZA",
  "South Korea": "KR", "South Sudan": "SS", "Spain": "ES", "Sri Lanka": "LK",
  "Sudan": "SD", "Suriname": "SR", "Sweden": "SE", "Switzerland": "CH", "Syria": "SY",
  "Taiwan": "TW", "Tajikistan": "TJ", "Tanzania": "TZ", "Thailand": "TH",
  "Timor-Leste": "TL", "Togo": "TG", "Tonga": "TO", "Trinidad and Tobago": "TT",
  "Tunisia": "TN", "Turkey": "TR", "Turkmenistan": "TM", "Tuvalu": "TV", "Uganda": "UG",
  "Ukraine": "UA", "United Arab Emirates": "AE", "UAE": "AE", "United Kingdom": "GB",
  "UK": "GB", "United States": "US", "USA": "US", "Uruguay": "UY", "Uzbekistan": "UZ",
  "Vanuatu": "VU", "Vatican City": "VA", "Venezuela": "VE", "Vietnam": "VN",
  "Yemen": "YE", "Zambia": "ZM", "Zimbabwe": "ZW"
};

// Fixed unique destinations — no duplicates, each with a country code
const UNIQUE_DESTINATIONS = [
  { name: "Goa",       countryCode: "IN", image: "https://s3.india.com/wp-content/uploads/2024/06/List-of-8-Famous-Beaches-Around-Goa.jpg?impolicy=Medium_Widthonly&w=800&h=541" },
  { name: "Manali",    countryCode: "IN", image: "https://www.snowvalleyresorts.com/wp-content/uploads/featurd-image-min-915x513.webp" },
  { name: "Jaipur",    countryCode: "IN", image: "https://t3.ftcdn.net/jpg/02/56/53/38/240_F_256533834_Chxhh4CkOk6YVnvAKGPSN3jc40rSTFaV.jpg" },
  { name: "Kerala",    countryCode: "IN", image: "https://media.worldnomads.com/Explore/india/kerala-backwaters-canoe-istock.jpg" },
  { name: "Mumbai",    countryCode: "IN", image: "https://greatruns.com/wp-content/uploads/2017/04/mumbai-cover.jpeg" },
  { name: "Paris",     countryCode: "FR", image: "https://t3.ftcdn.net/jpg/02/73/03/02/240_F_273030277_v8roAx6Z4kclxzNcBUIavuLitEfZySij.jpg" },
  { name: "Tokyo",     countryCode: "JP", image: "https://t3.ftcdn.net/jpg/04/98/23/10/240_F_498231018_6w6Zt0h2PdU4Muy5Tvph2VeNG67yTuwl.jpg" },
  { name: "New York",  countryCode: "US", image: "https://cdn.britannica.com/61/93061-050-99147DCE/Statue-of-Liberty-Island-New-York-Bay.jpg" },
  { name: "Dubai",     countryCode: "AE", image: "https://deih43ym53wif.cloudfront.net/large_dubai-palm-jumeirah-island-shutterstock_1291548640.jpg_3ab124c2b9.jpg" },
  { name: "Bali",      countryCode: "ID", image: "https://t3.ftcdn.net/jpg/02/63/19/78/240_F_263197896_NqmJWfTm7pljAVDfwl1U1gBAm3D08kCM.jpg"},
  { name: "Sydney",    countryCode: "AU", image: "https://t4.ftcdn.net/jpg/03/56/70/37/240_F_356703717_KwwdYG7MXCwV6TORIMxKUBN1lb0o1BTB.jpg" },
  { name: "Singapore", countryCode: "SG", image: "https://t3.ftcdn.net/jpg/01/88/33/86/240_F_188338662_3cGozCshsptU5gVHgPLdBeER1os5e0wX.jpg" },
  { name: "Istanbul",  countryCode: "TR", image: "https://t4.ftcdn.net/jpg/01/26/39/29/240_F_126392926_C39EtNWALNbR4OGKR3fybeUPFCtrySi0.jpg" },
  { name: "Maldives",  countryCode: "MV", image: "https://t3.ftcdn.net/jpg/03/34/77/78/240_F_334777839_Y7Y5P8FFY5WFo7sTwjeT0vxDbTGxhIo5.jpg" },
  { name: "Rome",      countryCode: "IT", image: "https://t4.ftcdn.net/jpg/12/37/42/81/240_F_1237428115_XfargDA0YTv6clijzRRMK8roAvJfOFXV.jpg" },
  { name: "London",    countryCode: "GB", image: "https://t4.ftcdn.net/jpg/02/57/75/51/240_F_257755130_JgTlcqTFxabsIKgIYLAhOFEFYmNgwyJ6.jpg" },
  { name: "Barcelona", countryCode: "ES", image: "https://t3.ftcdn.net/jpg/02/82/92/56/240_F_282925610_gHrIJtsSt6pBTwMbimLxadqZMbYqClTi.jpg" },
];

const getUniqueCards = () => {
  return [...UNIQUE_DESTINATIONS]
    .sort(() => 0.5 - Math.random()) 
    .slice(0, 9) 
    .map((dest) => ({
      name: dest.name,
      countryCode: dest.countryCode,
      image: dest.image 
    }));
};

// ── Explore Popup Modal — 2-step ──
const ExplorePopup = ({ card, onClose, onSearch }) => {
  const [step, setStep] = useState(1); // 1 = dates, 2 = guests
  const [popupMonth, setPopupMonth] = useState(new Date());
  const { checkIn, checkOut, onDateClick, isStart, isEnd, isInRange, isDisabled } = useDateRange();
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const handleNext = () => {
    if (!checkIn || !checkOut) { alert("Please select check-in and check-out dates"); return; }
    setStep(2);
  };

  const handleSearch = () => {
    const formattedCheckin = format(checkIn, "yyyy-MM-dd");
    const formattedCheckout = format(checkOut, "yyyy-MM-dd");
    onSearch(card.countryCode, card.name, adults, children, formattedCheckin, formattedCheckout);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl relative" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button onClick={() => setStep(1)} className="text-gray-400 hover:text-white transition text-lg leading-none">‹</button>
            )}
            <div>
              <p className="text-[10px] tracking-[4px] uppercase text-purple-400 mb-0.5">
                {step === 1 ? "Step 1 of 2 — Dates" : "Step 2 of 2 — Guests"}
              </p>
              <h2 className="text-2xl font-display tracking-widest text-white">{card.name}</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xl transition">✕</button>
        </div>

        <div className="p-4 md:p-6">

          {/* ── STEP 1: Dates ── */}
          {step === 1 && (
            <>
              <div className="relative flex items-center justify-center mb-6">
                <p className="font-display text-xl md:text-2xl tracking-[4px] text-amber-400 whitespace-nowrap">SELECT DATES</p>
                <div className="absolute right-0 flex gap-2">
                  <button onClick={() => setPopupMonth(m => addMonths(m, -1))}
                    className="w-8 h-8 border border-amber-400/30 text-amber-400 hover:bg-amber-400 hover:text-black transition-all rounded-sm text-sm">‹</button>
                  <button onClick={() => setPopupMonth(m => addMonths(m, 1))}
                    className="w-8 h-8 border border-amber-400/30 text-amber-400 hover:bg-amber-400 hover:text-black transition-all rounded-sm text-sm">›</button>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-8 justify-center max-h-[50vh] md:max-h-none overflow-y-auto md:overflow-visible custom-scrollbar pb-4 md:pb-0">
                {[0, 1].map((offset) => {
                  const month = addMonths(popupMonth, offset);
                  const start = startOfMonth(month);
                  const end = endOfMonth(month);
                  const days = eachDayOfInterval({ start, end });
                  return (
                    <div key={offset} className="flex-1">
                      <h3 className="text-center mb-3">{format(month, "MMMM yyyy")}</h3>
                      <div className="grid grid-cols-7 gap-1 md:gap-2 text-xs text-gray-400 text-center mb-2">
                        {["S","M","T","W","T","F","S"].map(d => <div key={d}>{d}</div>)}
                      </div>
                      <div className="grid grid-cols-7 gap-1 md:gap-2">
                        {days.map((day, i) => (
                          <div key={i} onClick={() => onDateClick(day)}
                            className={`p-1.5 md:p-2 text-center text-sm md:text-base rounded-lg cursor-pointer
                              ${isStart(day) ? "bg-blue-500 text-white rounded-l-full" : ""}
                              ${isEnd(day) ? "bg-blue-500 text-white rounded-r-full" : ""}
                              ${isInRange(day) ? "bg-purple-400/30" : ""}
                              ${isDisabled(day) ? "text-gray-600 cursor-not-allowed" : "hover:bg-blue-500/20"}`}>
                            {format(day, "d")}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="text-center mt-4 text-sm text-gray-300">
                <p>Check-in: {checkIn ? format(checkIn, "dd MMM yyyy") : "-"}</p>
                <p>Check-out: {checkOut ? format(checkOut, "dd MMM yyyy") : "-"}</p>
              </div>

              <button onClick={handleNext}
                className="mt-5 w-full p-3.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-bold text-sm hover:opacity-90 hover:scale-[1.01] active:scale-[.99] transition-all">
                Next — Select Guests →
              </button>
            </>
          )}

          {/* ── STEP 2: Guests ── */}
          {step === 2 && (
            <>
              <p className="text-xs text-gray-400 text-center mb-6">
                {format(checkIn, "dd MMM yyyy")} → {format(checkOut, "dd MMM yyyy")}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div>
                  <p className="text-xs text-gray-400 mb-2">Adults</p>
                  <div className="flex items-center bg-black/40 border border-white/10 rounded-xl overflow-hidden">
                    <button onClick={() => setAdults(a => Math.max(1, a - 1))} className="px-5 py-4 text-gray-400 hover:text-white hover:bg-white/5 transition text-xl">−</button>
                    <span className="flex-1 text-center text-white font-medium text-lg">{adults}</span>
                    <button onClick={() => setAdults(a => a + 1)} className="px-5 py-4 text-gray-400 hover:text-white hover:bg-white/5 transition text-xl">+</button>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-2">Children</p>
                  <div className="flex items-center bg-black/40 border border-white/10 rounded-xl overflow-hidden">
                    <button onClick={() => setChildren(c => Math.max(0, c - 1))} className="px-5 py-4 text-gray-400 hover:text-white hover:bg-white/5 transition text-xl">−</button>
                    <span className="flex-1 text-center text-white font-medium text-lg">{children}</span>
                    <button onClick={() => setChildren(c => c + 1)} className="px-5 py-4 text-gray-400 hover:text-white hover:bg-white/5 transition text-xl">+</button>
                  </div>
                </div>
              </div>

              <button onClick={handleSearch}
                className="w-full p-3.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-bold text-sm hover:opacity-90 hover:scale-[1.01] active:scale-[.99] transition-all">
                Search Hotels in {card.name}
              </button>
            </>
          )}

        </div>
      </div>
    </div>,
    document.body
  );
};

const HotelHome = () => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [cards, setCards] = useState([]);

  // Explore popup state
  const [exploreCard, setExploreCard] = useState(null);

  const { checkIn, checkOut, onDateClick, isStart, isEnd, isInRange, isDisabled } = useDateRange();

  const [search, setSearch] = useState({ location: "", countryCode: "IN", adults: 1, children: 0 });
  const inputRef = useRef(null);
  const suggestionRef = useRef(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => { setCards(getUniqueCards()); }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current && !inputRef.current.contains(event.target) &&
        suggestionRef.current && !suggestionRef.current.contains(event.target)
      ) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchPlaces = async (query) => {
    if (!query || query.length < 3) { setSuggestions([]); return; }
    setIsFetching(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/hotel/places?query=${query}`);
      setSuggestions(response.data?.data || []);
    } catch (error) {
      console.error("Failed to fetch from backend:", error.message);
      setSuggestions([]);
    } finally { setIsFetching(false); }
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setSearch({ ...search, location: value });
    setShowSuggestions(true);
    if (window.debounceTimeout) clearTimeout(window.debounceTimeout);
    window.debounceTimeout = setTimeout(() => fetchPlaces(value), 400);
  };

  const handleSelectSuggestion = (place) => {
    let extractedCountryCode = "IN";
    if (place.formattedAddress) {
      const countryName = place.formattedAddress.split(",").pop().trim();
      if (countryNameToCode[countryName]) extractedCountryCode = countryNameToCode[countryName];
    } else {
      extractedCountryCode = countryNameToCode[place.displayName] || "IN";
    }
    setSearch({ ...search, location: place.displayName, countryCode: extractedCountryCode });
    setShowSuggestions(false);
  };

  const handleSearch = () => {
    const formattedCheckin = checkIn ? format(checkIn, "yyyy-MM-dd") : "Any";
    const formattedCheckout = checkOut ? format(checkOut, "yyyy-MM-dd") : "Any";
    if (formattedCheckin === "Any" || formattedCheckout === "Any") { alert('complete the date part'); return; }
    const loc = search.location.trim().replace(/ /g, "%20") || "Any";
    window.location.href = `http://localhost:5174/hotels/search/${search.countryCode}/${loc}/${search.adults}/${search.children}/${formattedCheckin}/${formattedCheckout}`;
  };

  const handleExploreSearch = (countryCode, location, adults, children, checkin, checkout) => {
    const loc = location.trim().replace(/ /g, "%20");
    window.location.href = `http://localhost:5174/hotels/search/${countryCode}/${loc}/${adults}/${children}/${checkin}/${checkout}`;
  };

  return (
    <div className="min-h-screen bg-[#07060f] text-white px-6 md:px-16 py-10 relative overflow-hidden">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap');
        .font-display { font-family: 'Bebas Neue', cursive; }

        @keyframes drift1 { to { transform: translate(60px, 80px) scale(1.15); } }
        @keyframes drift2 { to { transform: translate(-60px, -50px) scale(1.2); } }
        @keyframes drift3 { to { transform: translate(-40px, 60px) scale(0.9); } }

        .dest-card img { transition: transform .7s cubic-bezier(.23,1,.32,1), filter .6s ease; }
        .dest-card:hover img { transform: scale(1.08); filter: brightness(.9) saturate(1.1); }

        .reveal { opacity: 0; transform: translateY(36px); transition: opacity .7s ease, transform .7s ease; }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .reveal-children > * { opacity: 0; transform: translateY(28px); transition: opacity .6s ease, transform .6s ease; }
        .reveal-children.visible > *:nth-child(1)  { opacity:1;transform:translateY(0);transition-delay:.05s }
        .reveal-children.visible > *:nth-child(2)  { opacity:1;transform:translateY(0);transition-delay:.12s }
        .reveal-children.visible > *:nth-child(3)  { opacity:1;transform:translateY(0);transition-delay:.19s }
        .reveal-children.visible > *:nth-child(4)  { opacity:1;transform:translateY(0);transition-delay:.26s }
        .reveal-children.visible > *:nth-child(5)  { opacity:1;transform:translateY(0);transition-delay:.33s }
        .reveal-children.visible > *:nth-child(6)  { opacity:1;transform:translateY(0);transition-delay:.40s }
        .reveal-children.visible > *:nth-child(7)  { opacity:1;transform:translateY(0);transition-delay:.47s }
        .reveal-children.visible > *:nth-child(8)  { opacity:1;transform:translateY(0);transition-delay:.54s }
        .reveal-children.visible > *:nth-child(9)  { opacity:1;transform:translateY(0);transition-delay:.61s }
        .reveal-children.visible > *:nth-child(10) { opacity:1;transform:translateY(0);transition-delay:.68s }

        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #1e293b; border-radius: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }

        /* Hide scrollbar for the mobile horizontal scrolling area */
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <RevealObserver cards={cards} />

      {/* ── Ambient glow blobs ── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute w-[700px] h-[700px] rounded-full -top-48 -left-24 opacity-25 blur-[130px] bg-purple-700" style={{ animation: 'drift1 14s ease-in-out infinite alternate' }} />
        <div className="absolute w-[500px] h-[500px] rounded-full -bottom-32 -right-24 opacity-20 blur-[120px] bg-blue-700" style={{ animation: 'drift2 17s ease-in-out infinite alternate' }} />
        <div className="absolute w-[400px] h-[400px] rounded-full top-[40%] left-[50%] opacity-15 blur-[100px] bg-pink-700" style={{ animation: 'drift3 11s ease-in-out infinite alternate' }} />
      </div>

      {/* ── Header ── */}
      <div className="text-center mb-12 relative z-10">
        <h1 className="text-5xl md:text-7xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
          Find Your Perfect Stay
        </h1>
        <p className="text-gray-400 mt-4 text-lg">
          Luxury hotels • Dream destinations • Elite experiences
        </p>
      </div>

      {/* ── Search box (Z-INDEX BUMP TO 50) ── */}
      <div className="relative z-[50] bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 md:p-6 shadow-2xl mb-12 max-w-[1200px] mx-auto">
        
        {/* Horizontal scroll area */}
        <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-2 md:pb-0 md:grid md:grid-cols-12 md:gap-4 md:overflow-visible items-end">
          
          {/* Location Input Area */}
          <div ref={inputRef} className="shrink-0 w-[260px] md:w-auto md:col-span-4">
            <p className="text-xs text-gray-400 mb-1">Where are you going?</p>
            <input
              value={search.location}
              onChange={handleLocationChange}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Enter destination (e.g. Nova Friburgo)"
              className="w-full p-4 rounded-xl bg-black/40 border border-white/10 focus:ring-2 focus:ring-blue-500 outline-none transition placeholder:text-gray-500"
            />
          </div>

          {/* Dates */}
          <div className="shrink-0 w-[260px] md:w-auto md:col-span-4 relative">
            <p className="text-xs text-gray-400 mb-1">Check-in — Check-out</p>
            <div onClick={() => setShowCalendar(true)}
              className="w-full p-4 rounded-xl bg-black/40 border border-white/10 cursor-pointer hover:bg-black/60 transition flex items-center justify-between group">
              <span className={checkIn && checkOut ? "text-white" : "text-gray-500"}>
                {checkIn && checkOut ? `${format(checkIn, "dd MMM")} — ${format(checkOut, "dd MMM")}` : "Select dates"}
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 group-hover:text-blue-400 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          {/* Adults */}
          <div className="shrink-0 w-[100px] md:w-auto md:col-span-1">
            <p className="text-xs text-gray-400 mb-1">Adults</p>
            <input type="number" min="1" value={search.adults}
              onChange={(e) => setSearch({ ...search, adults: e.target.value })}
              className="w-full p-4 rounded-xl bg-black/40 border border-white/10 outline-none focus:ring-2 focus:ring-blue-500 transition text-center" />
          </div>

          {/* Children */}
          <div className="shrink-0 w-[100px] md:w-auto md:col-span-1">
            <p className="text-xs text-gray-400 mb-1">Children</p>
            <input type="number" min="0" value={search.children}
              onChange={(e) => setSearch({ ...search, children: e.target.value })}
              className="w-full p-4 rounded-xl bg-black/40 border border-white/10 outline-none focus:ring-2 focus:ring-blue-500 transition text-center" />
          </div>

          {/* Search Button */}
          <div className="shrink-0 w-[140px] md:w-auto md:col-span-2">
            <button onClick={handleSearch}
              className="w-full p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition shadow-lg shadow-blue-500/25">
              Search
            </button>
          </div>
        </div>

        {/* ── Suggestions Dropdown (Moved OUTSIDE the scroll trap) ── */}
        {showSuggestions && search.location.length >= 3 && (
          <div className="absolute left-4 right-4 md:left-6 md:w-[32%] top-full mt-2 z-[9999]" ref={suggestionRef}>
            <ul className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl shadow-black/50 max-h-48 overflow-y-auto custom-scrollbar">
              {isFetching ? (
                <li className="p-3 text-sm text-slate-400 text-center">Loading places...</li>
              ) : suggestions.length > 0 ? suggestions.map((place, index) => {
                const uiCountry = place.formattedAddress ? place.formattedAddress.split(",").pop().trim() : "City";
                return (
                  <li key={index} onClick={() => handleSelectSuggestion(place)}
                    className="p-3 hover:bg-slate-700 cursor-pointer border-b border-slate-700/50 last:border-none flex justify-between items-center text-sm transition-colors">
                    <span className="text-slate-200 font-medium truncate pr-2">{place.displayName}</span>
                    <span className="text-blue-400 font-mono text-[11px] bg-blue-500/10 px-1.5 py-0.5 rounded shrink-0">{uiCountry}</span>
                  </li>
                );
              }) : (
                <li className="p-3 text-sm text-slate-400 text-center">No places found</li>
              )}
            </ul>
          </div>
        )}

      </div>

      {/* ── Section header (STAYS AT Z-10) ── */}
      <div className="reveal flex justify-between items-end mb-8 relative z-10">
        <div>
          <p className="text-[10px] tracking-[5px] uppercase text-purple-400 mb-2 font-display">— Popular Now</p>
          <h2 className="text-3xl md:text-5xl font-display tracking-wide bg-gradient-to-r from-white via-purple-200 to-blue-200 text-transparent bg-clip-text">
            Popular Destinations
          </h2>
        </div>
        <div className="hidden md:block w-24 h-px bg-gradient-to-r from-purple-500 to-transparent" />
      </div>

      {/* ── Cards grid ── */}
      <div className="reveal-children grid sm:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
        {cards.map((c, i) => {
          const tags = ["Trending", "Popular", "Featured"];
          const tag = tags[i % 3];
          const tagStyles = {
            Trending: "bg-red-500/20 text-red-300 border-red-500/30",
            Popular:  "bg-purple-500/20 text-purple-300 border-purple-500/30",
            Featured: "bg-blue-500/20 text-blue-300 border-blue-500/30",
          };
          const ratings = ["4.6","4.7","4.7","4.8","4.8","4.9"];
          const rating = ratings[i % ratings.length];
          const reviewCounts = ["1.8k","2.4k","3.1k","2.7k","4.1k","3.9k","4.6k","2.1k","5.2k","2.8k"];
          const reviewCount = reviewCounts[i % reviewCounts.length];
          const stars = "★".repeat(Math.floor(+rating)) + "☆".repeat(5 - Math.floor(+rating));

          return (
            <div
              key={i}
              className="dest-card group relative rounded-2xl overflow-hidden bg-[#0f0e1a] border border-white/[0.08] shadow-lg transition-all duration-300 hover:border-purple-500/40 cursor-pointer"
            >
              {/* image */}
              <div className="overflow-hidden h-48 relative">
                <span className={`absolute top-3 left-3 z-10 text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full border font-medium ${tagStyles[tag]}`}>
                  {tag}
                </span>
                <img
                  src={c.image}
                  className="h-full w-full object-cover brightness-95 transition-transform duration-700 "
                  alt={c.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07060f] via-[#07060f]/30 to-transparent" />
              </div>

              {/* body */}
              <div className="p-4">
                <h3 className="text-xl font-display tracking-widest text-white mb-1">{c.name}</h3>
                <p className="text-xs text-white/40 mb-4">Hotels &amp; Premium Stays</p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-purple-400 tracking-wider">{stars}</span>
                    <span className="text-[11px] text-white/40">{rating} · {reviewCount} reviews</span>
                  </div>
                  <button
                    onClick={() => setExploreCard(c)}
                    className="text-xs font-semibold px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 hover:scale-[1.04] active:scale-[.97] transition-all"
                  >
                    Explore
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Explore Popup ── */}
      {exploreCard && (
        <ExplorePopup
          card={exploreCard}
          onClose={() => setExploreCard(null)}
          onSearch={handleExploreSearch}
        />
      )}

      {/* ── Calendar Modal ── */}
      {showCalendar && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0f172a] p-4 md:p-6 rounded-2xl shadow-2xl w-full max-w-3xl relative">
            <button onClick={() => setShowCalendar(false)} className="absolute top-3 right-3 text-gray-400 hover:text-white">✕</button>

            <div className="relative flex items-center justify-center mb-6">
              <p className="font-display text-xl md:text-2xl tracking-[4px] text-amber-400 whitespace-nowrap">SELECT DATES</p>
              <div className="absolute right-0 flex gap-2">
                <button onClick={() => setCurrentMonth(m => addMonths(m, -1))}
                  className="w-8 h-8 border border-amber-400/30 text-amber-400 hover:bg-amber-400 hover:text-black transition-all rounded-sm text-sm">‹</button>
                <button onClick={() => setCurrentMonth(m => addMonths(m, 1))}
                  className="w-8 h-8 border border-amber-400/30 text-amber-400 hover:bg-amber-400 hover:text-black transition-all rounded-sm text-sm">›</button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 justify-center max-h-[50vh] md:max-h-none overflow-y-auto md:overflow-visible custom-scrollbar pb-4 md:pb-0">
              {[0, 1].map((offset) => {
                const month = addMonths(currentMonth, offset);
                const start = startOfMonth(month);
                const end = endOfMonth(month);
                const days = eachDayOfInterval({ start, end });
                return (
                  <div key={offset} className="flex-1">
                    <h3 className="text-center mb-3">{format(month, "MMMM yyyy")}</h3>
                    <div className="grid grid-cols-7 gap-1 md:gap-2 text-xs text-gray-400 text-center mb-2">
                      {["S","M","T","W","T","F","S"].map(d => <div key={d}>{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1 md:gap-2">
                      {days.map((day, i) => (
                        <div key={i} onClick={() => onDateClick(day)}
                          className={`p-1.5 md:p-2 text-center text-sm md:text-base rounded-lg cursor-pointer
                            ${isStart(day) ? "bg-blue-500 text-white rounded-l-full" : ""}
                            ${isEnd(day) ? "bg-blue-500 text-white rounded-r-full" : ""}
                            ${isInRange(day) ? "bg-purple-400/30" : ""}
                            ${isDisabled(day) ? "text-gray-600 cursor-not-allowed" : "hover:bg-blue-500/20"}`}>
                          {format(day, "d")}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-center mt-4 text-sm text-gray-300">
              <p>Check-in: {checkIn ? format(checkIn, "dd MMM yyyy") : "-"}</p>
              <p>Check-out: {checkOut ? format(checkOut, "dd MMM yyyy") : "-"}</p>
            </div>
            <button onClick={() => setShowCalendar(false)}
              className="mt-4 w-full p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl font-bold">Done</button>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

const RevealObserver = ({ cards }) => {
  useEffect(() => {
    if (!cards.length) return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.05 }
    );
    const timer = setTimeout(() => {
      document.querySelectorAll(".reveal, .reveal-children").forEach(el => {
        observer.observe(el);
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight) el.classList.add("visible");
      });
    }, 50);
    return () => { clearTimeout(timer); observer.disconnect(); };
  }, [cards]);
  return null;
};

export default HotelHome;
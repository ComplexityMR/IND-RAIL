import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// ==========================================
// 1. THE HOTEL CARD UI COMPONENT
// ==========================================
const HotelCard = ({ hotel, totalNights, onCardClick }) => {
  const hotelName = hotel?.name ? (hotel.name.charAt(0).toUpperCase() + hotel.name.slice(1)) : "Hotel Name";

  const hotelImage = hotel?.thumbnail || `https://picsum.photos/seed/${hotelName.replace(/ /g, "")}/600/400`;
  const hotelAddress = hotel?.address ? `${hotel.address}, ${hotel.city}` : hotel?.city || "Location Unavailable";
  const hotelRating = hotel?.rating || hotel?.stars || (Math.random() * (5 - 3.5) + 3.5).toFixed(1);
  const hotelPrice = hotel?.price;
  const pin = hotel?.zip || "";
  const rawDescription = hotel?.hotelDescription || "Experience luxury and comfort at our premium hotel, where exceptional service meets elegant accommodations. Enjoy world-class amenities, exquisite dining, and a prime location for an unforgettable stay.";
  const cleanDescription = rawDescription.replace(/<\/?[^>]+(>|$)/g, "");
  const refundable = hotel?.isrefundable ? "Refundable" : "Non-refundable";
  const expireIn = hotel?.expireIn || 200;
  const tax = hotel?.tax || 0;

  return (
    <div onClick={onCardClick} className="group bg-stone-800 border border-stone-700 rounded-2xl overflow-hidden shadow-md hover:shadow-lg hover:border-amber-500/50 transition-all duration-300 flex flex-col md:flex-row w-full cursor-pointer md:h-[280px]">

      {/* Left Section: Image */}
      <div className="relative md:w-[280px] shrink-0 h-48 md:h-full overflow-hidden bg-stone-900">
        <img
          src={hotelImage}
          alt={hotelName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80"; }}
        />
      </div>

      {/* Middle Section: Content & Details */}
      <div className="p-4 flex flex-col flex-1 border-b md:border-b-0 md:border-r border-stone-700 overflow-hidden">
        <div className="flex items-start mb-1">
          <h3 className="text-amber-400 font-bold text-xl text-left line-clamp-1 pr-4">{hotelName}</h3>
        </div>
        <div className="flex flex-row gap-1 justify-between mb-1.5">
          <p className="text-amber-200/80 text-sm flex items-start text-left gap-1 line-clamp-1 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="line-clamp-1">{hotelAddress}, {pin}</span>
          </p>
          <div className="flex text-amber-500 text-sm shrink-0 tracking-widest">
            {'★'.repeat(hotel?.stars || 3)}
          </div>
        </div>

        {/* Amenities/Tags */}
        <div className="flex flex-wrap gap-2 mb-1.5">
          <span className="text-xs border border-stone-600 bg-stone-900 text-amber-300 px-2 py-1 rounded">Couple Friendly</span>
          <span className="text-xs border border-stone-600 bg-stone-900 text-amber-300 px-2 py-1 rounded flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" /></svg>
            Free WiFi
          </span>
        </div>

        {/* Description */}
        <div className="text-sm text-amber-100/70 line-clamp-5 text-left leading-snug">
          {cleanDescription}
        </div>

        {/* Perks list */}
        <div className="mt-auto space-y-1 pt-3 md:pt-0">
          <p className="text-xs text-amber-500/80 flex items-center gap-1.5 font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
            {refundable}
          </p>
        </div>
      </div>

      {/* Right Section: Pricing & Actions */}
      {/* FIXED: Changed from strict right alignment to responsive left (mobile) -> right (desktop) */}
      <div className="p-4 flex flex-col justify-between items-start md:items-end md:w-[237px] shrink-0 bg-stone-900/40">
        <div className="w-full text-left md:text-right">
          <div className="flex justify-start md:justify-end mb-3">
            {/* FIXED: Bumped font size for readability */}
            <div className="bg-stone-900 text-amber-500 border border-stone-700 text-xs font-bold px-2 py-0.5 rounded flex items-center">
              Rating: {hotelRating}/10 ({hotel?.reviewCount || 0} Reviews)
            </div>
          </div>

          {/* FIXED: Bumped font size for readability */}
          <p className="text-[10px] text-amber-600 border border-stone-600 bg-stone-900 px-1.5 py-0.5 rounded uppercase font-semibold inline-block mb-1">
            Offer Expire In: {Math.floor(expireIn / 3600)} hour
          </p>
          <p className="text-amber-400 font-extrabold text-2xl leading-none mt-2">₹ {hotelPrice || "---"}</p>
          <p className="text-amber-500/80 font-medium text-xs mb-1">(Inclusive Tax of ₹{tax})</p>
          <p className="text-amber-600 text-xs font-medium">For {totalNights} Night{totalNights > 1 ? 's' : ''}</p>
        </div>

        {/* FIXED: Removed 'relative left-1' to prevent button overflow on mobile */}
        <div className="w-full mt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCardClick();
            }}
            className="w-full bg-amber-500 hover:bg-amber-400 text-stone-950 text-sm font-bold py-2 rounded-xl transition-all shadow-sm active:scale-[0.98]"
          >
            View Rooms Details
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 1.5. SKELETON SHIMMER UI COMPONENT 
// ==========================================
const HotelCardSkeleton = () => {
  return (
    <div className="group bg-stone-800/80 border border-stone-700/50 rounded-2xl overflow-hidden shadow-md flex flex-col md:flex-row w-full md:h-[280px] animate-pulse">
      <div className="relative md:w-[280px] shrink-0 h-48 md:h-full bg-stone-700/60"></div>
      <div className="p-4 flex flex-col flex-1 border-b md:border-b-0 md:border-r border-stone-700/50 overflow-hidden">
        <div className="h-7 bg-stone-700/60 rounded w-3/4 mb-3"></div>
        <div className="flex flex-row justify-between mb-4">
          <div className="h-4 bg-stone-700/60 rounded w-1/2"></div>
          <div className="h-4 bg-stone-700/60 rounded w-20"></div>
        </div>
        <div className="flex gap-2 mb-4">
          <div className="h-6 w-24 bg-stone-700/60 rounded"></div>
          <div className="h-6 w-24 bg-stone-700/60 rounded"></div>
        </div>
        <div className="space-y-2 mt-2">
          <div className="h-3 bg-stone-700/60 rounded w-full"></div>
          <div className="h-3 bg-stone-700/60 rounded w-5/6"></div>
        </div>
        <div className="mt-auto">
          <div className="h-4 bg-stone-700/60 rounded w-1/4 pt-3 md:pt-0"></div>
        </div>
      </div>
      <div className="p-4 flex flex-col justify-between items-start md:items-end md:w-[220px] shrink-0 bg-stone-900/30">
        <div className="h-6 bg-stone-700/60 rounded w-2/3 mb-3"></div>
        <div className="flex flex-col items-start md:items-end w-full mt-auto mb-4 space-y-2">
          <div className="h-3 bg-stone-700/60 rounded w-1/2"></div>
          <div className="h-7 bg-stone-700/60 rounded w-3/4"></div>
          <div className="h-3 bg-stone-700/60 rounded w-1/3"></div>
        </div>
        <div className="w-full h-10 bg-stone-700/60 rounded-xl"></div>
      </div>
    </div>
  );
};


// ==========================================
// 2. MAIN PAGE COMPONENT
// ==========================================
const Hotelcard = () => {
  const navigate = useNavigate();
  const { country, city, adults, children, checkin, checkout } = useParams();

  let totalNights = 1;

  if (checkin && checkout && checkin !== "Any" && checkout !== "Any") {
    const date1 = new Date(checkin);
    const date2 = new Date(checkout);
    if (!isNaN(date1.getTime()) && !isNaN(date2.getTime())) {
      const diffInMilliseconds = Math.abs(date2 - date1);
      const diffInDays = Math.ceil(diffInMilliseconds / (1000 * 60 * 60 * 24));
      totalNights = diffInDays > 0 ? diffInDays : 1;
    }
  }

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [isFiltering, setIsFiltering] = useState(false);
  
  // --- MOBILE FILTER UI STATE ---
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // --- PAGINATION STATE ---
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // --- FILTER STATE ---
  const [selectedFilters, setSelectedFilters] = useState({
    price: [],
    stars: [],
    rating: [],
    chains: []
  });

  const hotelChains = [
    "ITC Hotels", "Taj", "Oberoi", "JW Marriott", "Novotel",
    "Hyatt", "Radisson", "Le Meridien", "Holiday Inn", "Hilton",
    "Sheraton", "Windsor", "Ibis", "Lemon Tree", "Fairfield"
  ].sort();

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        if (offset === 0) setLoading(true);
        else setLoadingMore(true);
        
        setError(null);
        
        const apiUrl = `http://localhost:5000/api/hotels/search/${country}/${city}/${adults}/${children}/${checkin}/${checkout}?offset=${offset}&limit=50`;
        const response = await axios.get(apiUrl);
        
        const newHotels = response.data.data || [];
        
        if (offset === 0) {
          setHotels(newHotels);
        } else {
          setHotels(prevHotels => [...prevHotels, ...newHotels]);
        }
        
        setHasMore(response.data.hasMore);

      } catch (err) {
        console.error("Error fetching from backend:", err);
        if (offset === 0) setError("Unable to find hotels right now. Please try again.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    };
    fetchHotels();
  }, [country, city, adults, children, checkin, checkout, offset]);

  // --- INFINITE SCROLL OBSERVER ---
  const observer = useRef();
  
  const lastHotelElementRef = useCallback(node => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setOffset(prevOffset => prevOffset + 50);
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);


  // --- FILTER HANDLERS ---
  const handleFilterChange = (category, value) => {
    setIsFiltering(true);
    setSelectedFilters(prev => {
      const currentList = prev[category];
      if (currentList.includes(value)) {
        return { ...prev, [category]: currentList.filter(item => item !== value) };
      } else {
        return { ...prev, [category]: [...currentList, value] };
      }
    });

    setTimeout(() => {
      setIsFiltering(false);
    }, 600);
  };

  const clearAllFilters = () => {
    setIsFiltering(true);
    setSelectedFilters({ price: [], stars: [], rating: [], chains: [] });

    setTimeout(() => {
      setIsFiltering(false);
    }, 600);
  };

  // --- APPLY FILTERS ---
  const filteredHotels = useMemo(() => {
    return hotels.filter(hotel => {
      if (selectedFilters.price.length > 0) {
        const price = hotel?.price || 0;
        const matchesPrice = selectedFilters.price.some(range => {
          if (range === 'Below ₹2,000') return price < 2000;
          if (range === '₹2,000 - ₹5,000') return price >= 2000 && price <= 5000;
          if (range === '₹5,000 - ₹10,000') return price > 5000 && price <= 10000;
          if (range === '₹10,000+') return price > 10000;
          return false;
        });
        if (!matchesPrice) return false;
      }

      if (selectedFilters.stars.length > 0) {
        const stars = hotel?.stars || 3;
        if (!selectedFilters.stars.includes(stars)) return false;
      }

      if (selectedFilters.rating.length > 0) {
        const rating = parseFloat(hotel?.rating || hotel?.stars || 3.5);
        const matchesRating = selectedFilters.rating.some(r => {
          if (r === '9+ (Excellent)') return rating >= 9;
          if (r === '8+ (Very Good)') return rating >= 8;
          if (r === '7+ (Good)') return rating >= 7;
          return false;
        });
        if (!matchesRating) return false;
      }

      if (selectedFilters.chains.length > 0) {
        const hotelName = (hotel?.name || "").toLowerCase();
        const matchesChain = selectedFilters.chains.some(chain =>
          hotelName.includes(chain.toLowerCase())
        );
        if (!matchesChain) return false;
      }

      return true;
    });
  }, [hotels, selectedFilters]);


  return (
    <div className="min-h-screen w-full bg-stone-900 text-amber-200 font-sans flex flex-col selection:bg-amber-900 selection:text-amber-100">

      {/* Navbar */}
      <nav className="shrink-0 bg-stone-800 border-b border-stone-700 px-6 py-3 shadow-md z-50">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="h-9 w-9 rounded-lg bg-stone-900 border border-amber-500/50 flex items-center justify-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight text-amber-500">TripingBUDDY</span>
          </div>
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 bg-stone-700 hover:bg-stone-600 text-amber-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-stone-600">
            Modify Search
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 py-6 md:py-8 flex flex-col">

        {/* Header Section */}
        <div className="mb-6 border-b border-stone-700 pb-5">
          <h1 className="text-2xl md:text-3xl font-bold text-amber-400 mb-3">
            Stays in <span className="text-amber-500">{city !== "Any" ? city : "Popular Destinations"}</span>
          </h1>
          <div className="flex flex-wrap gap-2 text-xs md:text-sm text-amber-200/80 font-medium">
            <span className="bg-stone-800 px-4 py-2 rounded-lg border border-stone-700 shadow-sm">
              📅 {checkin !== "Any" ? checkin : "Any Date"} — {checkout !== "Any" ? checkout : "Any Date"}
            </span>
            <span className="bg-stone-800 px-4 py-2 rounded-lg border border-stone-700 shadow-sm">
              👥 {adults} Adults, {children} Children
            </span>
          </div>
        </div>

        {error && !loading ? (
          <div className="bg-stone-800 border border-stone-700 text-amber-400 p-6 rounded-xl text-center shadow-sm my-10 max-w-lg mx-auto">
            <h3 className="text-lg font-bold mb-2 text-amber-500">Oops!</h3>
            <p>{error}</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 pb-10 items-start relative">

            {/* FIXED: Mobile Filter Toggle Button */}
            <button 
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden w-full bg-stone-800 hover:bg-stone-700 flex items-center justify-center gap-2 p-3 rounded-xl text-amber-500 mb-2 font-bold border border-stone-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {isMobileFilterOpen ? "Close Filters" : "Filters & Sort"}
            </button>

            {/* Filters Sidebar (Hidden on mobile unless toggled) */}
            <div className={`w-full lg:w-[280px] shrink-0 bg-stone-800 border border-stone-700 rounded-2xl p-5 shadow-md ${isMobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
              <div className="flex items-center justify-between mb-6 border-b border-stone-700 pb-3">
                <h3 className="text-amber-400 font-bold text-lg flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                </h3>
                <span onClick={clearAllFilters} className="text-xs text-amber-500 font-medium cursor-pointer hover:text-amber-400 transition-colors">Clear All</span>
              </div>

              <div className="space-y-8">

                {/* Price Range Filter */}
                <div>
                  <p className="text-sm font-bold text-amber-500 mb-3 tracking-wide uppercase">Price Range</p>
                  <div className="space-y-2.5">
                    {['Below ₹2,000', '₹2,000 - ₹5,000', '₹5,000 - ₹10,000', '₹10,000+'].map(price => (
                      <label key={price} className="flex items-center gap-3 text-sm text-amber-200/80 hover:text-amber-400 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedFilters.price.includes(price)}
                          onChange={() => handleFilterChange('price', price)}
                          className="w-4 h-4 rounded border-stone-600 bg-stone-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-stone-800 cursor-pointer"
                        />
                        <span>{price}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="h-px w-full bg-stone-700"></div>

                {/* Star Rating Filter */}
                <div>
                  <p className="text-sm font-bold text-amber-500 mb-3 tracking-wide uppercase">Star Rating</p>
                  <div className="space-y-2.5">
                    {[5, 4, 3].map(star => (
                      <label key={star} className="flex items-center gap-3 text-sm text-amber-200/80 hover:text-amber-400 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedFilters.stars.includes(star)}
                          onChange={() => handleFilterChange('stars', star)}
                          className="w-4 h-4 rounded border-stone-600 bg-stone-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-stone-800 cursor-pointer"
                        />
                        <span className="flex text-amber-500 text-sm tracking-widest">{'★'.repeat(star)}</span>
                        <span className="text-xs ml-1 text-amber-500/50">({star} Star)</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="h-px w-full bg-stone-700"></div>

                {/* Guest Rating Filter */}
                <div>
                  <p className="text-sm font-bold text-amber-500 mb-3 tracking-wide uppercase">Guest Rating</p>
                  <div className="space-y-2.5">
                    {['9+ (Excellent)', '8+ (Very Good)', '7+ (Good)'].map(rating => (
                      <label key={rating} className="flex items-center gap-3 text-sm text-amber-200/80 hover:text-amber-400 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedFilters.rating.includes(rating)}
                          onChange={() => handleFilterChange('rating', rating)}
                          className="w-4 h-4 rounded border-stone-600 bg-stone-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-stone-800 cursor-pointer"
                        />
                        <span>{rating}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="h-px w-full bg-stone-700"></div>

                {/* Hotel Chains Filter */}
                <div>
                  <p className="text-sm font-bold text-amber-500 mb-3 tracking-wide uppercase">Hotel Chains</p>
                  <div className="space-y-2.5 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {hotelChains.map(chain => (
                      <label key={chain} className="flex items-center gap-3 text-sm text-amber-200/80 hover:text-amber-400 cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={selectedFilters.chains.includes(chain)}
                          onChange={() => handleFilterChange('chains', chain)}
                          className="w-4 h-4 rounded border-stone-600 bg-stone-900 text-amber-500 focus:ring-amber-500 focus:ring-offset-stone-800 cursor-pointer shrink-0"
                        />
                        <span className="truncate">{chain}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                {/* Mobile 'Apply/Done' button inside drawer */}
                <button 
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="lg:hidden w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold py-2.5 rounded-xl mt-4"
                >
                  Show Results
                </button>

              </div>
            </div>

            {/* Right Section: Hotel Cards List OR Skeleton Shimmers */}
            <div className="w-full flex-1 flex flex-col gap-5">
              {(loading && offset === 0) || isFiltering ? (
                <>
                  <HotelCardSkeleton />
                  <HotelCardSkeleton />
                  <HotelCardSkeleton />
                  <HotelCardSkeleton />
                  <HotelCardSkeleton />
                </>
              ) : filteredHotels.length > 0 ? (
                <>
                  {filteredHotels.map((hotel, index) => {
                    if (filteredHotels.length === index + 1) {
                      return (
                        <div ref={lastHotelElementRef} key={`${hotel.id}-${index}`}>
                          <HotelCard
                            onCardClick={() => navigate(`/hotel/${hotel.id}/${checkin}/${checkout}/${adults}/${children}`)}
                            hotel={hotel}
                            totalNights={totalNights}
                          />
                        </div>
                      );
                    } else {
                      return (
                        <HotelCard
                          key={`${hotel.id}-${index}`}
                          onCardClick={() => navigate(`/hotel/${hotel.id}/${checkin}/${checkout}/${adults}/${children}`)}
                          hotel={hotel}
                          totalNights={totalNights}
                        />
                      );
                    }
                  })}
                  
                  {/* Show a mini skeleton at the bottom while loading more */}
                  {loadingMore && (
                     <div className="mt-4"><HotelCardSkeleton /></div>
                  )}
                  
                  {/* Message when user reaches the absolute bottom */}
                  {!hasMore && !loading && (
                    <div className="py-8 text-center text-amber-500/60 font-semibold border-t border-stone-700/50 mt-4">
                      You've seen all available hotels for these dates!
                    </div>
                  )}
                </>
              ) : (
                <div className="py-16 text-center bg-stone-800 rounded-2xl border border-stone-700 shadow-sm">
                  <div className="text-5xl mb-4 text-amber-600/50">🏙️</div>
                  <h3 className="text-xl font-bold text-amber-400 mb-2">No hotels found</h3>
                  <p className="text-amber-200/80">Try adjusting your search filters or searching a different city.</p>
                </div>
              )}
            </div>

          </div>
        )}
      </main>

      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #57534e; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #f59e0b; }
      `}} />
    </div>
  );
};

export default Hotelcard;
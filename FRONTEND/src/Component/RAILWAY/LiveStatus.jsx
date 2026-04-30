import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { FiRefreshCw } from "react-icons/fi";

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const fmtTime = (epoch) =>
  epoch ? new Date(epoch * 1000).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true }) : "";

const minsToStr = (mins) => {
  if (mins == null) return "";
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;
};

const fmtDelay = (mins) => {
  if (!mins || mins === 0) return null;
  return mins > 0 ? `+${mins}m` : `${mins}m`;
};

const todayStr = () => new Date().toISOString().slice(0, 10);

const mergeRoute = (route, liveRoute, currentCode) => {
  const liveMap = (liveRoute || []).reduce((m, s) => ({ ...m, [s.stationCode]: s }), {});
  const currentIdx = currentCode ? route.findIndex(s => s.stationCode === currentCode) : -1;
  return route.map((s, idx) => {
    const live = liveMap[s.stationCode] || {};
    const delay = fmtDelay(live.delayArrivalMinutes ?? live.delayDepartureMinutes ?? 0);

    let state = "future";
    if (currentIdx !== -1) {
      if (idx < currentIdx) state = "past";
      if (idx === currentIdx) state = "current";
    }

    const schArrStr = live.scheduledArrival
      ? fmtTime(live.scheduledArrival)
      : (s.scheduledArrival != null ? minsToStr(s.scheduledArrival) : "");

    const actArrStr = live.actualArrival
      ? fmtTime(live.actualArrival)
      : (state !== "future" && schArrStr ? schArrStr : "");

    const schDepStr = live.scheduledDeparture
      ? fmtTime(live.scheduledDeparture)
      : (s.scheduledDeparture != null ? minsToStr(s.scheduledDeparture) : "");

    const actDepStr = live.actualDeparture
      ? fmtTime(live.actualDeparture)
      : (state !== "future" && schDepStr ? schDepStr : "");

    return {
      isHalt: s.isHalt === 1,
      name: s.stationName,
      code: s.stationCode,
      km: s.distanceFromSourceKm,
      platform: live.platform ?? s.platform ?? null,
      delay: state !== "future" ? delay : null,
      state,
      sch: schArrStr,
      act: actArrStr,
      schDep: schDepStr,
      actDep: actDepStr,
      currentCode: currentCode,
      rawArrival: live.scheduledArrival,
      actrawArrival: live.actualArrival,
      rawDeparture: live.scheduledDeparture,
      actrawDeparture: live.actualDeparture,
    };
  });
};

const groupStops = (stops) =>
  stops.reduce((acc, stop) => {
    if (stop.isHalt) acc.push({ major: stop, inter: [] });
    else if (acc.length) acc[acc.length - 1].inter.push(stop);
    return acc;
  }, []);

// ─── ICONS ──────────────────────────────────────────────────────────────────

const TrainIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tram-front w-4 h-4 text-primary-foreground" aria-hidden="true"><rect width="16" height="16" x="4" y="3" rx="2"></rect><path d="M4 11h16"></path><path d="M12 3v8"></path><path d="m8 19-2 3"></path><path d="m18 22-2-3"></path><path d="M8 15h.01"></path><path d="M16 15h.01"></path></svg>
);


// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function StopDot({ state }) {
  const isPastOrCurrent = state === "past" || state === "current";
  return (
    <div className={`w-3 h-3 rounded-full shrink-0 mt-1.5 z-10 
      ${isPastOrCurrent ? "bg-[#ffffffa4]" : "bg-[#ffffffd2]"} 
      ${state === "future" ? "border-2 border-[#444]" : ""}`}
    />
  );
}

function MajorStop({ major }) {
  const isCurrent = major.state === "current";

  return (
    <div id={`station-${major.code}`} className="flex items-start font-saira relative w-full">

      <div className="w-[75px] md:w-[85px] relative right-3 md:right-6 shrink-0 text-left pr-2 md:pr-4 pt-0.5">
        <div className="text-[10px] md:text-xs text-[#666] whitespace-nowrap">{major.sch}</div>
        {major.actrawArrival ?
          <div className={`text-[11px] md:text-[13px] font-semibold mt-0.5 whitespace-nowrap ${major.delay > 0 || major.actrawArrival > major.rawArrival ? "text-[#e05d5d]" : "text-[#46f511d8]"}`}>
            {major.act}
          </div> :
          <div className={`text-[11px] md:text-[13px] font-semibold mt-0.5 whitespace-nowrap ${major.delay > 0 || major.actrawArrival > major.rawArrival ? "text-[#e05d5d]" : "text-[#46f511d8]"}`}>
            ---
          </div>
        }
      </div>

      <div className="w-[30px] relative right-4 md:right-10 flex justify-center shrink-0 pt-1.5 z-10">
        <StopDot state={major.state} />
      </div>

      <div className="flex-1 min-w-0 flex flex-col relative right-4 md:right-9 items-start pl-2 pb-2">
        <div className={`text-[16px] md:text-[18px] leading-tight ${isCurrent ? "font-bold text-[#4a90d9]" : "font-medium text-[#eee]"}`}>
          {major.name}
          <span className="text-[10px] md:text-[11px] text-[#777] font-medium ml-1.5">{major.code}</span>

          {major.delay && (
            <span className="inline-block bg-[#e05d5d]/15 text-[#e05d5d] border border-[#e05d5d]/30 text-[10px] font-bold px-1.5 py-0.5 rounded-xl ml-2">
              {major.delay}
            </span>
          )}
        </div>

        <div className="flex gap-2 items-center mt-1">
          {major.km != null && <div className="text-xs text-[#666]">{major.km} km</div>}
          {major.platform && <div className="bg-[#222] text-[#888] text-[10px] px-1.5 py-0.5 rounded font-semibold">PF {major.platform}</div>}
        </div>
      </div>

      <div className="w-[75px] md:w-[85px] shrink-0 text-right pr-2 md:pr-4 pt-0.5 bottom-[7px]">
        <div className="text-[10px] md:text-xs text-[#666] whitespace-nowrap">{major.schDep}</div>
        {major.actrawDeparture ?
          <div className={`text-[11px] md:text-[13px] font-semibold mt-0.5 whitespace-nowrap ${major.delay > 0 || major.actrawDeparture > major.rawDeparture ? "text-[#e05d5d]" : "text-[#46f511d8]"}`}>
            {major.actDep}
          </div> :
          <div className={`text-[11px] md:text-[13px] font-semibold mt-0.5 whitespace-nowrap text-white`}>
            ---
          </div>
        }
      </div>
    </div>
  );
}

function InterList({ stops, currentCode }) {
  return stops.map((s) => {
    const isPastOrCurrent = s.state === "past" || s.state === "current";
    const isCurrent = s.state === "current";

    return (
      <div id={`station-${s.code}`} key={s.code} className="flex bg-[#58585a0c] items-center py-[15px] relative w-full">

        <div className="w-[75px] md:w-[85px] relative right-3 md:right-6 shrink-0 text-left pr-2 md:pr-4 pt-0.5">
          <div className="text-[10px] md:text-xs text-[#666] whitespace-nowrap">{s.sch || "-"}</div>
          {s.act && (
            <div className={`text-[11px] md:text-[13px] font-semibold mt-0.5 whitespace-nowrap ${s?.delay?.includes('-') ? "text-[#46f511d8]" : "text-[#e05d5d]"}`}>
              {s.act}
            </div>
          )}
        </div>

        <div className="w-[30px] relative right-4 md:right-10 flex justify-center shrink-0 z-10">
          <div className={`w-2 h-2 rounded-full shrink-0 
            ${isPastOrCurrent ? "bg-[#ffffffa4]" : "bg-[#333]"} 
            ${s.state === "future" ? "border-[1.5px] border-[#444]" : ""}`}
          />
        </div>

        <div className="flex-1 min-w-0 pl-2 flex relative right-4 md:right-9 flex-col justify-center">
          <div className="flex items-center gap-2">
            <div className={`text-[13px] md:text-[14px] font-serif truncate ${isCurrent ? "text-[#4a90d9] font-semibold" : "text-[#888] font-normal"}`}>
              {s.name}
            </div>
            <span className="text-[9px] md:text-[10px] text-[#777575] font-bold">{s.code}</span>
          </div>

          {s.km != null && (
            <div className="text-[10px] md:text-[11px] text-left relative text-[#666] font-bold mt-0.5">
              {s.km} km
            </div>
          )}
        </div>

        <div className="w-[75px] md:w-[85px] shrink-0 text-right pr-2 md:pr-4 pt-0.5 bottom-[7px]">
          <div className="text-[10px] md:text-xs text-[#666] whitespace-nowrap">{s.schDep}</div>
          {s.code == currentCode ?
            <div className={`text-[11px] md:text-[13px] font-semibold mt-0.5 whitespace-nowrap ${s?.delay?.includes('-') ? "text-[#46f511d8]" : "text-[#e05d5d]"}`}>
              {s.actDep}
            </div>
            : <div className={`text-[11px] md:text-[13px] font-semibold mt-0.5 whitespace-nowrap text-white`}>
              {"----"}
            </div>
          }
        </div>
      </div>
    );
  });
}

function StopGroup({ major, inter, nextStopCode, currentCode }) {
  const isTrainInside = inter.some(s => s.code === currentCode || s.code === nextStopCode);
  const [open, setOpen] = useState(isTrainInside);

  useEffect(() => {
    if (isTrainInside) setOpen(true);
  }, [isTrainInside]);

  const baseMargin = 20;
  const perStation = 6;
  const maxMargin = 200;

  const dynamicMargin = inter.length > 0
    ? `${Math.min(baseMargin + (inter.length * perStation), maxMargin)}px`
    : "24px";

  // Toggle function for the entire group
  const toggleOpen = () => setOpen(!open);

  return (
    <div className="flex flex-col" style={{ marginBottom: dynamicMargin }}>
      <MajorStop major={major} />

      {inter.length > 0 && (
        <div className="flex flex-col group/inter">
          {/* 1. Toggle Button */}
          <button
            onClick={toggleOpen}
            className={`flex items-center justify-center gap-2 w-full py-1 border-none text-[13px] font-bold cursor-pointer outline-none transition-colors ${open ? "text-[#4a90d9]" : "text-[#666]"}`}
          >
            <svg
              width="12" height="12" viewBox="0 0 12 12" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round"
              className={`shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            >
              <path d="M2 4l4 4 4-4" />
            </svg>
            <span>
              {open ? "Hide Stations" : `${inter.length} Intermediate Stations`}
              {isTrainInside && !open && (
                <span className="ml-2 text-[9px] text-[#22c55e] animate-pulse">● LIVE HERE</span>
              )}
            </span>
          </button>

          {/* 
             2. Interactive List Area 
             Added onClick={toggleOpen} so clicking anywhere opens/closes it.
             Added transition-colors for a subtle hover effect.
          */}
          <div 
            className="grid-transition overflow-hidden -ml-8 pl-8 w-[calc(100%+32px)] cursor-pointer hover:bg-white/[0.02] active:bg-white/[0.05] transition-colors" 
            data-expanded={open}
            onClick={toggleOpen}
          >
            <div className="inter-content min-h-0">
              <div className="pb-2">
                <InterList stops={inter} currentCode={currentCode} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// ─── TIMELINE VIEW ────────────────────────────────────────────────────────────

function InfoTile({ label, value, children }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-[#2c2c2e]/40 border border-[#3a3a3c] rounded-xl transition-all hover:bg-[#2c2c2e]/60">
      <div className="w-9 h-9 flex items-center justify-center bg-[#3a3a3c] rounded-lg text-blue-400 text-lg">
        {children}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] uppercase font-bold text-[#777] tracking-wider leading-tight">{label}</span>
        <span className="text-[13px] font-semibold text-[#eee] truncate leading-tight mt-0.5">{value}</span>
      </div>
    </div>
  );
}

function ProgressBar({ mockCurrentDistance, mockTotalDistance }) {
  const safeTotal = mockTotalDistance > 0 ? mockTotalDistance : 1;
  const current = mockCurrentDistance || 0;
  const calculatedProgress = Math.min(Math.max((current / safeTotal) * 100, 0), 100);

  return (
    <div className="p-4 mx-auto text-white rounded-xl ">
      <div className="flex justify-between relative bottom-1 text-sm">
        <span className="text-gray-400 font-medium">Origin</span>
        <span className="text-gray-400 font-medium">Destination</span>
      </div>
      <div className="h-2 bg-[#2a2a2a] rounded-full w-full relative overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-[#4a90d9] rounded-full transition-all duration-1000 ease-in-out"
          style={{ width: `${calculatedProgress}%` }}
        ></div>
      </div>
      <p className="text-center relative top-1 text-xs text-[#888] font-bold tracking-wide">
        {Math.round(calculatedProgress)}% JOURNEY COMPLETED
      </p>
    </div>
  );
}

function TrainTimeline({ data, onRefresh }) {
  const { train, route, liveData } = data;
  const currentCode = liveData?.currentLocation?.stationCode;
  const isLive = !!currentCode;
  const isTransit = liveData?.currentLocation?.status !== "AT_STATION";

  const stops = mergeRoute(route, liveData?.route, currentCode);
  const groups = groupStops(stops);

  const currentStop = stops.find(s => s.state === "current");
  const nextStop = stops.find((s, i) => s.state === "future" && stops[i - 1]?.state === "current");
  const CurrentStationName = stops.find(s => s.code === currentCode)?.name || "N/A";

  const nextMajorStop = stops.find(s => s.isHalt && s.state === "future");
  const nextMajorStopName = nextMajorStop?.name || "Destination Reached";

  const containerRef = useRef(null);
  const hasScrolledRef = useRef(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useLayoutEffect(() => {
    const updateLineHeight = () => {
      if (!isLive || !containerRef.current || !currentCode) return;
      let activeNode = document.getElementById(`station-${currentCode}`);
      let nextNode = nextStop ? document.getElementById(`station-${nextStop.code}`) : null;
      const containerRect = containerRef.current.getBoundingClientRect();

      const getCenterY = (node) => {
        if (!node) return null;
        const wrapper = node.closest('.grid-transition');
        const isHidden = wrapper && wrapper.getAttribute('data-expanded') === 'false';
        if (isHidden) {
          const stopGroupDiv = node.closest('[style*="margin-bottom"]');
          const button = wrapper.previousElementSibling;
          if (stopGroupDiv && button) {
            const startY = (button.getBoundingClientRect().top - containerRect.top) + (button.getBoundingClientRect().height / 2);
            const marginPx = parseInt(stopGroupDiv.style.marginBottom || '0', 10);
            const endY = startY + marginPx;
            const siblings = Array.from(node.parentElement.children);
            const index = siblings.indexOf(node);
            const total = siblings.length;
            if (index !== -1 && total > 0) {
              const proportion = (index + 1) / (total + 1);
              return startY + (endY - startY) * proportion;
            }
          }
        }
        const rect = node.getBoundingClientRect();
        return (rect.top - containerRect.top) + (rect.height / 2);
      };

      const activeCenterY = getCenterY(activeNode);
      let finalHeight = activeCenterY;

      if (isTransit && nextNode) {
        const nextCenterY = getCenterY(nextNode);
        if (activeCenterY !== null && nextCenterY !== null) {
          finalHeight = activeCenterY + ((nextCenterY - activeCenterY) * 0.5);
        }
      }
      if (finalHeight !== null) {
        containerRef.current.style.setProperty('--active-line-height', `${finalHeight}px`);
      }

      if (!hasScrolledRef.current && activeNode) {
        const wrapper = activeNode.closest('.grid-transition');
        const isHidden = wrapper && wrapper.getAttribute('data-expanded') === 'false';
        const scrollTarget = isHidden ? wrapper.previousElementSibling : activeNode;
        setTimeout(() => {
          scrollTarget?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 400);
        hasScrolledRef.current = true;
      }
    };

    updateLineHeight();
    const resizeObserver = new ResizeObserver(() => {
      window.requestAnimationFrame(updateLineHeight);
    });
    if (containerRef.current) resizeObserver.observe(containerRef.current);
    window.addEventListener("resize", updateLineHeight);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateLineHeight);
    };
  }, [currentCode, isLive, isTransit, nextStop]);

  const h = Math.floor(train.travelTimeMinutes / 60);
  const m = train.travelTimeMinutes % 60;

  const currentStationLiveInfo = liveData?.route?.find(station => station.stationCode === currentCode);
  const currentDelay = currentStationLiveInfo?.delayDepartureMinutes || 0;
  const distanceCovered = liveData?.currentLocation?.distanceFromOriginKm || 0;
  const totalDistance = train.distanceKm || 0;

  return (
    <div>
      {/* ─── ORIGINAL BOX (NO CHANGES TO STYLE) ─── */}
      <div className="flex flex-col mb-6 p-6 bg-[#1c1c1e] rounded-2xl border border-[#2d2d2f] shadow-sm">
        <div className="flex flex-col items-center justify-center mb-5 text-center">
          <div className="flex flex-col items-center gap-2">
            <h3 className="text-3xl font-bold text-white tracking-tight leading-none">
              {train.trainNumber} — {train.trainName}
            </h3>
            <h3 className="text-1xl relative top-2 font-bold text-white tracking-tight leading-none">
              {train.hindiName !== "null" ? train.hindiName : ""}
            </h3>
            <p className="text-[12px] relative top-2 text-[#777] font-medium uppercase tracking-wider">
              {train.sourceStationName} → {train.destinationStationName}
            </p>

            <div className="mt-1">
              {isLive ? (
                <span className="inline-flex items-center gap-1.5 bg-[#22c55e]/10 text-[#22c55e] text-[10px] font-bold px-3 py-1 rounded-full border border-[#22c55e]/20 uppercase tracking-wide">
                  <span className="live-dot" /> Live Tracking
                </span>
              ) : (
                <span className="inline-flex items-center bg-[#ffa500]/10 text-[#ffa500] text-[10px] font-bold px-3 py-1 rounded-full border border-[#ffa500]/20 uppercase tracking-wide">
                  ⚠️ Offline
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
          <InfoTile label="Running Days" value={train.runningDays.allDays ? "All Days" : train.runningDays.days?.join(", ") || "N/A"}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400 shrink-0"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
          </InfoTile>
          <InfoTile label="Travel Time" value={h > 0 ? `${h}h ${m}m` : `${m}m`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400 shrink-0"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          </InfoTile>
          <InfoTile label="Distance" value={`${train.distanceKm || 0} km`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400 shrink-0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></svg>
          </InfoTile>
          <InfoTile label="Avg Speed" value={`${train.avgSpeedKmph || 0} km/h`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400 shrink-0"><path d="m12 14 4-4" /><path d="M3.34 19a10 10 0 1 1 17.32 0" /></svg>
          </InfoTile>
          <InfoTile label="Return Train" value={train.returnTrainNumber || "N/A"}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400 shrink-0"><path d="m7 21-4-4 4-4" /><path d="M3 17h18" /><path d="m17 3 4 4-4 4" /><path d="M21 7H3" /></svg>
          </InfoTile>
          <InfoTile label="Halts" value={train.totalHalts || "Express"}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400 shrink-0"><rect width="16" height="16" x="4" y="3" rx="2" /><path d="M4 11h16" /><path d="M12 3v8" /><path d="m8 19-2 3" /><path d="m18 22-2-3" /></svg>
          </InfoTile>
        </div>
      </div>

      <div ref={containerRef} className="relative pl-2.5 mb-[200px] mt-4">
        {/* Adjusted Track Position for alignment */}
        <div className="absolute left-[47px] md:left-[59px] w-[15px] top-0 rounded-xl bottom-0 bg-[#14131370]" />

        {isLive && (
          <>
            <div
              className="absolute left-[47px] md:left-[59px] w-[15px] bg-[#4a8fd9da] rounded-xl z-10 transition-all duration-300 ease-out"
              style={{ height: 'calc(var(--active-line-height, 0px) - 20px)' }}
            />
            <div
              className={`absolute left-[54px] md:left-[66px] -translate-x-1/2 -translate-y-1/2 bg-[#2b86e7] rounded-full p-1.5 z-10 flex items-center justify-center transition-all duration-300 ease-out ${isTransit ? "animate-pulse" : ""}`}
              style={{ top: 'var(--active-line-height, 20px)' }}
            >
              <TrainIcon />
            </div>
          </>
        )}

        <div className="relative flex flex-col gap-2">
          {groups.map((g) => (
            <StopGroup
              key={g.major.code}
              major={g.major}
              inter={g.inter}
              currentCode={currentCode}
              nextStopCode={nextStop?.code}
            />
          ))}
        </div>
      </div>

      {isLive && currentStop && (
        <div
          className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full md:w-[70vw] z-50 flex flex-col bg-[#1a1a1a]/95 backdrop-blur-md rounded-t-[16px] border-t border-[#333] shadow-[0_-10px_40px_rgba(0,0,0,0.8)] transition-transform duration-300 ease-in-out"
          style={{ transform: isExpanded ? 'translateY(0)' : 'translateY(calc(100% - 76px))' }}
        >
          <div className="w-full px-4 pt-2 pb-3 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
            <div className="w-[36px] h-[3px] bg-[#555] rounded-full mx-auto mb-2 transition-colors hover:bg-[#777]"></div>
            <div className="flex justify-between items-center mt-1">
              <div>
                <div className="text-[18px] text-[#eee] font-semibold leading-tight">
                  {isTransit ? "Departed from" : "Currently at"} <span className="text-[#4a90d9]">{currentStop.name}</span>
                </div>
              </div>
              <div className="text-right flex items-center gap-2">
                {liveData?.lastUpdatedAt && (
                  <span className="hidden sm:inline text-[12px] text-[#888]">
                    Updated {new Date(liveData.lastUpdatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })}
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRefresh();
                    hasScrolledRef.current = false;
                  }}
                  className="bg-[#333] hover:bg-[#444] text-blue-400 p-1.5 rounded-full shadow-lg transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer border border-[#444]"
                >
                  <FiRefreshCw size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="px-4 pb-6 pt-1 overflow-hidden max-h-[45vh] border-t border-[#333]">
            <div className="space-y-3 mt-3">
              <ProgressBar mockCurrentDistance={distanceCovered} mockTotalDistance={totalDistance} />
              <div className="grid relative bottom-2 grid-cols-2 gap-3">
                <div className="bg-[#222] p-3 rounded-xl border border-[#333]">
                  <p className="text-[9px] text-[#888] font-bold tracking-wider uppercase">Next Station</p>
                  <p className="text-[#eee] font-bold text-base mt-0.5 truncate">
                    {nextMajorStopName ? nextMajorStopName : (isTransit ? "N/A" : "At Final Destination")}
                  </p>
                  <p className="text-[#eee] font-bold text-sm mt-0.5 truncate">
                    Left: {nextMajorStop ? (nextMajorStop.km - currentStop.km).toFixed(1) : "0"} km ({nextMajorStop?.act || "--"})
                  </p>
                </div>
                <div className="bg-[#222] p-3 rounded-xl border border-[#333]">
                  <p className="text-[9px] text-[#888] font-bold tracking-wider uppercase">Final Destination</p>
                  <p className="text-[#eee] font-bold text-base mt-0.5 truncate">{train ? train?.destinationStationName : "--"}</p>
                  <p className="text-[#eee] font-bold text-sm mt-0.5 truncate">
                    Left: {train && liveData?.currentLocation ? (train.distanceKm - liveData.currentLocation.distanceFromOriginKm).toFixed(1) : "0"} km - {groups[groups.length - 1]?.major?.act || "--"}
                  </p>
                </div>
              </div>
              <div className={`${currentDelay > 0 ? "bg-[#ff2c2cef]" : "bg-[#27ff0a9f]"} border text-xl relative bottom-3 text-center border-red-500/30 text-[#ffffff] font-medium px-3 py-2.5 rounded-xl w-full`}>
                {currentDelay > 0 ? `Train is Delayed by: ${currentDelay} Minutes At ${CurrentStationName}` : `Train is On Time At: ${CurrentStationName}`}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ───────────────────────────────────────────────────────────────

export default function TrainStatusApp() {
  const { trainId, dateParam } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLiveStatus = async () => {
    if (!trainId) return;
    const targetDate = dateParam || todayStr();
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`http://localhost:5000/api/railway/live-status/${trainId}/${targetDate}`);
      const result = res?.data?.data || res?.data;
      if (!result?.train) throw new Error("Train not found");
      setData(result);
    } catch (err) {
      setError(err?.response?.status === 404 ? `Train "${trainId}" not found.` : "Failed to fetch live status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!data || data.train?.trainNumber !== trainId) setData(null);
    fetchLiveStatus();
  }, [trainId, dateParam]);

  return (
    <div className="p-4 md:p-6 w-full md:w-[85vw] lg:w-[70vw] min-h-screen box-border font-sans bg-[#58585a52] text-[#fafafa] mx-auto relative overflow-x-hidden">
      <div className="mb-6">
        <div className="text-2xl font-extrabold text-white tracking-tight">Live Train Tracker</div>
      </div>

      {loading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#11111180] backdrop-blur-sm">
          <div className="p-8 rounded-full border border-gray-400/10 bg-[#22222250]">
            <div className="w-16 h-16 rounded-full border-4 border-[#4a8fd9d7] border-r-transparent animate-spin"></div>
          </div>
        </div>
      )}

      {error && !loading && (
        <div className="text-[#e05d5d] text-sm p-4 bg-[#e05d5d]/10 border border-[#e05d5d]/20 rounded-xl font-medium mt-4">
          ⚠️ {error}
        </div>
      )}

      {data && (
        <div className={`transition-all duration-500 ease-in-out ${loading ? 'blur-md opacity-40 pointer-events-none' : ''}`}>
          <TrainTimeline data={data} date={dateParam || todayStr()} onRefresh={fetchLiveStatus} />
        </div>
      )}

      <style>{`
        .live-dot {
          width: 8px; height: 8px; border-radius: 50%; background: #22c55e;
          animation: pulse-green 1.5s infinite cubic-bezier(0.4, 0, 0.6, 1);
        }
        @keyframes pulse-green {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
          50% { opacity: 0.4; box-shadow: 0 0 0 4px rgba(34, 197, 94, 0); }
        }
        .grid-transition {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease-in-out;
          opacity: 0;
        }
        .grid-transition[data-expanded="true"] {
          grid-template-rows: 1fr;
          opacity: 1;
        }
        .inter-content {
          min-height: 0;
        }
      `}</style>
    </div>
  );
}
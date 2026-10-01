"use client";

import { useEffect, useId, useState, type CSSProperties } from "react";

// The two photographed window areas are isolated so furniture never moves.
// Each original fabric panel gathers towards its own rail edge.
const banks = [
  { start: 0, middle: 218, end: 436, shape: "M0 0H436V753L310 777L160 801L0 834Z" },
  { start: 610, middle: 970, end: 1330, shape: "M610 0H1330V900L1198 891V768H1070V785L1018 749H610Z" },
];

export function LiveRoom({ blinds, className = "", id }: { blinds: number; className?: string; id?: string }) {
  const prefix = useId().replace(/:/g, "");
  const [openReady, setOpenReady] = useState(false);
  const gathered = openReady ? 1 - .92 * Math.min(100, Math.max(0, blinds)) / 100 : 1;
  const closed = import.meta.env.BASE_URL + "media/hero-living-room.webp";
  const opened = import.meta.env.BASE_URL + "media/hero-living-room-open.webp";
  const photo = { x: 0, y: 0, width: 2000, height: 1333, preserveAspectRatio: "none" };

  useEffect(() => {
    let active = true;
    const asset = new Image();
    asset.onload = () => { if (active) setOpenReady(true); };
    asset.src = opened;
    if (asset.complete && asset.naturalWidth > 0) setOpenReady(true);
    return () => { active = false; asset.onload = null; };
  }, [opened]);

  return <svg id={id} className={"live-room " + className} viewBox="0 0 2000 1333" width="2000" height="1333" preserveAspectRatio="xMidYMid slice" role="img" aria-label={"A contemporary living room with curtains " + (blinds === 0 ? "closed" : blinds === 100 ? "open to the garden" : "partly open") + "."} data-blinds={blinds}>
    <defs>{banks.map((bank, i) => <g key={i}>
      <clipPath id={`${prefix}-window-${i}`}><path d={bank.shape} /></clipPath>
      <clipPath id={`${prefix}-left-${i}`}><rect x={bank.start} y="0" width={bank.middle - bank.start} height="1333" /></clipPath>
      <clipPath id={`${prefix}-right-${i}`}><rect x={bank.middle} y="0" width={bank.end - bank.middle} height="1333" /></clipPath>
    </g>)}</defs>
    <image {...photo} href={closed} />
    {banks.map((bank, i) => <g key={i} clipPath={`url(#${prefix}-window-${i})`}>
      <image {...photo} href={opened} onLoad={() => setOpenReady(true)} />
      {(["left", "right"] as const).map(side => {
        const anchor = side === "left" ? bank.start : bank.end;
        const style: CSSProperties = { transform: `translateX(${anchor}px) scaleX(${gathered}) translateX(${-anchor}px)` };
        return <g key={side} className="curtain-panel" style={style}>
          <g clipPath={`url(#${prefix}-window-${i})`}><image {...photo} href={closed} clipPath={`url(#${prefix}-${side}-${i})`} /></g>
        </g>;
      })}
    </g>)}
  </svg>;
}

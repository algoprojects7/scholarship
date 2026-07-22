"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";

interface SecurityPuzzleProps {
  captchaId?: string;
  onSolve: (token: string) => void;
  onReset?: () => void;
  disabled?: boolean;
  error?: string;
}

export function SecurityPuzzle({
  captchaId,
  onSolve,
  onReset,
  disabled = false,
  error,
}: SecurityPuzzleProps) {
  const [isSolved, setIsSolved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isSelected, setIsSelected] = useState(false);
  
  const pieceRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  const resetPuzzle = useCallback(() => {
    setIsSolved(false);
    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
    setIsSelected(false);
    onReset?.();
  }, [onReset]);

  useEffect(() => {
    resetPuzzle();
  }, [captchaId, resetPuzzle]);

  const handleSolve = useCallback(() => {
    setIsSolved(true);
    setIsDragging(false);
    const token = captchaId ? `PUZZLE_VERIFIED_${captchaId}` : "PUZZLE_VERIFIED_SUCCESS";
    onSolve(token);
  }, [captchaId, onSolve]);

  // Check if position is close to target silhouette (within 50px)
  const checkTargetHit = useCallback(
    (currentX: number, currentY: number) => {
      if (!pieceRef.current || !targetRef.current) return false;
      const targetRect = targetRef.current.getBoundingClientRect();
      const pieceRect = pieceRef.current.getBoundingClientRect();

      const pieceCenterX = pieceRect.left + pieceRect.width / 2;
      const pieceCenterY = pieceRect.top + pieceRect.height / 2;
      const targetCenterX = targetRect.left + targetRect.width / 2;
      const targetCenterY = targetRect.top + targetRect.height / 2;

      const distance = Math.hypot(pieceCenterX - targetCenterX, pieceCenterY - targetCenterY);
      return distance < 65; // Hit threshold
    },
    [],
  );

  // Pointer Drag Handlers (Mouse & Touch)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isSolved || disabled) return;
    setIsDragging(true);
    setIsSelected(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || isSolved || disabled) return;
    setPosition((prev) => ({
      x: prev.x + e.movementX,
      y: prev.y + e.movementY,
    }));
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture release fails
    }

    if (checkTargetHit(position.x, position.y)) {
      handleSolve();
    } else {
      // Reset position if drop failed
      setPosition({ x: 0, y: 0 });
    }
  };

  // Click fallback handler
  const handleTargetClick = () => {
    if (isSolved || disabled) return;
    handleSolve();
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xl text-slate-800 select-none">
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="mt-3 text-lg sm:text-xl font-bold tracking-tight text-slate-900">Security Puzzle</h3>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">To continue, please solve the puzzle below.</p>
      </div>

      {/* Instruction Banner */}
      <div className={`mt-4 sm:mt-5 flex items-center justify-between gap-3 rounded-xl border px-3.5 py-3 transition-colors ${
        isSolved ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-blue-100 bg-blue-50/80 text-blue-800"
      }`}>
        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-medium">
          <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${isSolved ? "bg-emerald-500 text-white" : "bg-blue-600 text-white"}`}>
            {isSolved ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
              </svg>
            )}
          </div>
          <span>
            {isSolved
              ? "Security puzzle solved successfully!"
              : "Just drop a one horned-rhino into the puzzle by dragging."}
          </span>
        </div>
        {!isSolved && (
          <button
            type="button"
            onClick={resetPuzzle}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
            title="Reset puzzle"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>

      {/* Main Puzzle Area */}
      <div ref={containerRef} className="relative mt-5 flex flex-col md:flex-row items-center gap-4 sm:gap-6">
        
        {/* Left Draggable Rhino Card */}
        <div
          ref={pieceRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{
            transform: isSolved ? "none" : `translate3d(${position.x}px, ${position.y}px, 0)`,
            touchAction: "none",
          }}
          className={`group relative z-20 flex flex-col items-center justify-center rounded-2xl border-2 p-3 sm:p-4 transition-shadow ${
            isSolved
              ? "border-emerald-500 bg-emerald-50/40 shadow-sm cursor-default"
              : isDragging
              ? "border-blue-500 bg-white shadow-2xl scale-105 cursor-grabbing"
              : "border-slate-200 bg-white shadow-md hover:border-blue-400 hover:shadow-lg cursor-grab"
          }`}
        >
          {/* Rhino Illustration SVG */}
          <div className="relative h-28 w-36 sm:h-32 sm:w-40 flex items-center justify-center">
            <svg viewBox="0 0 200 140" className="h-full w-full object-contain">
              {/* Ground shadow */}
              <ellipse cx="100" cy="122" rx="75" ry="12" fill="#e2e8f0" />
              <ellipse cx="100" cy="120" rx="70" ry="10" fill="#cbd5e1" />
              <path d="M40,118 Q50,114 60,118" stroke="#94a3b8" strokeWidth="2" fill="none" />
              <path d="M140,118 Q150,114 160,118" stroke="#94a3b8" strokeWidth="2" fill="none" />
              
              {/* Rhino Body & Details */}
              <g id="rhino-body">
                {/* Back Legs */}
                <path d="M50,85 L48,118 A3,3 0 0,0 54,118 L58,95 Z" fill="#64748b" />
                <path d="M125,85 L123,118 A3,3 0 0,0 129,118 L133,95 Z" fill="#64748b" />

                {/* Main Body */}
                <path d="M45,75 Q40,55 60,48 Q90,45 125,50 Q145,52 160,65 Q175,75 165,95 Q150,105 125,102 Q80,105 50,100 Q40,95 45,75 Z" fill="#8492a6" stroke="#475569" strokeWidth="2.5" strokeLinejoin="round" />
                
                {/* Armor Folds (One-Horned Rhino Texture) */}
                <path d="M75,48 Q70,75 78,102" fill="none" stroke="#64748b" strokeWidth="2.5" />
                <path d="M115,50 Q110,75 118,102" fill="none" stroke="#64748b" strokeWidth="2.5" />
                <path d="M60,65 Q85,68 115,65" fill="none" stroke="#64748b" strokeWidth="2" strokeDasharray="3 2" />

                {/* Front Legs */}
                <path d="M62,85 L60,120 A4,4 0 0,0 68,120 L72,90 Z" fill="#64748b" stroke="#475569" strokeWidth="2" />
                <path d="M138,85 L136,120 A4,4 0 0,0 144,120 L148,90 Z" fill="#64748b" stroke="#475569" strokeWidth="2" />
                
                {/* Head & Neck */}
                <path d="M150,60 Q165,55 180,68 Q185,78 175,88 Q160,92 145,85 Z" fill="#8492a6" stroke="#475569" strokeWidth="2.5" strokeLinejoin="round" />
                
                {/* Ears */}
                <path d="M152,54 Q150,42 156,48 Z" fill="#64748b" stroke="#475569" strokeWidth="1.5" />
                
                {/* ONE HORN (Distinctive Feature) */}
                <path d="M174,68 Q188,48 182,60 Q178,65 174,68 Z" fill="#334155" stroke="#1e293b" strokeWidth="2" />
                
                {/* Eye */}
                <circle cx="163" cy="65" r="2.5" fill="#0f172a" />
                <circle cx="164" cy="64" r="0.8" fill="#ffffff" />
                
                {/* Tail */}
                <path d="M42,75 Q35,85 38,95" stroke="#475569" strokeWidth="2.5" fill="none" strokeLinecap="round" />
              </g>
            </svg>
          </div>

          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            {isSolved ? (
              <span className="text-emerald-600 flex items-center gap-1 font-bold">
                ✓ Placed
              </span>
            ) : (
              <>
                <span>Drag me</span>
                <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </>
            )}
          </div>
        </div>

        {/* Curved Dashed Indicator Line (Desktop) */}
        {!isSolved && (
          <div className="hidden md:block absolute left-[150px] top-[45%] w-16 h-10 pointer-events-none z-10">
            <svg className="w-full h-full" viewBox="0 0 60 40">
              <path d="M 5,20 Q 30,35 55,20" fill="none" stroke="#60a5fa" strokeWidth="2" strokeDasharray="4 3" />
              <polygon points="55,20 47,15 49,23" fill="#60a5fa" />
            </svg>
          </div>
        )}

        {/* Right Landscape Target Canvas */}
        <div
          ref={targetRef}
          onClick={handleTargetClick}
          className={`relative flex-1 w-full h-52 sm:h-60 rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden shadow-inner flex items-center justify-center cursor-pointer ${
            isSolved
              ? "border-emerald-500 bg-emerald-50/30"
              : "border-blue-300 bg-gradient-to-b from-sky-100 via-emerald-50/50 to-emerald-100/70 hover:border-blue-400"
          }`}
        >
          {/* Landscape Background SVG */}
          <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 400 240">
            <defs>
              <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e0f2fe" />
                <stop offset="100%" stopColor="#bae6fd" />
              </linearGradient>
              <linearGradient id="hillGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#a7f3d0" />
                <stop offset="100%" stopColor="#6ee7b7" />
              </linearGradient>
              <linearGradient id="pondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>

            {/* Sky */}
            <rect x="0" y="0" width="400" height="240" fill="url(#skyGrad)" />
            
            {/* Soft Clouds */}
            <path d="M30,40 Q40,30 55,35 Q65,25 80,35 Q90,30 100,40 Z" fill="#ffffff" opacity="0.8" />
            <path d="M280,30 Q290,20 305,25 Q315,15 330,25 Q340,20 350,30 Z" fill="#ffffff" opacity="0.8" />

            {/* Flying Birds */}
            <path d="M180,25 Q185,20 190,25 Q195,20 200,25" fill="none" stroke="#64748b" strokeWidth="1.5" />
            <path d="M205,32 Q209,28 213,32 Q217,28 221,32" fill="none" stroke="#64748b" strokeWidth="1.2" />

            {/* Distant Hills */}
            <path d="M0,140 Q80,90 180,130 Q260,80 400,120 L400,240 L0,240 Z" fill="#cbd5e1" opacity="0.5" />
            <path d="M0,150 Q120,110 240,145 Q320,115 400,140 L400,240 L0,240 Z" fill="url(#hillGrad)" opacity="0.8" />

            {/* Foreground Green Meadow */}
            <path d="M0,175 Q150,155 400,170 L400,240 L0,240 Z" fill="#34d399" opacity="0.5" />

            {/* Water Pond */}
            <ellipse cx="320" cy="215" rx="70" ry="20" fill="url(#pondGrad)" opacity="0.85" />
            
            {/* Tree */}
            <path d="M340,150 L345,185 L335,185 Z" fill="#78350f" />
            <circle cx="340" cy="140" r="22" fill="#15803d" opacity="0.9" />
            <circle cx="330" cy="132" r="16" fill="#22c55e" opacity="0.9" />
            <circle cx="352" cy="136" r="15" fill="#16a34a" opacity="0.9" />
          </svg>

          {/* Target Silhouette Cutout */}
          <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
            <svg viewBox="0 0 200 140" className="h-28 w-36 sm:h-32 sm:w-40 transition-transform">
              <path
                d="M45,75 Q40,55 60,48 Q90,45 125,50 Q145,52 160,65 Q175,75 165,95 Q150,105 125,102 Q80,105 50,100 Q40,95 45,75 Z M150,60 Q165,55 180,68 Q185,78 175,88 Q160,92 145,85 Z M174,68 Q188,48 182,60 Q178,65 174,68 Z"
                fill={isSolved ? "#22c55e" : "rgba(241, 245, 249, 0.75)"}
                fillOpacity={isSolved ? "0.2" : "0.75"}
                stroke={isSolved ? "#10b981" : "#94a3b8"}
                strokeWidth={isSolved ? "3" : "2.5"}
                strokeDasharray={isSolved ? "none" : "6 4"}
              />
            </svg>
            
            {isSolved && (
              <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/10 rounded-xl backdrop-blur-[1px]">
                <div className="flex items-center gap-2 rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-lg animate-bounce">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Verified Security Puzzle</span>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Footer Notes */}
      <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
        <div className="flex items-center justify-center gap-2 text-xs font-medium text-emerald-700">
          <svg className="h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>This helps us keep our application secure.</span>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <svg className="h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Your security is our priority.</span>
        </div>
      </div>

      {error ? (
        <p className="mt-3 text-center text-xs font-medium text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

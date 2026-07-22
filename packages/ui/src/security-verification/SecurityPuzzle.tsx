"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { RHINO_IMAGE_BASE64, LANDSCAPE_IMAGE_BASE64 } from "./assets";

interface SecurityPuzzleProps {
  captchaId?: string;
  onSolve: (token: string) => void;
  onReset?: () => void;
  disabled?: boolean;
  error?: string;
}

function RhinoFigure({ className = "h-28 w-36 sm:h-32 sm:w-40 object-contain drop-shadow-sm select-none" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={RHINO_IMAGE_BASE64}
      alt="Real Indian One-Horned Rhinoceros"
      className={className}
      draggable={false}
    />
  );
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

  const pieceRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  const onSolveRef = useRef(onSolve);
  const onResetRef = useRef(onReset);

  useEffect(() => {
    onSolveRef.current = onSolve;
  }, [onSolve]);

  useEffect(() => {
    onResetRef.current = onReset;
  }, [onReset]);

  const resetLocalState = useCallback(() => {
    setIsSolved(false);
    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleManualReset = useCallback(() => {
    resetLocalState();
    onResetRef.current?.();
  }, [resetLocalState]);

  const prevCaptchaIdRef = useRef(captchaId);
  useEffect(() => {
    if (captchaId !== prevCaptchaIdRef.current) {
      prevCaptchaIdRef.current = captchaId;
      resetLocalState();
    }
  }, [captchaId, resetLocalState]);

  const handleSolve = useCallback(() => {
    setIsSolved(true);
    setIsDragging(false);
    const token = captchaId ? `PUZZLE_VERIFIED_${captchaId}` : "PUZZLE_VERIFIED_SUCCESS";
    onSolveRef.current(token);
  }, [captchaId]);

  // Check if dragged rhino is over the target silhouette cutout
  const checkTargetHit = useCallback(() => {
    if (!pieceRef.current || !targetRef.current) return false;
    const targetRect = targetRef.current.getBoundingClientRect();
    const pieceRect = pieceRef.current.getBoundingClientRect();

    const pieceCenterX = pieceRect.left + pieceRect.width / 2;
    const pieceCenterY = pieceRect.top + pieceRect.height / 2;
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;

    const distance = Math.hypot(pieceCenterX - targetCenterX, pieceCenterY - targetCenterY);
    return distance < 80;
  }, []);

  // Drag handlers (Pointer Events)
  const handlePointerDown = (e: React.PointerEvent) => {
    if (isSolved || disabled) return;
    setIsDragging(true);
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
      // Ignore pointer release error
    }

    if (checkTargetHit()) {
      handleSolve();
    } else {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleTargetClick = () => {
    if (isSolved || disabled) return;
    handleSolve();
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-7 shadow-xl text-slate-800 select-none font-sans">
      {/* Header */}
      <div className="flex flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 shadow-sm">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="mt-3.5 text-xl font-bold tracking-tight text-slate-900">Security Puzzle</h3>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 font-normal">To continue, please solve the puzzle below.</p>
      </div>

      {/* Instruction Banner */}
      <div className={`mt-5 flex items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 transition-colors ${
        isSolved ? "border-emerald-200 bg-emerald-50/90 text-emerald-900" : "border-blue-100/80 bg-blue-50/70 text-blue-700"
      }`}>
        <div className="flex items-center gap-3 text-xs sm:text-sm font-medium">
          <div className={`flex h-6 w-6 items-center justify-center rounded-lg ${isSolved ? "bg-emerald-600 text-white" : "bg-blue-600 text-white"}`}>
            {isSolved ? (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
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
            onClick={handleManualReset}
            className="text-slate-400 hover:text-slate-600 transition-colors p-1"
            title="Reset puzzle"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>

      {/* Main Interactive Canvas Area */}
      <div ref={containerRef} className="relative mt-6 flex flex-col md:flex-row items-center gap-5 sm:gap-6">
        
        {/* Left Piece Card (Static Box Frame) */}
        <div className="relative flex flex-col items-center justify-between rounded-2xl border-2 border-slate-200/90 bg-white p-3.5 sm:p-4 shadow-sm w-44 sm:w-48 h-48 sm:h-52">
          
          {/* Draggable Rhino Figure ONLY */}
          {!isSolved && (
            <div
              ref={pieceRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              style={{
                transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
                touchAction: "none",
              }}
              className={`absolute top-3.5 z-30 cursor-grab transition-shadow ${
                isDragging ? "cursor-grabbing scale-110 filter drop-shadow-2xl z-40" : "hover:scale-105"
              }`}
            >
              <div className="h-28 w-36 sm:h-32 sm:w-40 flex items-center justify-center">
                <RhinoFigure />
              </div>
            </div>
          )}

          {/* Faded Placeholder when Rhino is dragged out or solved */}
          {(isDragging || isSolved) && (
            <div className="mt-1 h-28 w-36 sm:h-32 sm:w-40 flex items-center justify-center opacity-25">
              <RhinoFigure />
            </div>
          )}

          <div className="mt-auto pt-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-700 pointer-events-none z-10">
            {isSolved ? (
              <span className="text-emerald-600 font-bold">✓ Placed</span>
            ) : (
              <>
                <span>Drag me</span>
                <svg className="h-3.5 w-3.5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                </svg>
              </>
            )}
          </div>
        </div>

        {/* Curved Dashed Arrow Line (Visible on Desktop Only - Hidden on Mobile View) */}
        {!isSolved && (
          <div className="hidden md:block absolute left-[125px] sm:left-[145px] bottom-[20px] sm:bottom-[25px] w-36 sm:w-44 h-24 sm:h-28 pointer-events-none z-40">
            <svg className="w-full h-full filter drop-shadow" viewBox="0 0 170 100">
              {/* Curved dashed line extending from left card smoothly pointing directly into target slot */}
              <path
                d="M 12,82 Q 75,102 138,50"
                fill="none"
                stroke="#2563eb"
                strokeWidth="2.8"
                strokeDasharray="6 4"
                strokeLinecap="round"
              />
              {/* Blue Arrowhead contained cleanly inside the landscape target area */}
              <polygon points="150,42 132,44 140,56" fill="#2563eb" />
            </svg>
          </div>
        )}

        {/* Right Landscape Target Canvas */}
        <div
          ref={targetRef}
          onClick={handleTargetClick}
          className={`relative flex-1 w-full h-56 sm:h-64 rounded-3xl border-2 border-dashed transition-all duration-300 overflow-hidden shadow-inner flex items-center justify-center cursor-pointer ${
            isSolved
              ? "border-emerald-500 bg-emerald-50/30"
              : "border-blue-300/90 hover:border-blue-400"
          }`}
        >
          {/* Real Landscape Background Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LANDSCAPE_IMAGE_BASE64}
            alt="Landscape Security Target"
            className="absolute inset-0 h-full w-full object-cover select-none"
            draggable={false}
          />

          {/* Target Silhouette Cutout & Fitted Rhino */}
          <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
            
            {/* Real Photorealistic Target Silhouette Slot (Exact 1-to-1 Image Size) */}
            {!isSolved && (
              <div className="relative h-28 w-36 sm:h-32 sm:w-40 flex items-center justify-center">
                <div className="relative h-full w-full rounded-2xl border-2 border-dashed border-slate-400/80 bg-slate-100/80 backdrop-blur-[1px] flex items-center justify-center overflow-hidden p-1 shadow-inner">
                  {/* Exact 1-to-1 Rhino Silhouette Mask */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={RHINO_IMAGE_BASE64}
                    alt="Rhino Target Silhouette"
                    className="h-full w-full object-contain opacity-30 grayscale brightness-75 contrast-125 select-none"
                    draggable={false}
                  />
                </div>
              </div>
            )}

            {/* Fitted Rhino Figure inside Silhouette Slot when Solved */}
            {isSolved && (
              <div className="relative h-28 w-36 sm:h-32 sm:w-40 transition-all duration-300 scale-105 filter drop-shadow-md">
                <RhinoFigure />
                <div className="absolute -top-3 left-0 right-0 flex items-center justify-center">
                  <div className="flex items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-lg animate-bounce">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Verified</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Footer Notes */}
      <div className="mt-6 space-y-2 border-t border-slate-100 pt-4">
        <div className="flex items-center justify-center gap-2 text-xs font-medium text-emerald-700">
          <svg className="h-4 w-4 text-emerald-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>This helps us keep our application secure.</span>
        </div>

        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <svg className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Your security is our priority.</span>
        </div>
      </div>
    </div>
  );
}

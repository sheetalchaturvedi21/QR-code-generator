import React, { useState, useEffect, useRef, useCallback } from 'react';

const LINE_1 = "Welcome to QR Code Generator";
const LINE_2 = "Make a QR code, style it, download it.";

export default function IntroAnimation({ onFinish }) {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [isTyping1, setIsTyping1] = useState(true);
  const [isTyping2, setIsTyping2] = useState(false);
  const [isFading, setIsFading] = useState(false);

  const timersRef = useRef([]);
  const hasFinishedRef = useRef(false);
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  });

  const addTimer = (id) => {
    timersRef.current.push(id);
  };

  const clearAllTimers = () => {
    timersRef.current.forEach((t) => {
      clearTimeout(t);
      clearInterval(t);
    });
    timersRef.current = [];
  };

  const finishIntro = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    clearAllTimers();
    try {
      sessionStorage.setItem('qr_intro_seen', 'true');
    } catch {
      // Ignore storage error
    }
    setIsFading(true);
    const fadeTimer = setTimeout(() => {
      onFinishRef.current();
    }, 500);
    addTimer(fadeTimer);
  }, []);

  useEffect(() => {
    // 1. Check prefers-reduced-motion
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      try {
        sessionStorage.setItem('qr_intro_seen', 'true');
      } catch {
        // Ignore storage error
      }
      onFinishRef.current();
      return;
    }

    // Reset state at start of effect to prevent React StrictMode double-run overlap
    setText1('');
    setText2('');
    setIsTyping1(true);
    setIsTyping2(false);
    setIsFading(false);
    hasFinishedRef.current = false;

    // 2. Add event listeners for instant skip
    const handleKeyDown = () => finishIntro();
    window.addEventListener('keydown', handleKeyDown);

    // 3. Type Line 1
    let idx1 = 0;
    const interval1 = setInterval(() => {
      idx1++;
      setText1(LINE_1.substring(0, idx1));
      if (idx1 >= LINE_1.length) {
        clearInterval(interval1);
        setIsTyping1(false);

        // Wait ~0.8s then start Line 2
        const t1 = setTimeout(() => {
          setIsTyping2(true);
          let idx2 = 0;
          const interval2 = setInterval(() => {
            idx2++;
            setText2(LINE_2.substring(0, idx2));
            if (idx2 >= LINE_2.length) {
              clearInterval(interval2);
              setIsTyping2(false);

              // Wait ~1.0s then fade out
              const t2 = setTimeout(() => {
                finishIntro();
              }, 1000);
              timersRef.current.push(t2);
            }
          }, 60);
          timersRef.current.push(interval2);
        }, 800);
        timersRef.current.push(t1);
      }
    }, 60);

    timersRef.current.push(interval1);

    return () => {
      clearAllTimers();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [finishIntro]);

  return (
    <div
      className={`intro-overlay ${isFading ? 'fade-out' : ''}`}
      onClick={finishIntro}
    >
      <div className="intro-content">
        <h1 className="intro-title">
          {text1}
          {isTyping1 && <span className="intro-cursor">|</span>}
        </h1>
        {text1.length > 0 && (
          <p className="intro-subtitle">
            {text2}
            {isTyping2 && <span className="intro-cursor">|</span>}
          </p>
        )}
      </div>

      <button
        type="button"
        className="intro-skip-btn"
        onClick={(e) => {
          e.stopPropagation();
          finishIntro();
        }}
      >
        Skip
      </button>
    </div>
  );
}

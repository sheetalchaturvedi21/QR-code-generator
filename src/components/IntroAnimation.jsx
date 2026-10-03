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

  // Incremented each time the effect runs. Interval callbacks compare against
  // this value so that a StrictMode double-invocation drops the first run's
  // callbacks, preventing doubled typed text.
  const runKeyRef = useRef(0);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((t) => {
      clearTimeout(t);
      clearInterval(t);
    });
    timersRef.current = [];
  }, []);

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
    timersRef.current.push(fadeTimer);
  }, [clearAllTimers]);

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

    // Capture the run key for this invocation. When StrictMode double-fires
    // the effect, cleanup increments runKeyRef so the first run's interval/
    // timeout callbacks see a stale key and exit immediately — no doubled text.
    runKeyRef.current += 1;
    const myKey = runKeyRef.current;

    clearAllTimers();
    hasFinishedRef.current = false;

    // Reset typing state for the new run.
    // oxlint-disable-next-line react/set-state-in-effect -- intentional animation reset, guarded by runKey
    setText1('');
    // oxlint-disable-next-line react/set-state-in-effect
    setText2('');
    // oxlint-disable-next-line react/set-state-in-effect
    setIsTyping1(true);
    // oxlint-disable-next-line react/set-state-in-effect
    setIsTyping2(false);
    // oxlint-disable-next-line react/set-state-in-effect
    setIsFading(false);

    // 2. Add event listener for instant skip
    const handleKeyDown = () => finishIntro();
    window.addEventListener('keydown', handleKeyDown);

    // 3. Type Line 1
    let idx1 = 0;
    const interval1 = setInterval(() => {
      if (runKeyRef.current !== myKey) { clearInterval(interval1); return; }
      idx1++;
      setText1(LINE_1.substring(0, idx1));
      if (idx1 >= LINE_1.length) {
        clearInterval(interval1);
        setIsTyping1(false);

        // Wait ~0.8s then start Line 2
        const t1 = setTimeout(() => {
          if (runKeyRef.current !== myKey) return;
          setIsTyping2(true);
          let idx2 = 0;
          const interval2 = setInterval(() => {
            if (runKeyRef.current !== myKey) { clearInterval(interval2); return; }
            idx2++;
            setText2(LINE_2.substring(0, idx2));
            if (idx2 >= LINE_2.length) {
              clearInterval(interval2);
              setIsTyping2(false);

              // Wait ~1.0s then fade out
              const t2 = setTimeout(() => {
                if (runKeyRef.current !== myKey) return;
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
      runKeyRef.current += 1;
      clearAllTimers();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [finishIntro, clearAllTimers]);

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

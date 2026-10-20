import React from 'react';

export type SlothMood = 'sleeping' | 'awake' | 'thinking' | 'happy' | 'tea';

interface SlothMascotProps {
  mood?: SlothMood;
  size?: number;
  className?: string;
  animate?: boolean;
}

export const SlothMascot: React.FC<SlothMascotProps> = ({
  mood = 'awake',
  size = 120,
  className = '',
  animate = true,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${
        animate ? 'animate-sloth-float' : ''
      } ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 140 140"
        width={size}
        height={size}
        className="drop-shadow-xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Fur Gradient */}
          <linearGradient id="furGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#b08968" />
            <stop offset="100%" stopColor="#7f5539" />
          </linearGradient>

          {/* Face Gradient */}
          <linearGradient id="faceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#faedcd" />
            <stop offset="100%" stopColor="#e9edc9" />
          </linearGradient>

          {/* Eye Patches Gradient */}
          <linearGradient id="eyePatchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#9c6644" />
            <stop offset="100%" stopColor="#63391b" />
          </linearGradient>

          {/* Aura / Soft Glow */}
          <filter id="slothGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient background glow ring */}
        <circle
          cx="70"
          cy="70"
          r="62"
          fill="rgba(168, 85, 247, 0.08)"
          stroke="rgba(168, 85, 247, 0.25)"
          strokeWidth="2"
          strokeDasharray="4 4"
        />

        {/* Sloth Ears */}
        <circle cx="34" cy="56" r="12" fill="#7f5539" />
        <circle cx="34" cy="56" r="7" fill="#b08968" />
        <circle cx="106" cy="56" r="12" fill="#7f5539" />
        <circle cx="106" cy="56" r="7" fill="#b08968" />

        {/* Sloth Body & Arms */}
        <path
          d="M 45,95 C 40,115 45,130 70,130 C 95,130 100,115 95,95 Z"
          fill="url(#furGradient)"
        />
        {/* Soft Belly Patch */}
        <ellipse cx="70" cy="112" rx="16" ry="14" fill="#faedcd" opacity="0.85" />

        {/* Arms */}
        {mood === 'happy' ? (
          <>
            {/* Arms raised up in joy! */}
            <path
              d="M 48,95 C 30,85 24,65 30,55 C 35,62 42,80 50,92 Z"
              fill="#7f5539"
            />
            <path
              d="M 92,95 C 110,85 116,65 110,55 C 105,62 98,80 90,92 Z"
              fill="#7f5539"
            />
          </>
        ) : mood === 'tea' ? (
          <>
            {/* Holding tiny tea mug */}
            <path d="M 45,95 C 45,108 55,112 62,110 Z" fill="#7f5539" />
            <path d="M 95,95 C 95,108 85,112 78,110 Z" fill="#7f5539" />
            {/* Tiny Tea Mug */}
            <rect x="63" y="102" width="14" height="12" rx="2" fill="#14b8a6" />
            <path d="M 77,105 C 80,105 80,111 77,111" stroke="#14b8a6" strokeWidth="2" fill="none" />
            {/* Tea steam */}
            <path
              d="M 68,98 Q 70,94 69,90"
              stroke="#2dd4bf"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.7"
            />
          </>
        ) : (
          <>
            {/* Resting cozy paws */}
            <path d="M 46,95 C 48,110 58,114 65,112" stroke="#7f5539" strokeWidth="12" strokeLinecap="round" />
            <path d="M 94,95 C 92,110 82,114 75,112" stroke="#7f5539" strokeWidth="12" strokeLinecap="round" />
          </>
        )}

        {/* Head */}
        <circle cx="70" cy="65" r="38" fill="url(#furGradient)" />

        {/* Face Mask */}
        <ellipse cx="70" cy="68" rx="28" ry="24" fill="url(#faceGradient)" />

        {/* Eye Patches */}
        <path
          d="M 50,56 C 45,60 42,70 48,74 C 54,77 59,68 56,60 Z"
          fill="url(#eyePatchGrad)"
        />
        <path
          d="M 90,56 C 95,60 98,70 92,74 C 86,77 81,68 84,60 Z"
          fill="url(#eyePatchGrad)"
        />

        {/* Eyes according to mood */}
        {mood === 'sleeping' ? (
          <>
            {/* Peaceful Sleeping curved eye slits */}
            <path
              d="M 48,66 Q 52,71 56,66"
              fill="none"
              stroke="#2b2d42"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            <path
              d="M 84,66 Q 88,71 92,66"
              fill="none"
              stroke="#2b2d42"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            {/* Floating zzz */}
            <text x="96" y="44" fill="#c084fc" fontSize="12" fontWeight="bold" opacity="0.9">z</text>
            <text x="105" y="34" fill="#a855f7" fontSize="15" fontWeight="bold" opacity="0.7">Z</text>
            <text x="114" y="22" fill="#9333ea" fontSize="18" fontWeight="bold" opacity="0.5">Z</text>
          </>
        ) : mood === 'thinking' ? (
          <>
            {/* Eyes looking up/studying */}
            <circle cx="53" cy="64" r="3.5" fill="#1e293b" />
            <circle cx="54" cy="63" r="1.2" fill="#ffffff" />
            <circle cx="87" cy="64" r="3.5" fill="#1e293b" />
            <circle cx="88" cy="63" r="1.2" fill="#ffffff" />
          </>
        ) : mood === 'happy' ? (
          <>
            {/* Joyful happy crescent eyes */}
            <path
              d="M 48,67 Q 52,61 56,67"
              fill="none"
              stroke="#1e293b"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path
              d="M 84,67 Q 88,61 92,67"
              fill="none"
              stroke="#1e293b"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            {/* Cute rosy cheeks */}
            <circle cx="44" cy="74" r="5" fill="#f43f5e" opacity="0.35" />
            <circle cx="96" cy="74" r="5" fill="#f43f5e" opacity="0.35" />
          </>
        ) : (
          <>
            {/* Awake friendly round eyes */}
            <circle cx="52" cy="65" r="4" fill="#1e293b" />
            <circle cx="53.5" cy="63.5" r="1.5" fill="#ffffff" />
            <circle cx="88" cy="65" r="4" fill="#1e293b" />
            <circle cx="89.5" cy="63.5" r="1.5" fill="#ffffff" />
            {/* Rosy cheeks */}
            <circle cx="44" cy="74" r="4" fill="#f43f5e" opacity="0.25" />
            <circle cx="96" cy="74" r="4" fill="#f43f5e" opacity="0.25" />
          </>
        )}

        {/* Glasses (worn during thinking, awake, tea) */}
        {(mood === 'thinking' || mood === 'awake' || mood === 'tea') && (
          <g>
            <circle cx="52" cy="65" r="11" fill="none" stroke="#c084fc" strokeWidth="2.4" />
            <circle cx="88" cy="65" r="11" fill="none" stroke="#c084fc" strokeWidth="2.4" />
            <line x1="63" y1="65" x2="77" y2="65" stroke="#c084fc" strokeWidth="2.4" />
            {/* Lens glare */}
            <path d="M 46,59 L 52,59" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
            <path d="M 82,59 L 88,59" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
          </g>
        )}

        {/* Cute Sloth Nose */}
        <ellipse cx="70" cy="75" rx="6.5" ry="4.5" fill="#2b2d42" />

        {/* Smile */}
        {mood === 'happy' ? (
          <path
            d="M 64,81 Q 70,89 76,81"
            fill="#f43f5e"
            stroke="#2b2d42"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M 65,81 Q 70,85 75,81"
            fill="none"
            stroke="#2b2d42"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        )}

        {/* Cozy little green sprout / leaf on forehead */}
        <path
          d="M 70,32 Q 80,24 85,32 Q 75,37 70,32 Z"
          fill="#14b8a6"
          stroke="#0d9488"
          strokeWidth="1.2"
        />
        <line x1="70" y1="32" x2="77" y2="29" stroke="#0f766e" strokeWidth="1.2" />
      </svg>
    </div>
  );
};

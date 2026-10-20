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
        className="drop-shadow-[0_8px_20px_rgba(250,204,21,0.25)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Fur Gradient - Rich Warm Mocha & Honey */}
          <linearGradient id="furGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c59b6d" />
            <stop offset="60%" stopColor="#966a3d" />
            <stop offset="100%" stopColor="#633d18" />
          </linearGradient>

          {/* Face Gradient - Warm Cream / Butter */}
          <linearGradient id="faceGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef3c7" />
            <stop offset="100%" stopColor="#fde68a" />
          </linearGradient>

          {/* Eye Patches Gradient - Dark Roast Cocoa */}
          <linearGradient id="eyePatchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="100%" stopColor="#451a03" />
          </linearGradient>

          {/* Gold Metallic Glasses Gradient */}
          <linearGradient id="goldGlasses" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
        </defs>

        {/* Ambient background gold glow ring */}
        <circle
          cx="70"
          cy="70"
          r="62"
          fill="rgba(250, 204, 21, 0.06)"
          stroke="rgba(250, 204, 21, 0.4)"
          strokeWidth="1.75"
          strokeDasharray="4 4"
        />

        {/* Sloth Ears */}
        <circle cx="34" cy="56" r="12" fill="#78350f" />
        <circle cx="34" cy="56" r="7" fill="#b45309" />
        <circle cx="106" cy="56" r="12" fill="#78350f" />
        <circle cx="106" cy="56" r="7" fill="#b45309" />

        {/* Sloth Body & Arms */}
        <path
          d="M 45,95 C 40,115 45,130 70,130 C 95,130 100,115 95,95 Z"
          fill="url(#furGradient)"
        />
        {/* Soft Belly Patch */}
        <ellipse cx="70" cy="112" rx="16" ry="14" fill="#fef3c7" opacity="0.9" />

        {/* Arms */}
        {mood === 'happy' ? (
          <>
            {/* Arms raised up in joy! */}
            <path
              d="M 48,95 C 30,85 24,65 30,55 C 35,62 42,80 50,92 Z"
              fill="#78350f"
            />
            <path
              d="M 92,95 C 110,85 116,65 110,55 C 105,62 98,80 90,92 Z"
              fill="#78350f"
            />
          </>
        ) : mood === 'tea' ? (
          <>
            {/* Holding tiny gold tea mug */}
            <path d="M 45,95 C 45,108 55,112 62,110 Z" fill="#78350f" />
            <path d="M 95,95 C 95,108 85,112 78,110 Z" fill="#78350f" />
            {/* Tiny Gold Mug */}
            <rect x="63" y="102" width="14" height="12" rx="2.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
            <path d="M 77,105 C 80,105 80,111 77,111" stroke="#ca8a04" strokeWidth="2" fill="none" />
            {/* Tea steam */}
            <path
              d="M 68,98 Q 70,94 69,90"
              stroke="#fde047"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.8"
            />
          </>
        ) : (
          <>
            {/* Resting cozy paws */}
            <path d="M 46,95 C 48,110 58,114 65,112" stroke="#78350f" strokeWidth="11" strokeLinecap="round" />
            <path d="M 94,95 C 92,110 82,114 75,112" stroke="#78350f" strokeWidth="11" strokeLinecap="round" />
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
            <path
              d="M 48,66 Q 52,71 56,66"
              fill="none"
              stroke="#1c1917"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            <path
              d="M 84,66 Q 88,71 92,66"
              fill="none"
              stroke="#1c1917"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            {/* Floating zzz */}
            <text x="96" y="44" fill="#facc15" fontSize="12" fontWeight="bold" opacity="0.9">z</text>
            <text x="105" y="34" fill="#eab308" fontSize="15" fontWeight="bold" opacity="0.7">Z</text>
            <text x="114" y="22" fill="#ca8a04" fontSize="18" fontWeight="bold" opacity="0.5">Z</text>
          </>
        ) : mood === 'thinking' ? (
          <>
            <circle cx="53" cy="64" r="3.5" fill="#1c1917" />
            <circle cx="54.5" cy="63" r="1.3" fill="#ffffff" />
            <circle cx="87" cy="64" r="3.5" fill="#1c1917" />
            <circle cx="88.5" cy="63" r="1.3" fill="#ffffff" />
          </>
        ) : mood === 'happy' ? (
          <>
            <path
              d="M 48,67 Q 52,61 56,67"
              fill="none"
              stroke="#1c1917"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            <path
              d="M 84,67 Q 88,61 92,67"
              fill="none"
              stroke="#1c1917"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
            {/* Rosy cheeks */}
            <circle cx="44" cy="74" r="5" fill="#f59e0b" opacity="0.4" />
            <circle cx="96" cy="74" r="5" fill="#f59e0b" opacity="0.4" />
          </>
        ) : (
          <>
            <circle cx="52" cy="65" r="4" fill="#1c1917" />
            <circle cx="53.5" cy="63.5" r="1.5" fill="#ffffff" />
            <circle cx="88" cy="65" r="4" fill="#1c1917" />
            <circle cx="89.5" cy="63.5" r="1.5" fill="#ffffff" />
            {/* Rosy cheeks */}
            <circle cx="44" cy="74" r="4" fill="#f59e0b" opacity="0.3" />
            <circle cx="96" cy="74" r="4" fill="#f59e0b" opacity="0.3" />
          </>
        )}

        {/* Glasses with Electric Golden Gradient */}
        {(mood === 'thinking' || mood === 'awake' || mood === 'tea') && (
          <g>
            <circle cx="52" cy="65" r="11" fill="none" stroke="url(#goldGlasses)" strokeWidth="2.6" />
            <circle cx="88" cy="65" r="11" fill="none" stroke="url(#goldGlasses)" strokeWidth="2.6" />
            <line x1="63" y1="65" x2="77" y2="65" stroke="url(#goldGlasses)" strokeWidth="2.6" />
            {/* Lens glare */}
            <path d="M 46,59 L 52,59" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
            <path d="M 82,59 L 88,59" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
          </g>
        )}

        {/* Cute Sloth Nose */}
        <ellipse cx="70" cy="75" rx="6.5" ry="4.5" fill="#1c1917" />

        {/* Smile */}
        {mood === 'happy' ? (
          <path
            d="M 64,81 Q 70,89 76,81"
            fill="#d97706"
            stroke="#1c1917"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        ) : (
          <path
            d="M 65,81 Q 70,85 75,81"
            fill="none"
            stroke="#1c1917"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        )}

        {/* Golden Leaf Sprout on Forehead */}
        <path
          d="M 70,32 Q 80,24 85,32 Q 75,37 70,32 Z"
          fill="#facc15"
          stroke="#ca8a04"
          strokeWidth="1.2"
        />
        <line x1="70" y1="32" x2="77" y2="29" stroke="#b45309" strokeWidth="1.2" />
      </svg>
    </div>
  );
};

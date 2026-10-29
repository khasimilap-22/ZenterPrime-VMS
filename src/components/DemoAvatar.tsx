import React from 'react';

interface DemoAvatarProps {
  size?: number | string;
  className?: string;
  showStatusIndicator?: boolean;
}

/**
 * Deterministic Vector Illustration of the Enterprise Demo Developer.
 * Stays 100% identical and stable across all browser sessions and reloads.
 * Matches the reference screenshot's character styling (dark hair, green collared jacket, clean modern aesthetic).
 */
export const DemoAvatar: React.FC<DemoAvatarProps> = ({
  size = 34,
  className = '',
  showStatusIndicator = false,
}) => {
  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: size, height: size }}
      aria-label="Demo Developer Profile"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full rounded-md overflow-hidden"
      >
        <defs>
          <linearGradient id="bgGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f0fdf4" />
            <stop offset="1" stopColor="#dcfce7" />
          </linearGradient>
          <linearGradient id="jacketGrad" x1="20" y1="65" x2="80" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#047857" />
            <stop offset="1" stopColor="#065f46" />
          </linearGradient>
          <linearGradient id="shirtGrad" x1="45" y1="62" x2="55" y2="78" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f8fafc" />
            <stop offset="1" stopColor="#e2e8f0" />
          </linearGradient>
          <linearGradient id="hairGrad" x1="30" y1="15" x2="70" y2="50" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1e293b" />
            <stop offset="1" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        {/* Soft Background */}
        <rect width="100" height="100" rx="16" fill="url(#bgGrad)" />

        {/* Outer Ring Border */}
        <rect
          x="1"
          y="1"
          width="98"
          height="98"
          rx="15"
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          strokeOpacity="0.4"
        />

        {/* Shoulders & Jacket */}
        <path
          d="M14 96 C14 74, 30 65, 50 65 C70 65, 86 74, 86 96 Z"
          fill="url(#jacketGrad)"
        />

        {/* Shirt Collar V-Neck */}
        <path
          d="M44 65 L50 78 L56 65 Z"
          fill="url(#shirtGrad)"
        />

        {/* Jacket Left & Right Lapels */}
        <path
          d="M36 67 L44 65 L46 86 L34 96 Z"
          fill="#065f46"
          opacity="0.6"
        />
        <path
          d="M64 67 L56 65 L54 86 L66 96 Z"
          fill="#064e3b"
          opacity="0.7"
        />

        {/* Neck */}
        <rect x="44" y="52" width="12" height="16" rx="4" fill="#fbcfe8" />
        <rect x="44" y="52" width="12" height="16" rx="4" fill="#fcd34d" opacity="0.6" />
        {/* Neck Shadow */}
        <path d="M44 57 C48 62, 52 62, 56 57 L56 62 L44 62 Z" fill="#b45309" opacity="0.15" />

        {/* Head / Face */}
        <ellipse cx="50" cy="42" rx="17" ry="19" fill="#fcd34d" />
        <ellipse cx="50" cy="42" rx="17" ry="19" fill="#f472b6" opacity="0.18" />

        {/* Ears */}
        <circle cx="33" cy="44" r="3.5" fill="#fcd34d" />
        <circle cx="67" cy="44" r="3.5" fill="#fcd34d" />

        {/* Eyes */}
        <ellipse cx="44" cy="42" rx="2.2" ry="2.6" fill="#0f172a" />
        <ellipse cx="56" cy="42" rx="2.2" ry="2.6" fill="#0f172a" />
        <circle cx="43.3" cy="41.2" r="0.7" fill="#ffffff" />
        <circle cx="55.3" cy="41.2" r="0.7" fill="#ffffff" />

        {/* Eyebrows */}
        <path d="M41 37 Q44 35.5 47 37" stroke="#0f172a" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M53 37 Q56 35.5 59 37" stroke="#0f172a" strokeWidth="1.6" strokeLinecap="round" />

        {/* Smile */}
        <path d="M45.5 49 Q50 53 54.5 49" stroke="#92400e" strokeWidth="1.8" strokeLinecap="round" fill="none" />

        {/* Cheeks */}
        <ellipse cx="39" cy="46" rx="2.5" ry="1.5" fill="#f43f5e" opacity="0.3" />
        <ellipse cx="61" cy="46" rx="2.5" ry="1.5" fill="#f43f5e" opacity="0.3" />

        {/* Stylized Modern Dark Hair */}
        <path
          d="M33 39 C31 29, 36 21, 50 20 C64 21, 69 29, 67 39 C65 33, 62 31, 58 31 C52 31, 50 33, 44 32 C38 31, 35 34, 33 39 Z"
          fill="url(#hairGrad)"
        />
        <path
          d="M45 20 Q50 16 56 21 Q65 19 63 26"
          stroke="#334155"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Online / Active Indicator Dot */}
      {showStatusIndicator && (
        <span
          className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-900 shadow-xs"
          title="Demo Account Active"
        />
      )}
    </div>
  );
};

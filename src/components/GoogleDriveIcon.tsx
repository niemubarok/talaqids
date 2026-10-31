import React from 'react';

interface GoogleDriveIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

/**
 * Official Google Drive icon SVG in vector format with authentic Google brand colors.
 */
export function GoogleDriveIcon({
  className = 'h-4 w-4',
  ...props
}: GoogleDriveIconProps) {
  return (
    <svg
      viewBox="0 0 87.3 78"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      {...props}
    >
      {/* Blue segment */}
      <path
        d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z"
        fill="#0066da"
      />
      {/* Green segment */}
      <path
        d="M43.65 25L29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z"
        fill="#00ac47"
      />
      {/* Red corner accent */}
      <path
        d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H58.65l5.85 11.5z"
        fill="#ea4335"
      />
      {/* Dark green overlap */}
      <path
        d="M43.65 25L57.4 1.2C56.05.4 54.5 0 52.9 0H34.4c-1.6 0-3.15.45-4.5 1.2z"
        fill="#00832d"
      />
      {/* Light blue base */}
      <path
        d="M59.8 53H27.5L13.75 76.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z"
        fill="#2684fc"
      />
      {/* Yellow top-right */}
      <path
        d="M73.4 26.5l-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3L43.65 25l16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z"
        fill="#ffba00"
      />
    </svg>
  );
}

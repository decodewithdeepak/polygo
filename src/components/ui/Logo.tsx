export default function Logo({ className }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* White Rounded Background */}
            <rect x="0" y="0" width="32" height="32" rx="10" fill="#FFFFFF" />

            {/* Mathematically Centered Concentric Hexagons */}
            <g stroke="#374151" strokeWidth="3" strokeLinejoin="round" fill="none">
                {/* Outer Hexagon layer - centered at 16, 16 */}
                {/* Height from 5 to 27 = 22 units */}
                <path d="M16 5 L25.5 10.5 V21.5 L16 27 L6.5 21.5 V10.5 L16 5Z" />
                {/* Inner Hexagon layer - centered at 16, 16 */}
                {/* Height from 11 to 21 = 10 units */}
                <path d="M16 11 L20.33 13.5 V18.5 L16 21 L11.67 18.5 V13.5 L16 11Z" />
            </g>
        </svg>
    );
}

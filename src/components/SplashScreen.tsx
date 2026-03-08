import { useEffect, useState } from "react";
import Logo from "./ui/Logo";

interface SplashScreenProps {
    onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            // Guard against proceeding if an error is caught by something else
            if (!error) onComplete();
        }, 2000);

        // Global error listener for splash screen phase
        const handleError = (event: ErrorEvent) => {
            setError(`${event.error?.name || "Error"}: ${event.message}`);
        };
        window.addEventListener("error", handleError);

        return () => {
            clearTimeout(timer);
            window.removeEventListener("error", handleError);
        };
    }, [onComplete, error]);

    return (
        <>
            <style>{`
                @keyframes popIn {
                    from { opacity: 0; transform: scale(0.5); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fillBar {
                    from { width: 0%; }
                    to { width: 100%; }
                }
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); opacity: 0.4; }
                    50% { transform: translateY(-6px); opacity: 1; }
                }
            `}</style>

            <div
                style={{
                    position: "fixed",
                    inset: 0,
                    zIndex: 50,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#09090b",
                }}
            >
                {/* Logo */}
                <div
                    style={{
                        width: 100,
                        height: 100,
                        borderRadius: "16px",
                        background: "#27272a",
                        border: "1px solid #3f445e",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        animation: "popIn 0.4s ease-out forwards",
                    }}
                >
                    <Logo className="h-16 w-16 text-zinc-100" />
                </div>

                {/* App Name */}
                <h1
                    style={{
                        marginTop: 24,
                        fontSize: "2rem",
                        fontWeight: 700,
                        color: "#fff",
                        letterSpacing: "-0.02em",
                        opacity: 0,
                        animation: "fadeUp 0.4s ease-out 0.2s forwards",
                    }}
                >
                    Polygo
                </h1>

                {/* Subtitle */}
                <p
                    style={{
                        marginTop: 4,
                        color: "#9ca3af",
                        fontSize: "0.875rem",
                        opacity: 0,
                        animation: "fadeUp 0.4s ease-out 0.4s forwards",
                    }}
                >
                    Multilingual Real-time Chat
                </p>

                {/* Bouncing Dots */}
                <div
                    style={{
                        display: "flex",
                        gap: 12,
                        marginTop: 40,
                        opacity: 0,
                        animation: "fadeUp 0.3s ease-out 0.6s forwards",
                    }}
                >
                    {[0, 0.1, 0.2].map((delay, i) => (
                        <div
                            key={i}
                            style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                backgroundColor: "#fff",
                                animation: `bounce 1s ease-in-out ${delay}s infinite`,
                            }}
                        />
                    ))}
                </div>

                {/* Simple Progress Bar or Error Log */}
                {!error ? (
                    <div
                        style={{
                            position: "absolute",
                            bottom: 48,
                            width: 200,
                            height: 1,
                            backgroundColor: "#1f2937",
                            opacity: 0,
                            animation: "fadeUp 0.3s ease-out 0.6s forwards",
                        }}
                    >
                        <div
                            style={{
                                height: "100%",
                                backgroundColor: "#fff",
                                width: 0,
                                animation: "fillBar 2s ease-in-out 0.2s forwards",
                            }}
                        />
                    </div>
                ) : (
                    <div
                        style={{
                            position: "absolute",
                            bottom: 48,
                            width: "90%",
                            maxWidth: 600,
                            padding: 16,
                            borderRadius: 8,
                            background: "rgba(127, 29, 29, 0.2)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            color: "#fca5a5",
                            fontSize: "12px",
                            fontFamily: "monospace",
                            animation: "fadeUp 0.3s ease-out forwards",
                            overflowX: "auto",
                        }}
                    >
                        <div style={{ fontWeight: "bold", marginBottom: 4 }}>[Initialization Error]</div>
                        {error}
                    </div>
                )}
            </div>
        </>
    );
}

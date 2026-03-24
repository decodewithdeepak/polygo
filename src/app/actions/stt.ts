"use server";

export async function transcribeAudioAction(formData: FormData): Promise<string> {
    const file = formData.get("file") as File;
    if (!file) {
        throw new Error("No file provided");
    }

    const apiKey = process.env.SARVAM_API_KEY;
    if (!apiKey) {
        throw new Error("SARVAM_API_KEY is not configured on the server");
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const sarvamFormData = new FormData();
    sarvamFormData.append("file", new Blob([buffer], { type: file.type || "audio/webm" }), file.name || "audio.webm");

    const res = await fetch("https://api.sarvam.ai/speech-to-text-translate", {
        method: "POST",
        headers: {
            "api-subscription-key": apiKey,
        },
        body: sarvamFormData,
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error("Sarvam STT failed:", res.status, errorText);
        throw new Error(`Sarvam STT failed: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data.transcript || "";
}


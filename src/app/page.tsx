"use client";

import { useState } from "react";
import { SubmitButton } from "@/components/SubmitButton";

export default function HomePage() {
    const [authorName, setAuthorName] = useState("");
    const [loveInterest, setLoveInterest] = useState("");
    const [setting, setSetting] = useState("");
    const [trope, setTrope] = useState("");
    const [story, setStory] = useState("");
    const [loading, setLoading] = useState(false);

    const canSubmit = authorName && loveInterest && setting && trope;

    const generateStory = async () => {
        setLoading(true);
        const res = await fetch("/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ authorName, loveInterest, setting, trope }),
        });
        const data = await res.json();
        setStory(data.story);
        setLoading(false);
    };

    return (
        <main className="min-h-screen bg-pink-50 p-6">
            <div className="max-w-xl mx-auto">
                <h1 className="text-3xl font-bold text-center text-rose-700 mb-4">
                    HeartFire Publishing: Submit Your Romance
                </h1>
                <p className="text-center text-gray-600 mb-6">
                    Collaboratively author your next smash hit romance novel.
                </p>

                <div className="grid gap-4">
                    <input
                        placeholder="Your Character's Name"
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        className="border p-2 rounded w-full"
                    />
                    <input
                        placeholder="Their Love Interest's Name"
                        value={loveInterest}
                        onChange={(e) => setLoveInterest(e.target.value)}
                        className="border p-2 rounded w-full"
                    />
                    <input
                        placeholder="Romantic Setting (e.g. moonlit rooftop)"
                        value={setting}
                        onChange={(e) => setSetting(e.target.value)}
                        className="border p-2 rounded w-full"
                    />
                    <input
                        placeholder="Choose a Trope (e.g. enemies to lovers)"
                        value={trope}
                        onChange={(e) => setTrope(e.target.value)}
                        className="border p-2 rounded w-full"
                    />
                    <SubmitButton
                        onClick={generateStory}
                        disabled={!canSubmit || loading}
                        loading={loading}
                    >
                        Submit to Editor
                    </SubmitButton>
                </div>

                {story && (
                    <div className="mt-8 bg-white p-4 rounded shadow">
                        <h2 className="text-xl font-semibold text-rose-600 mb-2">
                            Submission Preview
                        </h2>
                        <p className="whitespace-pre-line text-gray-800">
                            {story}
                        </p>
                    </div>
                )}
            </div>
        </main>
    );
}

// To be paired with: /app/api/generate/route.ts and /components/SubmitButton.tsx

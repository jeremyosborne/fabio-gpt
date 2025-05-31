"use client";

import { useState } from "react";
import { SubmitButton } from "@/components/SubmitButton";

type ModelMessage = {
    /** ISO string when the message was generated. */
    created_at: string;
    /** false if there are no more messages to receive. */
    done: boolean;
    /** What model generated this education. */
    model: string;
    /** The next portion of the response message. */
    response: string;
};

export default function HomePage() {
    const [authorName, setAuthorName] = useState("");
    const [loveInterest, setLoveInterest] = useState("");
    const [setting, setSetting] = useState("");
    const [trope, setTrope] = useState("");
    const [story, setStory] = useState("");
    const [loading, setLoading] = useState(false);
    const [log, setLog] = useState<string[]>([]);

    const canSubmit = authorName && loveInterest && setting && trope;

    // A streaming response handler.
    const generateStory = async () => {
        setLoading(true);
        setStory("");
        setLog(["Connecting to HeartFire Editor..."]);

        try {
            const res = await fetch("/api/generate/stream", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    authorName,
                    loveInterest,
                    setting,
                    trope,
                }),
            });

            const reader = res.body?.getReader();
            const decoder = new TextDecoder("utf-8");

            setLog((prev) => [
                ...prev,
                "Receiving story draft from the editor...",
            ]);

            while (reader) {
                const { done, value } = await reader.read();
                if (done) {
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                setLog((prev) => [...prev, "Chunk received: " + chunk]);
                const message = JSON.parse(chunk) as ModelMessage;
                // Piece together the story as we get the responses.
                setStory((prev) => prev + message.response);
            }

            setLog((prev) => [...prev, "Draft complete. Ready for review!"]);
        } catch (error) {
            console.error("Stream error:", error);
            setLog((prev) => [...prev, "Something went wrong with streaming."]);
        } finally {
            setLoading(false);
        }
    };

    // A direct request/response function (simpler, easier to manage.)
    // const generateStory = async () => {
    //     setLoading(true);
    //     setLog(["Preparing your submission..."]);

    //     try {
    //         setLog((prev) => [
    //             ...prev,
    //             "Sending data to the editor (model)...",
    //         ]);
    //         const res = await fetch("/api/generate", {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({
    //                 authorName,
    //                 loveInterest,
    //                 setting,
    //                 trope,
    //             }),
    //         });

    //         setLog((prev) => [
    //             ...prev,
    //             "Waiting for response from the model...",
    //         ]);
    //         const data = await res.json();
    //         setStory(data.story);
    //         setLog((prev) => [...prev, "Story received and ready to read!"]);
    //     } catch (error) {
    //         console.error("Error generating story:", error);
    //         setLog((prev) => [
    //             ...prev,
    //             "An error occurred while generating your story.",
    //         ]);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    return (
        <main
            className="min-h-screen"
            style={{
                backgroundImage: 'url("/background.png")',
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                backgroundAttachment: "fixed",
                backgroundPosition: "center",
            }}
        >
            <div
                className="min-h-screen"
                style={{ backgroundColor: "rgba(200, 80, 100, 0.7)" }}
            >
                <div className="max-w-xl mx-auto bg-pink-50 p-10">
                    <h1 className="text-3xl font-bold text-center text-rose-700 mb-4">
                        FabioGPT
                    </h1>
                    <p className="text-center text-gray-600 mb-6">
                        Collaboratively author your next romantic scene.
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
                            Submit to FabioGPT
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

                    {log.length > 0 && (
                        <div className="h-50 mt-6 p-3 bg-yellow-50 border border-yellow-200 text-sm text-yellow-800 rounded overflow-y-auto">
                            <strong className="block mb-2">
                                Submission Log:
                            </strong>
                            <ul className="list-disc list-inside">
                                {log.map((entry, idx) => (
                                    <li key={idx}>{entry}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

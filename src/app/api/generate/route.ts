import { NextRequest, NextResponse } from "next/server";

// A standard request/response endpoint.
export async function POST(req: NextRequest) {
    const { authorName, loveInterest, setting, trope } = await req.json();

    console.log("📥 Received submission:");
    console.log(`- Character: ${authorName}`);
    console.log(`- Love Interest: ${loveInterest}`);
    console.log(`- Setting: ${setting}`);
    console.log(`- Trope: ${trope}`);

    const prompt = `
Write the first 2-3 paragraphs of a light-hearted, slightly steamy romance novel. Make it funny, full of clichés, and slightly over-the-top. Use the following info:

- Main character: ${authorName}
- Love interest: ${loveInterest}
- Setting: ${setting}
- Trope: ${trope}

Write as if it's the opening of a paperback romance novel submission.
`;

    console.log("🧠 Sending prompt to Ollama...");
    try {
        const response = await fetch("http://localhost:11434/api/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "llama3",
                prompt,
                stream: false,
            }),
        });

        const data = await response.json();
        console.log("✅ Received response from model.");

        return NextResponse.json({ story: data.response.trim() });
    } catch (err) {
        console.error("❌ Error talking to Ollama:", err);
        return NextResponse.json(
            { error: "Failed to generate story." },
            { status: 500 }
        );
    }
}

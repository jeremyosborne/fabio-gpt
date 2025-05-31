import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { authorName, loveInterest, setting, trope } = await req.json();

    const prompt = `
Write the first 2-3 paragraphs of a light-hearted, slightly steamy romance novel. Make it funny, full of clichés, and slightly over-the-top. Use the following info:

- Main character: ${authorName}
- Love interest: ${loveInterest}
- Setting: ${setting}
- Trope: ${trope}

Write as if it’s the opening of a paperback romance novel submission.
`;

    const response = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "llama3", // Make sure you've pulled it with `ollama run llama3`
            prompt,
            stream: false,
        }),
    });

    const data = await response.json();

    return NextResponse.json({ story: data.response.trim() });
}

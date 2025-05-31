import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const { authorName, loveInterest, setting, trope } = await req.json();

    const prompt = `
Write the first 2-3 paragraphs of a light-hearted, slightly steamy romance novel. Make it funny, full of clichés, and slightly over-the-top. Use the following info:

- Main character: ${authorName}
- Love interest: ${loveInterest}
- Setting: ${setting}
- Trope: ${trope}

Write as if it's the opening of a paperback romance novel submission.
`;

    const ollamaRes = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "llama3",
            prompt,
            stream: true,
        }),
    });

    return new Response(ollamaRes.body, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
        },
    });
}

import { OpenAI } from "openai";
import * as dotenv from "dotenv";
dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
});

type VaultStrategyInput = {
    xp: number; // user XP
    tvl: number; // vault total value locked in ETH
    ethPrice: number; // ETH/USD price
};

export async function generateStrategy(input: VaultStrategyInput): Promise<string> {
    const prompt = `
You are VaultOS AI – an intelligent advisor for DeFi vault strategies.

User has:
- ${input.xp} XP
- Vault TVL: ${input.tvl} ETH
- ETH price: $${input.ethPrice}

Give ONE concise strategy suggestion for optimizing yield. Do NOT include disclaimers. Mention a target APR and an asset or protocol to use.`;

    const res = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
    });

    return res.choices[0].message.content || "No suggestion.";
}

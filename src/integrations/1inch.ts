import axios from "axios";

const ONE_INCH_API_BASE = "https://api.1inch.dev/swap/v5.2";

export async function build1inchCalldata({
    chainId,
    from,
    srcToken = "ETH",
    dstToken,
    amount, // in wei (string)
    slippage = 1.0,
}: {
    chainId: number;
    from: string;
    srcToken?: string;
    dstToken: string;
    amount: string;
    slippage?: number;
}) {
    const endpoint = `${ONE_INCH_API_BASE}/${chainId}/swap`;
    const params = {
        src: srcToken,
        dst: dstToken,
        amount,
        from,
        slippage: slippage.toString(),
        disableEstimate: true,
    };

    const apiKey = process.env.VITE_ONE_INCH_API_KEY
    if (!apiKey) throw new Error("Missing VITE_ONE_INCH_API_KEY in .env");

    const res = await axios.get(endpoint, {
        params,
        headers: {
            Authorization: `Bearer ${apiKey}`,
        },
    });

    return {
        txData: res.data.tx.data,
        to: res.data.tx.to,
        value: res.data.tx.value,
    };
}

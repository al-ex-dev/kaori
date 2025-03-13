export default {
    order: {
        key: {
            participant: "13135550002@s.whatsapp.net",
            ...(m.from ? { remoteJid: m.sender } : {}),
        },
        message: {
            orderMessage: {
                orderId: '594071395007984',
                thumbnail: Buffer.from(await (await fetch("https://telegra.ph/file/f8324d9798fa2ed2317bc.png")).arrayBuffer()),
                itemCount: 50000,
                status: 'INQUIRY',
                surface: 'CATALOG',
                message: `You are not authorized`,
                orderTitle: _config.bot.credits,
                sellerJid: '6285768966412@s.whatsapp.net',
                token: 'AR40+xXRlWKpdJ2ILEqtgoUFd45C8rc1CMYdYG/R2KXrSg==',
                totalAmount1000: '500000',
                totalCurrencyCode: 'USD',
            },
        },
    },
}
export default {
    name: 'stickerpack',
    description: 'paquete de sticker',
    comand: ['stickerpack'],
    exec: async (m, { sock }) => {
        await sock.relayMessage(m.from, {
            stickerPackMessage: {
                stickerPackId: "com.marsvard.stickermakerforwhatsapp.stickercontentprovider 1735622300",
                name: "Loli is kawaii😻😻",
                publisher: "@xyuzu.js - Dimas Triyatno",
                stickers: [
                    {
                        fileName: "UrWMZd4M+dFhab0eT6++d3hnsZTP9X+uR0og8psC38w=.webp",
                        isAnimated: true,
                        emojis: ["😻"],
                        accessibilityLabel: "psht",
                        isLottie: false,
                        mimetype: "image/webp"
                    },
                    {
                        fileName: "yRmBsmWo8yIBCO2RanTbluFK+kYR+YwBG4VQTlECkdU=.webp",
                        isAnimated: false,
                        emojis: [""],
                        accessibilityLabel: "",
                        isLottie: false,
                        mimetype: "image/webp"
                    },
                ],
                fileLength: "728050",
                fileSha256: "jhdqeybzxe/pXEAT4BZ1Vq01NuHF1A4cR9BMBTzsLoM=",
                fileEncSha256: "+medG1NodVaMozb3qCx9NbGx7U3jq37tEcZKBcgcGyw=",
                mediaKey: "Wvlvtt7qAw5K9QIRjVR/vVStGPEprPr32jac0fig/Q0=",
                directPath: "/v/t62.15575-24/25224857_1800341540738225_177315250263849638_n.enc?ccb=11-4&oh=01_Q5AaIE1n5-Z0QKhbdfOMEJ9WHNLpwWzwWhkjYIxZeP-S4iTY&oe=67A200FF&_nc_sid=5e03e0",
                contextInfo: {},
                packDescription: "Apayah",
                mediaKeyTimestamp: "1736088676",
                trayIconFileName: "com.marsvard.stickermakerforwhatsapp.stickercontentprovider 1735622300.png",
                thumbnailDirectPath: "/v/t62.15575-24/24246757_902771565377944_818067326838774621_n.enc?ccb=11-4&oh=01_Q5AaIKjnrmxQbLtKbXoDzu9mmqSx03YEy-AhaHfk242TguWL&oe=67A1F6F3&_nc_sid=5e03e0",
                thumbnailSha256: "FQFP03spSHOSBUTOJkQg/phVS1I0YqtoqE8DoFZ/cmw=",
                thumbnailEncSha256: "OALtE35ViGAkU7DROBsJ1RK1dgma/dLcjpvUg62Mj8c=",
                thumbnailHeight: 252,
                thumbnailWidth: 252,
                imageDataHash: "f8453e3e13b8473f3e482f831129009848cc503d1ab28bde2fd037055ecd2e01",
                stickerPackSize: "723949",
                stickerPackOrigin: "THIRD_PARTY"
            }

        }, {})
    },
    isOwner: true
}
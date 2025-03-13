import Req from "./_request.js"
import fs from "fs"

export default new class Facebook {
    constructor() {
        this.parse = (str) => JSON.parse(`{"text": "${str}"}`).text
    }

    download(url) {
        return new Promise((resolve, reject) => {
            if (!url?.trim() || !["facebook.com", "fb.watch"].some(domain => url.includes(domain))) {
                return reject("Please enter a valid Facebook URL")
            }

            Req.axios.get(url, {
                headers: {
                    "sec-fetch-user": "?1",
                    "sec-ch-ua-mobile": "?0",
                    "sec-fetch-site": "none",
                    "sec-fetch-dest": "document",
                    "sec-fetch-mode": "navigate",
                    "cache-control": "max-age=0",
                    authority: "www.facebook.com",
                    "upgrade-insecure-requests": "1",
                    "accept-language": "en-GB,en;q=0.9,tr-TR;q=0.8,tr;q=0.7,en-US;q=0.6",
                    "sec-ch-ua": '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
                    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"
                }
            }).then(({ data }) => {
                const cleaned = data.replace(/&quot;/g, '"').replace(/&amp;/g, "&")
                
                let result = { 
                    url,
                    author: this.parse(cleaned.match(/"actors":\[.*?"name":"(.*?)"/)?.[1] || cleaned.match(/"owning_profile":\{"__typename":"User","name":"(.*?)"/)?.[1] || "Unknown"),
                    title: this.parse(cleaned.match(/"story":\{"message":\{"text":"((?:\\.|[^"\\])*)"/)?.[1] || cleaned.match(/"message_preferred_body":\{"__typename":"TextWithEntities".*?"text":"(.*?)"/)?.[1] || cleaned.match(/"message":\{"text":"(.*?)"/)?.[1] || "Facebook Post"),
                    creation: new Date(parseInt(cleaned.match(/"creation_time":(\d+)/)?.[1] || "0") * 1000).toLocaleString()
                }
                
                const extract = (regex) => this.parse(cleaned.match(regex)?.[1] || "")
                
                let match = cleaned.match(/"all_subattachments":\{"count":(\d+),"nodes":\[(.*?)\]\}/)
                if (match) {
                    const images = (match[2].match(/"image":\{"uri":"(.*?)"/g) || []).map(img => this.parse(img.match(/"image":\{"uri":"(.*?)"/)[1]))
                    return resolve({ ...result, type: "image", images })
                }
                
                const image = extract(/"comet_photo_attachment_resolution_renderer":\{[^}]*"image":\{"uri":"(.*?)"/)
                if (image) {
                    return resolve({ ...result, type: "image", download: image })
                }
                
                const video = extract(/"browser_native_sd_url":"(.*?)"/) || extract(/"playable_url":"(.*?)"/) || extract(/sd_src\s*:\s*"([^"]*)"/) || extract(/(?<="src":")[^"]*(https:\/\/[^\"]*)/)
                if (video) {
                    return resolve({ ...result, type: "video", download: video, duration: Number(extract(/"playable_duration_in_ms":(\d+)/)), thumbnail: extract(/"preferred_thumbnail":\{"image":\{"uri":"(.*?)"/) })
                }

                reject("Unable to fetch video information at this time. Please try again")
            }).catch(err => {
                reject(`Unable to fetch video information. Error: ${err.message}`)
            })
        })
    }
}
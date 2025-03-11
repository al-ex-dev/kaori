import Req from "./_request.js"
import fs from "fs"

export default new class Threads {
    constructor() {
        this.parse = (str) => JSON.parse(`{"text": "${str}"}`).text
    }

    download(url) {
        return new Promise((resolve, reject) => {
            Req.axios.get(url, {
                headers: {
                    "sec-fetch-user": "?1",
                    "sec-ch-ua-mobile": "?0",
                    "sec-fetch-site": "none",
                    "sec-fetch-dest": "document",
                    "sec-fetch-mode": "navigate",
                    "cache-control": "max-age=0",
                    authority: "www.x.net",
                    "upgrade-insecure-requests": "1",
                    "accept-language": "en-GB,en;q=0.9,tr-TR;q=0.8,tr;q=0.7,en-US;q=0.6",
                    "sec-ch-ua": '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
                    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"
                }
            }).then(({ data }) => {
                const cleaned =  (() => {
                    const start = data.indexOf('"thread_items":');
                    if (start === -1) return null;
                    const a = data.indexOf('[', start);
                    let c = 1, i = a + 1;
                    while (i < data.length && c) {
                        c += data[i] === '[' ? 1 : data[i] === ']' ? -1 : 0;
                        i++;
                    }
                    return data.slice(a, i);
                })()

                const threads = (JSON.parse(cleaned))[0].post

                // fs.writeFileSync("t.json", JSON.stringify(json, null, 2), "utf8")

                let result = {
                    status: true,
                    title: this.parse(threads.caption ? threads.caption?.text : "Scraper" ),
                    likes: threads.like_count || 0,
                    repost: threads.text_post_app_info.repost_count || 0,
                    reshare: threads.text_post_app_info.reshare_count || 0,
                    comments: threads.text_post_app_info.direct_reply_count || 0,
                    creation: threads.taken_at || "",
                    author: {
                        username: threads.user.username || "",
                        profile_pic_url: threads.user.profile_pic_url || "",
                        id: threads.user.id || "",
                        is_verified: threads.user.is_verified || false
                    }
                }

                if (threads.video_versions) {
                    return resolve({
                        ...result,
                        download: {
                            type: "video",
                            width: +threads.original_width,
                            height: +threads.original_height,
                            url: threads.video_versions[1].url
                        }
                    })
                }

                if (threads.audio) {
                    return resolve({
                        ...result,
                        download: {
                            type: "audio",
                            url: threads.audio.audio_src
                        }
                    })
                }

                if (threads.carousel_media) {
                    const media = threads.carousel_media.map((item) => {
                        let type, url, height, width
                        if (item.image_versions2) {
                            url = item.image_versions2.candidates[0].url,
                            type = "image",
                            width = item.image_versions2.candidates[0].width,
                            height = item.image_versions2.candidates[0].height
                        }
                        if (item.video_versions) {
                            url = item.video_versions[1].url,
                            type = "video"
                            width = item.original_width,
                            height = item.original_height
                        }

                        return {
                            url,
                            type,
                            width,
                            height
                        }
                    })
                    return resolve({ ...result, download: media })
                }

                if (threads.image_versions2) {
                    return resolve({
                        ...result,
                        download: {
                            url: threads.image_versions2.candidates[0].url,
                            type: "image",
                            width: threads.image_versions2.candidates[0].width,
                            height: threads.image_versions2.candidates[0].height
                        }
                    })
                }

                resolve({ status: false, url })
            })
        })
    }
}
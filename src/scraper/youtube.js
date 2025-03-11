import axios from "axios"
import { CookieJar, Cookie } from "tough-cookie"
import { wrapper } from "axios-cookiejar-support"

export default new class Download {
    constructor() {
        this.jar = new CookieJar()
        this.client = wrapper(axios.create({ jar: this.jar }))
        this.audio = [64, 96, 128, 192, 256, 320]
        this.video = [360, 480, 720, 1080, 1440]

        this._extract = data => data ? JSON.parse(data.split("var ytInitialData = ")[1].split("</")[0].slice(0, -1)) : new Error("No data provided")
        this._date = date => new Date(Date.parse(date.split(" ").slice(1).join(" "))).toISOString()
        this._convert = value => parseFloat(value.replace(/[^0-9.]/g, "")) * (value.includes("k") || value.includes("K") ? 1000 : value.includes("M") ? 1000000 : 1)
    }

    getYouTubeID(input) {
        if (!input) return null
        const url = new URL(input)
        const { hostname, pathname, searchParams } = url
        const valid = /^(www\.|m\.)?youtube\.(com|co)$|youtu\.be$/.test(hostname)
        if (!valid) return input

        if (hostname === "youtu.be") return pathname.split("/")[1] || input

        const [, , section, id] = pathname.split("/")
        return section === "shorts" ? id : searchParams.get("v") || (() => {
            if (["/watch", "channel", "user"].some(p => p === pathname || section === p)) return null
            return section === "playlist" ? searchParams.get("list") : input
        })()
    }

    search(query) {
        return new Promise(async (resolve, reject) => {
            await this.client.get("https://www.youtube.com/results", {
                headers: {
                    accept: "*/*",
                    "accept-encoding": "gzip, deflate, br",
                    "accept-language": "en-US,en;q=0.9",
                    "sec-ch-ua": '"Google Chrome";v="117", "Not;A=Brand";v="8", "Chromium";v="117"',
                    "sec-ch-ua-mobile": "?0",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36"
                },
                params: { search_query: query }
            }).then(({ data }) => {
                const contents = this._extract(data).contents.twoColumnSearchResultsRenderer.primaryContents.sectionListRenderer.contents[0].itemSectionRenderer.contents
                const results = contents.map(content => {
                    const tag = Object.keys(content)[0]
                    if (tag === "videoRenderer") {
                        const data = content[tag]
                        return {
                            id: data.videoId,
                            url: `https://www.youtube.com/watch?v=${data.videoId}`,
                            title: data.title?.runs[0]?.text,
                            author: data.ownerText?.runs[0]?.text,
                            description: data.descriptionSnippet ? data.descriptionSnippet.runs.map(run => run.text).join("") : data.detailedMetadataSnippets ? data.detailedMetadataSnippets[0].snippetText.runs.map(run => run.text).join("") : "",
                            viewers: data.viewCountText?.simpleText,
                            verified: data.ownerBadges && data.ownerBadges.some(badge => badge.metadataBadgeRenderer.tooltip === "Official Artist Channel"),
                            duration: data.lengthText?.accessibility?.accessibilityData?.label,
                            thumbnail: data.thumbnail?.thumbnails[0]?.url,
                            moving_thumbnail: data.richThumbnail ? data.richThumbnail.movingThumbnailRenderer.movingThumbnailDetails.thumbnails[0].url : null,
                            avatar: data.channelThumbnailSupportedRenderers?.channelThumbnailWithLinkRenderer?.thumbnail?.thumbnails[0]?.url,
                            published: data.publishedTimeText?.simpleText
                        }
                    }
                    return null
                }).filter(Boolean)
                resolve(results)
            }).catch(() => {
                reject({ status: false, message: "Error search results from YouTube" })
            })
        })
    }

    getInfo(url) {
        return new Promise(async (resolve, reject) => {
            const id = this.getYouTubeID(url)
            await this.client.get("https://www.youtube.com/watch", {
                params: { v: id },
            }).then(async ({ data }) => {
                const c = this._extract(data).contents.twoColumnWatchNextResults.results.results.contents
                const v = c.find(item => item.videoPrimaryInfoRenderer).videoPrimaryInfoRenderer
                const a = c.find(item => item.videoSecondaryInfoRenderer).videoSecondaryInfoRenderer.owner.videoOwnerRenderer
                const result = {
                    url: `https://www.youtube.com/watch?v=${id}`,
                    title: v.title.runs[0].text,
                    description: c.find(item => item.videoSecondaryInfoRenderer)?.videoSecondaryInfoRenderer?.attributedDescription?.content || "No description",
                    date: v.dateText.simpleText,
                    views: this._convert(v.viewCount.videoViewCountRenderer.viewCount.simpleText),
                    likes: this._convert(v.videoActions?.menuRenderer?.topLevelButtons?.find(btn => btn.segmentedLikeDislikeButtonViewModel?.likeButtonViewModel?.likeButtonViewModel)?.segmentedLikeDislikeButtonViewModel.likeButtonViewModel.likeButtonViewModel.toggleButtonViewModel.toggleButtonViewModel.toggledButtonViewModel.buttonViewModel.title),
                    thumbnail: `https://i.ytimg.com/vi/${id}/hq720.jpg`,
                    tags: v.superTitleLink?.runs.map(tag => tag.text).join(", ") || "No tags",
                    author: {
                        name: a.title.runs[0].text,
                        username: a.navigationEndpoint.browseEndpoint.canonicalBaseUrl.replace("/", ""),
                        subscribers: this._convert(a.subscriberCountText.simpleText),
                        thumbnail: a.thumbnail.thumbnails.at(-1).url,
                        url: `https://www.youtube.com${a.navigationEndpoint.browseEndpoint.canonicalBaseUrl}`
                    }
                }
                resolve(result)
            })
        })
    }

    convert(url, quality) {
        return new Promise(async (resolve, reject) => {
            const id = this.getYouTubeID(url)
            await this.client.get(`https://ytdl.vreden.web.id/convert.php/${id}/${quality}`).then(async ({ data: x }) => {
                await this.client.get(`https://ytdl.vreden.web.id/progress.php/${x.convert}`).then(async ({ data: y }) => {
                    if (y.status === "Error") reject({ status: false, message: "Conversion progress encountered an error" })
                    if (y.status === "Finished") resolve({
                        status: true,
                        quality,
                        url: y.url,
                        filename: `${x.title} (${quality}${this.audio.includes(quality) ? "kbps).mp3" : "p).mp4"}`
                    })
                })
            })
        })
    }

    ytmp3(url) {
        return new Promise(async (resolve, reject) => {
            await this.getInfo(url).then(async (data) => {
                await this.convert(url, 320).then(async ({ url, filename, quality }) => {
                    const result = await fetch(url)
                    const buffer = Buffer.from(await result.arrayBuffer())
                    resolve({
                        url: data.url,
                        title: data.title,
                        description: data.description,
                        date: data.date,
                        views: data.views,
                        likes: data.likes,
                        thumbnail: data.thumbnail,
                        author: {
                            name: data.author.name,
                            username: data.author.username,
                            subscribers: data.author.subscribers,
                            thumbnail: data.author.thumbnail,
                            url: data.author.url
                        },
                        metadata: {
                            download: buffer,
                            duration: buffer.length,
                            filename,
                            quality
                        }
                    })
                })
            })
        })
    }

    ytmp4(url) {
        return new Promise(async (resolve, reject) => {
            await this.getInfo(url).then(async (data) => {
                await this.convert(url, 360).then(async ({ url, filename, quality }) => {
                    const result = await fetch(url)
                    const buffer = Buffer.from(await result.arrayBuffer())
                    resolve({
                        url: data.url,
                        title: data.title,
                        description: data.description,
                        date: data.date,
                        views: data.views,
                        likes: data.likes,
                        thumbnail: data.thumbnail,
                        author: {
                            name: data.author.name,
                            username: data.author.username,
                            subscribers: data.author.subscribers,
                            thumbnail: data.author.thumbnail,
                            url: data.author.url
                        },
                        metadata: {
                            download: buffer,
                            duration: buffer.length,
                            filename,
                            quality
                        }
                    })
                })
            })
        })
    }
}
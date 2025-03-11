import axios from "axios"
import { CookieJar } from "tough-cookie"
import { wrapper } from "axios-cookiejar-support"

export default new class Tiktok {
    constructor() {
        this.client = wrapper(axios.create({ jar: new CookieJar() }))

        this.baseUrl = 'https://tikwm.com'
        this.headers = {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
            'Cookie': 'current_language=en',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
        }
    }

    async download(url) {
        return new Promise(async (resolve, reject) => {
            if (!url) reject(new Error("URL es requerida para descargar."))
            await this.client({
                method: 'POST',
                url: this.baseUrl + '/api/',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Cookie': 'current_language=en',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
                },
                data: {
                    url: url,
                    hd: 1
                }
            }).then(async ({ data: { data } }) => {
                resolve({
                    status: true,
                    data: {
                        id: data.id,
                        title: data.title,
                        cover: data.cover,
                        media: data.duration === 0
                            ? {
                                type: 'image',
                                images: data.images,
                                image_count: data.images.length
                            } : {
                                type: 'video',
                                duration: data.duration,
                                nowatermark: {
                                    size: data.size,
                                    play: data.play,
                                    hd: {
                                        size: data.hd_size,
                                        play: data.hdplay
                                    }
                                },
                                watermark: {
                                    size: data.wm_size,
                                    play: data.wmplay
                                }
                            },
                        creation: data.create_time,
                        views_count: data.play_count,
                        like_count: data.digg_count,
                        comment_count: data.comment_count,
                        share_count: data.share_count,
                        favorite_count: data.collect_count,
                        author: data.author,
                        music: data.music_info
                    }
                })
            }).catch(err => reject({ status: false, error: err }))
        })
    }

    async search(query) {
        return new Promise(async (resolve, reject) => {
            if (!query) reject(new Error("Query es requerida para descargar."));
            await this.client({
                method: 'POST',
                url: this.baseUrl + '/api/feed/search/',
                headers: this.headers,
                data: {
                    keywords: query,
                    count: 20,
                    cursor: 0,
                    hd: 1
                }
            }).then(async ({ data: { data: { videos }} }) => {
                if (videos.length === 0) reject({ status: false, error: "No se encontraron resultados." })
                resolve({
                    status: true,
                    data: videos.map(item => ({
                        id: item.video_id,
                        title: item.title,
                        cover: item.cover,
                        media: {
                            type: 'video',
                            duration: item.duration,
                            nowatermark: item.play,
                            watermark: item.wmplay
                        },
                        creation: item.create_time,
                        views_count: item.play_count,
                        like_count: item.digg_count,
                        comment_count: item.comment_count,
                        share_count: item.share_count,
                        author: item.author,
                        music: item.music_info
                    }))
                })
            }).catch(err => reject({ status: false, error: err }))

        })
    }

    async tending(region) {
        return new Promise(async (resolve, reject) => {
            if (!region) reject(new Error("Region es requerida para descargar."))
            await this.client({
                method: 'POST',
                url: this.baseUrl + '/api/feed/list/',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Cookie': 'current_language=en',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36'
                },
                data: {
                    region: region,
                    count: 12,
                    cursor: 0,
                    web: 1,
                    hd: 1
                }
            }).then(async ({ data: { data } }) => {
                resolve({
                    status: true,
                    data: data.map(item => ({
                        id: item.video_id,
                        title: item.title,
                        cover: this.baseUrl + item.cover,
                        media: {
                            type: 'video',
                            duration: item.duration,
                            nowatermark: this.baseUrl + item.play,
                            watermark: this.baseUrl + item.wmplay
                        },
                        creation: item.create_time,
                        views_count: item.play_count,
                        like_count: item.digg_count,
                        comment_count: item.comment_count,
                        share_count: item.share_count,
                        author: {
                            id: item.author.id,
                            unique_id: item.author.unique_id,
                            nickname: item.author.nickname,
                            avatar: this.baseUrl + item.author.avatar
                        },
                        music: item.music_info
                    }))
                })
            }).catch(err => reject({ status: false, error: err }))
        })
    }
}
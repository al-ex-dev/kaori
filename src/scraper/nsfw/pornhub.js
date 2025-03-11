import axios from "axios"
import * as cheerio from "cheerio"

export default new class PornHub {
    constructor() {
        this.baseUrl = 'https://es.pornhub.com'
        this.url2 = 'https://grabnwatch.com'
    }

    async search(query) {
        return new Promise(async (resolve, reject) => {
            
            const { data } = await axios( this.baseUrl + `/video/search?search=${encodeURIComponent(query)}`, {
                method: 'GET',
                headers: {
                    "cookie" : "__l=66AC3060-42FE722901BB23A27D-79DDB3F; __s=66AC3060-42FE722901BB23A27D-79DDB3F; sessid=641310188884535068; tj_UUID=ChA3Ka6CEJxN041RvSKOiRFUEgwI4eCwtQYQivv95gIYAQ==; tj_UUID_v2=ChA3Ka6CEJxN041RvSKOiRFUEgwI4eCwtQYQivv95gIYAQ==",
                    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"
                }
            })
    
            const $ = cheerio.load(data)
    
            let result = []
    
            $('div[class="wrap flexibleHeight "]').each((i, e) => {
    
                const url = $(e).find('div[class="thumbnail-info-wrapper clearfix"] span[class="title"]').find('a').attr('href')
                const title = $(e).find('div[class="thumbnail-info-wrapper clearfix"] span[class="title"]').find('a').attr('title')
                const author = $(e).find('div[class="usernameWrap"]').find('a').text() ? $(e).find('div[class="usernameWrap"]').find('a').text() : $(e).find('div[class="usernameWrap"] span').find('a').attr('title')
                const author_url = $(e).find('div[class="usernameWrap"]').find('a').attr('href') ? $(e).find('div[class="usernameWrap"]').find('a').attr('href') : $(e).find('div[class="usernameWrap"] span').find('a').attr('href')
                const preview = $(e).find('div[class="phimage"] a').find('img').attr('src')
                const views = $(e).find('div[class="videoDetailsBlock"] div span[class="views"]').find('var').eq(0).text()
                const duration = $(e).find('div[class="marker-overlays js-noFade"]').find('var').eq(0).text()
    
                result.push({ 
                    url: this.baseUrl + url,
                    title,
                    preview,
                    author: {
                        name: author,
                        url: this.baseUrl + author_url
                    },
                    views,
                    duration
                })
            })
            resolve(result)
        })
    }
    async download(url) {
        return new Promise(async (resolve, reject) => {
            const getDonwload = await axios(this.url2, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded' 
                },
                data: { video_url: url }
            })
    
            const getData = await axios(url, {
                method: 'GET',
            })
    
            const $ = cheerio.load(getDonwload.data)
            const $$ = cheerio.load(getData.data)
    
            let result = []
    
            const title = $$('div[class="title-container translate"] h1[class="title translate"]').find('span').text().trim()
            const details = $$('div[class="video-actions-menu"]')
    
            const views = $$(details).find('div[class="views"]').find('span').text().trim()
            const raiting = $$(details).find('div[class="ratingPercent"]').find('span').text().trim()
            const data = $$(details).find('div[class="videoInfo"]').text().trim()
    
            const detailsCount = $$('div[class="votes-fav-wrap"]')
            const likes = $$(detailsCount).find('span[class="votesUp"]').text().trim()
            const dislikes = $$(detailsCount).find('span[class="votesDown"]').text().trim()
            const favorites = $$(detailsCount).find('span[class="favoritesCounter"]').text().trim()
    
            const detailsAuthor = $$('div[class="userInfo"]')
            const name = $$(detailsAuthor).find('div[class="usernameWrap clearfix"]').text().trim()
    
            $('div[class="form-group mb-4"]').each((i, e) => {
                const url = $(e).find('a[class="btn btn-secondary mb-4"]').attr('href')
                const quality = $(e).find('a').eq(0).text().trim()
                result.push({
                    title,
                    data,
                    views,
                    raiting,
                    likes,
                    dislikes,
                    favorites,
                    author: {
                        name
                    },
                    url: this.url2 + url,
                    quality
                })
            })
    
            return result
        })
    }
}
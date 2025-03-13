import axios from 'axios'
import * as cheerio from'cheerio'

export default new class An1 {
    constructor () {
        this.baseUrl = `https://an1.com`
    }

    async download(url) {
        return new Promise(async (resolve, reject) => {
            
            const { data } = await axios.get(url)
    
            const $ = cheerio.load(data) 
    
            const image = $('img[itemprop="image"]').attr('src')
            const name = $('div[itemprop="description"]').find('b').text().trim()
            const description = $('div[itemprop="description"]').find('b').remove().end().text().replace(/^\s*-\s*/, '').trim()
            const author = $('div[class="developer smf muted"] span[itemprop="name"]').text().trim()
            const currency = $('li[class="current-rating"]').attr('style').match(/\d+/)[0]
            const android = $('span[itemprop="operatingSystem"]').text().trim()
            const version = $('span[itemprop="softwareVersion"]').text().trim()
            const file = $('span[itemprop="fileSize"]').text().trim()
            const updated = $('time[itemprop="datePublished"]').attr('datetime')
            const price = `${$('span[itemprop="price"]').attr('content')} ${$('meta[itemprop="priceCurrency"]').attr('content')}`
            const installs = $('div[class="smf"] ul[class="spec"] li').eq(2).find('span').remove().end().text().trim()
            const rated = $('div[class="smf"] ul[class="spec"] li').eq(3).find('span').remove().end().text().trim()
    
            const download = cheerio.load((await axios.get(this.baseUrl + $('a[class="btn btn-lg btn-green"]').attr('href'))).data)('a[id="pre_download"]').attr('href')
    
            resolve({
                image,
                name,
                description,
                author,
                currency,
                android,
                version,
                file,
                updated,
                price,
                installs,
                rated,
                download
            })
        })

    }

    async search(query) {
        return new Promise(async (resolve, reject) => {
            const { data } = await axios.get(this.baseUrl + `/?story=${encodeURIComponent(query)}&do=search&subaction=search`)
    
            const $ = cheerio.load(data)
    
            const results = $('div.fbold.smf.uppercase').text().match(/Found (\d+) responses/)[1]
    
            let result = []
            
            const url = $('div[class="data"]').find('div[class="name"] a')
            
            for (let i = 0; i < url.length; i++) {
                const details = await this.download($(url[i]).attr('href'))
                result.push({
                    ...details
                })
            }
        
            resolve({
                results,
                result
            })
        })
    }
    
}
import axios from "axios"

export default new class Xvideos {
    constructor() {
        this.baseUrl = ""
    }
    async search(query) {
        return new Promise(async resolve => {
            const response = await fetch(`https://www.xvideos.com/?k=${query}&page=${Math.floor(Math.random() * 9) + 1}`, { method: 'GET' })
            const html = await response.text()
            const $ = cheerio.load(html, { xmlMode: false })

            const titles = []
            const durations = []
            const qualities = []
            const thumbnails = []
            const urls = []
            
            $('div.mozaique > div > div.thumb-under > p.title').each(function () {
                titles.push($(this).find('a').attr('title'))
                durations.push($(this).find('span.duration').text())
                urls.push('https://www.xvideos.com' + $(this).find('a').attr('href'))
            })
            
            $('div.mozaique > div > div.thumb-under').each(function () {
                qualities.push($(this).find('span.quality').text())
            })
            
            $('div.mozaique > div > div.thumb-under img').each(function () {
                thumbnails.push($(this).attr('src'))
            })
            
            const results = [];
            for (let i = 0; i < titles.length; i++) {
                results.push({
                    title: titles[i],
                    duration: durations[i],
                    quality: qualities[i],
                    thumb: thumbnails[i],
                    url: urls[i],
                })
            }
            resolve(results)
        })
    }
}
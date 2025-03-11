import axios from 'axios';
import * as cheerio from 'cheerio';

export default new class Wallpaper {
    constructor() {
        this.baseUrl = 'https://wallspic.com/es';
    }
    
    async download(url) {
        return new Promise(async (resolve, reject) => {
            const { data: html } = await axios.get(url)
            const $ = cheerio.load(html)
            
            const title = $('h1.wallpaper__title').text().trim()
            const date = $('div.wallpaper__date').text().trim().replace("Descargado ", "")
            const category = $('span.detailsList__label').eq(0).next('a').text().trim()
            const resolution = $('li').filter((i, el) => $(el).find('span.detailsList__label').text().trim()).contents().filter(function() {
                return this.nodeType === 3
            }).text().trim()
            const uploader = $('span.detailsList__label').eq(2).next('a').text().trim()
            const download = $('a.btn_block.wallpaper__download').attr('href')

            const resolutions = []
            const promises = []

            $('.defPanel__item').each((i, el) => {
                const type = $(el).find('button').text().trim()
                $(el).find('.defPanel__list .defPanel__link').each((j, link) => {
                    const resUrl = $(link).attr('href')
                    const text = $(link).text().trim()
                    promises.push(
                        axios.get(resUrl).then(response => {
                            const $res = cheerio.load(response.data)
                            const downloadLink = $res('a.btn_block.wallpaper__download').attr('href')
                            resolutions.push({
                                type: type,
                                url: resUrl,
                                resolution: text,
                                download: downloadLink
                            })
                        })
                    )
                })
            })

            await Promise.all(promises)

            resolve({
                title,
                date,
                category,
                resolution,
                uploader,
                download,
                resolutions
            })
            
        })
    }

    async search(query) {
        return new Promise(async (resolve, reject) => {
            const { data: html } = await axios.get(`${this.baseUrl}/search/${encodeURIComponent(query)}`);
            const $ = cheerio.load(html);
    
            const results = []
            const promises = []
    
            $('script').each((i, el) => {
                const script = $(el).html()
    
                if (script && script.includes('window.mainAdaptiveGallery')) {
                    const json = script.match(/window.mainAdaptiveGallery\s*=\s*(\{.*?\});/s)
                    if (json) {
                        const data = JSON.parse(json[1])
                        data.list.forEach(item => {
                            const url = item.original.link
                            promises.push(
                                this.download(url)
                                    .then(details => {
                                        results.push({
                                            ...details,
                                            preview: item.thumbnail.link
                                        })
                                    })
                            )
                        })
                    }
                }
            })
    
            await Promise.all(promises)
    
            resolve(results)
        })
    }
}
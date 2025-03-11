import axios from "axios"
import * as cheerio from "cheerio"

export default new class Hentai {
    constructor() {
        this.baseUrl = ""
    }
    async v1(query) {
        return new Promise(async (resolve, reject) => {
            const { data } = await axios.get("https://hentai.tv/?s=" + query)
            let $ = cheerio.load(data)
            let results = []
            
            $('div.flex > div.crsl-slde').each(function (a, b) {
                let _thumb = $(b).find('img').attr('src')
                let _title = $(b).find('a').text().trim()
                let _views = $(b).find('p').text().trim()
                let _link = $(b).find('a').attr('href')
                let hasil = { creator: 'sensei#404', thumbnail: _thumb, title: _title, views: _views, url: _link }
                results.push(hasil)
            })
            
            resolve(results)
        })
    }

}
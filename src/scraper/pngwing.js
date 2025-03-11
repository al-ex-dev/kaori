import axios from "axios"

export default new class PngWing {
    constructor() {
        this.baseUrl = ""
    }

    async png() {
        const { data } = await axios.get('https://www.pngwing.com/id/search?q=' + query)
        const $ = cheerio.load(data)
        const results = []
        
        $('li[itemprop="associatedMedia"]').each((index, element) => {
            const contentUrl = $(element).find('link[itemprop="contentUrl"]').attr('href')
            const thumbnail = $(element).find('img[itemprop="thumbnail"]').attr('src')
            const title = $(element).find('figcaption[itemprop="caption description"]').text()
            const dimensions = $(element).find('footer .left').text()
            const fileSize = $(element).find('footer .right').text()
        
            results.push({
                contentUrl,
                thumbnail,
                title,
                dimensions,
                fileSize
            })
        })
        
        return results
    }
}
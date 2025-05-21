export default new class Intranet {
    constructor() {
        this.cookies = null
        this.baseUrl = "https://intranet.upla.edu.pe/sesion"
    }

    async #cookies(response) {
        if (response.headers['set-cookie']) {
            this.cookie = response.headers['set-cookie'].join('; ')
        }
    }

    async #request(url) {
        const response = await axios({
            method: 'GET',
            url: url,
            headers: {
                'accept': 'application/json',
                'cookie': this.cookie || '',
                'referer': this.baseUrl + '/',
                'x-inbox-lifespan': '600',
                'sec-ch-ua': '"Not A(Brand";v="8", "Chromium";v="132"',
                'sec-ch-ua-mobile': '?1'
            }
        });

        await this.#cookies(response)
        return response
    }
}
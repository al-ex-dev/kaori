import axios from "axios";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support"

export default new class Spotify {
    constructor() {
        this.baseUrl = 'https://api.fabdl.com'
        this.client = wrapper(axios.create({ jar: new CookieJar() }))

        process.env['SPOTIFY_CLIENT_ID'] = '4c4fc8c3496243cbba99b39826e2841f'
        process.env['SPOTIFY_CLIENT_SECRET'] = 'd598f89aba0946e2b85fb8aefa9ae4c8'
    }

    async spotifyCreds() {
        return new Promise(async resolve => {
            await this.client.post('https://accounts.spotify.com/api/token', 'grant_type=client_credentials', {
                headers: { Authorization: 'Basic ' + Buffer.from(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64') }
            }).then(({ data }) => resolve(data)).catch(resolve)
        });
    }

    async getInfo(url) {
        return new Promise(async (resolve, reject) => {
            const creds = await this.spotifyCreds()
            if (!creds.access_token) return reject(creds)
            await this.client.get('https://api.spotify.com/v1/tracks/' + url.split('track/')[1], {
                headers: { Authorization: 'Bearer ' + creds.access_token }
            }).then(async ({ data }) => {
                console.log(data)
                resolve({
                    id: data.id,
                    title: data.name,
                    duration: data.duration_ms,
                    popularity: data.popularity + '%',
                    thumbnail: data.album.images.filter(({ height }) => height === 640).map(({ url }) => url)[0],
                    date: data.album.release_date,
                    artist: data.artists.map(({ name, type, id }) => ({ name, type, id })),
                    url: data.external_urls.spotify
                })
            }).catch(err => reject({ status: false, error: err }))
        })
    }
    async search(query, type = 'track', limit = 20) {
        return new Promise(async (resolve, reject) => {
            const creds = await this.spotifyCreds()
            if (!creds.access_token) return reject(creds)
            await this.client.get('https://api.spotify.com/v1/search?query=' + query + '&type=' + type + '&offset=0&limit=' + limit, {
                headers: { Authorization: 'Bearer ' + creds.access_token }
            }).then(async ({ data: { tracks: { items } } }) => {
                let result = []
                items.map(async (data) => result.push({
                    id: data.id,
                    title: data.name,
                    duration: data.duration_ms,
                    popularity: data.popularity + '%',
                    thumbnail: data.album.images.filter(({ height }) => height === 640).map(({ url }) => url)[0],
                    date: data.album.release_date,
                    artist: data.artists.map(({ name, type, id }) => ({ name, type, id })),
                    url: data.external_urls.spotify
                }))
                resolve(result)
            }).catch(err => reject({ status: false, error: err }))
        })
    }

    async downloadV2(url) {
        try {
            const { data } = await this.client.post('https://spotmate.online/convert', { urls: url }, {
                headers: {
                    'Accept': '*/*',
                    'Accept-Encoding': 'gzip, deflate, br, zstd',
                    'Accept-Language': 'vi,en-US;q=0.9,en;q=0.8,fr-FR;q=0.7,fr;q=0.6',
                    'Content-Type': 'application/json',
                    'Cookie': '_ga=GA1.1.1053312031.1740445912; __gads=ID=321b021c6d45dc5a:T=1740445913:RT=1740448481:S=ALNI_MaaY6FZA8aa4MH9ZOKLq5HaT4_5cg; __gpi=UID=0000105657fd3ac7:T=1740445913:RT=1740448481:S=ALNI_MYwzicziiC5A9NPMH2aTe0FeaqkPw; __eoi=ID=71da8532ae5f89c8:T=1740445913:RT=1740448481:S=AA-AfjbHb3DTbIZlYGcuZU6rL_pP; FCNEC=%5B%5B%22AKsRol99Rgou47d_vSeCkQd9aSoKWwufXQieejzQ0y6SlzrbLTA7iXDN9mmKOxycFJQaf6YjBDrarqRHvryfd7gXnn5OdsBpDmhzOnGq6p8iey0bL9g5PKw1OIh_sbxLgEvTJca_XSqwMrvTGisGTbbnwiVPyOA2vg%3D%3D%22%5D%5D; _ga_6LS2RMW0TN=GS1.1.1740448480.2.1.1740448767.0.0.0; XSRF-TOKEN=eyJpdiI6ImxUZ3pUZ2RhbVRKMXF3WGUwRHRpaHc9PSIsInZhbHVlIjoiWVNYcG5oS1J5aDMreDJ0TUJobjhsMGJvM0FDRHZYZnM4c2c2emJERjVwQUhRVEdzMEJ2eWp6RTZSSEpnMHNwRWNBTjlEajc3dG53bHBhcWpBSEQ1SkxtYkE0dFpwa0pQMTQ3bXk5YmV4REMvMk16dkVjN2ltUFZIVDNZS1Y1ajUiLCJtYWMiOiI0YWU2MGQxMGE4ZDQ2ODYzOWFmYjU1NDRkNGRhMGQ0ODQ0NjYzMzNmNDg0ZjdmN2Y4ZjY0NzlkOTQ5YjVkNGU2IiwidGFnIjoiIn0%3D; spotmateonline_session=eyJpdiI6Im4wSGw5dCtsRjNPVHNFTWFnbTVsSEE9PSIsInZhbHVlIjoiRUtvV21zN3FSYzhCYlRtTWYvWmtrUlN4ZUdvYSt3VmlwRnBnbFNadFBCQjF5SjNPaUljTDNVKzZibGtEL0JuZVpjc1cxbExSTllLczZqTE1VUVpmc3J1VjFmamlQMW1CMys4L1RQN2w1bVVJWi9INFN6bFI5aGhwTEhTY2V1d1oiLCJtYWMiOiI4NGJhNzA2YjFjMjYzOTg4NTI0Nzc3YzQ0Nzg4ZWZkMGRlZjgyNzBkMzkwM2NkZmUxMTFjZTU1YzgwNjhjMGI5IiwidGFnIjoiIn0%3D',
                    'Origin': 'https://spotmate.online',
                    'Referer': 'https://spotmate.online/',
                    'Sec-Ch-Ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
                    'Sec-Ch-Ua-Mobile': '?0',
                    'Sec-Ch-Ua-Platform': '"Windows"',
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'same-origin',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
                    'X-Csrf-Token': 'o9YRJIwiXYfhKYx0i9zfsFt5ifOERXUcg5wFyq37'
                }
            });
            return data.url
        } catch (error) {
            console.error('Error:', error);
        }
    }


    async download(url) {
        return new Promise((resolve, reject) => {
            this.client.get(this.baseUrl + `/spotify/get?url=${encodeURIComponent(url)}`).then(async ({ data: { result: get } }) => {
                this.client.get(this.baseUrl + `/spotify/mp3-convert-task/${get.gid}/${get.id}`).then(({ data: { result: download } }) => {
                    if (!download.download_url) return reject({ status: false })
                    resolve({
                        id: get.id,
                        type: get.type,
                        name: get.name,
                        image: get.image,
                        artists: get.artists,
                        duration: get.duration_ms,
                        download: `https://api.fabdl.com${download.download_url}`
                    })
                }).catch(err => reject({ status: false, error: err }))
            }).catch(err => reject({ status: false, error: err }))
        })
    }
}

// const spotify = new Spotify()
// spotify.down("https://open.spotify.com/intl-es/track/59QhwsM5Ovak5APTdkrN57?si=6a4f890a7f53428f").then(console.log).catch(data => console.error(data))
// spotify.download("https://open.spotify.com/track/3zNcn4BaVfKORyx3uDfruW?si=Yb0zN8S9QwaSTyhk1Rk8jA ").then(console.log).catch(console.log)
// spotify.search("morat date la vuelta").then(console.log).catch(console.log)
// spotify.getInfo("https://open.spotify.com/track/3ZkUgtNi45G8qdmya5UTgV").then(console.log).catch(console.log)
// spotify.spotifyCreds().then(console.log).catch(console.log)
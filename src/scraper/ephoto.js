import axios from 'axios'
import * as cheerio from 'cheerio'
import FormData from 'form-data';
import { format } from 'util';

export default new class Ephoto {
    constructor() {
        this.ephoto = 'https://en.ephoto360.com/create-text-effects-in-the-style-of-the-deadpool-logo-818.html'
    }

    async create(url, text) {
        return new Promise(async (resolve, reject) => {

            if (/https?:\/\/(ephoto360|photooxy|textpro)\/\.(com|me)/i.test(url)) throw new Error("URL Invalid")
            const a = await axios.get(url, {
                headers: {
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    "Origin": (new URL(url)).origin,
                    "Referer": url,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.188"
                }
            })

            const $ = cheerio.load(a.data)

            const server = $('#build_server').val()
            const serverId = $('#build_server_id').val()
            const token = $('#token').val()
            const submit = $('#submit').val() ? $('#submit').val() : $('#create_effect').val()

            const types = []
            $('input[name="radio0[radio]"]').each((i, elem) => {
                types.push($(elem).attr("value"))
            })
            let post
            if (types.length !== 0) {
                post = {
                    'radio0[radio]': types[Math.floor(Math.random() * types.length)],
                    'submit': submit,
                    'token': token,
                    'build_server': server,
                    'build_server_id': Number(serverId)
                }
            } else {
                post = {
                    'submit': submit,
                    'token': token,
                    'build_server': server,
                    'build_server_id': Number(serverId)
                };
            }
            console.log(post)

            const form = new FormData()
            for (const key in post) {
                form.append(key, post[key])
            }

            if (typeof text === "string") text = [text]
            text.forEach(t => form.append("text[]", t))

            const b = await axios.post(url, form, {
                headers: {
                    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                    "Origin": (new URL(url)).origin,
                    "Referer": url,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.188",
                    "Cookie": a.headers["set-cookie"].join("; "),
                    ...form.getHeaders()
                }
            })

            const c$ = cheerio.load(b.data);
            const out = c$('#form_value').first().text() || c$('#form_value_input').first().text() || c$('#form_value').first().val() || c$('#form_value_input').first().val();

            console.log(JSON.parse(out))
            const c = await axios.post((new URL(url)).origin + "/effect/create-image", JSON.parse(out), {
                headers: {
                    "Accept": "*/*",
                    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                    "Origin": (new URL(url)).origin,
                    "Referer": url,
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.188",
                    "Cookie": a.headers["set-cookie"].join("; ")
                }
            })

            console.log(c.data)

            resolve({
                status: c.data?.success,
                info: c.data?.info,
                url: server + (c.data?.fullsize_image || c.data?.image || ""),
                session: c.data?.session_id
            })
        })
    }
}
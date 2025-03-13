import _convert from './_convert.js'
import _request from './_request.js'
import _utils from './_utils.js'
import an1 from './an1.js'
import applemusic from './applemusic.js'
import bilibili from './bilibili.js'
import ephoto from "./ephoto.js"
import facebook from "./facebook.js"
import github from "./github.js"
import instagram from "./instagram.js"
import npm from "./npm.js"
import pngwing from "./pngwing.js"
import remini from "./remini.js"
import removebg from "./removebg.js"
import simisimi from './simisimi.js'
import soundcloud from './soundcloud.js'
import spotify from "./spotify.js"
import terabox from "./terabox.js"
import threads from "./threads.js"
import tiktok from "./tiktok.js"
import wallpaper from './wallpaper.js'
import twitter from "./x.js"
import youtube from "./youtube.js"

import hentai from './nsfw/hentai.js'
import pornhub from './nsfw/pornhub.js'
import xvideos from './nsfw/xvideos.js'

export default {
    nsfw: {
        hentai,
        pornhub,
        xvideos
    },
    _convert,
    _request,
    _utils,
    an1,
    ephoto,
    facebook,
    instagram,
    remini,
    spotify,
    threads,
    tiktok,
    twitter,
    youtube
}
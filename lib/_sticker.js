import webp from 'node-webpmux'
import ff from 'fluent-ffmpeg'
import fs from 'fs'

import Function from './_functions.js'

export default new class Sticker {
    async image(media) {
        const input = Function.getRandom('.jpeg')
        const output = Function.getRandom('.webp')
    
        fs.writeFileSync(input, media);
    
        await new Promise((resolve, reject) => {
            ff(input)
                .on('error', (error) => {
                    reject(error)
                })
                .on('end', () => {
                    resolve(true)
                })
                .addOutputOptions([
                    "-vcodec",
                    "libwebp",
                    "-vf",
                    "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse"
                ])
                .toFormat('webp')
                .save(output);
        })
        const buff = fs.readFileSync(output)
        fs.unlinkSync(output)
        fs.unlinkSync(input)
        return buff
    }
    async video(media) {
        const input = Function.getRandom('.jpeg')
        const output = Function.getRandom('.webp')
    
        fs.writeFileSync(input, media);
    
        await new Promise((resolve, reject) => {
            ff(input)
                .on('error', (err) => {
                    reject(err);
                })
                .on('end', () => {
                    resolve(true);
                })
                .addOutputOptions([
                    "-vcodec",
                    "libwebp",
                    "-vf",
                    "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse",
                    "-loop",
                    "0",
                    "-ss",
                    "00:00:00",
                    "-t",
                    "00:00:05",
                    "-preset",
                    "default",
                    "-an",
                    "-vsync",
                    "0"
                ])
                .toFormat('webp')
                .save(output);
        });
    
        const buff = await fs.readFileSync(output)
        fs.unlinkSync(output)
        fs.unlinkSync(input)
        return buff
    }
    
    async write(metadata) {
        const webpBuffer = metadata.sticker ? metadata.sticker : metadata.image ? await this.image(metadata.image) : await this.video(metadata.video)
    
        const input = Function.getRandom('.webp')
        const output = Function.getRandom('.webp')
    
        fs.writeFileSync(input, webpBuffer);
    
        if (metadata.packname || metadata.author) {
            const json = {
                'android-app-store-link': 'https://play.google.com/store/apps/details?id=com.snowcorp.stickerly.android',
                "sticker-pack-id": 'Kaori - Bot',
                "sticker-pack-name": metadata.packname || 'annonymous',
                "sticker-pack-publisher": metadata.author || 'annonymous',
                "emojis": metadata.categories || ["👻"]
            };
            const exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
            const jsonBuff = Buffer.from(JSON.stringify(json), "utf-8");
            const exif = Buffer.concat([exifAttr, jsonBuff]);
            exif.writeUIntLE(jsonBuff.length, 14, 4);
            const img = new webp.Image();
            await img.load(input);
            fs.unlinkSync(input);
            img.exif = exif;
    
            await img.save(output)
            const finalStickerBuffer = fs.readFileSync(output)
            fs.unlinkSync(output);
            return finalStickerBuffer
        }
        fs.unlinkSync(input)
        fs.unlinkSync(output)
        return webpBuffer
    }
}
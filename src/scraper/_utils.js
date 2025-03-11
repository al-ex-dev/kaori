export default new class Utils {
    constructor() {
        this.resolutions = { 
            144: [256, 144], 240: [426, 240], 360: [640, 360], 480: [854, 480], 
            720: [1280, 720], 1080: [1920, 1080], 1440: [2560, 1440], 2160: [3840, 2160] 
        };
    }

    getResolution({ width, height }) {
        return Number(Object.entries(this.resolutions).reduce((best, [q, [w, h]]) => {
            const diff = Math.hypot(w - width, h - height)
            return diff < best.diff ? { q, diff } : best;
        }, { q: null, diff: Infinity }).q);
    }
}

import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.join('/tmp', 'gemini-cache');
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours (increased from 12 to reduce API usage)

export async function getCachedAIResponse<T>(key: string): Promise<T | null> {
    try {
        const filePath = path.join(CACHE_DIR, `${key}.json`);
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            const now = new Date().getTime();

            // Cache for 24 hours
            if (now - stats.mtimeMs < CACHE_DURATION) {
                return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            }
        }
    } catch (e) {
        console.error("Cache read failed", e);
    }
    return null;
}

export async function setCachedAIResponse(key: string, data: any) {
    try {
        if (!fs.existsSync(CACHE_DIR)) {
            fs.mkdirSync(CACHE_DIR, { recursive: true });
        }
        const filePath = path.join(CACHE_DIR, `${key}.json`);
        fs.writeFileSync(filePath, JSON.stringify(data));
    } catch (e) {
        console.error("Cache write failed", e);
    }
}

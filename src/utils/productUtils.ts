export const normalize = (s: string) => s ? s.trim().toLowerCase() : "";

export const findMatchingKey = (imageUrls: Record<string, any> | undefined, targetColor: string) => {
    if (!imageUrls) return null;
    const target = normalize(targetColor);
    const keys = Object.keys(imageUrls);

    if (imageUrls[targetColor]) return targetColor; // Exact match

    const match = keys.find(key => normalize(key) === target); // Loose match

    if (!match) {
        console.warn(`[ProductUtils] No match found for color: "${targetColor}" (normalized: "${target}"). Available keys:`, keys);
    }

    return match;
};

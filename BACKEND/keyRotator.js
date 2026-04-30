
export const createKeyRotator = (envKeyString) => {

    const keys = envKeyString ? envKeyString.split(',').map(k => k.trim()) : [];
    let currentIndex = 0;

    return {
        getNextKey: () => {
            if (keys.length === 0) throw new Error("No API keys configured.");
            const key = keys[currentIndex];
            currentIndex = (currentIndex + 1) % keys.length;
            return key;
        },
        getKeyCount: () => keys.length
    };
};
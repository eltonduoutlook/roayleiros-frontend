import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "event-scheduler:admin-favorites";

function sanitizeFavoriteKeys(value: unknown): string[] {
    if (!Array.isArray(value)) return [];

    const onlyStrings = value.filter(
        (item): item is string => typeof item === "string" && item.trim().length > 0
    );

    return Array.from(new Set(onlyStrings));
}

function arraysAreEqual(a: string[], b: string[]) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => item === b[index]);
}

export function useAdminFavorites(validKeys: string[] = []) {
    const validKeysSignature = useMemo(
        () => validKeys.slice().sort().join("|"),
        [validKeys]
    );

    const [favoriteKeys, setFavoriteKeys] = useState<string[]>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);

        if (!stored) return [];

        try {
            const parsed = JSON.parse(stored);
            const sanitized = sanitizeFavoriteKeys(parsed);

            if (validKeys.length === 0) return sanitized;

            const validKeySet = new Set(validKeys);
            return sanitized.filter((key) => validKeySet.has(key));
        } catch {
            localStorage.removeItem(STORAGE_KEY);
            return [];
        }
    });

    useEffect(() => {
        const validKeySet = new Set(validKeys);

        setFavoriteKeys((current) => {
            if (validKeys.length === 0) return current;

            const filtered = current.filter((key) => validKeySet.has(key));

            return arraysAreEqual(current, filtered) ? current : filtered;
        });
    }, [validKeysSignature, validKeys]);

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteKeys));
    }, [favoriteKeys]);

    const isFavorite = (key: string) => favoriteKeys.includes(key);

    const toggleFavorite = (key: string) => {
        if (validKeys.length > 0 && !validKeys.includes(key)) {
            return;
        }

        setFavoriteKeys((current) => {
            if (current.includes(key)) {
                return current.filter((item) => item !== key);
            }

            return [key, ...current];
        });
    };

    const removeFavorite = (key: string) => {
        setFavoriteKeys((current) => current.filter((item) => item !== key));
    };

    const clearFavorites = () => {
        setFavoriteKeys([]);
    };

    return {
        favoriteKeys,
        isFavorite,
        toggleFavorite,
        removeFavorite,
        clearFavorites,
    };
}
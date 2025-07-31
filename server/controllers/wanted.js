const axios = require('axios');

// FBI API Configuration
const FBI_API_BASE = 'https://api.fbi.gov';
const CACHE_EXPIRATION = 3600; // 1 hour in seconds

// Helper to safely parse integers with defaults
const parsePositiveInt = (val, defaultVal) => {
    const n = parseInt(val, 10);
    if (isNaN(n) || n <= 0) return defaultVal;
    return n;
};

/**
 * Map a single FBI wanted-person item to the normalized shape.
 * Leaves nulls where data is missing.
 */
const mapWantedPerson = (raw) => {
    return {
        pathId: raw.pathId || null,
        uid: raw.uid || null,
        title: raw.title || null,
        description: raw.description || null,
        images: Array.isArray(raw.images)
            ? raw.images.map((img) => ({
                caption: img.caption !== undefined ? img.caption : null,
                original: img.original || null,
                large: img.large || null,
                thumb: img.thumb || null,
            }))
            : [],
        files: Array.isArray(raw.files)
            ? raw.files.map((f) => ({
                url: f.url || null,
                name: f.name || null,
            }))
            : [],
        warning_message: raw.warning_message || null,
        remarks: raw.remarks || null,
        details: raw.details || null,
        additional_information: raw.additional_information || null,
        caution: raw.caution || null,
        reward_text: raw.reward_text || null,
        reward_min: raw.reward_min != null ? raw.reward_min : 0,
        reward_max: raw.reward_max != null ? raw.reward_max : 0,
        dates_of_birth_used: raw.dates_of_birth_used || null,
        place_of_birth: raw.place_of_birth || null,
        locations: raw.locations || null,
        field_offices: raw.field_offices || [],
        legat_names: raw.legat_names || null,
        status: raw.status || null,
        person_classification: raw.person_classification || null,
        poster_classification: raw.poster_classification || null,
        ncic: raw.ncic || null,
        age_min: raw.age_min || null,
        age_max: raw.age_max || null,
        weight_min: raw.weight_min || null,
        weight_max: raw.weight_max || null,
        height_min: raw.height_min || null,
        height_max: raw.height_max || null,
        eyes: raw.eyes || null,
        hair: raw.hair || null,
        build: raw.build || null,
        sex: raw.sex || null,
        race: raw.race || null,
        nationality: raw.nationality || null,
        scars_and_marks: raw.scars_and_marks || null,
        complexion: raw.complexion || null,
        occupations: raw.occupations || null,
        possible_countries: raw.possible_countries || null,
        possible_states: raw.possible_states || null,
        modified: raw.modified || null,
        publication: raw.publication || null,
        path: raw.path || null,
    };
};

/**
 * Map the full wanted list response into normalized shape.
 * Preserves total/page but maps each item.
 */
const mapWantedList = (raw) => {
    return {
        total: raw.total != null ? raw.total : 0,
        page: raw.page != null ? raw.page : 1,
        items: Array.isArray(raw.items)
            ? raw.items.map(mapWantedPerson)
            : [],
    };
};

// Get Wanted List with Caching and Pagination
const getWantedList = async (req, res) => {
    try {
        const { redisClient } = req.app.locals;
        const page = parsePositiveInt(req.query.page, 1);
        const pageSize = parsePositiveInt(req.query.pageSize, 10);
        const cacheKey = `wanted:page:${page}:size:${pageSize}`;

        // Try cache
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            return res.json(JSON.parse(cached));
        }

        // Fetch from FBI API
        const params = { page, pageSize };
        const response = await axios.get(`${FBI_API_BASE}/wanted`, {
            params,
            headers: {
                'User-Agent': 'MyFBIClient/1.0 (+your-email@domain.com)', // identify yourself responsibly
                'Accept': 'application/json'
            },
            timeout: 10000,
        });

        const mapped = mapWantedList(response.data);

        // Cache normalized payload
        await redisClient.set(cacheKey, JSON.stringify(mapped), 'EX', CACHE_EXPIRATION);

        return res.json(mapped);
    } catch (err) {
        console.error('getWantedList error:', {
            message: err.message,
            code: err.code,
            responseStatus: err.response?.status,
            responseData: err.response?.data,
            isAxios: !!err.isAxiosError,
        });
        return res.status(502).json({ error: 'Failed to fetch wanted list' });
    }
};

// Get Specific Wanted Person (by uid)
const getWantedPerson = async (req, res) => {
    try {
        const { redisClient } = req.app.locals;
        const { uid } = req.params;
        if (!uid) return res.status(400).json({ error: 'Missing uid parameter' });

        const cacheKey = `wanted:person:${uid}`;

        // Try cache
        const cached = await redisClient.get(cacheKey);
        if (cached) {
            return res.json(JSON.parse(cached));
        }

        const response = await axios.get(`${FBI_API_BASE}/@wanted-person/${uid}`, {
            headers: {
                'User-Agent': 'MyFBIClient/1.0 (+your-email@domain.com)', // identify yourself responsibly
                'Accept': 'application/json'
            },
            timeout: 10000,
        });

        const mapped = mapWantedPerson(response.data);

        await redisClient.set(cacheKey, JSON.stringify(mapped), 'EX', CACHE_EXPIRATION);

        return res.json(mapped);
    } catch (err) {
        console.error('getWantedPerson error:', err.message || err);
        if (err.response && err.response.status === 404) {
            return res.status(404).json({ error: 'Wanted person not found' });
        }
        return res.status(502).json({ error: 'Failed to fetch wanted person' });
    }
};

module.exports = { getWantedList, getWantedPerson, mapWantedList, mapWantedPerson };

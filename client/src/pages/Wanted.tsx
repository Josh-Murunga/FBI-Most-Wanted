import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

interface WantedPersonImage {
    large?: string;
    thumb?: string;
    original?: string;
    caption?: string | null;
}

interface WantedPerson {
    uid: string;
    title: string;
    description: string;
    images: WantedPersonImage[];
    field_offices?: string[];
    caution?: string | null;
    modified: string;
    reward_text?: string | null;
    reward_min?: number;
    reward_max?: number;
    hair?: string | null;
    eyes?: string | null;
    race?: string | null;
    nationality?: string | null;
}

interface WantedListResponse {
    total: number;
    page: number;
    items: WantedPerson[];
}

const PAGE_SIZE = 10;

const Wanted = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [wantedList, setWantedList] = useState<WantedPerson[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    // Search inputs (controlled)
    const [searchTitle, setSearchTitle] = useState('');
    const [searchKeywords, setSearchKeywords] = useState('');
    const [searchSubject, setSearchSubject] = useState('');
    const [activeSearchParams, setActiveSearchParams] = useState<{
        title?: string;
        keywords?: string;
        subject?: string;
    }>({});

    // Filters (client-side)
    const [showFilters, setShowFilters] = useState(false);
    const [filterHair, setFilterHair] = useState<string>('');
    const [filterEyes, setFilterEyes] = useState<string>('');
    const [filterRace, setFilterRace] = useState<string>('');
    const [filterNationality, setFilterNationality] = useState<string>('');

    const inFlightRef = React.useRef(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/wanted' } });
        }
    }, [isAuthenticated, navigate]);

    const buildParams = (p: number) => {
        const params: Record<string, any> = {
            page: p,
            pageSize: PAGE_SIZE,
        };
        if (activeSearchParams.title) params.title = activeSearchParams.title;
        if (activeSearchParams.keywords) params.keywords = activeSearchParams.keywords;
        if (activeSearchParams.subject) params.subject = activeSearchParams.subject;
        return params;
    };

    const fetchWanted = useCallback(
        async (p: number, reset = false) => {
            if (inFlightRef.current) return;
            setError('');
            if (!hasMore && !reset && p !== 1) return;

            setLoading(true);
            inFlightRef.current = true;

            try {
                const response = await api.get<WantedListResponse>('/api/wanted', {
                    params: buildParams(p),
                });
                const { items, total } = response.data;

                setWantedList((prev) => (reset ? items : [...prev, ...items]));
                setTotalItems(total);
                setHasMore(p * PAGE_SIZE < total);
            } catch (err: any) {
                setError(err.response?.data?.error || 'Failed to fetch wanted list');
            } finally {
                setLoading(false);
                inFlightRef.current = false;
            }
        },
        [activeSearchParams, hasMore]
    );

    // Initial load or when search submitted
    useEffect(() => {
        if (!isAuthenticated) return;
        fetchWanted(1, true);
        setPage(1);
    }, [isAuthenticated, fetchWanted]);

    const loadMore = () => {
        if (hasMore && !loading) {
            const next = page + 1;
            setPage(next);
            fetchWanted(next);
        }
    };

    const handleSearch = () => {
        setActiveSearchParams({
            title: searchTitle.trim() || undefined,
            keywords: searchKeywords.trim() || undefined,
            subject: searchSubject.trim() || undefined,
        });
        // reset page & list; effect watching activeSearchParams will trigger fetch via dependency
    };

    const handlePersonClick = (uid: string) => {
        navigate(`/wanted/${uid}`);
    };

    const getBestImage = (images: WantedPerson['images']) => {
        return images?.[0]?.large || images?.[0]?.original || images?.[0]?.thumb || '';
    };

    // Apply client-side filters
    const filteredList = useMemo(() => {
        return wantedList.filter((p) => {
            if (filterHair && p.hair && filterHair.toLowerCase() !== p.hair.toLowerCase()) return false;
            if (filterEyes && p.eyes && filterEyes.toLowerCase() !== p.eyes.toLowerCase()) return false;
            if (filterRace && p.race && filterRace.toLowerCase() !== p.race.toLowerCase()) return false;
            if (
                filterNationality &&
                p.nationality &&
                filterNationality.toLowerCase() !== p.nationality.toLowerCase()
            )
                return false;
            return true;
        });
    }, [wantedList, filterHair, filterEyes, filterRace, filterNationality]);

    // Derive filter options from current dataset
    const hairOptions = useMemo(() => Array.from(new Set(wantedList.map((p) => p.hair).filter(Boolean) as string[])), [wantedList]);
    const eyesOptions = useMemo(() => Array.from(new Set(wantedList.map((p) => p.eyes).filter(Boolean) as string[])), [wantedList]);
    const raceOptions = useMemo(() => Array.from(new Set(wantedList.map((p) => p.race).filter(Boolean) as string[])), [wantedList]);
    const nationalityOptions = useMemo(
        () => Array.from(new Set(wantedList.map((p) => p.nationality).filter(Boolean) as string[])),
        [wantedList]
    );

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">FBI Most Wanted</h1>

            {/* Search bar + actions */}
            <div className="flex flex-col lg:flex-row gap-4 mb-4">
                <div className="flex flex-wrap gap-4 flex-grow">
                    <div className="flex-1 min-w-[180px]">
                        <label className="block text-xs font-medium text-gray-600">Name / Title</label>
                        <input
                            type="text"
                            value={searchTitle}
                            onChange={(e) => setSearchTitle(e.target.value)}
                            placeholder="e.g., Matthews"
                            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex-1 min-w-[180px]">
                        <label className="block text-xs font-medium text-gray-600">Keywords</label>
                        <input
                            type="text"
                            value={searchKeywords}
                            onChange={(e) => setSearchKeywords(e.target.value)}
                            placeholder="e.g., theft, drug"
                            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex-1 min-w-[180px]">
                        <label className="block text-xs font-medium text-gray-600">Subject</label>
                        <input
                            type="text"
                            value={searchSubject}
                            onChange={(e) => setSearchSubject(e.target.value)}
                            placeholder="e.g., gang"
                            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>
                <div className="flex items-end gap-3">
                    <button
                        onClick={handleSearch}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
                    >
                        Search
                    </button>
                    <button
                        onClick={() => setShowFilters((v) => !v)}
                        className="px-4 py-2 border rounded-md text-sm"
                    >
                        {showFilters ? 'Hide Filters' : 'Filters'}
                    </button>
                </div>
            </div>

            {/* Filters panel */}
            {showFilters && (
                <div className="bg-white border rounded mb-6 p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex flex-col">
                        <label className="text-xs font-medium text-gray-600">Hair</label>
                        <select
                            value={filterHair}
                            onChange={(e) => setFilterHair(e.target.value)}
                            className="border rounded px-2 py-1 text-sm"
                        >
                            <option value="">All</option>
                            {hairOptions.map((h) => (
                                <option key={h} value={h}>
                                    {h}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs font-medium text-gray-600">Eyes</label>
                        <select
                            value={filterEyes}
                            onChange={(e) => setFilterEyes(e.target.value)}
                            className="border rounded px-2 py-1 text-sm"
                        >
                            <option value="">All</option>
                            {eyesOptions.map((e) => (
                                <option key={e} value={e}>
                                    {e}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs font-medium text-gray-600">Race</label>
                        <select
                            value={filterRace}
                            onChange={(e) => setFilterRace(e.target.value)}
                            className="border rounded px-2 py-1 text-sm"
                        >
                            <option value="">All</option>
                            {raceOptions.map((r) => (
                                <option key={r} value={r}>
                                    {r}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs font-medium text-gray-600">Nationality</label>
                        <select
                            value={filterNationality}
                            onChange={(e) => setFilterNationality(e.target.value)}
                            className="border rounded px-2 py-1 text-sm"
                        >
                            <option value="">All</option>
                            {nationalityOptions.map((n) => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setFilterHair('');
                                setFilterEyes('');
                                setFilterRace('');
                                setFilterNationality('');
                            }}
                            className="text-sm px-3 py-1 bg-gray-100 rounded hover:bg-gray-200"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div className="rounded-md bg-red-50 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">{error}</h3>
                        </div>
                    </div>
                </div>
            )}

            {/* Results grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredList.map((person) => (
                    <div
                        key={person.uid}
                        onClick={() => handlePersonClick(person.uid)}
                        className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105 hover:shadow-lg flex flex-col"
                    >
                        <div className="h-48 overflow-hidden flex-shrink-0">
                            {getBestImage(person.images) ? (
                                <img
                                    src={getBestImage(person.images)}
                                    alt={person.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src =
                                            'https://via.placeholder.com/300x200?text=No+Image';
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-500">No image available</span>
                                </div>
                            )}
                        </div>
                        <div className="p-4 flex-grow flex flex-col">
                            <h2 className="text-xl font-semibold text-gray-900 mb-1">{person.title}</h2>
                            <p className="text-gray-600 text-sm flex-grow mb-3 line-clamp-3">{person.description}</p>
                            <div className="flex flex-col gap-1">
                                {person.reward_text && (
                                    <div className="flex items-center text-sm text-yellow-600">
                                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                                            />
                                        </svg>
                                        {person.reward_text}
                                    </div>
                                )}
                                {(person.hair || person.eyes || person.race || person.nationality) && (
                                    <div className="text-xs text-gray-500 mt-1">
                                        {person.hair && <span className="mr-2">Hair: {person.hair}</span>}
                                        {person.eyes && <span className="mr-2">Eyes: {person.eyes}</span>}
                                        {person.race && <span className="mr-2">Race: {person.race}</span>}
                                        {person.nationality && <span>Nationality: {person.nationality}</span>}
                                    </div>
                                )}
                            </div>
                            <div className="mt-3 text-xs text-gray-400">
                                Last updated: {new Date(person.modified).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Load more */}
            <div className="flex justify-center mt-8 space-x-4">
                {hasMore ? (
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className={`px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition ${loading ? 'opacity-75 cursor-not-allowed' : ''
                            }`}
                    >
                        {loading ? 'Loading...' : 'Load More'}
                    </button>
                ) : (
                    <div className="text-gray-500 pt-2">
                        Showing {wantedList.length} of {totalItems} results
                    </div>
                )}
            </div>

            {!loading && wantedList.length === 0 && !error && (
                <div className="text-center text-gray-500 mt-8">No wanted persons found</div>
            )}
        </div>
    );
};

export default Wanted;

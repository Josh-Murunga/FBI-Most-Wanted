import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
    details?: string | null;
    additional_information?: string | null;
    place_of_birth?: string | null;
    person_classification?: string | null;
    status?: string | null;
    publication?: string | null;
    // add other fields if needed
    files?: Array<{ url?: string; name?: string }>;
}

const getBestImage = (images: WantedPersonImage[]) => {
    return images?.[0]?.large || images?.[0]?.original || images?.[0]?.thumb || '';
};

const WantedDetails = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const { uid } = useParams<{ uid: string }>();
    const [person, setPerson] = useState<WantedPerson | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/wanted/${uid}` } });
            return;
        }
        if (!uid) {
            setError('Missing identifier');
            setLoading(false);
            return;
        }

        const fetchPerson = async () => {
            try {
                setLoading(true);
                const resp = await api.get<WantedPerson>(`/api/wanted/${uid}`);
                setPerson(resp.data);
            } catch (err: any) {
                setError(err.response?.data?.error || 'Failed to fetch wanted person');
            } finally {
                setLoading(false);
            }
        };

        fetchPerson();
    }, [isAuthenticated, navigate, uid]);

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="rounded-md bg-red-50 p-4 mb-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
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
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 inline-block px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                    Go Back
                </button>
            </div>
        );
    }

    if (!person) {
        return null;
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-10">
            <button
                onClick={() => navigate(-1)}
                className="mb-6 inline-flex items-center text-sm font-medium text-indigo-600 hover:underline"
            >
                &larr; Back
            </button>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="md:flex">
                    <div className="md:w-1/2 h-80 bg-gray-100 flex items-center justify-center overflow-hidden">
                        {getBestImage(person.images) ? (
                            <img
                                src={getBestImage(person.images)}
                                alt={person.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                        'https://via.placeholder.com/500x400?text=No+Image';
                                }}
                            />
                        ) : (
                            <div className="text-gray-500">No Image Available</div>
                        )}
                    </div>
                    <div className="md:w-1/2 p-6 flex flex-col">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{person.title}</h1>
                        <div className="text-sm text-gray-500 mb-1">
                            Status: <span className="font-medium">{person.status || 'N/A'}</span>
                        </div>
                        <div className="text-sm text-gray-500 mb-1">
                            Classification:{' '}
                            <span className="font-medium">{person.person_classification || 'N/A'}</span>
                        </div>
                        <div className="text-sm text-gray-500 mb-4">
                            Published:{' '}
                            <span className="font-medium">
                                {person.publication
                                    ? new Date(person.publication).toLocaleDateString()
                                    : 'N/A'}
                            </span>
                        </div>

                        <p className="text-gray-700 mb-4">{person.description}</p>

                        {person.reward_text && (
                            <div className="mb-3">
                                <div className="text-sm font-semibold text-yellow-700">Reward</div>
                                <div className="flex items-center gap-2">
                                    <div className="text-lg">{person.reward_text}</div>
                                    {person.reward_min != null || person.reward_max != null ? (
                                        <div className="text-sm text-gray-500">
                                            ({person.reward_min || 0} - {person.reward_max || 0})
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        )}

                        {person.field_offices && person.field_offices.length > 0 && (
                            <div className="mb-3">
                                <div className="text-sm font-semibold text-gray-700">Field Offices</div>
                                <div className="text-sm">{person.field_offices.join(', ')}</div>
                            </div>
                        )}

                        {person.place_of_birth && (
                            <div className="mb-3">
                                <div className="text-sm font-semibold text-gray-700">Place of Birth</div>
                                <div className="text-sm">{person.place_of_birth}</div>
                            </div>
                        )}

                        <div className="mt-auto text-xs text-gray-400">
                            Last updated: {person.modified ? new Date(person.modified).toLocaleDateString() : 'N/A'}
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t">
                    {person.caution && (
                        <div className="mb-6">
                            <h2 className="text-lg font-bold mb-2">Caution</h2>
                            <div
                                className="prose prose-sm max-w-none text-gray-800"
                                dangerouslySetInnerHTML={{
                                    __html: person.caution,
                                }}
                            />
                        </div>
                    )}

                    {person.details && (
                        <div className="mb-6">
                            <h2 className="text-lg font-bold mb-2">Details</h2>
                            <p className="text-gray-700">{person.details}</p>
                        </div>
                    )}

                    {person.additional_information && (
                        <div className="mb-6">
                            <h2 className="text-lg font-bold mb-2">Additional Information</h2>
                            <p className="text-gray-700">{person.additional_information}</p>
                        </div>
                    )}

                    {person.files && person.files.length > 0 && (
                        <div className="mb-6">
                            <h2 className="text-lg font-bold mb-2">Files</h2>
                            <div className="flex flex-wrap gap-3">
                                {person.files.map((f, idx) => (
                                    <a
                                        key={idx}
                                        href={f.url || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 bg-indigo-50 border border-indigo-200 rounded flex items-center text-sm hover:bg-indigo-100 transition"
                                    >
                                        <svg
                                            className="w-4 h-4 mr-2 text-indigo-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 4v16m8-8H4"
                                            />
                                        </svg>
                                        {f.name || 'Download'}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default WantedDetails;

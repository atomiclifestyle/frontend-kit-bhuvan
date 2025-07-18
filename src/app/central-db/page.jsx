'use client';

import { useState } from 'react';
import '@/app/globals.css';
import SpaceBackground from '@/components/SpaceBackground';
import { useSession } from 'next-auth/react';


function BhuvanDataExplorer() {
    const [query, setQuery] = useState(
        'SELECT product_name, theme_name, ST_AsText(geom) AS wkt_geometry FROM bhuvan_land_cover LIMIT 10;'
    );
    const [queryResult, setQueryResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const { data: session, status: sessionStatus } = useSession();
    const userId = session?.user_id;


    const handleExecuteQuery = async () => {
        if (!userId) {
            setError('User session not found. Please log in.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setQueryResult(null); // Clear previous results

        try {
            const NEXT_PUBLIC_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

            const response = await fetch(
                `${NEXT_PUBLIC_API_BASE_URL}/api/bhuvan/execute-central-query`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-user-id': userId,
                    },
                    body: JSON.stringify({ query: query }),
                }
            );

            if (!response.ok) {
                // If the response is not successful, parse the error and throw it.
                const errorData = await response.json().catch(() => ({ message: 'An unknown error occurred' }));
                throw new Error(errorData.message || `Request failed with status ${response.status}`);
            }

            const data = await response.json();
            setQueryResult(data);
        } catch (err) {
            // Catch any errors from the fetch operation or thrown from the response check.
            setError(err.message);
        } finally {
            // Ensure loading state is turned off regardless of success or failure.
            setIsLoading(false);
        }
    };

    const isButtonDisabled = isLoading || sessionStatus === 'loading';

    return (
        <div className="relative min-h-screen bg-gray-900 text-gray-100 p-6 md:p-8 font-sans">
            <SpaceBackground />
            <div className="relative z-10 max-w-5xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold text-center text-blue-400 mb-8 tracking-tight">
                    Bhuvan Data Explorer
                </h1>
                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-gray-700">
                    <div className="space-y-4">
                        <label htmlFor="query-input" className="block text-sm font-medium text-gray-300">
                            SQL Query
                        </label>
                        <textarea
                            id="query-input"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Enter your SQL query here"
                            className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200 h-32 font-mono text-sm"
                            rows={4}
                        />
                        <button
                            onClick={handleExecuteQuery}
                            disabled={isButtonDisabled}
                            className="w-full bg-blue-600 text-white font-medium py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Executing...
                                </>
                            ) : (
                                'Execute Query'
                            )}
                        </button>
                    </div>
                </div>

                <div className="mt-8">
                    <h2 className="text-xl md:text-2xl font-semibold text-gray-200 mb-3">Query Results</h2>
                    <div className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg overflow-auto max-h-96 text-sm font-mono shadow-inner border border-gray-700 min-h-[100px]">
                        {isLoading && <p className="text-gray-400">Loading results...</p>}
                        {error && <pre className="text-red-400 whitespace-pre-wrap">Error: {error}</pre>}
                        {queryResult && (
                            <pre className="text-gray-200">{JSON.stringify(queryResult, null, 2)}</pre>
                        )}
                        {!isLoading && !error && !queryResult && (
                            <p className="text-gray-500">No data to display. Execute a query to see results.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BhuvanDataExplorer;

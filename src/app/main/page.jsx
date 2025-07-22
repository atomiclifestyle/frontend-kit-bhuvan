'use client';

import GetUserIdButton from "@/components/GetUserId";

const ApiIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
);
const DatabaseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7a8 8 0 0116 0" />
    </svg>
);
const UserDbIcon = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);
const NpmIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="currentColor" viewBox="0 0 16 16">
        <path d="M5.555 3.332h4.89v1.11H6.666v1.11h3.778v1.11H6.666v1.11h3.778v1.11H5.555V3.332zM2.222 2.222h11.556v11.556H2.222V2.222zM0 0v16h16V0H0z"/>
    </svg>
);

const MainPage = () => {

    const handleDownload = async () => {
       try {
            const res = await fetch("/api/download-package");

            if (!res.ok) {
                const errorData = await res.json();
                alert("Error: " + errorData.error);
                return;
            }

            const blob = await res.blob();

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "bhuvan-api.tgz";
            document.body.appendChild(a);
            a.click();

            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Download failed", err);
            alert("Something went wrong!");
        }
    }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#000010] text-gray-100 p-6 md:p-8">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-300">
                Bhuvan Development Environment
            </h1>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
                Your central hub for accessing Bhuvan's geospatial tools, powerful APIs, and extensive datasets.
            </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
            <a href="/demo" className="group bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center hover:bg-gray-800 hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-blue-500/20">
                <div className="flex justify-center mb-3 text-blue-400 group-hover:text-blue-300 transition-colors">
                    <ApiIcon />
                </div>
                <h3 className="text-xl font-bold text-gray-100 mb-2">Bhuvan API Demo</h3>
                <p className="text-gray-400 text-sm">Test live API endpoints for routing, geocoding, and more.</p>
            </a>

            <a href="/central-db" className="group bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center hover:bg-gray-800 hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-blue-500/20">
                 <div className="flex justify-center mb-3 text-blue-400 group-hover:text-blue-300 transition-colors">
                    <DatabaseIcon />
                </div>
                <h3 className="text-xl font-bold text-gray-100 mb-2">Access Sample Data</h3>
                <p className="text-gray-400 text-sm">Explore and query the central database of sample datasets.</p>
            </a>

            <a href="/personal-db" className="group bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center hover:bg-gray-800 hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-blue-500/20">
                <div className="flex justify-center mb-3 text-blue-400 group-hover:text-blue-300 transition-colors">
                    <UserDbIcon />
                </div>
                <h3 className="text-xl font-bold text-gray-100 mb-2">Personal Database</h3>
                <p className="text-gray-400 text-sm">Manage your own private datasets and saved queries.</p>
            </a>

            <a
                href="https://www.npmjs.com/package/bhuvan-dev-env-client?activeTab=readme"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gray-800/50 border border-gray-700 rounded-xl p-6 text-center hover:bg-gray-800 hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1 shadow-lg hover:shadow-blue-500/20"
            >
                <div className="flex justify-center mb-3 text-blue-400 group-hover:text-blue-300 transition-colors">
                    <NpmIcon />
                </div>
                <h3 className="text-xl font-bold text-gray-100 mb-2">Bhuvan NPM Package</h3>
                <p className="text-gray-400 text-sm">Integrate Bhuvan services directly into your projects.</p>
            </a>

            {/* If GetUserIdButton is a separate component, place it here.
                I've styled it as a card for consistency. */}
            <GetUserIdButton />

        </div>
    </div>
  );
} 
export default MainPage;

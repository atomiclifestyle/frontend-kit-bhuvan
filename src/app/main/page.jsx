'use client';

import GetUserIdButton from "@/components/GetUserId";

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
        <>
            <div className="flex flex-col items-center justify-center h-screen px-4 text-center">
                <h1 className="text-4xl font-bold mb-10">
                    Welcome To Bhuvan Development Environment
                </h1>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-xl">
                    <a
                    href="/demo"
                    className="w-full py-3 rounded-xl font-semibold bg-blue-500 text-white hover:bg-blue-600 transition transform hover:scale-105 shadow-md"
                    >
                    Bhuvan API Demo
                    </a>

                    <a
                    href="/central-db"
                    className="w-full py-3 rounded-xl font-semibold bg-blue-500 text-white hover:bg-blue-600 transition transform hover:scale-105 shadow-md"
                    >
                    Access Sample Data
                    </a>

                    <a
                    href="/personal-db"
                    className="w-full py-3 rounded-xl font-semibold bg-blue-500 text-white hover:bg-blue-600 transition transform hover:scale-105 shadow-md"
                    >
                    My Personal Database
                    </a>

{/*                     <button
                    onClick={handleDownload}
                    className="w-full py-3 rounded-xl font-semibold bg-blue-500 text-white hover:bg-blue-600 transition transform hover:scale-105 shadow-md"
                    >
                    Download Package
                    </button>

                    <a
                    href="https://github.com/atomiclifestyle/bhuvan-projects-base"
                    className="w-full py-3 rounded-xl font-semibold bg-blue-500 text-white hover:bg-blue-600 transition transform hover:scale-105 shadow-md"
                    >
                    Contribute
                    </a> */}
                    <a
                    href="https://www.npmjs.com/package/bhuvan-dev-env-client?activeTab=readme"
                    className="w-full py-3 rounded-xl font-semibold bg-blue-500 text-white hover:bg-blue-600 transition transform hover:scale-105 shadow-md"
                    >
                    Bhuvan npm package
                    </a>

                    <GetUserIdButton />
                </div>
            </div>
        </>
    );
} 
export default MainPage;

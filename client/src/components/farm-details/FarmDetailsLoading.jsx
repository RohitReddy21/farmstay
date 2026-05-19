const FarmDetailsLoading = () => {
    return (
        <div className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <div className="h-[300px] animate-pulse rounded-2xl bg-[#ead7b8] sm:h-[400px] md:h-[500px]" />
                    <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                        {Array.from({ length: 8 }).map((_, index) => (
                            <div key={index} className="h-20 animate-pulse rounded-lg bg-[#f1e3cc]" />
                        ))}
                    </div>
                </div>
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-xl">
                    <div className="mb-5 h-8 w-3/4 animate-pulse rounded bg-[#ead7b8]" />
                    <div className="mb-5 h-8 w-32 animate-pulse rounded bg-[#ead7b8]" />
                    <div className="mb-5 h-24 animate-pulse rounded-2xl bg-[#f1e3cc]" />
                    <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <div key={index} className="h-12 animate-pulse rounded-xl bg-[#f1e3cc]" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FarmDetailsLoading;

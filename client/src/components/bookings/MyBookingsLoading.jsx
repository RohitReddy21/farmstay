const MyBookingsLoading = () => (
    <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 space-y-3">
            <div className="h-4 w-40 animate-pulse rounded bg-[#ead7b8]" />
            <div className="h-9 w-56 animate-pulse rounded bg-[#ead7b8]" />
            <div className="h-5 w-full max-w-md animate-pulse rounded bg-[#f1e3cc]" />
        </div>
        <div className="space-y-4 md:hidden">
            {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-2xl border border-[#ead7b8] bg-[#fffaf1] p-4 shadow-md">
                    <div className="mb-4 h-6 w-2/3 animate-pulse rounded bg-[#ead7b8]" />
                    <div className="mb-3 grid grid-cols-2 gap-3">
                        <div className="h-20 animate-pulse rounded-xl bg-[#f1e3cc]" />
                        <div className="h-20 animate-pulse rounded-xl bg-[#f1e3cc]" />
                    </div>
                    <div className="space-y-2">
                        <div className="h-4 animate-pulse rounded bg-[#f1e3cc]" />
                        <div className="h-4 w-4/5 animate-pulse rounded bg-[#f1e3cc]" />
                    </div>
                </div>
            ))}
        </div>
        <div className="hidden rounded-3xl border border-[#ead7b8] bg-[#fffaf1] p-5 shadow-xl md:block">
            <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="grid grid-cols-6 gap-4">
                        {Array.from({ length: 6 }).map((__, cell) => (
                            <div key={cell} className="h-10 animate-pulse rounded bg-[#f1e3cc]" />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export default MyBookingsLoading;

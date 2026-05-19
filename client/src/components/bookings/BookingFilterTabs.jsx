const BookingFilterTabs = ({ filter, setFilter }) => (
    <div className="mb-6 flex gap-2 overflow-x-auto border-b border-[#ead7b8]">
        {['all', 'upcoming', 'past'].map((tab) => (
            <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`whitespace-nowrap px-4 pb-3 text-sm font-bold transition ${
                    filter === tab
                        ? 'border-b-2 border-primary text-primary'
                        : 'text-[#645747] hover:text-[#211b14]'
                }`}
            >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
        ))}
    </div>
);

export default BookingFilterTabs;

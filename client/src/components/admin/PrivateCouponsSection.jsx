import { Loader, Plus, Tag } from 'lucide-react';

const PrivateCouponsSection = ({
    coupons,
    couponForm,
    couponError,
    couponSaving,
    onCouponFormChange,
    onCreateCoupon,
    onToggleCoupon,
    onDeleteCoupon,
    formatDate,
    formatCouponDiscount
}) => (
    <section className="order-4 mb-8 rounded-xl border border-[#ead7b8] bg-white p-4 shadow-md sm:p-6">
        <div className="mb-5 flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
            <div>
                <div className="flex items-center gap-2 text-[#7a5527]">
                    <Tag size={22} />
                    <h2 className="text-xl font-bold text-gray-800">Private Coupons</h2>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                    Coupon codes are visible only here. Share a code directly with a customer, and they can apply it during checkout.
                </p>
            </div>
            <span className="w-fit rounded-full border border-[#ead7b8] bg-[#fffaf1] px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-[#7a5527]">
                Admin only
            </span>
        </div>

        <form onSubmit={onCreateCoupon} className="rounded-xl border border-[#ead7b8] bg-[#fffaf1] p-4">
            {couponError && (
                <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                    {couponError}
                </div>
            )}

            <div className="grid gap-3 md:grid-cols-4">
                <label className="text-sm font-bold text-[#211b14]">
                    Code
                    <input
                        type="text"
                        value={couponForm.code}
                        onChange={(event) => onCouponFormChange('code', event.target.value.toUpperCase())}
                        placeholder="FARM10"
                        className="mt-1 w-full rounded-lg border border-[#ead7b8] bg-white px-3 py-2 text-base uppercase outline-none focus:border-primary"
                    />
                </label>
                <label className="text-sm font-bold text-[#211b14]">
                    Discount Type
                    <select
                        value={couponForm.discountType}
                        onChange={(event) => onCouponFormChange('discountType', event.target.value)}
                        className="mt-1 w-full rounded-lg border border-[#ead7b8] bg-white px-3 py-2 text-base outline-none focus:border-primary"
                    >
                        <option value="Percentage">Percentage</option>
                        <option value="Fixed">Fixed amount</option>
                    </select>
                </label>
                <label className="text-sm font-bold text-[#211b14]">
                    Discount Value
                    <input
                        type="number"
                        min="1"
                        value={couponForm.discountValue}
                        onChange={(event) => onCouponFormChange('discountValue', event.target.value)}
                        placeholder={couponForm.discountType === 'Percentage' ? '10' : '500'}
                        className="mt-1 w-full rounded-lg border border-[#ead7b8] bg-white px-3 py-2 text-base outline-none focus:border-primary"
                    />
                </label>
                <label className="text-sm font-bold text-[#211b14]">
                    Max Discount
                    <input
                        type="number"
                        min="0"
                        value={couponForm.maxDiscount}
                        onChange={(event) => onCouponFormChange('maxDiscount', event.target.value)}
                        placeholder="Optional"
                        className="mt-1 w-full rounded-lg border border-[#ead7b8] bg-white px-3 py-2 text-base outline-none focus:border-primary"
                    />
                </label>
                <label className="text-sm font-bold text-[#211b14]">
                    Usage Limit
                    <input
                        type="number"
                        min="0"
                        value={couponForm.usageLimit}
                        onChange={(event) => onCouponFormChange('usageLimit', event.target.value)}
                        placeholder="Optional"
                        className="mt-1 w-full rounded-lg border border-[#ead7b8] bg-white px-3 py-2 text-base outline-none focus:border-primary"
                    />
                </label>
                <label className="text-sm font-bold text-[#211b14]">
                    Start Date
                    <input
                        type="date"
                        value={couponForm.startDate}
                        onChange={(event) => onCouponFormChange('startDate', event.target.value)}
                        className="mt-1 w-full rounded-lg border border-[#ead7b8] bg-white px-3 py-2 text-base outline-none focus:border-primary"
                    />
                </label>
                <label className="text-sm font-bold text-[#211b14]">
                    End Date
                    <input
                        type="date"
                        min={couponForm.startDate}
                        value={couponForm.endDate}
                        onChange={(event) => onCouponFormChange('endDate', event.target.value)}
                        className="mt-1 w-full rounded-lg border border-[#ead7b8] bg-white px-3 py-2 text-base outline-none focus:border-primary"
                    />
                </label>
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <label className="inline-flex items-center gap-2 text-sm font-bold text-[#211b14]">
                    <input
                        type="checkbox"
                        checked={couponForm.isActive}
                        onChange={(event) => onCouponFormChange('isActive', event.target.checked)}
                        className="h-4 w-4 accent-[#7a5527]"
                    />
                    Active now
                </label>
                <button
                    type="submit"
                    disabled={couponSaving}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-bold text-white transition hover:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-70"
                >
                    {couponSaving ? <Loader size={18} className="animate-spin" /> : <Plus size={18} />}
                    Create Coupon
                </button>
            </div>
        </form>

        <div className="mt-5 overflow-x-auto rounded-xl border border-[#ead7b8]">
            <table className="min-w-[880px] w-full text-left text-sm">
                <thead className="bg-[#f8efdf] text-xs uppercase tracking-wide text-[#7a5527]">
                    <tr>
                        <th className="px-4 py-3">Code</th>
                        <th className="px-4 py-3">Discount</th>
                        <th className="px-4 py-3">Validity</th>
                        <th className="px-4 py-3">Usage</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#ead7b8]">
                    {coupons.map((coupon) => (
                        <tr key={coupon._id} className="hover:bg-[#fffaf1]">
                            <td className="px-4 py-3 font-bold tracking-wide text-[#211b14]">{coupon.code}</td>
                            <td className="px-4 py-3">{formatCouponDiscount(coupon)}</td>
                            <td className="px-4 py-3">{formatDate(coupon.startDate)} to {formatDate(coupon.endDate)}</td>
                            <td className="px-4 py-3">
                                {Number(coupon.usedCount || 0).toLocaleString('en-IN')}
                                {coupon.usageLimit ? ` / ${Number(coupon.usageLimit).toLocaleString('en-IN')}` : ' / Unlimited'}
                            </td>
                            <td className="px-4 py-3">
                                <span className={`rounded-full px-2 py-1 text-xs font-bold ${coupon.isActive ? 'bg-[#eef7e9] text-[#3f6b3f]' : 'bg-gray-100 text-gray-600'}`}>
                                    {coupon.isActive ? 'Active' : 'Paused'}
                                </span>
                            </td>
                            <td className="px-4 py-3">
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={() => onToggleCoupon(coupon)}
                                        className="rounded-lg border border-[#ead7b8] bg-white px-3 py-2 text-xs font-semibold text-[#7a5527] transition hover:bg-[#f8efdf]"
                                    >
                                        {coupon.isActive ? 'Pause' : 'Activate'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onDeleteCoupon(coupon._id)}
                                        className="rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-600"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {coupons.length === 0 && (
                        <tr>
                            <td colSpan="6" className="py-8 text-center text-gray-500">
                                No private coupons created yet.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </section>
);

export default PrivateCouponsSection;

import { CheckCircle2, Loader, Tag, X } from 'lucide-react';

const CheckoutSummary = ({
    checkoutItems,
    lineItemLabel,
    taxTotal,
    couponCode,
    appliedCoupon,
    isApplyingCoupon,
    couponMessage,
    couponError,
    discountAmount,
    amountToPay,
    onCouponInput,
    onApplyCoupon,
    onRemoveCoupon
}) => (
    <div className="mb-8 rounded-2xl border border-[#ead7b8] bg-gradient-to-br from-[#fffaf1] to-[#f4ead8] p-6">
        <h3 className="mb-4 text-lg font-bold text-[#211b14]">Final Summary</h3>
        <div className="mb-4 space-y-2">
            {checkoutItems.map((item) => (
                <div key={item.cartId} className="flex items-center justify-between gap-4">
                    <span className="min-w-0 truncate text-[#645747]">{item.property?.title || lineItemLabel}</span>
                    <span className="font-semibold text-[#211b14]">Rs {item.pricing.totalPrice}</span>
                </div>
            ))}
        </div>
        <div className="mb-4 flex items-center justify-between border-b border-[#ead7b8] pb-4">
            <span className="text-[#645747]">Taxes</span>
            <span className="font-semibold text-[#211b14]">Rs {taxTotal}</span>
        </div>
        <div className="mb-4 overflow-hidden rounded-xl border border-[#ead7b8] bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-[#f1dfc6] bg-[#fff8ea] px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#f4ead8] text-[#7a5527]">
                        <Tag size={19} />
                    </span>
                    <div className="min-w-0">
                        <p className="font-black text-[#211b14]">Coupons & Offers</p>
                        <p className="text-xs font-medium text-[#7f6c56]">Have a coupon code? Apply it here.</p>
                    </div>
                </div>
                {appliedCoupon && (
                    <span className="hidden items-center gap-1 rounded-full bg-[#eef7e9] px-3 py-1 text-xs font-bold text-[#3f6b3f] sm:inline-flex">
                        <CheckCircle2 size={14} />
                        Applied
                    </span>
                )}
            </div>
            <div className="p-4">
                {appliedCoupon ? (
                    <div className="flex flex-col gap-3 rounded-xl border border-[#cfe4c8] bg-[#f6fbf3] p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#3f6b3f]">Coupon Applied</p>
                            <p className="mt-1 text-lg font-black text-[#211b14]">{appliedCoupon.code}</p>
                            <p className="text-sm font-semibold text-[#3f6b3f]">You saved Rs {discountAmount}</p>
                        </div>
                        <button
                            type="button"
                            onClick={onRemoveCoupon}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#cfe4c8] bg-white px-4 py-2 font-bold text-[#7a5527] transition hover:bg-[#eef7e9]"
                        >
                            <X size={16} />
                            Remove
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                            type="text"
                            value={couponCode}
                            onChange={(event) => onCouponInput(event.target.value)}
                            placeholder="Enter coupon code"
                            className="min-w-0 flex-1 rounded-lg border border-[#ead7b8] bg-[#fffaf1] px-3 py-2 uppercase tracking-[0.08em] outline-none transition focus:border-primary focus:bg-white"
                        />
                        <button
                            type="button"
                            onClick={onApplyCoupon}
                            disabled={isApplyingCoupon || !couponCode.trim()}
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#7a5527] px-5 py-2 font-bold text-white transition hover:bg-[#5f3f1d] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isApplyingCoupon ? <Loader size={16} className="animate-spin" /> : <Tag size={16} />}
                            Apply
                        </button>
                    </div>
                )}
                <p className="mt-2 text-xs font-medium text-[#8b7a66]">
                    Coupon codes are shared by Brown Cows for selected bookings and guests.
                </p>
                {couponMessage && !appliedCoupon && (
                    <p className="mt-2 text-sm font-semibold text-[#3f6b3f]">{couponMessage}</p>
                )}
                {couponError && (
                    <p className="mt-2 text-sm font-semibold text-red-700">{couponError}</p>
                )}
            </div>
        </div>
        {discountAmount > 0 && (
            <div className="mb-4 flex items-center justify-between border-b border-[#ead7b8] pb-4">
                <span className="text-[#3f6b3f]">Coupon Discount ({appliedCoupon.code})</span>
                <span className="font-bold text-[#3f6b3f]">- Rs {discountAmount}</span>
            </div>
        )}
        <div className="flex items-center justify-between text-xl">
            <span className="font-bold text-[#211b14]">Amount to Pay</span>
            <span className="font-bold text-primary">Rs {amountToPay}</span>
        </div>
    </div>
);

export default CheckoutSummary;

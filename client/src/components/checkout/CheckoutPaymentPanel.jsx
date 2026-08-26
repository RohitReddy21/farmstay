import { Loader, ShieldCheck } from 'lucide-react';

const CheckoutPaymentPanel = ({
    isProcessing,
    isCheckoutComplete,
    amountToPay,
    onSubmitPayment
}) => (
    <>
        <div className="mb-8">
            <h3 className="mb-2 text-xl font-bold text-[#211b14]">Payment</h3>
            <p className="mb-4 text-sm text-[#645747]">Pay securely to place this pending approval booking.</p>

            <div className="overflow-hidden rounded-xl border-2 border-[#d6a23d]/60 bg-[#fffaf1]">
                <div className="flex flex-col justify-between gap-3 border-b border-[#ead7b8] p-4 sm:flex-row sm:items-center">
                    <span className="font-medium text-[#211b14]">Razorpay Secure (UPI, Cards, Wallets)</span>
                    <div className="flex items-center gap-1.5">
                        <div className="rounded border border-[#e4d4bd] bg-white px-2 py-0.5 text-xs font-bold italic text-[#527b52]">UPI</div>
                        <div className="rounded border border-[#e4d4bd] bg-white px-2 py-0.5 text-xs font-bold italic text-[#7a5527]">VISA</div>
                        <div className="flex items-center rounded border border-[#e4d4bd] bg-white px-1.5 py-0.5">
                            <div className="z-10 -mr-1 h-2.5 w-2.5 rounded-full bg-[#8d3a24]"></div>
                            <div className="h-2.5 w-2.5 rounded-full bg-[#d6a23d]"></div>
                        </div>
                        <div className="rounded border border-[#e4d4bd] bg-white px-2 py-0.5 text-xs text-[#8b7a66]">+18</div>
                    </div>
                </div>
                <div className="flex flex-col items-center bg-[#f8efdf] p-8 text-center text-sm text-[#645747]">
                    <ShieldCheck className="mb-4 h-12 w-12 text-[#c8a978]" strokeWidth={1.5} />
                    You will be redirected to Razorpay Secure to complete your payment. Your booking is sent for host review only after payment succeeds.
                </div>
            </div>
        </div>

        <div className="space-y-4">
            <button
                type="button"
                onClick={onSubmitPayment}
                disabled={isProcessing || isCheckoutComplete}
                className={`flex w-full items-center justify-center gap-3 rounded-xl py-4 text-lg font-bold text-white shadow-lg transition-all ${isProcessing || isCheckoutComplete
                    ? 'cursor-not-allowed bg-[#b7aa98]'
                    : 'bg-primary hover:bg-primary-800 active:scale-[0.98]'
                }`}
            >
                {isCheckoutComplete ? (
                    'Booking Received'
                ) : isProcessing ? (
                    <>
                        <Loader className="animate-spin" size={24} />
                        Processing Securely...
                    </>
                ) : (
                    `Pay Rs ${amountToPay}`
                )}
            </button>

            <p className="mt-4 text-center text-xs text-[#8b7a66]">
                By continuing, you agree to the terms, conditions, and cancellation policy of Brown Cows Dairy.
                Online bookings are submitted to the host after successful payment.
            </p>
        </div>
    </>
);

export default CheckoutPaymentPanel;

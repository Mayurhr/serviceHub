import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingsAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function InvoicePage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingsAPI.getInvoice(id)
      .then(r => setInvoice(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner fullPage text="Loading invoice..." />;
  if (!invoice) return (
    <div className="text-center py-20">
      <h2 className="text-xl font-bold text-ink-900 mb-3">Invoice not available</h2>
      <p className="text-ink-500 mb-4">Invoice is generated only after service completion.</p>
      <Link to="/my-bookings" className="btn-primary">Back to Bookings</Link>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6 no-print">
        <Link to="/my-bookings" className="btn-secondary py-2 px-4 text-sm">← Back</Link>
        <button onClick={() => window.print()} className="btn-primary py-2 px-4 text-sm">🖨️ Print / Save PDF</button>
      </div>

      <div className="card-flat p-8" id="invoice-print">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-ink-100">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 bg-saffron-gradient rounded-xl flex items-center justify-center text-white font-bold text-lg">⚡</div>
              <div>
                <span className="font-extrabold text-xl text-ink-900">Serve</span>
                <span className="font-extrabold text-xl text-saffron-500">Ease</span>
                <span className="text-xs bg-saffron-100 text-saffron-600 font-bold px-1.5 py-0.5 rounded ml-1">PRO</span>
              </div>
            </div>
            <p className="text-ink-500 text-xs">Professional Service Platform</p>
          </div>
          <div className="text-right">
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 inline-block">
              <p className="text-xs text-green-600 font-bold uppercase tracking-wide">Tax Invoice</p>
              <p className="font-extrabold text-ink-900 text-sm">{invoice.invoiceId}</p>
            </div>
            <p className="text-ink-400 text-xs mt-2">
              {new Date(invoice.generatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Customer and Provider Info */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-xs font-bold text-ink-400 uppercase tracking-widest mb-2">Bill To</h3>
            <p className="font-bold text-ink-900">{invoice.customerName}</p>
            <p className="text-ink-600 text-sm">{invoice.customerEmail}</p>
            <p className="text-ink-600 text-sm">{invoice.customerPhone}</p>
            {invoice.customerAddress && (
              <p className="text-ink-500 text-sm mt-1 leading-relaxed">{invoice.customerAddress}</p>
            )}
          </div>
          <div>
            <h3 className="text-xs font-bold text-ink-400 uppercase tracking-widest mb-2">Service Provider</h3>
            <p className="font-bold text-ink-900">{invoice.providerName}</p>
            <p className="text-ink-600 text-sm">{invoice.providerPhone}</p>
          </div>
        </div>

        {/* Booking Details Table */}
        <div className="bg-ink-50 rounded-2xl p-4 mb-6">
          <h3 className="text-xs font-bold text-ink-400 uppercase tracking-widest mb-3">Booking Details</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Service', invoice.serviceName],
              ['Booking Date', invoice.bookingDate ? new Date(invoice.bookingDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '—'],
              ['Time Slot', invoice.timeSlot],
              ['Payment Method', invoice.paymentMethod?.toUpperCase()],
              ['Payment Status', invoice.paymentStatus?.toUpperCase()],
              ['Booking Status', invoice.status?.toUpperCase()],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-ink-400 text-xs">{label}</p>
                <p className="font-semibold text-ink-800 text-sm">{value || '—'}</p>
              </div>
            ))}
          </div>
          {invoice.notes && (
            <div className="mt-3 pt-3 border-t border-ink-200">
              <p className="text-ink-400 text-xs">Special Notes</p>
              <p className="text-ink-700 text-sm">{invoice.notes}</p>
            </div>
          )}
        </div>

        {/* Price Breakdown */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-ink-400 uppercase tracking-widest mb-3">Price Breakdown</h3>
          <div className="border border-ink-100 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-ink-50">
                <tr>
                  <th className="text-left p-3 font-bold text-ink-600 text-xs uppercase tracking-wide">Description</th>
                  <th className="text-right p-3 font-bold text-ink-600 text-xs uppercase tracking-wide">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.breakdown?.map((item, i) => (
                  <tr key={i} className="border-t border-ink-50">
                    <td className="p-3 text-ink-700 font-medium text-sm">{item.item}</td>
                    <td className={`p-3 text-right font-bold text-sm ${item.amount < 0 ? 'text-green-600' : 'text-ink-900'}`}>
                      {item.amount < 0
                        ? `-₹${Math.abs(item.amount).toLocaleString()}`
                        : `₹${item.amount.toLocaleString()}`}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                {invoice.discountAmount > 0 && (
                  <tr className="bg-green-50 border-t border-green-100">
                    <td className="p-3 text-green-700 font-semibold text-sm">Discount Applied</td>
                    <td className="p-3 text-right font-bold text-green-600 text-sm">-₹{invoice.discountAmount.toLocaleString()}</td>
                  </tr>
                )}
                <tr className="bg-saffron-50 border-t-2 border-saffron-200">
                  <td className="p-3 font-extrabold text-ink-900">Total Payable</td>
                  <td className="p-3 text-right font-extrabold text-saffron-500 text-xl">
                    ₹{invoice.totalAmount?.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Legal Note */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6">
          <p className="text-amber-800 text-xs leading-relaxed">
            <strong>Note:</strong> {invoice.legalNote || 'Prices are service charges only. Final cost may vary based on actual work done.'}
          </p>
        </div>

        {/* Footer */}
        <div className="text-center border-t border-ink-100 pt-6">
          <div className="text-3xl mb-2">🙏</div>
          <p className="font-bold text-ink-900 text-lg">Thank you for choosing ServeEase Pro!</p>
          <p className="text-ink-500 text-sm mt-1">We hope you had a great experience.</p>
          <Link to="/services" className="btn-primary mt-4 text-sm py-2 no-print inline-flex">Book Another Service</Link>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; }
        }
      `}</style>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import {
  Users,
  DollarSign,
  FileText,
  RefreshCw,
  Loader2,
  Building,
  Mail,
  Phone,
} from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  organizationNumber?: string;
  totalRevenue: number;
  invoiceCount: number;
}

export default function ClientsPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/luca/customers');
      const data = await res.json();

      if (data.success) {
        setCustomers(data.customers || []);
      } else {
        setError(data.error || 'Failed to fetch customers');
      }
    } catch (err) {
      setError('Failed to connect to Luca');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totalRevenue = customers.reduce((sum, c) => sum + c.totalRevenue, 0);
  const totalInvoices = customers.reduce((sum, c) => sum + c.invoiceCount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold font-display text-white mb-2">
            Clients
          </h1>
          <p className="text-dark-400">
            Customer revenue breakdown from Luca Regnskap
          </p>
        </div>
        <button
          onClick={fetchCustomers}
          disabled={loading}
          className="btn-primary flex items-center gap-2 w-fit"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <RefreshCw className="w-5 h-5" />
          )}
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 animate-slide-up">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/20 border border-blue-500/30">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Total Clients</p>
              <p className="text-2xl font-bold text-white font-display">
                {customers.length}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-asoldi-500/20 border border-asoldi-500/30">
              <DollarSign className="w-6 h-6 text-asoldi-400" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Total Revenue</p>
              <p className="text-2xl font-bold text-white font-display">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/20 border border-purple-500/30">
              <FileText className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-dark-400">Total Invoices</p>
              <p className="text-2xl font-bold text-white font-display">
                {totalInvoices}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Clients Grid */}
      <div className="glass-card p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
        <h2 className="text-xl font-semibold font-display text-white mb-6">
          Revenue by Client
        </h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-asoldi-400" />
          </div>
        ) : customers.length === 0 ? (
          <p className="text-dark-400 text-center py-12">
            No customers found. Connect to Luca by adding LUCA_API_KEY environment variable in Hostinger.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers.map((customer, index) => (
              <div
                key={customer.id}
                className="p-5 rounded-xl bg-dark-900/50 border border-dark-700 hover:border-dark-600 transition-all"
                style={{ animationDelay: `${400 + index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-asoldi-500 to-blue-500 flex items-center justify-center text-white font-bold">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{customer.name}</h3>
                      {customer.organizationNumber && (
                        <p className="text-xs text-dark-500">
                          Org: {customer.organizationNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  {customer.email && (
                    <div className="flex items-center gap-2 text-sm text-dark-400">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{customer.email}</span>
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-sm text-dark-400">
                      <Phone className="w-4 h-4" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-dark-700 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-dark-500">Revenue</p>
                    <p className="text-lg font-bold text-asoldi-400">
                      {formatCurrency(customer.totalRevenue)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-dark-500">Invoices</p>
                    <p className="text-lg font-bold text-white">
                      {customer.invoiceCount}
                    </p>
                  </div>
                </div>

                {/* Revenue bar */}
                {totalRevenue > 0 && (
                  <div className="mt-3">
                    <div className="h-1.5 bg-dark-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-asoldi-500 to-blue-500 rounded-full"
                        style={{ width: `${(customer.totalRevenue / totalRevenue) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-dark-500 mt-1 text-right">
                      {((customer.totalRevenue / totalRevenue) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


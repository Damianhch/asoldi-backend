// Luca Regnskap GraphQL API Integration
// Documentation: https://www.lucaregnskap.no/hjelp/kom-i-gang-med-apiet

const LUCA_API_KEY = process.env.LUCA_API_KEY;
const LUCA_API_URL = 'https://go.lucaregnskap.no/api/v1/graphql';

interface LucaResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Invoice types
export interface LucaInvoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerId?: string;
  totalAmount: number;
  paidAmount: number;
  status: string;
  dueDate: string;
  paidDate?: string;
  createdAt: string;
}

// Customer types
export interface LucaCustomer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  organizationNumber?: string;
  totalRevenue: number;
  invoiceCount: number;
}

// Employee/Salary types
export interface LucaEmployee {
  id: string;
  name: string;
  email?: string;
  salary?: number;
  lastPaymentDate?: string;
}

// Income summary
export interface LucaIncomeSummary {
  totalRevenue: number;
  paidInvoices: number;
  unpaidInvoices: number;
  pendingAmount: number;
}

// GraphQL query helper
async function lucaQuery<T>(query: string, variables?: Record<string, unknown>): Promise<LucaResponse<T>> {
  if (!LUCA_API_KEY) {
    return { success: false, error: 'Luca API key not configured' };
  }

  try {
    const response = await fetch(LUCA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LUCA_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const result = await response.json();

    if (result.errors) {
      return {
        success: false,
        error: result.errors[0]?.message || 'GraphQL error',
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error('Luca API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Get all paid invoices
export async function getPaidInvoices(
  fromDate?: string,
  toDate?: string
): Promise<LucaResponse<LucaInvoice[]>> {
  const query = `
    query GetPaidInvoices($first: Int) {
      saleInvoices(first: $first) {
        nodes {
          id
          invoiceNumber
          customer {
            id
            name
          }
          totalIncVat
          paidAmount
          status
          dueDate
          paidAt
          createdAt
        }
      }
    }
  `;

  const response = await lucaQuery<{
    saleInvoices: {
      nodes: Array<{
        id: string;
        invoiceNumber: string;
        customer: { id: string; name: string };
        totalIncVat: number;
        paidAmount: number;
        status: string;
        dueDate: string;
        paidAt?: string;
        createdAt: string;
      }>;
    };
  }>(query, { first: 100 });

  if (!response.success || !response.data) {
    return { success: false, error: response.error };
  }

  const invoices: LucaInvoice[] = response.data.saleInvoices.nodes
    .filter(inv => {
      // Filter by date if provided
      if (fromDate && new Date(inv.createdAt) < new Date(fromDate)) return false;
      if (toDate && new Date(inv.createdAt) > new Date(toDate)) return false;
      return true;
    })
    .map(inv => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      customerName: inv.customer?.name || 'Unknown',
      customerId: inv.customer?.id,
      totalAmount: inv.totalIncVat,
      paidAmount: inv.paidAmount,
      status: inv.status,
      dueDate: inv.dueDate,
      paidDate: inv.paidAt,
      createdAt: inv.createdAt,
    }));

  return { success: true, data: invoices };
}

// Get all customers with their revenue
export async function getCustomersWithRevenue(): Promise<LucaResponse<LucaCustomer[]>> {
  const query = `
    query GetCustomers($first: Int) {
      customers(first: $first) {
        nodes {
          id
          name
          email
          phone
          organizationNumber
        }
      }
      saleInvoices(first: 500) {
        nodes {
          customer {
            id
          }
          totalIncVat
          paidAmount
          status
        }
      }
    }
  `;

  const response = await lucaQuery<{
    customers: {
      nodes: Array<{
        id: string;
        name: string;
        email?: string;
        phone?: string;
        organizationNumber?: string;
      }>;
    };
    saleInvoices: {
      nodes: Array<{
        customer: { id: string };
        totalIncVat: number;
        paidAmount: number;
        status: string;
      }>;
    };
  }>(query, { first: 100 });

  if (!response.success || !response.data) {
    return { success: false, error: response.error };
  }

  // Calculate revenue per customer
  const revenueByCustomer = new Map<string, { total: number; count: number }>();
  
  for (const inv of response.data.saleInvoices.nodes) {
    if (inv.customer?.id) {
      const existing = revenueByCustomer.get(inv.customer.id) || { total: 0, count: 0 };
      existing.total += inv.paidAmount || 0;
      existing.count += 1;
      revenueByCustomer.set(inv.customer.id, existing);
    }
  }

  const customers: LucaCustomer[] = response.data.customers.nodes.map(cust => {
    const revenue = revenueByCustomer.get(cust.id) || { total: 0, count: 0 };
    return {
      id: cust.id,
      name: cust.name,
      email: cust.email,
      phone: cust.phone,
      organizationNumber: cust.organizationNumber,
      totalRevenue: revenue.total,
      invoiceCount: revenue.count,
    };
  });

  // Sort by revenue descending
  customers.sort((a, b) => b.totalRevenue - a.totalRevenue);

  return { success: true, data: customers };
}

// Get income summary
export async function getIncomeSummary(): Promise<LucaResponse<LucaIncomeSummary>> {
  const query = `
    query GetIncomeSummary {
      saleInvoices(first: 500) {
        nodes {
          totalIncVat
          paidAmount
          status
        }
      }
    }
  `;

  const response = await lucaQuery<{
    saleInvoices: {
      nodes: Array<{
        totalIncVat: number;
        paidAmount: number;
        status: string;
      }>;
    };
  }>(query);

  if (!response.success || !response.data) {
    return { success: false, error: response.error };
  }

  const invoices = response.data.saleInvoices.nodes;
  
  const summary: LucaIncomeSummary = {
    totalRevenue: invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0),
    paidInvoices: invoices.filter(inv => inv.status === 'paid' || inv.paidAmount >= inv.totalIncVat).length,
    unpaidInvoices: invoices.filter(inv => inv.status !== 'paid' && inv.paidAmount < inv.totalIncVat).length,
    pendingAmount: invoices.reduce((sum, inv) => sum + (inv.totalIncVat - (inv.paidAmount || 0)), 0),
  };

  return { success: true, data: summary };
}

// Test API connection
export async function testLucaConnection(): Promise<boolean> {
  const query = `
    query TestConnection {
      saleInvoices(first: 1) {
        nodes {
          id
        }
      }
    }
  `;

  const response = await lucaQuery(query);
  return response.success;
}

// Get employees (if available in your Luca setup)
export async function getEmployees(): Promise<LucaResponse<LucaEmployee[]>> {
  // Note: This query may need adjustment based on your Luca plan
  // Salary/employee features may require specific modules
  const query = `
    query GetEmployees {
      employees(first: 50) {
        nodes {
          id
          name
          email
        }
      }
    }
  `;

  const response = await lucaQuery<{
    employees: {
      nodes: Array<{
        id: string;
        name: string;
        email?: string;
      }>;
    };
  }>(query);

  if (!response.success || !response.data) {
    // Employees endpoint might not be available
    return { success: false, error: response.error || 'Employees not available' };
  }

  const employees: LucaEmployee[] = response.data.employees.nodes.map(emp => ({
    id: emp.id,
    name: emp.name,
    email: emp.email,
  }));

  return { success: true, data: employees };
}


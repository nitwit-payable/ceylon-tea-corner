// User related types
export const UserTypes = {
  User: {
    id: 'number',
    username: 'string',
  },
  LoginRequest: {
    username: 'string',
    password: 'string',
  },
  LoginResponse: {
    access: 'string',
    refresh: 'string',
    user: 'User',
  },
};

// Tea related types
export const TeaTypes = {
  Tea: {
    id: 'number',
    name: 'string',
    category: 'string',
    price: 'number',
  },
  TeaListResponse: {
    results: 'Tea[]',
    count: 'number',
    next: 'string|null',
    previous: 'string|null',
  },
};

// Sale related types
export const SaleTypes = {
  Sale: {
    id: 'number',
    tea: 'number', // Tea ID
    quantity: 'number',
    sold_at: 'string', // ISO date string
    total_amount: 'number',
  },
  SaleRequest: {
    tea: 'number',
    quantity: 'number',
  },
  SaleResponse: {
    id: 'number',
    tea: 'Tea',
    quantity: 'number',
    sold_at: 'string',
    total_amount: 'number',
  },
};

// Report related types
export const ReportTypes = {
  DailySalesReport: {
    date: 'string',
    total_sales: 'number',
    total_amount: 'number',
    sales_by_category: 'object',
  },
  CategorySalesReport: {
    category: 'string',
    total_quantity: 'number',
    total_amount: 'number',
  },
}; 
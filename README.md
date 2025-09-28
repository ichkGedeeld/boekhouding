# Boekhouding - Inventory Management System

A simple Next.js application for inventory management and point of sale, connected to Supabase.

## Setup Instructions

### 1. Environment Variables
Create a `.env.local` file in the root directory with the following content:

```env
NEXT_PUBLIC_SUPABASE_URL=https://btvkqloedlndeuqiaqsa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0dmtxbG9lZGxuZGV1cWlhcXNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwODYyMjMsImV4cCI6MjA3NDY2MjIyM30.HMp0qJRjsvAC5FrR8ffRD6Tj8-AluBqBzH91ppgMFts
```

### 2. Database Setup
Run the SQL commands from `database-setup.sql` in your Supabase SQL Editor. This will create:

- **Items table**: Stores product information (name, cost price, sell price, inventory count)
- **Sales table**: Records completed sales with totals and amounts paid
- **Sale_items table**: Junction table linking sales to specific items and quantities
- **Requests table**: Stores customer requests for items (with optional contact info)

The SQL file also includes:
- Row Level Security (RLS) policies
- Sample data for testing

### 3. Install Dependencies and Run
```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to see your application.

## Features

### Current Features
- **Item Display**: Grid of items showing name, price, and inventory count
- **Shopping Cart**: Add items to cart, adjust quantities, and modify final price
- **Sale Processing**: Complete sales and automatically update inventory
- **Inventory Management**: Real-time inventory tracking

### Database Structure
- **Items**: `id`, `name`, `cost_price`, `sell_price`, `inventory_count`, `created_at`
- **Sales**: `id`, `total_amount`, `amount_paid`, `created_at`
- **Sale_items**: `id`, `sale_id`, `item_id`, `quantity`, `price_per_item`, `created_at`
- **Requests**: `id`, `item_id`, `customer_name`, `customer_phone`, `customer_email`, `created_at`

## Deployment to Vercel

1. Push your code to a GitHub repository
2. Connect the repository to Vercel
3. Add the environment variables in Vercel's project settings
4. Deploy!

## Next Steps (Future Features)
- Analytics dashboard with sales insights
- Inventory management interface
- Customer request management
- Income and profit tracking
- Reporting features

## Technologies Used
- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (Database & Authentication)
- **React Context** (State Management)

## Project Structure
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ItemGrid.tsx
│   └── ShoppingCart.tsx
├── contexts/
│   └── CartContext.tsx
└── lib/
    └── supabase.ts
```
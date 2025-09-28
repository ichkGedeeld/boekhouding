import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Item {
  id: number
  name: string
  cost_price: number
  sell_price: number
  inventory_count: number
  created_at: string
}

export interface Sale {
  id: number
  items: SaleItem[]
  total_amount: number
  amount_paid: number
  created_at: string
}

export interface SaleItem {
  item_id: number
  quantity: number
  price_per_item: number
}

export interface Request {
  id: number
  item_id: number
  customer_name?: string
  customer_phone?: string
  customer_email?: string
  created_at: string
}

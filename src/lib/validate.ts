import { z } from 'zod';
import { NextResponse } from 'next/server';

// Auth schemas
export const registerSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username must be alphanumeric'),
  email: z.string().email(),
  password: z.string().min(6).max(100),
  referralCode: z.string().max(20).optional().default(''),
  language: z.enum(['th', 'en', 'zh']).default('th'),
});

export const loginSchema = z.object({
  username: z.string().min(1).max(30),
  password: z.string().min(1).max(100),
});

// Wallet schemas
export const depositSchema = z.object({
  amount: z.number().min(50).max(50000),
  method: z.enum(['promptpay', 'truewallet']),
});

export const confirmDepositSchema = z.object({
  depositId: z.string().uuid(),
});

// Order schemas
export const createOrderSchema = z.object({
  productId: z.string().min(1).max(100),
});

// Admin schemas
export const adminProductSchema = z.object({
  category_id: z.string().min(1),
  name_th: z.string().min(1).max(200),
  name_en: z.string().min(1).max(200),
  name_zh: z.string().min(1).max(200),
  description_th: z.string().max(1000).default(''),
  description_en: z.string().max(1000).default(''),
  description_zh: z.string().max(1000).default(''),
  price: z.number().positive().max(100000),
  original_price: z.number().positive().max(100000).nullable().default(null),
  stock: z.number().int().min(0).default(0),
  type: z.enum(['account', 'otp', 'game', 'mobile', 'social']).default('account'),
  sort_order: z.number().int().min(0).default(0),
  image_url: z.string().url().max(500).or(z.literal('')).default(''),
});

export const adminProductUpdateSchema = z.object({
  id: z.string().uuid(),
}).passthrough(); // Allow any additional fields for partial updates

export const adminInventorySchema = z.object({
  productId: z.string().min(1),
  accountData: z.string().min(1).max(100000),
});

export const adminDepositActionSchema = z.object({
  depositId: z.string().uuid(),
  action: z.enum(['confirm', 'reject']),
});

export const smsConfirmSchema = z.object({
  amount: z.number().positive(),
  timestamp: z.string().optional(),
  api_key: z.string().optional(),
});

// Validation helper
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
    return { success: false, error: errors };
  }
  return { success: true, data: result.data };
}

export function validationErrorResponse(message: string) {
  return NextResponse.json({ error: `Validation error: ${message}` }, { status: 400 });
}

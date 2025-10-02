import { z } from 'zod'

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const therapistLoginSchema = z.object({
  patientEmail: z.string().email('Invalid patient email'),
  passcode: z.string().length(6, 'Passcode must be 6 digits').regex(/^\d+$/, 'Passcode must be numeric'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type TherapistLoginInput = z.infer<typeof therapistLoginSchema>

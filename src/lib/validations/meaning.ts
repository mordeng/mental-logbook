import { z } from 'zod'

export const meaningGoalSchema = z.object({
  goalType: z.enum(['join_group', 'volunteer', 'share_creativity', 'other']),
  description: z.string().min(1, 'Description is required'),
})

export const meaningReflectionSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  content: z.string().min(1, 'Reflection content is required'),
})

export type MeaningGoalInput = z.infer<typeof meaningGoalSchema>
export type MeaningReflectionInput = z.infer<typeof meaningReflectionSchema>

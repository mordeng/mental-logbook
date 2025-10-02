import { z } from 'zod'

export const ffnLogSchema = z.object({
  contactName: z.string().min(1, 'Contact name is required'),
  fact: z.string().min(1, 'Fact is required'),
  feeling: z.string().min(1, 'Feeling is required'),
  need: z.string().min(1, 'Need is required'),
  response: z.string().optional(),
  afterFeeling: z.string().optional(),
  afterMood: z.number().min(1).max(10).optional(),
  successRating: z.enum(['successful', 'difficult', 'neutral']).optional(),
})

export type FFNLogInput = z.infer<typeof ffnLogSchema>

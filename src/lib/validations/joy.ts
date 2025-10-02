import { z } from 'zod'

export const joyActivitySchema = z.object({
  plannedActivity: z.string().min(1, 'Activity description is required'),
  completed: z.boolean().optional(),
  rating: z.number().min(1).max(10).optional(),
  notes: z.string().optional(),
})

export type JoyActivityInput = z.infer<typeof joyActivitySchema>

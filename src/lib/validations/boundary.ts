import { z } from 'zod'

export const boundaryCheckInSchema = z.object({
  situation: z.string().min(1, 'Situation description is required'),
  wantIt: z.boolean(),
  feelsMutual: z.boolean(),
  nourishOrDrain: z.enum(['nourish', 'drain', 'unsure']),
  decision: z.enum(['yes', 'no', 'postpone']),
  reflection: z.string().optional(),
})

export type BoundaryCheckInInput = z.infer<typeof boundaryCheckInSchema>

import { z } from 'zod'

export const actionTypes = ['safe_contact', 'new_context', 'vulnerability_step'] as const

export const connectionActionSchema = z.object({
  actionType: z.enum(actionTypes),
  description: z.string().min(1, 'Description is required'),
  beforeMood: z.number().min(1).max(10).optional(),
  afterMood: z.number().min(1).max(10).optional(),
  wouldRepeat: z.enum(['yes', 'no', 'maybe']).optional(),
  notes: z.string().optional(),
})

export type ConnectionActionInput = z.infer<typeof connectionActionSchema>

export const actionTypeLabels = {
  safe_contact: 'Safe Contact',
  new_context: 'New Context',
  vulnerability_step: 'Vulnerability Step',
} as const

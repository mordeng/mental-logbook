import { z } from 'zod'

export const emotionalNeedTypes = [
  'emotional_closeness',
  'intellectual_stimulation',
  'shared_purpose',
  'physical_presence',
  'rest_alone_time',
  'other',
] as const

export const dailyCheckInSchema = z.object({
  moodRating: z.number().min(1).max(10),
  feelingText: z.string().min(1, 'Please describe how you feel'),
  needText: z.string().min(1, 'Please describe what you need'),
  emotionalNeeds: z.array(z.object({
    needType: z.enum(emotionalNeedTypes),
    customNeed: z.string().optional(),
  })).min(1, 'Please select at least one emotional need'),
})

export type DailyCheckInInput = z.infer<typeof dailyCheckInSchema>

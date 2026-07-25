import type { ComponentType } from 'npm:react@18.3.1'

export type TemplateEntry = {
  component: ComponentType<Record<string, unknown>>
  subject: string | ((data: Record<string, unknown>) => string)
  displayName?: string
  previewData?: Record<string, unknown>
  to?: string
}

import { template as contestConfirmation } from './contest-confirmation.tsx'
import { template as contestAdminNotification } from './contest-admin-notification.tsx'
import { day1, day3, day7, day14, day21, day30, day45, winner, loser, discountOffer } from './contest-drip.tsx'
import { template as bookingNotification } from './booking-notification.tsx'
import { template as musicSubmission } from './music-submission.tsx'
import { template as eventReminder } from './event-reminder.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'contest-confirmation': contestConfirmation,
  'contest-admin-notification': contestAdminNotification,
  'contest-day-1': day1,
  'contest-day-3': day3,
  'contest-day-7': day7,
  'contest-day-14': day14,
  'contest-day-21': day21,
  'contest-day-30': day30,
  'contest-day-45': day45,
  'contest-winner': winner,
  'contest-loser': loser,
  'contest-discount-offer': discountOffer,
  'booking-notification': bookingNotification,
  'music-submission': musicSubmission,
  'event-reminder': eventReminder,
}

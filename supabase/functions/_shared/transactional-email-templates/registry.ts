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

export const TEMPLATES: Record<string, TemplateEntry> = {
  'contest-confirmation': contestConfirmation,
  'contest-admin-notification': contestAdminNotification,
}
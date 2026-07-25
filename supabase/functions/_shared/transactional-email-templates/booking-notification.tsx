import * as React from 'npm:react@18.3.1'
import { Heading, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { EmailShell, styles } from './email-shell.tsx'

type Props = {
  status?: 'pending' | 'paid'
  sessionId?: string
  details?: Record<string, string>
}

const BookingNotification = ({ status = 'pending', sessionId, details = {} }: Props) => {
  const paid = status === 'paid'
  const entries = Object.entries(details).filter(([key]) => !key.startsWith('_'))

  return (
    <EmailShell preview={paid ? 'A booking deposit has been paid' : 'A customer started booking checkout'}>
      <Heading style={styles.heading}>{paid ? 'Booking payment confirmed' : 'New booking checkout started'}</Heading>
      <Text style={styles.text}>
        {paid
          ? 'The customer’s booking deposit was successfully paid.'
          : 'The customer has been redirected to the secure payment page. Payment is still pending.'}
      </Text>
      {sessionId ? (
        <Section>
          <Text style={styles.label}>Payment reference</Text>
          <Text style={styles.value}>{sessionId}</Text>
        </Section>
      ) : null}
      {entries.map(([label, value]) => (
        <Section key={label}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value || 'Not provided'}</Text>
        </Section>
      ))}
    </EmailShell>
  )
}

export const template = {
  component: BookingNotification,
  subject: (data) => {
    const status = data.status === 'paid' ? 'PAID' : 'PENDING PAYMENT'
    const details = (data.details ?? {}) as Record<string, string>
    const customer = `${details['1. First Name'] ?? details.Customer ?? ''} ${details['2. Last Name'] ?? ''}`.trim()
    return `${status} — Booking${customer ? ` · ${customer}` : ''}`
  },
  displayName: 'Booking notification',
  previewData: {
    status: 'paid',
    sessionId: 'payment-reference',
    details: { Customer: 'Sample Customer', Package: 'Wedding Essential' },
  },
} satisfies TemplateEntry
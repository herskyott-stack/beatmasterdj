import * as React from 'npm:react@18.3.1'
import { Button, Heading, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { EmailShell, styles } from './email-shell.tsx'

type Props = {
  name?: string
  email?: string
  phone?: string
  packageName?: string
  packageCategory?: string
  packagePrice?: string
  eventType?: string
  eventDate?: string
  venue?: string
  guestCount?: string
  notes?: string
}

const Field = ({ label, value }: { label: string; value?: string }) => <>
  <Text style={styles.label}>{label}</Text>
  <Text style={styles.value}>{value || '—'}</Text>
</>

const ContestAdminNotification = (props: Props) => (
  <EmailShell preview={`New contest entry from ${props.name || 'a contestant'}`}>
    <Heading style={styles.heading}>New contest entry</Heading>
    <Field label="Name" value={props.name} />
    <Field label="Email" value={props.email} />
    <Field label="Phone" value={props.phone} />
    <Field label="Package" value={[props.packageCategory, props.packageName].filter(Boolean).join(' · ')} />
    <Field label="Price" value={props.packagePrice} />
    <Field label="Event" value={props.eventType} />
    <Field label="Date" value={props.eventDate} />
    <Field label="Venue" value={props.venue} />
    <Field label="Guests" value={props.guestCount} />
    <Field label="Notes" value={props.notes} />
    <Button href="https://beatmasterdj.ca/admin/contest" style={styles.button}>Open contest participants</Button>
  </EmailShell>
)

export const template = {
  component: ContestAdminNotification,
  subject: (data) => `New contest entry: ${String(data.name || 'Contestant')}`,
  displayName: 'Contest admin notification',
  to: 'hersky.ott@gmail.com',
  previewData: { name: 'Jordan Lee', email: 'jordan@example.com', packageName: 'Wedding Essential', eventDate: 'August 22, 2027' },
} satisfies TemplateEntry
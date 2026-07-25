import * as React from 'npm:react@18.3.1'
import { Heading, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { EmailShell, styles } from './email-shell.tsx'

type Props = {
  name?: string
  packageName?: string
  eventDate?: string
}

const ContestConfirmation = ({ name, packageName, eventDate }: Props) => {
  const firstName = name?.trim().split(/\s+/)[0] || 'there'
  return (
    <EmailShell preview="Your BeatMaster DJ giveaway entry is confirmed">
      <Heading style={styles.heading}>You’re officially entered</Heading>
      <Text style={styles.text}>Hi {firstName},</Text>
      <Text style={styles.text}>Thanks for entering the BeatMaster DJ giveaway. Your entry has been received and your selected DJ package is saved.</Text>
      <Text style={styles.label}>Selected package</Text>
      <Text style={styles.value}>{packageName || 'DJ package'}</Text>
      {eventDate ? <><Text style={styles.label}>Event date</Text><Text style={styles.value}>{eventDate}</Text></> : null}
      <Text style={styles.text}>The winner will be announced September 1, 2026. We’ll contact the winner directly using this email address.</Text>
      <Text style={styles.text}>Good luck,<br />Jake · BeatMaster DJ</Text>
    </EmailShell>
  )
}

export const template = {
  component: ContestConfirmation,
  subject: 'You’re officially entered — BeatMaster DJ',
  displayName: 'Contest entry confirmation',
  previewData: { name: 'Jordan', packageName: 'Wedding Essential', eventDate: 'August 22, 2027' },
} satisfies TemplateEntry
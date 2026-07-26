import * as React from 'npm:react@18.3.1'
import { Heading, Link, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { EmailShell, styles } from './email-shell.tsx'

type Props = {
  name?: string
  packageName?: string
  eventDate?: string
}

const IG_URL = 'https://instagram.com/beatmasterdj.ca'

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

      <Text style={{ ...styles.label, marginTop: '18px' }}>Boost your odds (3 bonus tickets)</Text>
      <Text style={styles.text}>
        1. Follow <Link href={IG_URL} style={{ color: '#d59b2b' }}>@beatmasterdj.ca</Link> on Instagram.<br />
        2. Share the contest post to your Instagram <strong>story</strong>.<br />
        3. Tag <strong>3 friends</strong> in the post’s comments who are getting married, planning a party, or booking an event soon.
      </Text>

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

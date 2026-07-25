import * as React from 'npm:react@18.3.1'
import { Button, Heading, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { EmailShell, styles } from './email-shell.tsx'

type Song = { song_title?: string; artist?: string | null; notes?: string | null }
type Props = {
  firstName?: string
  lastName?: string
  eventDate?: string
  eventLocation?: string
  packageName?: string
  prioritySongs?: Song[]
  additionalSongs?: Song[]
  doNotPlaySongs?: Song[]
}

const SongSummary = ({ title, songs = [] }: { title: string; songs?: Song[] }) => (
  <Section>
    <Text style={styles.label}>{title} ({songs.length})</Text>
    <Text style={styles.value}>
      {songs.length ? songs.map((song) => `${song.song_title || 'Untitled'}${song.artist ? ` — ${song.artist}` : ''}`).join(', ') : 'None submitted'}
    </Text>
  </Section>
)

const EventReminder = ({
  firstName = 'there', eventDate, eventLocation, packageName,
  prioritySongs, additionalSongs, doNotPlaySongs,
}: Props) => (
  <EmailShell preview="Your event is two weeks away">
    <Heading style={styles.heading}>Your event is coming up</Heading>
    <Text style={styles.text}>Hi {firstName}, your event is 14 days away. Please review the details and music selections below.</Text>
    <Section>
      <Text style={styles.label}>Event date</Text>
      <Text style={styles.value}>{eventDate || 'To be confirmed'}</Text>
      <Text style={styles.label}>Location</Text>
      <Text style={styles.value}>{eventLocation || 'To be confirmed'}</Text>
      <Text style={styles.label}>Package</Text>
      <Text style={styles.value}>{packageName || 'DJ service'}</Text>
    </Section>
    <SongSummary title="Priority songs" songs={prioritySongs} />
    <SongSummary title="Additional songs" songs={additionalSongs} />
    <SongSummary title="Do not play" songs={doNotPlaySongs} />
    <Section>
      <Button href="https://beatmasterdj.ca/client-portal" style={styles.button}>Update your playlist</Button>
    </Section>
  </EmailShell>
)

export const template = {
  component: EventReminder,
  subject: (data) => `Two weeks until your event${data.firstName ? ` — ${String(data.firstName)}` : ''}`,
  displayName: 'Event reminder',
  previewData: {
    firstName: 'Sample Client',
    eventDate: 'Saturday, August 15, 2026',
    eventLocation: 'Ottawa, Ontario',
    packageName: 'Wedding Essential',
    prioritySongs: [{ song_title: 'Sample song', artist: 'Sample artist' }],
  },
} satisfies TemplateEntry
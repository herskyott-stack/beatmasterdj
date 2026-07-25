import * as React from 'npm:react@18.3.1'
import { Heading, Section, Text } from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'
import { EmailShell, styles } from './email-shell.tsx'

type Song = { song_title?: string; artist?: string | null; notes?: string | null }
type Props = {
  clientName?: string
  clientEmail?: string
  eventDate?: string
  eventLocation?: string
  prioritySongs?: Song[]
  additionalSongs?: Song[]
  doNotPlaySongs?: Song[]
}

const SongList = ({ title, songs = [] }: { title: string; songs?: Song[] }) => (
  <Section>
    <Text style={styles.label}>{title} ({songs.length})</Text>
    {songs.length === 0 ? (
      <Text style={styles.value}>None submitted</Text>
    ) : songs.map((song, index) => (
      <Text key={`${title}-${index}`} style={styles.value}>
        {index + 1}. {song.song_title || 'Untitled song'}{song.artist ? ` — ${song.artist}` : ''}{song.notes ? ` (${song.notes})` : ''}
      </Text>
    ))}
  </Section>
)

const MusicSubmission = ({
  clientName = 'Client', clientEmail, eventDate, eventLocation,
  prioritySongs, additionalSongs, doNotPlaySongs,
}: Props) => (
  <EmailShell preview={`Music selections submitted by ${clientName}`}>
    <Heading style={styles.heading}>Music playlist submitted</Heading>
    <Section>
      <Text style={styles.label}>Client</Text>
      <Text style={styles.value}>{clientName}{clientEmail ? ` · ${clientEmail}` : ''}</Text>
      <Text style={styles.label}>Event</Text>
      <Text style={styles.value}>{eventDate || 'Date not provided'} · {eventLocation || 'Location not provided'}</Text>
    </Section>
    <SongList title="Priority songs" songs={prioritySongs} />
    <SongList title="Additional songs" songs={additionalSongs} />
    <SongList title="Do not play" songs={doNotPlaySongs} />
  </EmailShell>
)

export const template = {
  component: MusicSubmission,
  subject: (data) => `Music playlist submitted — ${String(data.clientName || 'Client')}`,
  displayName: 'Music submission',
  previewData: {
    clientName: 'Sample Client',
    clientEmail: 'client@example.com',
    eventDate: 'Saturday, August 15, 2026',
    eventLocation: 'Ottawa, Ontario',
    prioritySongs: [{ song_title: 'Sample song', artist: 'Sample artist' }],
  },
} satisfies TemplateEntry
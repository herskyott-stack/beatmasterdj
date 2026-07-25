import * as React from 'npm:react@18.3.1'
import { Button, Heading, Text } from 'npm:@react-email/components@0.0.22'
import { EmailShell, styles } from './email-shell.tsx'

export type ContestGenericProps = {
  name?: string
  preview: string
  heading: string
  intro?: string
  paragraphs?: string[]
  bullets?: string[]
  quotes?: string[]
  ctaLabel?: string
  ctaHref?: string
  signoff?: string
}

const firstName = (n?: string) => (n?.trim().split(/\s+/)[0]) || 'there'

export const ContestGeneric = (p: ContestGenericProps) => (
  <EmailShell preview={p.preview}>
    <Heading style={styles.heading}>{p.heading}</Heading>
    <Text style={styles.text}>Hi {firstName(p.name)},</Text>
    {p.intro ? <Text style={styles.text}>{p.intro}</Text> : null}
    {(p.paragraphs || []).map((t, i) => (
      <Text key={`p-${i}`} style={styles.text}>{t}</Text>
    ))}
    {p.bullets && p.bullets.length > 0 ? (
      <Text style={styles.text}>
        {p.bullets.map((b, i) => (
          <React.Fragment key={`b-${i}`}>• {b}<br /></React.Fragment>
        ))}
      </Text>
    ) : null}
    {(p.quotes || []).map((q, i) => (
      <Text
        key={`q-${i}`}
        style={{ ...styles.text, borderLeft: '3px solid #d59b2b', padding: '6px 14px', color: '#555', fontStyle: 'italic' }}
      >
        “{q}”
      </Text>
    ))}
    {p.ctaLabel && p.ctaHref ? (
      <Button href={p.ctaHref} style={styles.button}>{p.ctaLabel}</Button>
    ) : null}
    <Text style={{ ...styles.text, marginTop: '20px' }}>
      {p.signoff || 'Talk soon,'}<br />Jake · BeatMaster DJ
    </Text>
  </EmailShell>
)

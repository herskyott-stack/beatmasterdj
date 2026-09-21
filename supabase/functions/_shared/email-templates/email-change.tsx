/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Link, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'

interface Props { siteName: string; oldEmail: string; email: string; newEmail: string; confirmationUrl: string }

export const EmailChangeEmail = ({ siteName, oldEmail, newEmail, confirmationUrl }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your email change for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brand}>BeatMaster DJ</Text>
          <Text style={tagline}>Beatmaster DJ · Ottawa</Text>
        </Section>
        <Section style={body}>
          <Heading style={h1}>Confirm your email change</Heading>
          <Text style={text}>You requested to change your {siteName} email from <Link href={`mailto:${oldEmail}`} style={link}>{oldEmail}</Link> to <Link href={`mailto:${newEmail}`} style={link}>{newEmail}</Link>.</Text>
          <Button style={button} href={confirmationUrl}>Confirm Email Change</Button>
          <Text style={footer}>If you didn't request this change, please secure your account immediately.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)
export default EmailChangeEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, "Times New Roman", serif', color: '#2b2b2b' }
const container = { maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden' as const }
const header = { backgroundColor: '#1a1a1a', padding: '20px 28px' }
const brand = { fontFamily: 'Playfair Display, Georgia, serif', color: '#d4a574', fontSize: '22px', letterSpacing: '0.5px', margin: '0' }
const tagline = { color: '#bbbbbb', fontSize: '12px', margin: '4px 0 0' }
const body = { padding: '28px' }
const h1 = { fontFamily: 'Playfair Display, Georgia, serif', fontSize: '24px', color: '#1a1a1a', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#2b2b2b', lineHeight: '1.55', margin: '0 0 18px' }
const link = { color: '#d4a574', textDecoration: 'underline' }
const button = { backgroundColor: '#d4a574', color: '#1a1a1a', fontSize: '15px', fontWeight: 'bold' as const, borderRadius: '6px', padding: '12px 24px', textDecoration: 'none', display: 'inline-block' }
const footer = { fontSize: '12px', color: '#888888', margin: '28px 0 0', lineHeight: '1.5' }

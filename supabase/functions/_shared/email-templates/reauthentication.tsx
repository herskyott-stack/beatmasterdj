/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'

interface Props { token: string }

export const ReauthenticationEmail = ({ token }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your BeatMaster DJ verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brand}>BeatMaster DJ</Text>
          <Text style={tagline}>Beatmaster DJ · Ottawa</Text>
        </Section>
        <Section style={body}>
          <Heading style={h1}>Confirm it's you</Heading>
          <Text style={text}>Use the code below to confirm your identity:</Text>
          <Text style={codeStyle}>{token}</Text>
          <Text style={footer}>This code expires shortly. If you didn't request this, you can safely ignore this email.</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)
export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, "Times New Roman", serif', color: '#2b2b2b' }
const container = { maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '8px', overflow: 'hidden' as const }
const header = { backgroundColor: '#1a1a1a', padding: '20px 28px' }
const brand = { fontFamily: 'Playfair Display, Georgia, serif', color: '#d4a574', fontSize: '22px', letterSpacing: '0.5px', margin: '0' }
const tagline = { color: '#bbbbbb', fontSize: '12px', margin: '4px 0 0' }
const body = { padding: '28px' }
const h1 = { fontFamily: 'Playfair Display, Georgia, serif', fontSize: '24px', color: '#1a1a1a', margin: '0 0 16px' }
const text = { fontSize: '15px', color: '#2b2b2b', lineHeight: '1.55', margin: '0 0 18px' }
const codeStyle = { fontFamily: 'Courier, monospace', fontSize: '28px', fontWeight: 'bold' as const, color: '#d4a574', letterSpacing: '4px', margin: '0 0 24px' }
const footer = { fontSize: '12px', color: '#888888', margin: '28px 0 0', lineHeight: '1.5' }

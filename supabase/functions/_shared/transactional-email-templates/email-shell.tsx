import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Html, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'

type Props = {
  preview: string
  children?: React.ReactNode
}

export const EmailShell = ({ preview, children }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{preview}</Preview>
    <Body style={body}>
      <Container style={container}>
        <Section style={header}>
          <Text style={brand}>Beatmaster DJ</Text>
          <Text style={tagline}>Beatmaster DJ · Ottawa</Text>
        </Section>
        <Section style={content}>{children}</Section>
        <Section style={footer}>
          <Text style={footerText}>Beatmaster DJ · Ottawa, Ontario</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const styles = {
  heading: { color: '#1a1a1a', fontFamily: 'Georgia, serif', fontSize: '26px', lineHeight: '34px', margin: '0 0 18px' },
  text: { color: '#2b2b2b', fontFamily: 'Arial, sans-serif', fontSize: '16px', lineHeight: '25px', margin: '0 0 16px' },
  label: { color: '#777777', fontFamily: 'Arial, sans-serif', fontSize: '12px', fontWeight: 'bold' as const, margin: '0 0 3px', textTransform: 'uppercase' as const },
  value: { color: '#2b2b2b', fontFamily: 'Arial, sans-serif', fontSize: '15px', lineHeight: '22px', margin: '0 0 14px' },
  button: { backgroundColor: '#d59b2b', borderRadius: '4px', color: '#111111', display: 'inline-block', fontFamily: 'Arial, sans-serif', fontSize: '15px', fontWeight: 'bold' as const, padding: '12px 20px', textDecoration: 'none' },
}

const body = { backgroundColor: '#ffffff', margin: '0', padding: '24px 12px' }
const container = { border: '1px solid #e7e1d8', borderRadius: '6px', margin: '0 auto', maxWidth: '600px', overflow: 'hidden' }
const header = { backgroundColor: '#17120f', padding: '22px 28px' }
const brand = { color: '#e0aa3e', fontFamily: 'Georgia, serif', fontSize: '24px', margin: '0' }
const tagline = { color: '#d5d0ca', fontFamily: 'Arial, sans-serif', fontSize: '12px', margin: '5px 0 0' }
const content = { backgroundColor: '#ffffff', padding: '30px 28px 20px' }
const footer = { backgroundColor: '#faf8f5', borderTop: '1px solid #e7e1d8', padding: '16px 28px' }
const footerText = { color: '#777777', fontFamily: 'Arial, sans-serif', fontSize: '12px', margin: '0' }
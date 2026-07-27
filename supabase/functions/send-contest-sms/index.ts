// send-contest-sms — Twilio SMS for the wedding contest.
// Actions:
//   { type: "entry", entryId }          → SMS #1 (instant thanks)
//   { type: "day7" }                    → SMS #2 (scan 7-day-old opted-in entries)
//   { type: "winner", entryId }         → SMS #3 (winner personal message)
//   { type: "final_push" }              → SMS #4 (48h before contest end)
// Twilio routes through the Lovable connector gateway.

import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.57.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/twilio'
const CONTEST_END = new Date('2026-09-01T23:59:59-04:00')

const MESSAGES = {
  entry: 'Thanks for entering the BeatMaster DJ wedding giveaway! Winner announced Sept 1st. — beatmasterdj.ca (reply STOP to opt out)',
  day7: 'Want me to hold your wedding date while the contest runs? No commitment — just reply with your date. — BeatMaster DJ (STOP to opt out)',
  winner: "You did it! You won the BeatMaster DJ wedding giveaway 🎉 Check your email — I'll be in touch to lock in your date.",
  final_push: "48h left — your free wedding DJ giveaway entry closes soon. Want me to secure your date with the $200 discount? Reply YES. (STOP to opt out)",
} as const

const admin = () =>
  createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

function toE164(raw: string | null | undefined): string | null {
  if (!raw) return null
  const digits = raw.replace(/[^\d+]/g, '')
  if (digits.startsWith('+')) return /^\+[1-9]\d{7,14}$/.test(digits) ? digits : null
  const only = digits.replace(/\D/g, '')
  if (only.length === 10) return `+1${only}`
  if (only.length === 11 && only.startsWith('1')) return `+${only}`
  return null
}

async function sendSms(to: string, body: string) {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
  const TWILIO_API_KEY = Deno.env.get('TWILIO_API_KEY')
  const FROM = Deno.env.get('TWILIO_FROM_NUMBER')
  if (!LOVABLE_API_KEY || !TWILIO_API_KEY || !FROM) {
    throw new Error('Missing Twilio credentials or sender number')
  }
  const res = await fetch(`${GATEWAY_URL}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      'X-Connection-Api-Key': TWILIO_API_KEY,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: to, From: FROM, Body: body }),
  })
  const text = await res.text()
  if (!res.ok) throw new Error(`Twilio ${res.status}: ${text}`)
  return text
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const sb = admin()
    const now = new Date()
    const body = await req.json().catch(() => ({}))
    const type: string = body.type

    // ── Single entry: instant + winner ────────────────────────────────
    if (type === 'entry' || type === 'winner') {
      const entryId: string | undefined = body.entryId
      if (!entryId) {
        return new Response(JSON.stringify({ error: 'entryId required' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      const { data: row } = await sb
        .from('contest_entries')
        .select('id, phone, sms_opt_in, sms_entry_sent_at, sms_winner_sent_at, unsubscribed_at')
        .eq('id', entryId).maybeSingle()
      if (!row) return new Response(JSON.stringify({ error: 'not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      if (row.unsubscribed_at || !row.sms_opt_in) {
        return new Response(JSON.stringify({ ok: true, skipped: 'not_opted_in' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      const to = toE164(row.phone as string | null)
      if (!to) return new Response(JSON.stringify({ ok: true, skipped: 'no_phone' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      const alreadyCol = type === 'entry' ? 'sms_entry_sent_at' : 'sms_winner_sent_at'
      if ((row as any)[alreadyCol]) {
        return new Response(JSON.stringify({ ok: true, skipped: 'already_sent' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      await sendSms(to, type === 'entry' ? MESSAGES.entry : MESSAGES.winner)
      await sb.from('contest_entries').update({ [alreadyCol]: now.toISOString() }).eq('id', entryId)
      return new Response(JSON.stringify({ ok: true, sent: 1 }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // ── Batch scans (cron) ────────────────────────────────────────────
    if (type === 'day7' || type === 'final_push') {
      if (type === 'final_push') {
        const hoursUntilEnd = (CONTEST_END.getTime() - now.getTime()) / 3600_000
        if (hoursUntilEnd <= 0 || hoursUntilEnd > 48) {
          return new Response(JSON.stringify({ ok: true, skipped: 'not_in_window' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }
      }
      const col = type === 'day7' ? 'sms_day7_sent_at' : 'sms_final_sent_at'
      const cutoff = type === 'day7'
        ? new Date(now.getTime() - 7 * 86400_000).toISOString()
        : new Date(0).toISOString()

      const { data: rows } = await sb
        .from('contest_entries')
        .select('id, phone, sms_opt_in')
        .eq('sms_opt_in', true)
        .is('unsubscribed_at', null)
        .is(col, null)
        .lte('created_at', cutoff)
        .not('phone', 'is', null)
        .limit(50)

      let sent = 0, skipped = 0, failed = 0
      for (const r of (rows ?? []) as any[]) {
        const to = toE164(r.phone)
        if (!to) { skipped++; continue }
        try {
          await sendSms(to, type === 'day7' ? MESSAGES.day7 : MESSAGES.final_push)
          await sb.from('contest_entries').update({ [col]: now.toISOString() }).eq('id', r.id)
          sent++
          await new Promise((res) => setTimeout(res, 150))
        } catch (e) {
          failed++
          console.error('sms send failed', r.id, e)
        }
      }
      return new Response(JSON.stringify({ ok: true, sent, skipped, failed }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ error: 'unknown type' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('send-contest-sms', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})

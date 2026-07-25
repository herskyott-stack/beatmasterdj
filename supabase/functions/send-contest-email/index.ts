// send-contest-email — routes ALL contest emails through the free internal
// transactional queue (send-transactional-email). No Resend, no billing.
// Kept the same public API: { type, email, name } for single sends,
// { type: "announce_all", contestId, winnerId } for one result email per entrant,
// { type: "run_followups" } for the pg_cron drip.

import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.57.2'
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS' }

const CONTEST_END = new Date('2026-09-01T23:59:59-04:00')

const firstName = (n: string) => (n || '').trim().split(/\s+/)[0] || 'there'

const admin = () =>
  createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

// Map the legacy `type` used across the codebase to the registered
// transactional template name.
const TYPE_TO_TEMPLATE: Record<string, string> = {
  confirmation: 'contest-confirmation',
  day_1: 'contest-day-1',
  day_3: 'contest-day-3',
  day_7: 'contest-day-7',
  day_14: 'contest-day-14',
  day_21: 'contest-day-21',
  day_30: 'contest-day-30',
  day_45: 'contest-day-45',
  winner: 'contest-winner',
  loser: 'contest-loser',
  discount_offer: 'contest-discount-offer',
}

async function sendOne(
  supabase: ReturnType<typeof admin>,
  to: string,
  templateName: string,
  templateData: Record<string, unknown>,
  idempotencyKey: string,
) {
  const { data, error } = await supabase.functions.invoke('send-transactional-email', {
    body: { templateName, recipientEmail: to, idempotencyKey, templateData },
  })
  if (error) throw error
  return data
}

async function pool<T>(items: T[], size: number, fn: (t: T) => Promise<void>) {
  let i = 0
  const workers = Array(Math.min(size, items.length))
    .fill(0)
    .map(async () => {
      while (i < items.length) {
        const idx = i++
        try {
          await fn(items[idx])
        } catch (e) {
          console.error('send err', e)
        }
        await new Promise((r) => setTimeout(r, 100))
      }
    })
  await Promise.all(workers)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const now = new Date()
    const body = await req.json().catch(() => ({}))
    const sb = admin()

    // ─── Winner blast ────────────────────────────────────────────────────
    if (body.type === 'announce_all') {
      const contestId: string | undefined = body.contestId
      const winnerId: string | undefined = body.winnerId
      if (!contestId || !winnerId) {
        return new Response(JSON.stringify({ error: 'contestId and winnerId required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      const { data: entries } = await sb
        .from('contest_entries')
        .select(
          'id, full_name, email, contest_id, unsubscribed_at, winner_email_sent_at, loser_email_sent_at, discount_email_sent_at',
        )
        .eq('contest_id', contestId)
      const list = (entries as any[] | null) ?? []
      const winnerRow = list.find((e) => e.id === winnerId)
      if (!winnerRow) {
        return new Response(JSON.stringify({ error: 'winner not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      const winnerFirst = firstName(winnerRow.full_name)
      let sent = 0
      let skipped = 0

      if (!winnerRow.unsubscribed_at && !winnerRow.winner_email_sent_at) {
        await sendOne(sb, winnerRow.email, 'contest-winner', { name: winnerRow.full_name }, `winner-${winnerRow.id}`)
        await sb.from('contest_entries').update({ winner_email_sent_at: now.toISOString() }).eq('id', winnerRow.id)
        sent++
      } else skipped++

      const losers = list.filter((e) => e.id !== winnerId && !e.unsubscribed_at && !e.loser_email_sent_at)
      await pool(losers, 5, async (e) => {
        await sendOne(sb, e.email, 'contest-loser', { name: e.full_name, winnerFirstName: winnerFirst }, `loser-${e.id}`)
        await sb.from('contest_entries').update({ loser_email_sent_at: now.toISOString() }).eq('id', e.id)
        sent++
      })

      return new Response(JSON.stringify({ ok: true, sent, skipped, total: list.length }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ─── Drip cron ───────────────────────────────────────────────────────
    if (body.type === 'run_followups') {
      if (now > CONTEST_END) {
        return new Response(JSON.stringify({ ok: true, skipped: 'contest_ended' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      const steps: { days: number; col: string; type: string }[] = [
        { days: 1, col: 'email_day1_sent_at', type: 'day_1' },
        { days: 3, col: 'email_day3_sent_at', type: 'day_3' },
        { days: 7, col: 'email_day7_sent_at', type: 'day_7' },
        { days: 14, col: 'email_day14_sent_at', type: 'day_14' },
        { days: 21, col: 'email_day21_sent_at', type: 'day_21' },
        { days: 30, col: 'email_day30_sent_at', type: 'day_30' },
        { days: 45, col: 'email_day45_sent_at', type: 'day_45' },
      ]
      let totalSent = 0
      for (const step of steps) {
        const cutoff = new Date(now.getTime() - step.days * 86400_000).toISOString()
        const { data } = await sb
          .from('contest_entries')
          .select('id, full_name, email')
          .is(step.col, null)
          .is('unsubscribed_at', null)
          .eq('is_winner', false)
          .lte('created_at', cutoff)
          .limit(50)
        const rows = (data as any[] | null) ?? []
        await pool(rows, 5, async (e) => {
          await sendOne(sb, e.email, TYPE_TO_TEMPLATE[step.type], { name: e.full_name }, `${step.type}-${e.id}`)
          await sb.from('contest_entries').update({ [step.col]: now.toISOString() }).eq('id', e.id)
          totalSent++
        })
      }
      return new Response(JSON.stringify({ ok: true, sent: totalSent }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ─── Single send (entry confirmation + admin notification) ───────────
    const { type, email, name, category, packageName } = body as {
      type: string
      email: string
      name: string
      category?: string
      packageName?: string
    }
    if (!type || !email || !name) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const templateName = TYPE_TO_TEMPLATE[type]
    if (!templateName) {
      return new Response(JSON.stringify({ error: `Unknown type: ${type}` }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (now > CONTEST_END && !['winner', 'loser', 'discount_offer'].includes(type)) {
      return new Response(JSON.stringify({ ok: true, skipped: 'contest_ended' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Look up entry + inquiry for admin notification content
    let entryRow: any = null
    let inquiryRow: any = null
    try {
      const { data } = await sb
        .from('contest_entries')
        .select(
          'id, full_name, email, phone, unsubscribed_at, interested_package_category, interested_package_name, interested_package_price, event_inquiry_id, created_at',
        )
        .ilike('email', email)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (data?.unsubscribed_at) {
        return new Response(JSON.stringify({ ok: true, skipped: 'unsubscribed' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      entryRow = data
      if (data?.event_inquiry_id) {
        const { data: inq } = await sb
          .from('contest_event_inquiries')
          .select('*')
          .eq('id', data.event_inquiry_id)
          .maybeSingle()
        inquiryRow = inq
      }
    } catch (e) {
      console.error('lookup entry', e)
    }

    // Send entrant email
    let entrantErr: unknown = null
    try {
      await sendOne(
        sb,
        email,
        templateName,
        { name, packageName: packageName ?? entryRow?.interested_package_name ?? undefined },
        `${type}-${entryRow?.id ?? email}`,
      )
    } catch (e) {
      entrantErr = String(e)
      console.error('entrant send failed', e)
    }

    // Admin notification on confirmation
    let adminErr: unknown = null
    if (type === 'confirmation') {
      try {
        await sendOne(
          sb,
          'hersky.ott@gmail.com',
          'contest-admin-notification',
          {
            name: entryRow?.full_name ?? name,
            email,
            phone: entryRow?.phone ?? undefined,
            packageCategory: category ?? entryRow?.interested_package_category ?? undefined,
            packageName: packageName ?? entryRow?.interested_package_name ?? undefined,
            packagePrice: entryRow?.interested_package_price ? `$${entryRow.interested_package_price}` : undefined,
            eventType: inquiryRow?.event_type ?? undefined,
            eventDate: inquiryRow?.event_date ?? undefined,
            venue: inquiryRow?.venue_location ?? undefined,
            guestCount: inquiryRow?.guest_count ?? undefined,
            notes: inquiryRow?.special_requests ?? undefined,
          },
          `admin-confirm-${entryRow?.id ?? email}`,
        )
      } catch (e) {
        adminErr = String(e)
        console.error('admin send failed', e)
      }
    }

    return new Response(
      JSON.stringify({
        ok: !entrantErr,
        entrant: { error: entrantErr },
        admin: type === 'confirmation' ? { error: adminErr } : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (err) {
    console.error('send-contest-email error', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

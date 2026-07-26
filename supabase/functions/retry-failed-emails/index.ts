// Automatic retry for emails that failed due to transient sender-domain
// verification errors (e.g., "domain_not_verified" returned while
// notify.beatmasterdj.ca was still provisioning). Once the domain becomes
// Active, the next scheduled run picks up DLQ rows and re-invokes
// send-transactional-email with the original templateData snapshot stored
// in email_send_log.metadata.
//
// Safe to run frequently: rows are only retried once per invocation, and
// each retry produces its own message_id / pending row, so the DLQ row is
// marked as "retried" via metadata to prevent infinite loops.

import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

const RETRIABLE_ERROR_MARKERS = [
  'domain_not_verified',
  'No email domain record found',
]

const MAX_ATTEMPTS = 5
const BATCH_LIMIT = 50

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!supabaseUrl || !serviceKey) {
    return json({ error: 'Server misconfigured' }, 500)
  }

  const supabase = createClient(supabaseUrl, serviceKey)

  // Pull recent DLQ rows that look like domain-verification failures and
  // still carry the original templateData snapshot.
  const { data: rows, error } = await supabase
    .from('email_send_log')
    .select('id, message_id, template_name, recipient_email, error_message, metadata, created_at')
    .eq('status', 'dlq')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) {
    console.error('retry-failed-emails: query failed', error)
    return json({ error: error.message }, 500)
  }

  const candidates = (rows ?? []).filter((r) => {
    const msg = r.error_message ?? ''
    if (!RETRIABLE_ERROR_MARKERS.some((m) => msg.includes(m))) return false
    const meta = (r.metadata ?? {}) as Record<string, any>
    if (meta.retried_at) return false
    const attempts = typeof meta.retry_attempts === 'number' ? meta.retry_attempts : 0
    if (attempts >= MAX_ATTEMPTS) return false
    if (!meta.template_data) return false
    return true
  }).slice(0, BATCH_LIMIT)

  if (candidates.length === 0) {
    return json({ retried: 0, message: 'No retriable emails' }, 200)
  }

  let retried = 0
  let failed = 0

  for (const row of candidates) {
    const meta = (row.metadata ?? {}) as Record<string, any>
    const attempts = (typeof meta.retry_attempts === 'number' ? meta.retry_attempts : 0) + 1

    // Mark the DLQ row FIRST so a slow send doesn't cause the next tick to
    // pick it up again.
    await supabase
      .from('email_send_log')
      .update({
        metadata: {
          ...meta,
          retried_at: new Date().toISOString(),
          retry_attempts: attempts,
        },
      })
      .eq('id', row.id)

    const { data, error: invokeError } = await supabase.functions.invoke(
      'send-transactional-email',
      {
        body: {
          templateName: row.template_name,
          recipientEmail: meta.original_recipient ?? row.recipient_email,
          idempotencyKey: `retry-${row.message_id}-${attempts}`,
          templateData: meta.template_data,
        },
      },
    )

    if (invokeError) {
      console.error('retry-failed-emails: re-enqueue failed', {
        message_id: row.message_id,
        error: invokeError.message,
      })
      failed++
    } else {
      console.log('retry-failed-emails: re-enqueued', {
        message_id: row.message_id,
        template: row.template_name,
        recipient: row.recipient_email,
        response: data,
      })
      retried++
    }
  }

  return json({ retried, failed, considered: candidates.length }, 200)
})

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

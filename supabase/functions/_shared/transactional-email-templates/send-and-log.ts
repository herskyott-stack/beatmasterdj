// Sends a registered template through Lovable's managed email API and records
// the outcome in public.email_send_log (the app's own audit table).
//
// Delivery, retries, rate limits, suppression and unsubscribe are handled by
// Lovable — this wrapper only preserves the app-side log rows.

import { createClient } from 'npm:@supabase/supabase-js@2'
import {
  sendTemplateEmail,
  type SendTemplateEmailOptions,
  type SendTemplateEmailResult,
} from './send-email.ts'

async function logSend(
  templateName: string,
  recipient: string,
  status: 'sent' | 'suppressed' | 'failed',
  errorMessage?: string,
): Promise<void> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!supabaseUrl || !serviceKey) return

    const supabase = createClient(supabaseUrl, serviceKey)
    const { error } = await supabase.from('email_send_log').insert({
      message_id: null,
      template_name: templateName,
      recipient_email: recipient,
      status,
      error_message: errorMessage ? errorMessage.slice(0, 1000) : null,
    })
    if (error) {
      console.error('Failed to write email_send_log row', {
        code: error.code,
        message: error.message,
        status,
      })
    }
  } catch (e) {
    console.error('Failed to write email_send_log row', e)
  }
}

export async function sendTemplateEmailLogged(
  templateName: string,
  to: string,
  options: SendTemplateEmailOptions = {},
): Promise<SendTemplateEmailResult> {
  try {
    const result = await sendTemplateEmail(templateName, to, options)
    await logSend(templateName, to, result.sent ? 'sent' : 'suppressed')
    return result
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    await logSend(templateName, to, 'failed', message)
    throw error
  }
}

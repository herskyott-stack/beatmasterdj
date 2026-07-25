import { serve } from 'https://deno.land/std@0.190.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2.57.2'
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'

const EXPECTED_TXT_HOST = '_lovable-email.beatmasterdj.ca'
const EXPECTED_TXT_VALUE = 'lovable_email_verify=2b7b3e1ac0252e9b68a3ddcc0625a11ef8b2c07262f0abcb12c5eb25f9657651'
const EXPECTED_NS_HOST = 'notify.beatmasterdj.ca'
const EXPECTED_NS_VALUES = ['ns3.lovable.cloud.', 'ns4.lovable.cloud.']

async function dohQuery(name: string, type: 'TXT' | 'NS') {
  const url = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${type}`
  const res = await fetch(url, { headers: { Accept: 'application/dns-json' } })
  if (!res.ok) return { Answer: [] as Array<{ data: string }> }
  return await res.json() as { Answer?: Array<{ data: string }> }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // Admin gate
    const authHeader = req.headers.get('Authorization') ?? ''
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const { data: roleRow } = await supabase
      .from('user_roles').select('role')
      .eq('user_id', user.id).eq('role', 'admin').maybeSingle()
    if (!roleRow) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const [txtRes, nsRes] = await Promise.all([
      dohQuery(EXPECTED_TXT_HOST, 'TXT'),
      dohQuery(EXPECTED_NS_HOST, 'NS'),
    ])

    const txtValues = (txtRes.Answer ?? []).map((a) => (a.data || '').replace(/^"|"$/g, ''))
    const txtOk = txtValues.some((v) => v.includes(EXPECTED_TXT_VALUE))

    const nsValues = (nsRes.Answer ?? []).map((a) => (a.data || '').toLowerCase())
    const nsFound = EXPECTED_NS_VALUES.filter((exp) => nsValues.includes(exp))
    const nsOk = nsFound.length === EXPECTED_NS_VALUES.length

    const result = {
      allGreen: txtOk && nsOk,
      txt: {
        host: EXPECTED_TXT_HOST,
        expected: EXPECTED_TXT_VALUE,
        found: txtValues,
        ok: txtOk,
      },
      ns: {
        host: EXPECTED_NS_HOST,
        expected: EXPECTED_NS_VALUES.map((v) => v.replace(/\.$/, '')),
        found: nsValues.map((v) => v.replace(/\.$/, '')),
        ok: nsOk,
      },
      checkedAt: new Date().toISOString(),
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('check-dns-status error', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

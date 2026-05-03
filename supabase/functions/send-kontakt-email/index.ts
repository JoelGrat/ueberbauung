import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const { name, email, telefon, nachricht } = await req.json();

  const now = new Date().toLocaleString('de-CH', {
    timeZone: 'Europe/Zurich',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:48px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #e5e5e5;">

          <!-- Header -->
          <tr>
            <td style="background:#000000;padding:32px 40px;">
              <p style="margin:0;font-size:13px;letter-spacing:3px;color:#ffffff;text-transform:uppercase;">Widematte</p>
            </td>
          </tr>

          <!-- Title -->
          <tr>
            <td style="padding:40px 40px 0;">
              <h1 style="margin:0;font-size:28px;font-weight:300;color:#111111;line-height:1.2;">Neue Unterlagen­anfrage</h1>
              <p style="margin:8px 0 0;font-size:13px;color:#999999;">${now} Uhr</p>
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td style="padding:24px 40px 0;">
              <p style="margin:0;font-size:15px;font-weight:300;color:#444444;line-height:1.7;">
                Eine neue Person hat über das Kontaktformular auf <a href="https://widematte.ch" style="color:#111111;">widematte.ch</a> die Unterlagen zu den <strong style="font-weight:500;">Widematte</strong> angefordert. Bitte nehmen Sie zeitnah Kontakt auf und senden Sie die Unterlagen zu.
              </p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:32px 40px 0;">
              <hr style="border:none;border-top:1px solid #e5e5e5;margin:0;" />
            </td>
          </tr>

          <!-- Fields -->
          <tr>
            <td style="padding:32px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-bottom:24px;">
                    <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999999;">Name</p>
                    <p style="margin:0;font-size:18px;font-weight:300;color:#111111;">${name}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:24px;">
                    <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999999;">E-Mail</p>
                    <p style="margin:0;font-size:18px;font-weight:300;color:#111111;">
                      <a href="mailto:${email}" style="color:#111111;text-decoration:underline;">${email}</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom:24px;">
                    <p style="margin:0 0 4px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999999;">Telefon</p>
                    <p style="margin:0;font-size:18px;font-weight:300;color:#111111;">${telefon || '–'}</p>
                  </td>
                </tr>
                ${nachricht ? `<tr>
                  <td>
                    <p style="margin:0 0 8px;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#999999;">Nachricht</p>
                    <p style="margin:0;font-size:15px;font-weight:300;color:#333333;line-height:1.7;white-space:pre-wrap;background:#f9f9f9;border-left:3px solid #e5e5e5;padding:16px 20px;">${nachricht}</p>
                  </td>
                </tr>` : ''}
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 40px;">
              <a href="mailto:${email}" style="display:inline-block;background:#000000;color:#ffffff;font-size:12px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;padding:14px 28px;">${name} antworten</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9f9f9;padding:20px 40px;border-top:1px solid #e5e5e5;">
              <p style="margin:0;font-size:12px;color:#bbbbbb;">Niederwilerstrasse · 5524 Nesselnbach · widematte.ch</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Widematte <noreply@widematte.ch>',
      to: 'kontakt@widematte.ch',
      reply_to: email,
      subject: `Neue Anfrage von ${name}`,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    return new Response(JSON.stringify({ error: body }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});

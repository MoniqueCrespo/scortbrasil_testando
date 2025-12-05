const BOT_AGENTS = [
  'googlebot', 'yahoo', 'bingbot', 'yandex', 'baiduspider', 'facebookexternalhit',
  'twitterbot', 'rogerbot', 'linkedinbot', 'embedly', 'quora link preview',
  'showyoubot', 'outbrain', 'pinterest', 'developers.google.com/+/web/snippet',
  'slackbot', 'vkShare', 'W3C_Validator', 'redditbot', 'Applebot', 'WhatsApp',
  'flipboard', 'tumblr', 'bitlybot', 'SkypeUriPreview', 'nuzzel', 'Discordbot',
  'Google Page Speed', 'Qwantify', 'pinterestbot', 'Bitrix link preview',
  'XING-contenttabreceiver', 'Chrome-Lighthouse', 'TelegramBot'
];

export default function middleware(request) {
  const userAgent = request.headers.get('user-agent') || '';
  const isBot = BOT_AGENTS.some(bot => 
    userAgent.toLowerCase().includes(bot.toLowerCase())
  );

  if (isBot) {
    const url = new URL(request.url);
    const prerenderUrl = `https://service.prerender.io/ps9W6uizBT7yu1Dbu4bM/${url.href}`;
    return Response.redirect(prerenderUrl, 302);
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|assets|.*\\..*).*)']
};

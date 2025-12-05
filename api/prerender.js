export const config = {
  runtime: 'edge',
};

const BOT_AGENTS = [
  'googlebot', 'bingbot', 'yandex', 'baiduspider', 'facebookexternalhit',
  'twitterbot', 'linkedinbot', 'whatsapp', 'telegrambot', 'discordbot',
  'slackbot', 'pinterest', 'redditbot'
];

export default async function handler(request) {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  const url = new URL(request.url);
  const path = url.searchParams.get('path') || '/';
  
  const isBot = BOT_AGENTS.some(bot => userAgent.includes(bot));
  
  if (isBot) {
    const targetUrl = `https://radiant-home-clone-sh9v.vercel.app${path}`;
    const prerenderUrl = `https://service.prerender.io/ps9W6uizBT7yu1Dbu4bM/${targetUrl}`;
    
    const response = await fetch(prerenderUrl);
    const html = await response.text();
    
    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  }
  
  return Response.redirect(`https://radiant-home-clone-sh9v.vercel.app${path}`, 302);
}

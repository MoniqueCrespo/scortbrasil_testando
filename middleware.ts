import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const BOT_AGENTS = [
  'googlebot',
  'bingbot',
  'yandex',
  'baiduspider',
  'facebookexternalhit',
  'twitterbot',
  'rogerbot',
  'linkedinbot',
  'embedly',
  'showyoubot',
  'outbrain',
  'pinterest',
  'slackbot',
  'vkShare',
  'W3C_Validator',
  'whatsapp',
  'TelegramBot',
  'Discordbot',
];

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';
  
  const isBot = BOT_AGENTS.some(bot => userAgent.includes(bot.toLowerCase()));
  
  if (isBot) {
    const prerenderUrl = `https://service.prerender.io/ps9W6uizBT7yu1Dbu4bM/${request.url}`;
    return NextResponse.rewrite(prerenderUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|assets).*)'],
};

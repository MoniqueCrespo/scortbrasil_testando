import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const AnalyticsScripts = () => {
  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const { data, error } = await supabase
          .from('integration_settings')
          .select('key, value')
          .in('key', ['google_analytics_id', 'search_console_code']);

        if (error || !data) return;

        data.forEach((setting) => {
          if (setting.key === 'google_analytics_id' && setting.value) {
            // Inject Google Analytics
            const gaScript1 = document.createElement('script');
            gaScript1.async = true;
            gaScript1.src = `https://www.googletagmanager.com/gtag/js?id=${setting.value}`;
            document.head.appendChild(gaScript1);

            const gaScript2 = document.createElement('script');
            gaScript2.innerHTML = `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${setting.value}');
            `;
            document.head.appendChild(gaScript2);
          } else if (setting.key === 'search_console_code' && setting.value) {
            // Inject Search Console meta tag
            const metaTag = document.createElement('meta');
            metaTag.name = 'google-site-verification';
            metaTag.content = setting.value.replace('google-site-verification=', '');
            document.head.appendChild(metaTag);
          }
        });
      } catch (error) {
        console.error('Error loading analytics:', error);
      }
    };

    loadAnalytics();
  }, []);

  return null;
};

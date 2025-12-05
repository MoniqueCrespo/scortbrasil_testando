import { Helmet } from 'react-helmet-async';
import { useLocation as useRouterLocation } from 'react-router-dom';

interface SEOHeadProps {
  title: string;
  description: string;
  canonical?: string;
  keywords?: string;
  image?: string;
  type?: string;
}

const SEOHead = ({ 
  title, 
  description, 
  canonical, 
  keywords,
  image = 'https://scortbrazil.com.br/og-image.jpg',
  type = 'website'
}: SEOHeadProps) => {
  const location = useRouterLocation();
  const siteUrl = 'https://scortbrazil.com.br';
  const canonicalUrl = canonical || `${siteUrl}${location.pathname}`;

  return (
    <Helmet>
      {/* Título */}
      <title>{title}</title>
      
      {/* Meta básicas */}
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="pt_BR" />
      <meta property="og:site_name" content="ScortBrazil" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEOHead;

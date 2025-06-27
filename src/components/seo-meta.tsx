import Head from 'next/head';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  keywords?: string;
  type?: string;
}

const defaultMeta = {
  title: 'QR Code Generator & Performance Comparison Tool',
  description: 'Compare and analyze performance of popular QR code libraries (qrcode, react-qr-code, qrcode.react). Generate QR codes with embedded logos and get detailed performance metrics.',
  image: 'https://qrcode-generation.vercel.app/og-image.png',
  url: 'https://qrcode-generation.vercel.app',
  keywords: 'qr code generator, qr code performance, qrcode npm, react-qr-code, qrcode.react, qr code comparison, qr code with logo, performance benchmarking',
  type: 'website'
};

export default function SEOMeta({
  title = defaultMeta.title,
  description = defaultMeta.description,
  image = defaultMeta.image,
  url = defaultMeta.url,
  keywords = defaultMeta.keywords,
  type = defaultMeta.type
}: SEOProps) {
  const fullTitle = title === defaultMeta.title ? title : `${title} | QR Code Tool`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": fullTitle,
    "description": description,
    "url": url,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "author": {
      "@type": "Organization",
      "name": "QR Code Performance Tool"
    },
    "features": [
      "QR Code Generation",
      "Performance Benchmarking",
      "Logo Embedding",
      "Multiple Library Comparison",
      "Real-time Metrics"
    ]
  };

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="QR Code Performance Tool" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="QR Code Performance Tool" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      <meta property="twitter:creator" content="@qrcodetool" />
      
      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
    </Head>
  );
}

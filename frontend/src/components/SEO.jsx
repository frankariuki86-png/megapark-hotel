import { useEffect } from 'react';

/**
 * SEO Component - Manages meta tags and Open Graph tags for each page
 * 
 * Usage:
 * <SEO 
 *   title="Page Title"
 *   description="Page description"
 *   url="https://megapark-hotel.com/page"
 *   image="image-url"
 *   type="website"
 * />
 */

const SEO = ({ 
  title = "Megapark Resort", 
  description = "Megapark Resort - Rooms, Restaurant, and Event Venue in Kenya. Book accommodation, authentic Kenyan cuisine, and host your events.",
  url = "https://megapark-hotel.com/",
  image = "https://megapark-hotel.com/images/megapark6.jfif",
  type = "website",
  author = "Megapark Resort",
  keywords = "hotel, resort, accommodation, events, restaurant, Kenya, rooms, booking"
}) => {
  useEffect(() => {
    // Set page title
    document.title = title;
    
    // Update or create meta tags
    const updateMeta = (name, content, property = false) => {
      let tag = document.querySelector(
        property 
          ? `meta[property="${name}"]` 
          : `meta[name="${name}"]`
      );
      
      if (!tag) {
        tag = document.createElement('meta');
        if (property) {
          tag.setAttribute('property', name);
        } else {
          tag.setAttribute('name', name);
        }
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    // Core Meta Tags
    updateMeta('description', description);
    updateMeta('keywords', keywords);
    updateMeta('author', author);
    updateMeta('viewport', 'width=device-width, initial-scale=1.0');
    updateMeta('charset', 'UTF-8');
    updateMeta('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    updateMeta('language', 'English');
    updateMeta('revisit-after', '7 days');

    // Open Graph Meta Tags
    updateMeta('og:title', title, true);
    updateMeta('og:description', description, true);
    updateMeta('og:url', url, true);
    updateMeta('og:image', image, true);
    updateMeta('og:type', type, true);
    updateMeta('og:site_name', 'Megapark Resort', true);
    updateMeta('og:locale', 'en_US', true);

    // Twitter Card Tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:title', title);
    updateMeta('twitter:description', description);
    updateMeta('twitter:image', image);
    updateMeta('twitter:creator', '@megapark');

    // Android Meta Tags
    updateMeta('mobile-web-app-capable', 'yes');
    updateMeta('apple-mobile-web-app-capable', 'yes');
    updateMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
    updateMeta('apple-mobile-web-app-title', 'Megapark Resort');

    // Canonical URL
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.rel = 'canonical';
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.href = url;

    // Theme Color
    let themeTag = document.querySelector('meta[name="theme-color"]');
    if (!themeTag) {
      themeTag = document.createElement('meta');
      themeTag.name = 'theme-color';
      document.head.appendChild(themeTag);
    }
    themeTag.content = '#1a472a';

    // Return cleanup function
    return () => {
      // Keep meta tags persistent - don't remove them
    };
  }, [title, description, url, image, type, author, keywords]);

  return null;
};

export default SEO;

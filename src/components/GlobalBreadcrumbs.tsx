import { useEffect } from 'react';
import { MapPin, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';

const GlobalBreadcrumbs = () => {
  const { breadcrumbs, schemaMarkup } = useBreadcrumbs();

  // Injetar Schema.org JSON-LD
  useEffect(() => {
    const existingScript = document.getElementById('breadcrumb-schema');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.id = 'breadcrumb-schema';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schemaMarkup);
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById('breadcrumb-schema');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [schemaMarkup]);

  if (breadcrumbs.length <= 1) {
    return null;
  }

  return (
    <div className="bg-background/95 backdrop-blur-sm border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => (
              <div key={item.href} className="flex items-center">
                {index > 0 && (
                  <BreadcrumbSeparator>
                    <ChevronRight className="w-4 h-4" />
                  </BreadcrumbSeparator>
                )}
                <BreadcrumbItem>
                  {item.isCurrentPage ? (
                    <BreadcrumbPage>
                      {index === 0 && <MapPin className="w-4 h-4 inline mr-1" />}
                      {item.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink asChild>
                      <Link to={item.href} className="flex items-center gap-1">
                        {index === 0 && <MapPin className="w-4 h-4" />}
                        {item.label}
                      </Link>
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </div>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </div>
  );
};

export default GlobalBreadcrumbs;

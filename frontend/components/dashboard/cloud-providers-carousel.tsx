import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CloudProvider {
  id: string;
  name: string;
  logo: string;
  serviceCount: number;
}

interface CloudProvidersCarouselProps {
  providers: CloudProvider[];
}

export function CloudProvidersCarousel({
  providers,
}: CloudProvidersCarouselProps) {
  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Cloud Providers</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
        {providers.map((provider) => (
          <Link key={provider.id} href={`/providers/${provider.id}`}>
            <Card className="min-w-[220px] hover:border-primary transition-colors">
              <CardContent className="flex flex-col items-center p-6">
                <div className="h-12 w-12 relative mb-4">
                  <Image
                    src={provider.logo}
                    alt={provider.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <h3 className="font-medium text-center">{provider.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {provider.serviceCount} services
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

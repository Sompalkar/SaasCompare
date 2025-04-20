import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Construction } from "lucide-react";

interface UnderConstructionProps {
  title?: string;
  description?: string;
  backUrl?: string;
  backText?: string;
}

export function UnderConstruction({
  title = "Page Under Construction",
  description = "We're working hard to bring you this feature soon. Please check back later.",
  backUrl = "/dashboard",
  backText = "Back to Dashboard",
}: UnderConstructionProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] py-16 text-center px-4">
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 mb-8">
        <Construction className="h-12 w-12 text-primary" />
      </div>

      <h1 className="text-3xl font-bold tracking-tight mb-4">{title}</h1>

      <p className="text-muted-foreground max-w-md mb-8">{description}</p>

      <Button asChild>
        <Link href={backUrl}>{backText}</Link>
      </Button>
    </div>
  );
}

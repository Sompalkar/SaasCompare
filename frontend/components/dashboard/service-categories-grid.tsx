import Link from "next/link";
import { Icon } from "@/components/ui/icon";

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  count: number;
}

interface ServiceCategoriesGridProps {
  categories: ServiceCategory[];
}

export function ServiceCategoriesGrid({
  categories,
}: ServiceCategoriesGridProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/categories/${category.id}`}
          className="group rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="rounded-full bg-primary/10 p-2">
                <Icon name={category.icon} className="h-6 w-6 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">
                {category.count} tools
              </span>
            </div>
            <div>
              <h3 className="font-semibold tracking-tight group-hover:text-primary">
                {category.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                {category.description}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

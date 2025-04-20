import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PlusCircle, Eye, Download, Star } from "lucide-react";

interface Tool {
  id: string;
  name: string;
  category: string;
  rating: number;
}

interface Comparison {
  id: string;
  date: string;
  tools: Tool[];
}

interface ToolsComparisonTableProps {
  comparisons: Comparison[];
}

export function ToolsComparisonTable({
  comparisons,
}: ToolsComparisonTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recent Comparisons</h2>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Comparison
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Tools</TableHead>
              <TableHead>Categories</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comparisons.map((comparison) => (
              <TableRow key={comparison.id}>
                <TableCell className="font-medium">{comparison.date}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-2">
                    {comparison.tools.map((tool) => (
                      <TooltipProvider key={tool.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Link
                              href={`/tools/${tool.id}`}
                              className="px-2 py-1 bg-secondary rounded text-xs hover:bg-secondary/80 transition-colors"
                            >
                              {tool.name}
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-sm">
                              <div className="font-semibold">{tool.name}</div>
                              <div className="flex items-center mt-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                                <span>{tool.rating}/5</span>
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {[
                      ...new Set(comparison.tools.map((tool) => tool.category)),
                    ].map((category) => (
                      <span
                        key={category}
                        className="px-2 py-0.5 bg-muted rounded-full text-xs"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/comparisons/${comparison.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

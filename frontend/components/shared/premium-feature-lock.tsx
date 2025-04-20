import { useState } from "react";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PremiumFeatureLockProps {
  featureName: string;
  description?: string;
  planRequired?: "pro" | "enterprise" | "custom";
}

export function PremiumFeatureLock({
  featureName,
  description = "Upgrade your plan to access this feature",
  planRequired = "pro",
}: PremiumFeatureLockProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="w-full h-full min-h-[200px] flex flex-col items-center justify-center gap-4 p-8 bg-muted/50 rounded-lg border border-dashed cursor-pointer">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-center">{featureName}</h3>
          <p className="text-sm text-muted-foreground text-center">
            {description}
          </p>
          <Button variant="outline" size="sm">
            Unlock Feature
          </Button>
        </div>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Upgrade to{" "}
            {planRequired.charAt(0).toUpperCase() + planRequired.slice(1)} Plan
          </DialogTitle>
          <DialogDescription>
            This feature is only available on our {planRequired} plan and above.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <p>
            The {featureName} feature requires a {planRequired} subscription.
            Upgrade now to unlock:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>More tool comparisons</li>
            <li>Advanced filtering</li>
            <li>PDF and Excel exports</li>
            <li>AI-powered recommendations</li>
            <li>Price alerts and notifications</li>
          </ul>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => router.push("/dashboard/subscription")}>
            View Plans
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

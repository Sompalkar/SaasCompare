"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Inbox,
  Mail,
  Settings,
  Save,
  AlertCircle,
  Plus,
  Trash,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { priceAlertAPI } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PriceAlertSettingsProps {
  userId?: string;
}

export default function PriceAlertSettings({
  userId,
}: PriceAlertSettingsProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [preferences, setPreferences] = useState<any>({
    priceAlertSubscription: false,
    priceAlertThreshold: 5,
    weeklyDigestSubscription: false,
    subscribedTools: [],
  });
  const [threshold, setThreshold] = useState<number>(5);
  const { toast } = useToast();

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    setIsLoading(true);
    try {
      const response = await priceAlertAPI.getPriceAlertPreferences();
      if (response.success && response.data) {
        setPreferences(response.data);
        setThreshold(response.data.priceAlertThreshold);
      } else {
        toast({
          title: "Failed to load preferences",
          description: "Could not load your price alert preferences",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching price alert preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAlerts = async () => {
    try {
      const newValue = !preferences.priceAlertSubscription;
      if (newValue) {
        // Subscribe to price alerts
        const response = await priceAlertAPI.subscribeToPriceAlerts({
          threshold: preferences.priceAlertThreshold,
        });
        if (response.success) {
          setPreferences({
            ...preferences,
            priceAlertSubscription: true,
          });
          toast({
            title: "Success",
            description: "You've subscribed to price alerts",
          });
        }
      } else {
        // Unsubscribe from price alerts
        const response = await priceAlertAPI.unsubscribeFromPriceAlerts({});
        if (response.success) {
          setPreferences({
            ...preferences,
            priceAlertSubscription: false,
          });
          toast({
            title: "Success",
            description: "You've unsubscribed from price alerts",
          });
        }
      }
    } catch (error) {
      console.error("Error toggling price alerts:", error);
    }
  };

  const handleThresholdChange = (value: number[]) => {
    setThreshold(value[0]);
  };

  const handleSaveThreshold = async () => {
    try {
      const response = await priceAlertAPI.updatePriceAlertThreshold(threshold);
      if (response.success) {
        setPreferences({
          ...preferences,
          priceAlertThreshold: threshold,
        });
        toast({
          title: "Success",
          description: "Price alert threshold updated successfully",
        });
      }
    } catch (error) {
      console.error("Error updating threshold:", error);
    }
  };

  const handleToggleWeeklyDigest = async () => {
    try {
      const newValue = !preferences.weeklyDigestSubscription;
      const response = await priceAlertAPI.toggleWeeklyDigest(newValue);
      if (response.success) {
        setPreferences({
          ...preferences,
          weeklyDigestSubscription: newValue,
        });
        toast({
          title: "Success",
          description: newValue
            ? "You've subscribed to weekly price digests"
            : "You've unsubscribed from weekly price digests",
        });
      }
    } catch (error) {
      console.error("Error toggling weekly digest:", error);
    }
  };

  const handleRemoveTool = async (toolId: string) => {
    try {
      const response = await priceAlertAPI.unsubscribeFromPriceAlerts({
        toolId,
      });
      if (response.success) {
        setPreferences({
          ...preferences,
          subscribedTools: preferences.subscribedTools.filter(
            (tool: any) => tool.id !== toolId
          ),
        });
        toast({
          title: "Success",
          description: "Tool removed from price alerts",
        });
      }
    } catch (error) {
      console.error("Error removing tool:", error);
    }
  };

  return (
    <Card className="border border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center text-xl">
          <Bell className="mr-2 h-5 w-5 text-amber-500" />
          Price Alert Settings
        </CardTitle>
        <CardDescription>
          Configure how you want to be notified about price changes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent"></div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Price Change Alerts</h3>
                  <p className="text-sm text-muted-foreground">
                    Get notified when prices change for your tracked tools
                  </p>
                </div>
                <Switch
                  checked={preferences.priceAlertSubscription}
                  onCheckedChange={handleToggleAlerts}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Weekly Price Digest</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive a weekly email summary of all price changes
                  </p>
                </div>
                <Switch
                  checked={preferences.weeklyDigestSubscription}
                  onCheckedChange={handleToggleWeeklyDigest}
                />
              </div>

              <div className="pt-4 pb-2">
                <h3 className="font-medium mb-2">
                  Alert Threshold: {threshold}%
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Only notify me when price changes are greater than this
                  percentage
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Slider
                      value={[threshold]}
                      min={1}
                      max={20}
                      step={1}
                      onValueChange={handleThresholdChange}
                      disabled={!preferences.priceAlertSubscription}
                    />
                  </div>
                  <Button
                    size="sm"
                    onClick={handleSaveThreshold}
                    disabled={
                      !preferences.priceAlertSubscription ||
                      threshold === preferences.priceAlertThreshold
                    }
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Tracked Tools</h3>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Tool
                </Button>
              </div>

              {preferences.subscribedTools.length === 0 ? (
                <div className="text-center py-6 bg-muted/30 rounded-lg">
                  <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <h4 className="font-medium">No tools tracked yet</h4>
                  <p className="text-sm text-muted-foreground">
                    Add tools to track their price changes
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {preferences.subscribedTools.map((tool: any) => (
                    <div
                      key={tool.id}
                      className="flex items-center justify-between border rounded-lg p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          {tool.logo ? (
                            <AvatarImage src={tool.logo} alt={tool.name} />
                          ) : (
                            <AvatarFallback>
                              {tool.name.charAt(0)}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{tool.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {tool.category}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemoveTool(tool.id)}
                      >
                        <Trash className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
      <CardFooter className="border-t pt-6 flex justify-between">
        <p className="text-sm text-muted-foreground">
          <Mail className="h-4 w-4 inline-block mr-1" />
          Notifications will be sent to your email address
        </p>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-1" />
          More Settings
        </Button>
      </CardFooter>
    </Card>
  );
}

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
import { Badge } from "@/components/ui/badge";
import {
  BellRing,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Calendar,
  CheckCircle,
  RefreshCw,
  Filter,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { priceAlertAPI } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

interface PriceNotificationsProps {
  limit?: number;
  showHeader?: boolean;
}

export default function PriceNotifications({
  limit = 5,
  showHeader = true,
}: PriceNotificationsProps) {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const response = await priceAlertAPI.getPriceChangeNotifications();
      if (response.success && response.data) {
        setNotifications(response.data.slice(0, limit));
      } else {
        toast({
          title: "Failed to load notifications",
          description: "Could not load your price change notifications",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching price change notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const response = await priceAlertAPI.markNotificationAsRead(
        notificationId
      );
      if (response.success) {
        setNotifications(
          notifications.map((notification) =>
            notification.id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const formatTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      return "Unknown date";
    }
  };

  return (
    <Card className="border border-border bg-card">
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center text-xl">
            <BellRing className="mr-2 h-5 w-5 text-amber-500" />
            Price Change Alerts
          </CardTitle>
          <CardDescription>
            Recent price changes for your tracked tools
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className="space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 bg-muted/30 rounded-lg">
            <DollarSign className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <h4 className="font-medium">No price changes yet</h4>
            <p className="text-sm text-muted-foreground">
              You'll be notified when prices change for your tracked tools
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Recent Alerts</span>
                <Badge variant="outline" className="text-xs">
                  {notifications.filter((n) => !n.read).length} unread
                </Badge>
              </div>
              <Button variant="ghost" size="sm" onClick={fetchNotifications}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`border rounded-lg p-3 transition-all ${
                    !notification.read
                      ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                      : "bg-background"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-sm">
                      {notification.toolName}
                    </h4>
                    <Badge
                      variant={
                        notification.changePercentage >= 0
                          ? "destructive"
                          : "success"
                      }
                      className="text-xs"
                    >
                      {notification.changePercentage >= 0 ? (
                        <ArrowUp className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDown className="h-3 w-3 mr-1" />
                      )}
                      {Math.abs(notification.changePercentage).toFixed(1)}%
                    </Badge>
                  </div>

                  <p className="text-xs mb-2">{notification.planName}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div>
                      <span className="text-muted-foreground">Old price:</span>{" "}
                      <span
                        className={
                          notification.changePercentage >= 0
                            ? "line-through text-muted-foreground"
                            : ""
                        }
                      >
                        ${notification.oldPrice}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">New price:</span>{" "}
                      <span className="font-medium">
                        ${notification.newPrice}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-2 pt-2 border-t text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatTimeAgo(notification.createdAt)}
                    </span>

                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Mark read
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
      {!isLoading && notifications.length > 0 && (
        <CardFooter className="border-t pt-4 flex justify-between">
          <Button variant="link" size="sm" className="text-muted-foreground">
            View all notifications
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-1" />
            Filter
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

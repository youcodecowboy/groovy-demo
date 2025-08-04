"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Calendar, Clock, User, Workflow, CheckCircle, Eye } from "lucide-react";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function CompletedItemsPage() {
  const completedItems = useQuery(api.items.getCompleted);
  const router = useRouter();

  if (completedItems === undefined) {
    return (
      <AdminSidebar>
        <div className="flex-1 space-y-6 p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AdminSidebar>
    );
  }

  return (
    <AdminSidebar>
      <div className="flex-1 space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Completed Items</h1>
            <p className="text-gray-600">View all items that have completed their workflow</p>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-600">{completedItems.length} completed</span>
          </div>
        </div>

        {completedItems.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="text-muted-foreground text-center">
                <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No completed items</h3>
                <p>Items will appear here once they complete their workflow.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Completed Items ({completedItems.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completedItems.map((item) => (
                  <div
                    key={item.itemId}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                    onClick={() => router.push(`/admin/items-list/${item.itemId}`)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {item.itemId}
                          </div>
                          <div className="text-sm text-gray-600">Item ID</div>
                        </div>

                        <div>
                          <div className="text-sm font-medium">{item.finalStageName}</div>
                          <div className="text-xs text-gray-600">Final Stage</div>
                        </div>

                        <div>
                          <div className="text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Started {formatDistanceToNow(item.startedAt, { addSuffix: true })}
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Completed {formatDistanceToNow(item.completedAt, { addSuffix: true })}
                            </div>
                          </div>
                        </div>

                        <div>
                          {item.completedBy && (
                            <div className="text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {item.completedBy}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/admin/items-list/${item.itemId}`);
                          }}
                          size="sm"
                          variant="outline"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminSidebar>
  );
} 
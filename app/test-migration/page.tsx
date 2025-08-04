"use client";

import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function TestMigrationPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const migrateWorkflows = useMutation(api.migrations.migrateWorkflows);

  const handleMigration = async () => {
    try {
      setIsRunning(true);
      const result = await migrateWorkflows({});
      setResult(result);
    } catch (error) {
      console.error("Migration failed:", error);
      setResult({ error: error.message });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <Card>
        <CardHeader>
          <CardTitle>Database Migration</CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleMigration} 
            disabled={isRunning}
            className="mb-4"
          >
            {isRunning ? "Running Migration..." : "Run Migration"}
          </Button>
          
          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <pre>{JSON.stringify(result, null, 2)}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 
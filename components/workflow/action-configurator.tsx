"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Settings, Camera, ScanLine, FileText, CheckCircle, Ruler, Eye } from "lucide-react";

export interface StageAction {
  id: string;
  type: "scan" | "photo" | "note" | "approval" | "measurement" | "inspection";
  label: string;
  description?: string;
  required: boolean;
  config?: {
    // Scan configuration
    scanType?: "qr" | "barcode" | "both";
    expectedValue?: string;
    
    // Photo configuration
    photoCount?: number;
    photoQuality?: "low" | "medium" | "high";
    
    // Note configuration
    notePrompt?: string;
    maxLength?: number;
    
    // Approval configuration
    approverRole?: string;
    autoApprove?: boolean;
    
    // Measurement configuration
    measurementUnit?: "inches" | "cm" | "mm";
    minValue?: number;
    maxValue?: number;
    
    // Inspection configuration
    inspectionChecklist?: string[];
    allowPartial?: boolean;
  };
}

const actionTypes = [
  { 
    value: "scan", 
    label: "QR/Barcode Scan", 
    icon: ScanLine,
    description: "Scan QR codes or barcodes to advance"
  },
  { 
    value: "photo", 
    label: "Photo Capture", 
    icon: Camera,
    description: "Take photos for documentation"
  },
  { 
    value: "note", 
    label: "Text Note", 
    icon: FileText,
    description: "Add text notes or comments"
  },
  { 
    value: "approval", 
    label: "Approval Required", 
    icon: CheckCircle,
    description: "Require supervisor approval"
  },
  { 
    value: "measurement", 
    label: "Measurement", 
    icon: Ruler,
    description: "Record measurements or dimensions"
  },
  { 
    value: "inspection", 
    label: "Inspection Checklist", 
    icon: Eye,
    description: "Complete inspection checklist"
  },
];

interface ActionConfiguratorProps {
  action: StageAction;
  onUpdate: (action: StageAction) => void;
  onDelete: () => void;
}

export function ActionConfigurator({ action, onUpdate, onDelete }: ActionConfiguratorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const actionType = actionTypes.find(type => type.value === action.type);
  const IconComponent = actionType?.icon || Settings;

  const updateConfig = (updates: Partial<StageAction>) => {
    onUpdate({ ...action, ...updates });
  };

  const updateActionConfig = (updates: any) => {
    onUpdate({
      ...action,
      config: { ...action.config, ...updates }
    });
  };

  const renderActionConfig = () => {
    switch (action.type) {
      case "scan":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Scan Type</Label>
              <Select
                value={action.config?.scanType || "qr"}
                onValueChange={(value) => updateActionConfig({ scanType: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="qr">QR Code Only</SelectItem>
                  <SelectItem value="barcode">Barcode Only</SelectItem>
                  <SelectItem value="both">Both QR & Barcode</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Expected Value (Optional)</Label>
              <Input
                value={action.config?.expectedValue || ""}
                onChange={(e) => updateActionConfig({ expectedValue: e.target.value })}
                placeholder="Enter expected scan value"
                className="mt-1"
              />
            </div>
          </div>
        );

      case "photo":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Number of Photos</Label>
              <Select
                value={action.config?.photoCount?.toString() || "1"}
                onValueChange={(value) => updateActionConfig({ photoCount: parseInt(value) })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Photo</SelectItem>
                  <SelectItem value="2">2 Photos</SelectItem>
                  <SelectItem value="3">3 Photos</SelectItem>
                  <SelectItem value="4">4 Photos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Photo Quality</Label>
              <Select
                value={action.config?.photoQuality || "medium"}
                onValueChange={(value) => updateActionConfig({ photoQuality: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (Fast)</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High (Slow)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "note":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Note Prompt</Label>
              <Textarea
                value={action.config?.notePrompt || ""}
                onChange={(e) => updateActionConfig({ notePrompt: e.target.value })}
                placeholder="Enter prompt for the note..."
                className="mt-1"
                rows={2}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Maximum Length</Label>
              <Input
                type="number"
                value={action.config?.maxLength || 500}
                onChange={(e) => updateActionConfig({ maxLength: parseInt(e.target.value) })}
                className="mt-1"
              />
            </div>
          </div>
        );

      case "approval":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Approver Role</Label>
              <Select
                value={action.config?.approverRole || "supervisor"}
                onValueChange={(value) => updateActionConfig({ approverRole: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="qc">Quality Control</SelectItem>
                  <SelectItem value="any">Any Authorized User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={action.config?.autoApprove || false}
                onCheckedChange={(checked) => updateActionConfig({ autoApprove: checked })}
              />
              <Label className="text-sm">Auto-approve after delay</Label>
            </div>
          </div>
        );

      case "measurement":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Measurement Unit</Label>
              <Select
                value={action.config?.measurementUnit || "inches"}
                onValueChange={(value) => updateActionConfig({ measurementUnit: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inches">Inches</SelectItem>
                  <SelectItem value="cm">Centimeters</SelectItem>
                  <SelectItem value="mm">Millimeters</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium">Min Value</Label>
                <Input
                  type="number"
                  value={action.config?.minValue || ""}
                  onChange={(e) => updateActionConfig({ minValue: parseFloat(e.target.value) })}
                  placeholder="Optional"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-sm font-medium">Max Value</Label>
                <Input
                  type="number"
                  value={action.config?.maxValue || ""}
                  onChange={(e) => updateActionConfig({ maxValue: parseFloat(e.target.value) })}
                  placeholder="Optional"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );

      case "inspection":
        return (
          <div className="space-y-3">
            <div>
              <Label className="text-sm font-medium">Checklist Items</Label>
              <div className="space-y-2">
                {(action.config?.inspectionChecklist || ["Check item 1"]).map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={item}
                      onChange={(e) => {
                        const newChecklist = [...(action.config?.inspectionChecklist || [])];
                        newChecklist[index] = e.target.value;
                        updateActionConfig({ inspectionChecklist: newChecklist });
                      }}
                      placeholder="Enter checklist item"
                      className="flex-1"
                    />
                    <Button
                      onClick={() => {
                        const newChecklist = (action.config?.inspectionChecklist || []).filter((_, i) => i !== index);
                        updateActionConfig({ inspectionChecklist: newChecklist });
                      }}
                      size="sm"
                      variant="ghost"
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  onClick={() => {
                    const newChecklist = [...(action.config?.inspectionChecklist || []), `Check item ${(action.config?.inspectionChecklist || []).length + 1}`];
                    updateActionConfig({ inspectionChecklist: newChecklist });
                  }}
                  size="sm"
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Checklist Item
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                checked={action.config?.allowPartial || false}
                onCheckedChange={(checked) => updateActionConfig({ allowPartial: checked })}
              />
              <Label className="text-sm">Allow partial completion</Label>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconComponent className="w-5 h-5 text-gray-600" />
            <div className="flex-1">
              <Input
                value={action.label}
                onChange={(e) => updateConfig({ label: e.target.value })}
                placeholder="Action name"
                className="font-medium"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={action.required ? "default" : "secondary"}>
              {action.required ? "Required" : "Optional"}
            </Badge>
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              size="sm"
              variant="ghost"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              onClick={onDelete}
              size="sm"
              variant="ghost"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Action Type</Label>
              <Select
                value={action.type}
                onValueChange={(value: any) => updateConfig({ type: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {actionTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="w-4 h-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">Description</Label>
              <Textarea
                value={action.description || ""}
                onChange={(e) => updateConfig({ description: e.target.value })}
                placeholder="Describe what this action does..."
                className="mt-1"
                rows={2}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={action.required}
                onCheckedChange={(checked) => updateConfig({ required: checked })}
              />
              <Label className="text-sm">Required to advance</Label>
            </div>

            {renderActionConfig()}
          </div>
        </CardContent>
      )}
    </Card>
  );
} 
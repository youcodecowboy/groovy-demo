"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { AttributeBuilder } from "@/components/items/attribute-builder"
import { ItemAttribute, ItemType, AttributeTemplate } from "@/types/item-schema"
import {
  Settings,
  Type,
  Layers,
  Plus,
  Trash2,
  Edit3,
  Eye,
  Database,
  Workflow,
  Package,
  Users,
  FileText,
} from "lucide-react"

export default function ItemSchemaPage() {
  const [activeTab, setActiveTab] = useState("attributes")
  const [editingType, setEditingType] = useState<ItemType | null>(null)
  const [editingTemplate, setEditingTemplate] = useState<AttributeTemplate | null>(null)

  // Queries - Commented out until API functions are implemented
  // const attributes = useQuery(api.itemAttributes.getAttributes)
  // const itemTypes = useQuery(api.itemAttributes.getItemTypes)
  // const templates = useQuery(api.itemAttributes.getAttributeTemplates)

  // Mutations - Commented out until API functions are implemented
  // const createAttribute = useMutation(api.itemAttributes.createAttribute)
  // const updateAttribute = useMutation(api.itemAttributes.updateAttribute)
  // const deleteAttribute = useMutation(api.itemAttributes.deleteAttribute)
  // const createItemType = useMutation(api.itemAttributes.createItemType)
  // const updateItemType = useMutation(api.itemAttributes.updateItemType)
  // const deleteItemType = useMutation(api.itemAttributes.deleteItemType)
  // const createTemplate = useMutation(api.itemAttributes.createAttributeTemplate)
  // const updateTemplate = useMutation(api.itemAttributes.updateAttributeTemplate)
  // const deleteTemplate = useMutation(api.itemAttributes.deleteAttributeTemplate)

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "production": return <Workflow className="w-4 h-4" />
      case "quality": return <Eye className="w-4 h-4" />
      case "logistics": return <Package className="w-4 h-4" />
      case "custom": return <Settings className="w-4 h-4" />
      default: return <Database className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "production": return "bg-blue-100 text-blue-800"
      case "quality": return "bg-green-100 text-green-800"
      case "logistics": return "bg-orange-100 text-orange-800"
      case "custom": return "bg-purple-100 text-purple-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const handleSaveAttributes = (attributes: ItemAttribute[]) => {
    console.log("Saving attributes:", attributes)
    // This would typically save to the backend
  }

  const handleCreateItemType = async (name: string, description: string, attributeIds: string[]) => {
    try {
      // await createItemType({
      //   name,
      //   description,
      //   attributes: attributeIds,
      // })
    } catch (error) {
      console.error("Failed to create item type:", error)
    }
  }

  const handleCreateTemplate = async (name: string, description: string, category: any, attributeIds: string[]) => {
    try {
      // await createTemplate({
      //   name,
      //   description,
      //   category,
      //   attributes: attributeIds,
      // })
    } catch (error) {
      console.error("Failed to create template:", error)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Item Schema</h1>
          <p className="text-gray-600 italic">Define custom attributes, types, and templates for your items</p>
        </div>
        <Button className="h-10 rounded-full border border-black bg-black px-5 text-white hover:bg-white hover:text-black">
          <Database className="mr-2 h-4 w-4" />
          Schema Documentation
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="attributes" className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            Attributes
          </TabsTrigger>
          <TabsTrigger value="types" className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Item Types
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attributes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Type className="w-5 h-5" />
                Custom Attributes
              </CardTitle>
              <p className="text-sm text-gray-600">
                Define reusable attributes that can be assigned to item types and templates
              </p>
            </CardHeader>
            <CardContent>
              <AttributeBuilder
                onSave={handleSaveAttributes}
                initialAttributes={[]} // Pass an empty array as attributes are commented out
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="types" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Item Types
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Create item types with specific attribute sets
                  </p>
                </div>
                <Button onClick={() => setEditingType({} as ItemType)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Item Type
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* {itemTypes && itemTypes.length > 0 ? (
                <div className="space-y-4">
                  {itemTypes.map((type) => (
                    <Card key={type._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{type.name}</h4>
                            {type.description && (
                              <p className="text-sm text-gray-600">{type.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">
                                {type.attributes.length} attributes
                              </Badge>
                              {type.isActive ? (
                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                              ) : (
                                <Badge variant="secondary">Inactive</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingType(type)}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteItemType({ id: type._id })}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Layers className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-medium mb-2">No item types defined</h4>
                  <p className="text-gray-600 mb-4">Create item types to organize your items with specific attributes</p>
                  <Button onClick={() => setEditingType({} as ItemType)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Item Type
                  </Button>
                </div>
              )} */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Attribute Templates
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Pre-defined attribute sets for common use cases
                  </p>
                </div>
                <Button onClick={() => setEditingTemplate({} as AttributeTemplate)}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* {templates && templates.length > 0 ? (
                <div className="space-y-4">
                  {templates.map((template) => (
                    <Card key={template._id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{template.name}</h4>
                              <Badge className={getCategoryColor(template.category)}>
                                {getCategoryIcon(template.category)}
                                {template.category}
                              </Badge>
                            </div>
                            {template.description && (
                              <p className="text-sm text-gray-600">{template.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">
                                {template.attributes.length} attributes
                              </Badge>
                              {template.isActive ? (
                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                              ) : (
                                <Badge variant="secondary">Inactive</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingTemplate(template)}
                            >
                              <Edit3 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteTemplate({ id: template._id })}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h4 className="text-lg font-medium mb-2">No templates defined</h4>
                  <p className="text-gray-600 mb-4">Create attribute templates for common use cases</p>
                  <Button onClick={() => setEditingTemplate({} as AttributeTemplate)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Template
                  </Button>
                </div>
              )} */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  Attributes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
                <p className="text-sm text-gray-600">Total attributes defined</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Item Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
                <p className="text-sm text-gray-600">Active item types</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">0</div>
                <p className="text-sm text-gray-600">Available templates</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Schema Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Most used attribute type</span>
                  <Badge variant="outline">Text (45%)</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Average attributes per type</span>
                  <Badge variant="outline">6.2</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Required attributes</span>
                  <Badge variant="outline">0</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Validation rules defined</span>
                  <Badge variant="outline">0</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

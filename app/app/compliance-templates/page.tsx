"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { FileCheck, Download, Eye, Search, Filter, Shield, Globe, Truck, Leaf } from "lucide-react"

interface ComplianceTemplate {
  id: string
  name: string
  category: 'export' | 'safety' | 'environmental' | 'quality' | 'labor'
  region: string
  description: string
  requiredFields: string[]
  template: string
  lastUpdated: string
}

const mockTemplates: ComplianceTemplate[] = [
  {
    id: "1",
    name: "Certificate of Origin (NAFTA)",
    category: "export",
    region: "North America",
    description: "NAFTA Certificate of Origin for preferential duty treatment",
    requiredFields: ["Exporter Name", "Producer Name", "Importer Name", "Description of Goods", "HS Code", "Preference Criterion"],
    template: `NORTH AMERICAN FREE TRADE AGREEMENT
CERTIFICATE OF ORIGIN

I CERTIFY that the information on this document is true and accurate and I assume the responsibility for proving such representations. I understand that I am liable for any false statements or material omissions made on or in connection with this document.

EXPORTER NAME AND ADDRESS: {{exporterName}}
{{exporterAddress}}

PRODUCER NAME AND ADDRESS: {{producerName}}
{{producerAddress}}

IMPORTER NAME AND ADDRESS: {{importerName}}
{{importerAddress}}

DESCRIPTION OF GOODS: {{description}}
HS TARIFF CLASSIFICATION NUMBER: {{hsCode}}
PREFERENCE CRITERION: {{criterion}}

I CERTIFY that the goods described above meet the conditions required under the NAFTA for preferential tariff treatment.

Authorized Signature: ________________________
Name: {{signerName}}
Title: {{signerTitle}}
Date: {{date}}`,
    lastUpdated: "2024-01-15"
  },
  {
    id: "2",
    name: "CPSIA Certificate of Compliance",
    category: "safety",
    region: "USA",
    description: "Consumer Product Safety Improvement Act compliance certificate for children's products",
    requiredFields: ["Product Description", "Age Group", "Test Results", "Laboratory Name", "Manufacturer Details"],
    template: `CERTIFICATE OF COMPLIANCE
Consumer Product Safety Improvement Act (CPSIA)

PRODUCT IDENTIFICATION:
Product Name: {{productName}}
Product Description: {{productDescription}}
Age Group: {{ageGroup}}
Model/Style Number: {{modelNumber}}

MANUFACTURER INFORMATION:
Name: {{manufacturerName}}
Address: {{manufacturerAddress}}
Contact: {{manufacturerContact}}

CERTIFICATION:
I hereby certify that this product complies with all applicable CPSIA requirements including but not limited to:
- Lead Content Limits (Section 101)
- Phthalates Prohibition (Section 108)
- Third Party Testing Requirements (Section 102)

TEST RESULTS:
Lead Content: {{leadResults}}
Phthalates: {{phthalateResults}}
Additional Tests: {{additionalTests}}

TESTING LABORATORY:
Laboratory Name: {{labName}}
Laboratory Address: {{labAddress}}
Test Report Number: {{reportNumber}}
Test Date: {{testDate}}

This certificate is based on testing of the product described above.

Authorized Representative: {{representative}}
Signature: ________________________
Date: {{date}}`,
    lastUpdated: "2024-01-10"
  },
  {
    id: "3",
    name: "OEKO-TEX Standard 100",
    category: "environmental",
    region: "Global",
    description: "Textile ecological certification for harmful substances testing",
    requiredFields: ["Product Type", "Textile Components", "Chemical Tests", "Production Stage", "Certificate Number"],
    template: `OEKO-TEX® STANDARD 100
CERTIFICATE OF COMPLIANCE

CERTIFICATE NUMBER: {{certificateNumber}}
CERTIFICATE VALIDITY: {{validityPeriod}}

PRODUCT INFORMATION:
Product Type: {{productType}}
Article Description: {{articleDescription}}
Textile Components: {{textileComponents}}
Production Stage: {{productionStage}}

TESTING INFORMATION:
Testing Institute: {{testingInstitute}}
Test Number: {{testNumber}}
Test Date: {{testDate}}

COMPLIANCE STATEMENT:
The textile articles mentioned above have been tested for harmful substances according to OEKO-TEX® Standard 100 and meet the requirements of the standard.

TESTED PARAMETERS:
- Formaldehyde: {{formaldehydeResults}}
- pH Value: {{phResults}}
- Heavy Metals: {{heavyMetalResults}}
- Pesticides: {{pesticideResults}}
- Phenols: {{phenolResults}}
- Colorfastness: {{colorfastnessResults}}

CERTIFICATE HOLDER:
Company: {{companyName}}
Address: {{companyAddress}}
Contact Person: {{contactPerson}}

This certificate is valid until: {{expiryDate}}

Authorized by: {{authorizedBy}}
Date: {{issueDate}}`,
    lastUpdated: "2024-01-08"
  },
  {
    id: "4",
    name: "ISO 9001 Quality Management",
    category: "quality",
    region: "Global",
    description: "ISO 9001 Quality Management System compliance documentation",
    requiredFields: ["Organization Name", "Scope of Certification", "Quality Policy", "Management Representative", "Audit Results"],
    template: `ISO 9001:2015 QUALITY MANAGEMENT SYSTEM
COMPLIANCE DECLARATION

ORGANIZATION DETAILS:
Organization Name: {{organizationName}}
Address: {{organizationAddress}}
Registration Number: {{registrationNumber}}

SCOPE OF CERTIFICATION:
{{scopeDescription}}

QUALITY POLICY:
{{qualityPolicy}}

MANAGEMENT SYSTEM:
Management Representative: {{managementRep}}
Quality Manual Reference: {{qualityManual}}
Document Control System: {{documentControl}}

COMPLIANCE STATEMENT:
This organization maintains a Quality Management System that complies with the requirements of ISO 9001:2015.

KEY PROCESSES:
- Customer Focus: {{customerFocus}}
- Leadership Commitment: {{leadership}}
- Risk-Based Thinking: {{riskManagement}}
- Continuous Improvement: {{continuousImprovement}}

AUDIT INFORMATION:
Internal Audit Date: {{internalAuditDate}}
Management Review Date: {{managementReviewDate}}
External Audit Date: {{externalAuditDate}}
Certification Body: {{certificationBody}}

CERTIFICATE VALIDITY:
Issue Date: {{issueDate}}
Expiry Date: {{expiryDate}}

Authorized Signature: ________________________
Name: {{signerName}}
Position: {{signerPosition}}
Date: {{date}}`,
    lastUpdated: "2024-01-12"
  },
  {
    id: "5",
    name: "Fair Labor Standards Declaration",
    category: "labor",
    region: "Global",
    description: "Declaration of compliance with fair labor standards and ethical manufacturing",
    requiredFields: ["Facility Name", "Working Hours", "Wage Information", "Safety Measures", "Worker Rights"],
    template: `FAIR LABOR STANDARDS DECLARATION

FACILITY INFORMATION:
Facility Name: {{facilityName}}
Address: {{facilityAddress}}
Number of Workers: {{workerCount}}
Production Type: {{productionType}}

LABOR STANDARDS COMPLIANCE:
We hereby declare that our manufacturing facility complies with all applicable labor standards and ethical manufacturing practices.

WORKING CONDITIONS:
Maximum Working Hours: {{maxHours}} hours per week
Overtime Policy: {{overtimePolicy}}
Rest Days: {{restDays}} per week
Break Periods: {{breakPeriods}}

COMPENSATION:
Minimum Wage Compliance: {{wageCompliance}}
Overtime Rate: {{overtimeRate}}
Payment Schedule: {{paymentSchedule}}
Benefits Provided: {{benefits}}

HEALTH & SAFETY:
Safety Training: {{safetyTraining}}
Protective Equipment: {{protectiveEquipment}}
Emergency Procedures: {{emergencyProcedures}}
Safety Officer: {{safetyOfficer}}

WORKER RIGHTS:
Freedom of Association: {{freedomAssociation}}
Non-Discrimination Policy: {{nonDiscrimination}}
Grievance Mechanism: {{grievanceMechanism}}
Child Labor Policy: {{childLaborPolicy}}

CERTIFICATIONS:
Social Compliance Audit: {{socialAudit}}
Third-Party Verification: {{thirdPartyVerification}}
Certification Body: {{certificationBody}}
Audit Date: {{auditDate}}

DECLARATION:
I hereby declare that the information provided is true and accurate to the best of my knowledge.

Facility Manager: {{facilityManager}}
Signature: ________________________
Date: {{date}}

Company Seal: ________________________`,
    lastUpdated: "2024-01-05"
  }
]

export default function ComplianceTemplatesPage() {
  const [templates] = useState<ComplianceTemplate[]>(mockTemplates)
  const [selectedTemplate, setSelectedTemplate] = useState<ComplianceTemplate | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("")
  const [regionFilter, setRegionFilter] = useState<string>("")
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [showPreview, setShowPreview] = useState(false)

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = !categoryFilter || categoryFilter === 'all' || template.category === categoryFilter
    const matchesRegion = !regionFilter || regionFilter === 'all' || template.region === regionFilter
    
    return matchesSearch && matchesCategory && matchesRegion
  })

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'export': return Globe
      case 'safety': return Shield
      case 'environmental': return Leaf
      case 'quality': return FileCheck
      case 'labor': return Truck
      default: return FileCheck
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'export': return 'bg-blue-100 text-blue-800'
      case 'safety': return 'bg-red-100 text-red-800'
      case 'environmental': return 'bg-green-100 text-green-800'
      case 'quality': return 'bg-purple-100 text-purple-800'
      case 'labor': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleTemplateSelect = (template: ComplianceTemplate) => {
    setSelectedTemplate(template)
    // Initialize form data with empty values for required fields
    const initialFormData: Record<string, string> = {}
    template.requiredFields.forEach(field => {
      initialFormData[field.toLowerCase().replace(/\s+/g, '')] = ''
    })
    setFormData(initialFormData)
    setShowPreview(false)
  }

  const generateDocument = () => {
    if (!selectedTemplate) return

    let generatedTemplate = selectedTemplate.template
    
    // Replace placeholders with form data
    Object.entries(formData).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`
      generatedTemplate = generatedTemplate.replace(new RegExp(placeholder, 'g'), value)
    })

    // Add current date if not provided
    generatedTemplate = generatedTemplate.replace(/{{date}}/g, new Date().toLocaleDateString())

    return generatedTemplate
  }

  const downloadDocument = () => {
    const content = generateDocument()
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${selectedTemplate?.name.replace(/\s+/g, '_')}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center gap-3 mb-6">
        <FileCheck className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance Document Templates</h1>
          <p className="text-gray-600">Generate compliance documents for international trade and manufacturing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Library */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Template Library
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div>
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label>Category</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="export">Export Documentation</SelectItem>
                      <SelectItem value="safety">Safety & Compliance</SelectItem>
                      <SelectItem value="environmental">Environmental</SelectItem>
                      <SelectItem value="quality">Quality Management</SelectItem>
                      <SelectItem value="labor">Labor Standards</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Region</Label>
                  <Select value={regionFilter} onValueChange={setRegionFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All regions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Regions</SelectItem>
                      <SelectItem value="Global">Global</SelectItem>
                      <SelectItem value="USA">USA</SelectItem>
                      <SelectItem value="North America">North America</SelectItem>
                      <SelectItem value="Europe">Europe</SelectItem>
                      <SelectItem value="Asia">Asia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Template List */}
          <Card>
            <CardHeader>
              <CardTitle>Available Templates ({filteredTemplates.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredTemplates.map((template) => {
                  const IconComponent = getCategoryIcon(template.category)
                  return (
                    <div
                      key={template.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        selectedTemplate?.id === template.id 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="flex items-start gap-3">
                        <IconComponent className="h-5 w-5 mt-1 text-gray-600" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{template.name}</div>
                          <div className="text-xs text-gray-600 mt-1">{template.description}</div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={`text-xs ${getCategoryColor(template.category)}`}>
                              {template.category}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {template.region}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Template Form & Preview */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTemplate ? (
            <>
              {/* Template Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{selectedTemplate.name}</span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowPreview(!showPreview)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {showPreview ? 'Hide' : 'Show'} Preview
                      </Button>
                      <Button onClick={downloadDocument}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-600">{selectedTemplate.description}</p>
                    <div className="flex items-center gap-4">
                      <Badge className={getCategoryColor(selectedTemplate.category)}>
                        {selectedTemplate.category}
                      </Badge>
                      <Badge variant="outline">{selectedTemplate.region}</Badge>
                      <span className="text-sm text-gray-500">
                        Last updated: {new Date(selectedTemplate.lastUpdated).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Form Fields */}
              <Card>
                <CardHeader>
                  <CardTitle>Required Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedTemplate.requiredFields.map((field) => {
                      const fieldKey = field.toLowerCase().replace(/\s+/g, '')
                      return (
                        <div key={field}>
                          <Label htmlFor={fieldKey}>{field}</Label>
                          {field.includes('Address') || field.includes('Description') || field.includes('Policy') ? (
                            <Textarea
                              id={fieldKey}
                              placeholder={`Enter ${field.toLowerCase()}`}
                              value={formData[fieldKey] || ''}
                              onChange={(e) => setFormData(prev => ({ ...prev, [fieldKey]: e.target.value }))}
                            />
                          ) : (
                            <Input
                              id={fieldKey}
                              placeholder={`Enter ${field.toLowerCase()}`}
                              value={formData[fieldKey] || ''}
                              onChange={(e) => setFormData(prev => ({ ...prev, [fieldKey]: e.target.value }))}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Preview */}
              {showPreview && (
                <Card>
                  <CardHeader>
                    <CardTitle>Document Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-white border rounded-lg p-6">
                      <pre className="text-sm whitespace-pre-wrap font-mono">
                        {generateDocument()}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <FileCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Compliance Template</h3>
                  <p className="text-gray-600">Choose a template from the library to get started with document generation</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
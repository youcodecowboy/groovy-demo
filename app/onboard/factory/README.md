# Factory Onboarding Suite

A comprehensive, interactive onboarding experience for new Groovy factory users. This onboarding flow helps configure the application based on the user's specific needs and factory setup.

## Features

### 🎯 **Conversational Design**
- One question per screen for focused attention
- Clear, friendly language that feels like talking to Groovy
- Progressive disclosure of information

### 🎨 **Visual Experience**
- Full-page, immersive design
- Beautiful animations and transitions
- Interactive cards and visual feedback
- Progress bar showing completion status

### ⚙️ **Smart Configuration**
- Industry-specific customization
- Feature toggles based on user needs
- Workflow builder for manufacturing stages
- Team and permission setup

## Onboarding Steps

### 1. **Industry Selection**
- Choose manufacturing industry (Garments, Electronics, Automotive, etc.)
- Garments is fully supported, others show "Coming Soon"
- Visual cards with icons and descriptions

### 2. **Product Type**
- Free-form text input for specific product types
- Example: "T-shirts, jeans, dresses, sportswear"

### 3. **Location Setup**
- Address input with map preview
- Timezone and local settings configuration

### 4. **Language Preference**
- Language selection for Disco floor app
- Multiple language options for global teams

### 5. **Production Capacity**
- Scale selection (Small, Medium, Large, Enterprise)
- Order volume-based configuration

### 6. **Feature Toggles**
- **Design Management**: Enable design workflows and file management
- **Subcontractor Management**: Enable subcontractor tracking and communication

### 7. **System Integration**
- **Inventory System**: Connect existing systems or set up new ones
- **Third-party Integrations**: Multi-select for e-commerce, CRM, communication tools

### 8. **Workflow Builder**
- Customizable manufacturing stages
- Default stages: Planning, Cutting, Sewing, Washing, QC, Finishing, Packing, Shipping
- Add/remove custom stages

### 9. **Team Setup**
- Common factory teams (Production, QC, Design, etc.)
- Custom team creation
- Permission and workflow setup

### 10. **Factory Scale**
- **Employee Count**: Team size optimization
- **Production Lines**: Floor layout and capacity planning

## Technical Implementation

### Architecture
- **TypeScript**: Full type safety
- **React Hooks**: State management and side effects
- **Tailwind CSS**: Consistent styling following Groovy design system
- **Modular Components**: Reusable step types

### Component Structure
```
components/
├── OnboardingLayout.tsx      # Main layout with header
├── OnboardingProgress.tsx    # Progress bar component
├── OnboardingStep.tsx        # Main step container
└── step-types/              # Individual step components
    ├── IndustrySelect.tsx
    ├── TextInput.tsx
    ├── LocationInput.tsx
    ├── LanguageSelect.tsx
    ├── CapacityInput.tsx
    ├── BooleanChoice.tsx
    ├── InventorySystem.tsx
    ├── Integrations.tsx
    ├── ManufacturingStages.tsx
    ├── Teams.tsx
    ├── EmployeeCount.tsx
    └── ProductionLines.tsx
```

### Data Flow
1. **State Management**: Centralized onboarding data
2. **Validation**: Step-by-step validation with visual feedback
3. **Navigation**: Forward/backward with progress tracking
4. **Configuration**: Real-time application configuration

### Design System Compliance
- Follows Groovy UI Style Guide
- Consistent spacing, typography, and colors
- Accessible design patterns
- Mobile-responsive layout

## Usage

Navigate to `/onboard/factory` to start the onboarding process. The flow takes approximately 4-5 minutes to complete and provides a comprehensive factory setup experience.

## Future Enhancements

- **Real-time Validation**: Address validation with geocoding
- **Integration Testing**: Test connections to third-party systems
- **Preview Mode**: Show how the configured app will look
- **Save & Resume**: Allow users to save progress and return later
- **Multi-language Support**: Onboarding in user's preferred language

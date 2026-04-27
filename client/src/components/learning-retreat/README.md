# Learning Retreat Components

This directory contains all the refactored components for the Learning Retreat page, making it easier to maintain and edit in the future.

## Component Structure

### Main Page Component
- **`../pages/LearningRetreat.jsx`** - Main page that orchestrates all components

### UI Components

#### 1. **HeroSection.jsx**
- Displays the hero video background
- Contains main title, subtitle, and CTA buttons
- Handles brochure download modal trigger

#### 2. **RetreatHeader.jsx**
- Shows the retreat name with gradient text effect
- Displays descriptive text about the experience
- Includes decorative divider elements

#### 3. **PropertyImageGallery.jsx**
- Interactive image slider/carousel
- Shows different images based on experience type and stay type
- Includes navigation arrows, slide indicators, and property badges
- Smooth transitions with framer-motion

#### 4. **HighlightsSection.jsx**
- Displays key farm experience highlights
- Animated cards with hover effects
- CheckCircle2 icons for visual appeal

#### 5. **BookingPanel.jsx**
- Main booking interface component
- Experience type selection (Day vs 2-Day Stay)
- Stay type selection (Solo, Couple, Group)
- Guest count selector
- Calendar integration
- Enhanced pricing display with breakdown
- Book button with animations

#### 6. **CalendarModal.jsx**
- Interactive calendar for date selection
- Saturday/Sunday availability logic
- Date range display for 2-day stays
- Month navigation
- Visual indicators for selected dates

#### 7. **AudienceSection.jsx**
- Shows target audience cards
- Urban Professionals, Families, Students, Nature Lovers
- Hover animations and responsive grid

#### 8. **StayOptionsSection.jsx**
- Displays accommodation options
- Mud Cottage and Limestone Villa
- Large image cards with overlay text

#### 9. **GallerySection.jsx**
- Masonry-style image gallery
- Lightbox integration
- Responsive column layout

#### 10. **ScheduleSection.jsx**
- 2-day retreat schedule display
- Timeline-style layout with animations
- Sticky day headers
- Detailed activity descriptions

#### 11. **FAQSection.jsx**
- Accordion-style FAQ display
- Smooth expand/collapse animations
- Interactive question toggles
- Clean, accessible design

#### 12. **ContactSection.jsx**
- Contact information display
- Address, phone, and email details
- Embedded Google Maps integration
- Professional contact layout

#### 13. **Lightbox.jsx**
- Full-screen image viewer
- Navigation controls
- Image counter
- Smooth animations

### Data & Configuration

#### 14. **RetreatContent.js**
- All retreat content and configuration
- Package pricing and details
- Image URLs
- FAQ content
- Seasonal pricing
- Blocked dates
- Centralized content management

## Key Features

### Enhanced UI Elements
- **Gradient text effects** on headings
- **Motion animations** throughout
- **Interactive hover states**
- **Modern card designs** with shadows and borders
- **Responsive layouts** for all screen sizes

### Design System
- **Color palette**: Gold/brown theme (`#7a5527`, `#d6a23d`, etc.)
- **Typography**: Consistent font weights and sizes
- **Spacing**: Generous padding and margins
- **Border radius**: Large rounded corners (2rem+)
- **Shadows**: Layered shadow effects for depth

### Functionality
- **Image slider** with auto-play capability
- **Calendar integration** with date validation
- **Pricing calculations** with seasonal rates
- **Form handling** for brochure download
- **Cart integration** for booking flow
- **WhatsApp integration** for quick contact

## Maintenance Benefits

### Easy to Edit
- **Separate components** for each section
- **Centralized content** in `RetreatContent.js`
- **Clear prop interfaces** between components
- **Consistent styling patterns**

### Reusable Components
- **BookingPanel** can be used for other retreats
- **CalendarModal** is generic for date selection
- **GallerySection** works with any image set
- **Lightbox** is reusable for image viewing

### Focused Responsibility
- Each component has a **single purpose**
- **Clear separation of concerns**
- **Independent testing capability**
- **Easy debugging and updates**

## Usage

To modify the Learning Retreat page:

1. **Content changes**: Edit `RetreatContent.js`
2. **Styling changes**: Modify individual components
3. **New features**: Add new components or extend existing ones
4. **Layout changes**: Update the main `LearningRetreat.jsx` page

## Responsive Design

All components are fully responsive with:
- **Mobile-first approach**
- **Adaptive layouts** for tablets and desktops
- **Touch-friendly interactions**
- **Optimized image loading**

## Animations

Components use **framer-motion** for:
- **Page transitions**
- **Hover effects**
- **Modal animations**
- **Image slider transitions**
- **Scroll-triggered animations**

This modular structure makes the Learning Retreat page much easier to maintain, update, and extend in the future!

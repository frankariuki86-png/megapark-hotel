# Admin Menu & Food Orders - Visual Guide

## Admin Dashboard Navigation

```
┌─────────────────────────────────────────────────────────────┐
│  📊 Admin Dashboard                          [Logout Button]  │
│  Welcome, Admin User                                          │
└─────────────────────────────────────────────────────────────┘

┌─ Tabs ──────────────────────────────────────────────────────┐
│ [📈 Overview] [🛏️ Rooms] [📅 Bookings] [🎉 Events]         │
│ [🍽️ Menu] [📦 Food Orders]  ← NEW TABS                     │
└─────────────────────────────────────────────────────────────┘
```

## Menu Tab (🍽️) - Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Menu Management          [+ Add Menu Item] (Toggle Button)  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  [Add Menu Item Form - Shows when button clicked]            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Add New Menu Item                                   │    │
│  │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ │    │
│  │ │ Item Name    │ │ Description  │ │ Category   ▼ │ │    │
│  │ └──────────────┘ └──────────────┘ └──────────────┘ │    │
│  │ ┌──────────────┐ ┌──────────────┐                  │    │
│  │ │ Price (KES)  │ │ Prep Time(m) │                  │    │
│  │ └──────────────┘ └──────────────┘                  │    │
│  │                          [Save Item]                │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  Menu Items Grid (3 columns on desktop, 1 on mobile)         │
│  ┌──────────────────┐ ┌──────────────────┐                 │
│  │ Nyama Choma      │ │ Ugali            │                 │
│  │ ✓ Available      │ │ ✕ Unavailable    │                 │
│  │ Grilled meat...  │ │ Cornmeal...      │                 │
│  │ Mains, 20 min    │ │ Sides, 10 min    │                 │
│  │ KES 450          │ │ KES 150          │                 │
│  │ [Price] [Enable] │ │ [Price] [Disable]│                 │
│  │ [Delete]         │ │ [Delete]         │                 │
│  └──────────────────┘ └──────────────────┘                 │
│  ┌──────────────────┐                                       │
│  │ Samosas          │                                       │
│  │ ✓ Available      │                                       │
│  │ Crispy pastry... │                                       │
│  │ Appetizers, 15m  │                                       │
│  │ KES 200          │                                       │
│  │ [Price] [Disable]│                                       │
│  │ [Delete]         │                                       │
│  └──────────────────┘                                       │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Food Orders Tab (📦) - Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Food Orders Management                                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Summary Statistics (4 cards)                                │
│  ┌────────────────┐ ┌────────────────┐                      │
│  │       12       │ │       3        │                      │
│  │  Total Orders  │ │   Pending      │                      │
│  └────────────────┘ └────────────────┘                      │
│  ┌────────────────┐ ┌────────────────┐                      │
│  │       5        │ │       2        │                      │
│  │   Preparing    │ │     Ready      │                      │
│  └────────────────┘ └────────────────┘                      │
│                                                               │
│  Orders List                                                 │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Order #order_1                        [🟡 PENDING]  │    │
│  │ John Doe | +254712345678                           │    │
│  │ Delivery | 123 Nairobi St                          │    │
│  │                                                     │    │
│  │ Items:                                             │    │
│  │ • Nyama Choma × 2 = KES 900                        │    │
│  │                                                     │    │
│  │ Subtotal:      KES 900                             │    │
│  │ Delivery Fee:  KES 50                              │    │
│  │ Tax:           KES 135                             │    │
│  │ TOTAL:         KES 1,085                           │    │
│  │                                                     │    │
│  │ [Pending ▼] [Cancel Order]                         │    │
│  │  Options:                                          │    │
│  │  - Pending                                         │    │
│  │  - Confirmed                                       │    │
│  │  - Preparing                                       │    │
│  │  - Ready                                           │    │
│  │  - Delivered                                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Order #order_2                       [🔵 PREPARING] │    │
│  │ Jane Smith | +254798765432                          │    │
│  │ Dine-in                                            │    │
│  │                                                     │    │
│  │ Items:                                             │    │
│  │ • Samosas × 3 = KES 600                           │    │
│  │ • Chapati × 4 = KES 400                           │    │
│  │ • Mango Juice × 2 = KES 240                       │    │
│  │                                                     │    │
│  │ Subtotal:      KES 1,240                          │    │
│  │ Tax:           KES 300                            │    │
│  │ TOTAL:         KES 1,540                          │    │
│  │                                                     │    │
│  │ [Preparing ▼] [Cancel Order]                      │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Menu Card Detailed View

```
┌──────────────────────────────┐
│ Nyama Choma    [✓ Available] │
├──────────────────────────────┤
│ Grilled meat with ugali      │
│                              │
│ Category:    Mains           │
│ Prep Time:   20 minutes      │
│                              │
│ KES 450                      │
│                              │
│ [Price Input] [🔒 Disable]  │
│ [🗑️ Delete]                  │
└──────────────────────────────┘
```

## Order Card Detailed View

```
┌────────────────────────────────────────┐
│ Order #order_1        [🟡 PENDING]     │
│ John Doe | +254712345678               │
├────────────────────────────────────────┤
│ Type:    Delivery                      │
│ Date:    2024-01-15                    │
│ Address: 123 Nairobi St                │
│                                        │
│ Items:                                 │
│ • Nyama Choma × 2 = KES 900           │
│                                        │
│ ┌──────────────────────────────┐      │
│ │ Subtotal:        KES 900     │      │
│ │ Delivery Fee:    KES 50      │      │
│ │ Tax:             KES 135     │      │
│ │ TOTAL:           KES 1,085   │      │
│ └──────────────────────────────┘      │
│                                        │
│ [Pending        ▼] [Cancel Order]    │
│  Confirmed                             │
│  Preparing                             │
│  Ready                                 │
│  Delivered                             │
└────────────────────────────────────────┘
```

## Color Coding

### Status Badges
```
🟡 PENDING    - Yellow background (#fff3cd)
🔵 CONFIRMED  - Blue background (#d1ecf1)
🔵 PREPARING  - Blue background (#cfe2ff)
🟢 READY      - Green background (#d1e7dd)
🟢 DELIVERED  - Green background (#d1e7dd)
```

### Menu Availability
```
✓ Available   - Green background (#d4edda)
✕ Unavailable - Red background (#f8d7da)
```

### Price Display
```
KES 450 - Green text (#4CAF50) - Prominent display
```

## Interactive Elements

### Buttons
```
Primary Action     [+ Add Menu Item]  - Green (#4CAF50)
Save Action        [Save Item]        - Blue (#667eea)
Disable Item       [🔒 Disable]      - Blue (#2196F3)
Enable Item        [🔓 Enable]       - Blue (#2196F3)
Delete Action      [🗑️ Delete]       - Red (#f44336)
Cancel Order       [Cancel Order]    - Red (#f44336)
Logout             [Logout]          - White border on gradient
```

### Dropdowns
```
Category Selector  [Mains ▼]     - Clean white background
Status Selector    [Pending ▼]   - Clean white background
```

### Input Fields
```
Text Input         [Item Name]    - Light gray border, focus: blue
Number Input       [Price]        - Light gray border, focus: blue
Inline Price Edit  [New price]    - Small inline field
```

## Dark Mode Visual

```
Light Mode                    Dark Mode
─────────────────────         ────────────────────
White background          →   Dark gray (#2d2d2d)
Black text                →   Light gray (#e0e0e0)
Light gray borders        →   Dark gray borders (#444)
Colored backgrounds       →   Adjusted for contrast
```

## Responsive Breakpoints

```
Desktop (>1200px)
├─ Menu Grid: 3 columns
├─ Form Grid: 5 columns
└─ Orders: Full width cards

Tablet (768px - 1200px)
├─ Menu Grid: 2 columns
├─ Form Grid: 3 columns
└─ Orders: Full width cards

Mobile (<768px)
├─ Menu Grid: 1 column
├─ Form Grid: 1 column
├─ Form labels stacked
└─ Orders: Stacked layout
```

## Navigation Flow

```
Admin Login (/admin/login)
    ↓
    [Enter credentials]
    ↓
Admin Dashboard (/admin/dashboard)
    ├─ Overview Tab
    ├─ Rooms Tab
    ├─ Bookings Tab
    ├─ Events Tab
    ├─ Menu Tab ← NEW
    │   ├─ Add Menu Item (toggle form)
    │   ├─ Edit Price (inline)
    │   ├─ Delete Item (button)
    │   └─ Toggle Availability (button)
    └─ Food Orders Tab ← NEW
        ├─ View Orders (list)
        ├─ Update Status (dropdown)
        └─ Cancel Order (button)
```

## Form Flow

### Add Menu Item
```
Click "+ Add Menu Item"
    ↓
Form appears with:
- Item Name (text input)
- Description (text input)
- Category (dropdown)
- Price (number input)
- Prep Time (number input)
    ↓
Fill in details
    ↓
Click "Save Item"
    ↓
Form validates
    ↓
Item added to grid
    ↓
Form resets and hides
```

### Update Order Status
```
Open order card
    ↓
Click status dropdown
    ↓
Select new status
- Pending → Confirmed → Preparing → Ready → Delivered
    ↓
Status updates immediately
    ↓
Visual badge changes color
```

## Accessibility Features

- ✅ Semantic HTML structure
- ✅ Clear button labels
- ✅ Color contrast ratios meet WCAG AA
- ✅ Form labels associated with inputs
- ✅ Keyboard navigation support
- ✅ Focus indicators visible
- ✅ Error messages clear and actionable

## Performance Features

- ✅ CSS Grid for efficient layout
- ✅ Flexbox for responsive alignment
- ✅ CSS variables for theme switching (no re-renders)
- ✅ Optimized transitions and animations
- ✅ No unnecessary DOM manipulation
- ✅ Efficient state management with React hooks

## Summary

The admin menu and food orders interface provides:
- 🎯 Clear visual hierarchy
- 🎨 Cohesive design language
- 📱 Responsive mobile-first layout
- 🌙 Full dark mode support
- ⚡ Fast, responsive interactions
- 🎪 Professional appearance

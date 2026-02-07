# Admin Menu & Food Orders - Quick Reference

## Login to Admin Panel
- **URL:** `/admin/login`
- **Demo Email:** admin@megapark.com
- **Demo Password:** admin123
- **Dashboard:** `/admin/dashboard`

## Menu Management (🍽️ Tab)

### Add Menu Item
```
1. Click "+ Add Menu Item" button
2. Fill form fields:
   - Item Name (required)
   - Description
   - Category dropdown
   - Price in KES (required)
   - Preparation Time (minutes)
3. Click "Save Item"
```

### Modify Menu Price
```
1. Find item in menu grid
2. Enter new price in "New price" field
3. Click outside or press Enter
4. Price updates immediately
```

### Disable/Enable Item
```
1. Find item in menu grid
2. Click "🔒 Disable" to make unavailable
3. Click "🔓 Enable" to make available again
```

### Delete Menu Item
```
1. Find item in menu grid
2. Click "🗑️ Delete" button
3. Item is removed from menu
```

## Food Orders Management (📦 Tab)

### View Orders
- **Overview Stats:** Total, Pending, Preparing, Ready counts
- **Order Card:** Shows all details including customer, items, total
- **Real-time Status:** Color-coded status badges

### Update Order Status
```
1. Find order in list
2. Use dropdown menu: Pending → Confirmed → Preparing → Ready → Delivered
3. Status updates immediately
```

### Cancel Order
```
1. Find order in list
2. Click "Cancel Order" button
3. Order marked as cancelled
```

## Mock Data Sample

### Menu Items (5 items)
- Nyama Choma: 450 KES, 20 min
- Ugali: 150 KES, 10 min
- Samosas: 200 KES, 15 min
- Chapati: 100 KES, 10 min
- Mango Juice: 120 KES, 5 min

### Food Orders (2 sample)
- Order #order_1: John Doe, Pending, 1085 KES
- Order #order_2: Jane Smith, Preparing, 1540 KES

## Admin Features

| Feature | Implementation | Status |
|---------|-----------------|--------|
| Menu Add | Form-based | ✅ Complete |
| Menu Edit Price | Inline input | ✅ Complete |
| Menu Delete | Button action | ✅ Complete |
| Menu Availability | Toggle button | ✅ Complete |
| Orders View | Table display | ✅ Complete |
| Orders Status | Dropdown select | ✅ Complete |
| Orders Cancel | Button action | ✅ Complete |
| Dark Mode | CSS variables | ✅ Complete |

## Admin Context Functions

### Available in AdminDashboard

```javascript
// From AdminContext destructuring:
{
  menuItems,                          // Array of menu items
  addMenuItem,                        // Add new item
  updateMenuItem,                     // Update item details
  deleteMenuItem,                     // Remove item
  updateMenuItemPrice,                // Change price
  toggleMenuItemAvailability,         // Enable/disable
  foodOrders,                         // Array of orders
  updateFoodOrder,                    // Update order details
  cancelFoodOrder                     // Cancel order
}
```

## Component Structure

### AdminDashboard.jsx
```
AdminDashboard
├── Header (with logout)
├── Navigation tabs
│   ├── Overview
│   ├── Rooms
│   ├── Bookings
│   ├── Events
│   ├── Menu ← NEW
│   └── Food Orders ← NEW
└── Content sections
    ├── overview-section
    ├── rooms-section
    ├── bookings-section
    ├── events-section
    ├── menu-section ← NEW
    │   ├── menu-header
    │   ├── add-menu-form
    │   └── menu-grid
    └── orders-section ← NEW
        ├── orders-summary
        └── orders-list
```

## CSS Styling

### New Style Classes
- `.menu-section` - Menu container
- `.menu-card` - Individual item
- `.menu-grid` - Grid layout
- `.add-menu-form` - Add form
- `.orders-section` - Orders container
- `.order-card` - Individual order
- `.orders-list` - Orders list

### Dark Mode
- Automatic via CSS variables
- `--bg-secondary`, `--text-primary`, `--border-color`
- All new components include dark mode styles

## Database Schema Ready

### menu_items table
```sql
- id (primary key)
- name
- description
- category
- price
- preparationTime
- availability
- createdAt
```

### orders & order_items tables
```sql
orders:
- id, orderDate, customerName, customerPhone
- orderType, deliveryAddress, status, paymentStatus
- subtotal, deliveryFee, tax, totalAmount

order_items:
- id, orderId, itemName, quantity, totalPrice
```

## Next Steps for Backend Integration

1. **API Endpoints**
   - POST `/api/menu-items` - Create
   - GET `/api/menu-items` - Read all
   - PUT `/api/menu-items/:id` - Update
   - DELETE `/api/menu-items/:id` - Delete
   - GET `/api/food-orders` - Fetch orders
   - PUT `/api/food-orders/:id` - Update status

2. **Database Migration**
   - Create menu_items table
   - Create orders table
   - Create order_items table
   - Add foreign keys and indexes

3. **State Management Update**
   - Replace mock data with API calls
   - Add loading/error states
   - Implement optimistic updates

## Keyboard Shortcuts (Future)

Planned enhancements:
- `+ M` - Add menu item
- `+ O` - View new orders
- `D` - Delete selected item
- `S` - Save/Submit form

## Support & Troubleshooting

### Menu items not showing?
- Check AdminContext.jsx has menuItems state
- Verify menu-grid CSS is applied
- Check browser console for errors

### Orders not updating?
- Verify updateFoodOrder function is called
- Check form data is properly formatted
- Confirm AdminContext provides foodOrders

### Styling issues?
- Check admindashboard.css is imported in App.jsx
- Verify CSS class names match JSX
- Clear browser cache if styles don't update

## File References

- **Component:** `src/pages/AdminDashboard.jsx` (lines 261-465)
- **Context:** `src/context/AdminContext.jsx`
- **Styles:** `src/styles/admindashboard.css` (lines 403+)
- **Docs:** `ADMIN_MENU_ORDERS_IMPLEMENTATION.md`

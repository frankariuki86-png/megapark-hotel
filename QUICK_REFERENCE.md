# Quick Reference Guide - Megapark Resort React App

## Command Cheatsheet

```bash
# Development
npm run dev          # Start dev server (http://localhost:5174/)

# Production
npm run build        # Create optimized build in dist/
npm run preview      # Preview production build locally

# Linting
npm run lint         # Check code for errors
```

## Key Files at a Glance

| File | Purpose |
|------|---------|
| `src/App.jsx` | Main app with routing setup |
| `src/pages/Home.jsx` | Homepage with carousel & sections |
| `src/pages/Checkout.jsx` | Shopping cart page |
| `src/pages/Orders.jsx` | Order history page |
| `src/components/Header.jsx` | Navigation bar |
| `src/components/Footer.jsx` | Footer with links |
| `src/context/CartContext.jsx` | Cart state management |
| `src/styles/*.css` | Component-specific styles |
| `public/images/` | All website images |

## Component Tree

```
App (BrowserRouter)
├── CartProvider
├── Header
├── Routes
│   ├── Home (/)
│   ├── Checkout (/checkout)
│   └── Orders (/orders)
└── Footer
```

## URL Routing Map

```
/                    → Home page with all sections
/checkout            → Shopping cart & order review
/orders              → Order history & tracking

Anchor links (smooth scroll):
/#home               → Hero carousel
/#about              → About section
/#menu               → Menu section
/#events             → Event booking
/#halls              → Event halls
/#rooms              → Accommodation
/#contact            → Contact form
```

## Cart Context API

```javascript
// Import
import { useCart } from '../context/CartContext';

// Usage in component
const { 
  cart,              // Array of cart items
  addToCart,         // Function to add item
  updateCartItem,    // Function to update quantity
  removeFromCart,    // Function to delete item
  clearCart,         // Function to empty cart
  getCartTotal,      // Function to get total price
  getCartCount,      // Function to get total items
  orders,            // Array of past orders
  placeOrder         // Function to create order
} = useCart();
```

## Adding a New Menu Item

1. Edit `src/pages/Home.jsx`
2. Add to `menuItems` array:
```javascript
{
  id: 'unique-id',
  name: 'Item Name',
  description: 'Description here',
  price: 1000,
  image: '/images/filename.webp'
}
```

## Adding a New Section to Home

1. Edit `src/pages/Home.jsx`
2. Add new `<section>` with unique ID
3. Add CSS styling in `src/styles/home.css`
4. Add navigation link in `src/components/Header.jsx`

## Common Tasks

### Change App Colors
- Primary green: Search `#0b7546` in CSS files
- Navy blue: Search `#06324a` in CSS files
- Button green: Search `rgb(110, 241, 110)` in CSS files

### Update Contact Information
- Email: Search `megapark@gmail.com` in components
- Phone: Search `254711768878` in components
- WhatsApp: Search `wa.me/` in components

### Modify Carousel Speed
- File: `src/pages/Home.jsx`
- Find: `intervalMs = 2500` (change 2500 to desired milliseconds)

### Change Product Prices
- File: `src/pages/Home.jsx`
- Find: `menuItems` array and update `price` values

### Update Hall or Room Details
- File: `src/pages/Home.jsx`
- Find: `halls` or `rooms` arrays and edit properties

## Styling Structure

Each page/component has its CSS file:
- `header.css` → Header component styling
- `footer.css` → Footer component styling
- `home.css` → Homepage sections styling
- `checkout.css` → Checkout page styling
- `orders.css` → Orders page styling
- `global.css` → Global styles, buttons, forms

To modify component styling:
1. Open the corresponding CSS file
2. Find the class name (e.g., `.menu-card`)
3. Edit the CSS properties

## Responsive Breakpoints

```css
/* Mobile (phones) */
@media (max-width: 420px) { }

/* Tablet */
@media (max-width: 780px) { }

/* Desktop and above */
/* No media query needed */
```

## Debug Mode

To debug cart/order state:
```javascript
// Add to any component
const { cart, orders } = useCart();
console.log('Cart:', cart);
console.log('Orders:', orders);
```

## Deploy to Different Platforms

### Netlify
```bash
npm run build
# Drag & drop 'dist' folder to Netlify
```

### Vercel
```bash
npm install -g vercel
npm run build
vercel
```

### GitHub Pages
```bash
npm run build
# Upload 'dist' contents to gh-pages branch
```

### Traditional Server
```bash
npm run build
# FTP/upload 'dist' folder to web server
# Configure server to serve index.html for all routes (SPA)
```

## Troubleshooting

### Images not showing
- Check if files exist in `public/images/`
- Verify image names match exactly (case-sensitive on Linux)
- Check browser console for 404 errors

### Cart not updating
- Check if CartProvider wraps the app in `App.jsx`
- Verify useCart() is called inside CartProvider context

### Styles not applying
- Make sure CSS files are imported in components
- Check CSS class names match in JSX
- Clear browser cache (Ctrl+Shift+Delete)

### Routing not working
- Verify react-router-dom is installed: `npm list react-router-dom`
- Check BrowserRouter wraps Routes in `App.jsx`
- Verify route paths match link hrefs

### Build fails
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Try `npm run build` again

## Performance Tips

- Images are already optimized
- CSS is minified in production build
- JavaScript is tree-shaken and minified
- Use `npm run preview` to test production build locally

## Dependency Management

### Current Dependencies
```json
{
  "react": "^19.1.0",
  "react-dom": "^19.1.0",
  "react-router-dom": "^7.13.0",
  "lucide-react": "^0.563.0"
}
```

### To Add a New Dependency
```bash
npm install package-name
# or for dev-only
npm install --save-dev package-name
```

### To Update Dependencies
```bash
npm update
# or update specific package
npm update package-name
```

## File Size Reference

- **Build Output**: ~255KB total
- **Gzipped JS**: ~80KB
- **Gzipped CSS**: ~3.5KB
- **HTML**: ~0.5KB
- **All optimized for web** ✓

## Browser DevTools Tips

1. **Inspect React Components**: Install React DevTools extension
2. **Inspect Network**: Open DevTools → Network tab
3. **Debug State**: React DevTools → Components → CartContext
4. **Console Errors**: Press F12 → Console tab
5. **Responsive Testing**: Press F12 → Toggle device toolbar

## Git Workflow (if using version control)

```bash
git add .
git commit -m "Description of changes"
git push origin main
```

## Common Component Imports

```javascript
// Routing
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';

// Context
import { useCart } from '../context/CartContext';

// CSS
import '../styles/component.css';

// Components
import Header from '../components/Header';
import Footer from '../components/Footer';
```

## Testing Checklist Before Deployment

- [ ] Carousel works and rotates
- [ ] Menu items add to cart
- [ ] Cart counter updates
- [ ] Checkout page displays cart
- [ ] Can update quantities
- [ ] Can remove items
- [ ] Can place order
- [ ] Order appears in orders page
- [ ] All links work
- [ ] Mobile menu works
- [ ] Images load correctly
- [ ] Forms submit
- [ ] Responsive on mobile
- [ ] Build completes without errors

---

## Need Help?

### Check These Files First
1. `COMPLETION_REPORT.md` - Full project overview
2. `MIGRATION_GUIDE.md` - Technical documentation
3. `FEATURES_CHECKLIST.md` - Complete feature list

### Common Issues & Solutions
See "Troubleshooting" section above

### Development Workflow
1. Make changes to code
2. Dev server auto-refreshes (HMR)
3. Check browser for errors
4. Test functionality
5. Commit changes
6. Build & deploy when ready

---

**Quick Help**: Press `npm run dev` and visit `http://localhost:5174/` to start developing!

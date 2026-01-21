# Plan
- 2 hour recording
- responsive layout
- implement auth with better auth library and prisma orm
- setup eslint with formatter

## Responsive Layout
- implement collapsible sidebar with icons  - done
- add smooth transitions and animations  - done
- ensure mobile-friendly design  - in progress
  When resizing the window, the layout should adjust smoothly
  There is 3 breakpoints to consider:
  - mobile (< 768px)
  - tablet (768px - 1024px)
  - desktop (> 1024px)
  When tablet breakpoint is reached, the layout should adjust to show the sidebar in a collapsed state
  When mobile breakpoint is reached, the layout should adjust to hide the sidebar completely
  When mobile breakpoint is reached and hamburger menu is clicked, the sidebar should slide in from the left.

  When mobile breakpoint is reached and hamburger menu is clicked, the sidebar should slide in from the left. DaisyUI already have the "drawer" component that can be used for this. How to implement it properly?

The drawer component in DaisyUI uses a checkbox input to toggle its state. Here's how to implement it:

```tsx
// Mobile sidebar implementation
<div className="drawer lg:drawer-open">
  <input id="sidebar-drawer" type="checkbox" className="drawer-toggle" />
  
  <div className="drawer-content">
    {/* Hamburger button - only visible on mobile */}
    <label htmlFor="sidebar-drawer" className="btn btn-ghost lg:hidden">
      <Menu className="h-6 w-6" />
    </label>
    
    {/* Main content */}
    <main className="p-4">
      {children}
    </main>
  </div>
  
  <div className="drawer-side">
    <label htmlFor="sidebar-drawer" className="drawer-overlay"></label>
    <aside className="bg-base-200 min-h-full w-64">
      {/* Sidebar content */}
    </aside>
  </div>
</div>
```

Key features:
- `drawer-open` class on desktop keeps sidebar visible
- Checkbox toggle controls drawer state without JavaScript
- `drawer-overlay` provides click-outside-to-close functionality
- Smooth slide-in animation is built into DaisyUI


When mobile breakpoint is reached (< 768px):
- Hide the sidebar completely from view
- Add DaisyUI drawer component to enable slide-in navigation
- Display hamburger menu button in the header
- On hamburger click, sidebar slides in from left with smooth animation
- Clicking overlay or close button dismisses the drawer
- Drawer should overlay content, not push it
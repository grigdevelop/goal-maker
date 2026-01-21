# Dashboard Layout

## Structure

- Left Sidebar
- Main Content

## Frameworks

- Tailwind CSS
- DaisyUI

## Responsive Behavior

When the hamburger button is clicked:
- The left sidebar minimizes to show only icons
- The main content expands to fill the available space
- Clicking again restores the sidebar to its full width

Currently it's working, but without smooth transitions and animations. How can we improve this?

## Adding Smooth Transitions

To add smooth transitions and animations when toggling the sidebar, apply the following CSS classes:

### Sidebar Transitions
- Add `transition-all duration-300 ease-in-out` to the sidebar container
- This will smoothly animate the width changes

### Main Content Transitions
- Add `transition-all duration-300 ease-in-out` to the main content area
- This ensures the expansion happens smoothly alongside the sidebar

### Icon/Text Transitions
- Add `transition-opacity duration-200` to text labels that hide/show
- Use `opacity-0` when minimized and `opacity-100` when expanded
- Add a slight delay with `delay-100` on text appearance for polish

### Example Implementation
```tsx
<div className="sidebar transition-all duration-300 ease-in-out">
  <button className="icon">
    <Icon />
    <span className="label transition-opacity duration-200 delay-100">Text</span>
  </button>
</div>
<main className="content transition-all duration-300 ease-in-out">
  {/* content */}
</main>
```

### Additional Polish
- Add `transform` transitions for icon rotation if needed
- Use `will-change-[width]` for performance optimization on the sidebar
- Consider adding `overflow-hidden` during transition to prevent content jumping

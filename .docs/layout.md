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

I need to detect if the screen is in desktop, tabled or mobile mode and adjust the layout accordingly.
How to implement this custom hook with best performance and user experience? Should I use useMediaQuery from @mantine/hooks or useWindowSize from @uidotdev/usehooks?

## Implementing Screen Breakpoint Detection

For optimal performance and user experience, use a custom hook with native `window.matchMedia()` API. This approach:
- Avoids external dependencies
- Provides better performance (no resize event listeners)
- Uses native browser APIs designed for media queries
- Prevents unnecessary re-renders

### Custom Hook Implementation

```typescript
// src/hooks/useBreakpoint.ts
import { useEffect, useState } from 'react';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  });

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 767px)');
    const tabletQuery = window.matchMedia('(min-width: 768px) and (max-width: 1023px)');
    
    const updateBreakpoint = () => {
      if (mobileQuery.matches) {
        setBreakpoint('mobile');
      } else if (tabletQuery.matches) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    mobileQuery.addEventListener('change', updateBreakpoint);
    tabletQuery.addEventListener('change', updateBreakpoint);

    return () => {
      mobileQuery.removeEventListener('change', updateBreakpoint);
      tabletQuery.removeEventListener('change', updateBreakpoint);
    };
  }, []);

  return breakpoint;
}
```

### Usage in Components

```typescript
const breakpoint = useBreakpoint();
const isMobile = breakpoint === 'mobile';
const isTablet = breakpoint === 'tablet';
const isDesktop = breakpoint === 'desktop';
```

This solution provides the best performance because `matchMedia` only fires when breakpoints actually change, unlike resize listeners that fire continuously.

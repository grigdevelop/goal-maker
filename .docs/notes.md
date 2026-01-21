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
  When mobile breakpoint is reached and hamburger menu is clicked, the sidebar should slide in from the left
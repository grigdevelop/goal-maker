# Login and Register design


## Register
I would like to have centered container with form (email, password, confirm password) 

## Creating a Centered Container with Tailwind CSS

To create a centered container using Tailwind CSS, use the following approach:

```tsx
<div className="min-h-screen flex items-center justify-center">
  <div className="w-full max-w-md p-8">
    {/* Your form content here */}
  </div>
</div>
```

Key classes explained:
- `min-h-screen` - Makes container full viewport height
- `flex items-center justify-center` - Centers content both vertically and horizontally
- `w-full max-w-md` - Responsive width with maximum constraint
- `p-8` - Adds padding inside the container
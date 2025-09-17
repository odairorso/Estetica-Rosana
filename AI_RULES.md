# AI_RULES.md - Gestão de Clínica Estética

## Tech Stack

- **React 18.3.1** - Frontend framework with TypeScript support
- **Vite 5.4.19** - Build tool and development server
- **TypeScript 5.8.3** - Static type checking for JavaScript
- **Tailwind CSS 3.4.17** - Utility-first CSS framework with custom design tokens
- **shadcn/ui** - Component library built on Radix UI primitives
- **Radix UI** - Low-level accessible UI primitives
- **React Router DOM 6.30.1** - Client-side routing
- **TanStack Query 5.83.0** - Server state management
- **React Hook Form 7.61.1** - Form management with Zod validation
- **Zod 3.25.76** - Schema validation and type inference
- **Lucide React 0.462.0** - Icon library
- **Date-fns 3.6.0** - Date manipulation library
- **Sonner 1.7.4** - Toast notifications
- **Recharts 2.15.4** - Data visualization charts

## Library Usage Rules

### UI Components
- **Use shadcn/ui components** for all standard UI elements (buttons, inputs, cards, etc.)
- **Use Radix UI primitives** when you need low-level control over accessibility
- **Custom components** should be placed in `src/components/` with proper naming conventions
- **Glass effect styling** should use the `card-glass` utility class from `src/index.css`

### Styling
- **Always use Tailwind CSS classes** for styling - no inline styles or CSS modules
- **Use CSS custom properties** from `src/index.css` for colors and spacing
- **Neon effects** should use the predefined classes: `neon-glow`, `icon-glow`, `text-gradient-brand`
- **Responsive design** is mandatory - use Tailwind responsive utilities (md:, lg:, etc.)

### State Management
- **TanStack Query** for server state and data fetching
- **React Hook Form + Zod** for form validation and state
- **Custom hooks** for local state management (useClients, usePackages, etc.)
- **Local storage** for data persistence using localStorage API

### Data & Validation
- **Zod schemas** for all form validation
- **TypeScript interfaces** for all data structures
- **Date-fns** for all date manipulations (formatting, parsing, calculations)
- **Consistent naming** for data models (use PascalCase for interfaces)

### Routing
- **React Router DOM** for all navigation
- **Route definitions** in `src/App.tsx`
- **Dynamic routes** should use URL parameters
- **404 handling** with the NotFound component

### Icons
- **Lucide React** for all icons
- **Import icons individually** (don't use the full library)
- **Consistent icon sizing** (h-4 w-4 for small, h-5 w-5 for medium, h-6 w-6 for large)

### Forms
- **React Hook Form** for all form handling
- **Zod** for validation schemas
- **Consistent form structure** with proper labels and accessibility
- **Real-time validation** using `useForm` hooks

### Data Persistence
- **localStorage** for client-side data persistence
- **Custom hooks** to abstract data operations
- **Type safety** for all stored data structures
- **Migration logic** for data structure changes

### Component Architecture
- **Small, focused components** (under 100 lines when possible)
- **Composition over inheritance** - use props and children
- **Consistent prop naming** (onX for handlers, value for data)
- **Proper TypeScript typing** for all component props

### Performance
- **React.memo** for expensive components
- **useCallback/useMemo** for expensive calculations
- **Lazy loading** for routes and components
- **Virtual scrolling** for large lists

### Testing
- **React Testing Library** for component tests
- **Jest** for unit tests
- **Playwright** for E2E tests
- **Test coverage** should be maintained above 80%

### Code Quality
- **ESLint** with React and TypeScript rules
- **Prettier** for consistent formatting
- **Type checking** on every commit
- **No console.log** in production code

### Security
- **Input validation** on all user inputs
- **XSS prevention** through proper escaping
- **CSRF protection** for form submissions
- **Secure storage** for sensitive data

### Accessibility
- **ARIA attributes** for complex components
- **Keyboard navigation** support
- **Screen reader compatibility**
- **Color contrast** compliance (WCAG 2.1 AA)
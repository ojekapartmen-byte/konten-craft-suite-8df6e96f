# Plan: Add TaskFlow Menu Link

The goal is to add a new menu item "TaskFlow" that links to `https://ebranxmels.lovable.app` in the desktop sidebar and mobile header.

## Current State Analysis

-   **Desktop Sidebar**: Defined in [Sidebar.tsx](file:///Users/febriromadon/Desktop/konten-craft-suite-8df6e96f/src/components/layout/Sidebar.tsx). It uses a local `navItems` array and `react-router-dom`'s `Link` for navigation.
-   **Mobile Header**: Defined in [MobileHeader.tsx](file:///Users/febriromadon/Desktop/konten-craft-suite-8df6e96f/src/components/layout/MobileHeader.tsx). It also uses a local `navItems` array and `Link` for navigation.
-   **Icons**: Both components use `lucide-react` icons.

## Proposed Changes

### 1. Update Navigation Items

In both [Sidebar.tsx](file:///Users/febriromadon/Desktop/konten-craft-suite-8df6e96f/src/components/layout/Sidebar.tsx) and [MobileHeader.tsx](file:///Users/febriromadon/Desktop/konten-craft-suite-8df6e96f/src/components/layout/MobileHeader.tsx):

-   Import the `Globe` icon from `lucide-react`.
-   Add a new item to the `navItems` array:
    ```typescript
    {
      icon: Globe,
      label: "TaskFlow",
      path: "https://ebranxmels.lovable.app",
      isExternal: true
    }
    ```

### 2. Update Component Logic

Modify the rendering logic in both components to handle external links.

#### Sidebar.tsx
-   Update the `.map()` function to check `item.isExternal`.
-   If `item.isExternal` is true, render an `<a>` tag with `target="_blank"` and `rel="noopener noreferrer"`.
-   Otherwise, continue using the `Link` component.

#### MobileHeader.tsx
-   Similarly, update the `.map()` function in the slide-down menu overlay to handle external links.

## Assumptions & Decisions

-   **Icon**: `Globe` will be used as requested.
-   **Label**: "TaskFlow" will be used as requested.
-   **Target**: The link will open in a new tab (`_blank`) for better UX since it's an external application.
-   **Position**: The new menu item will be placed at the end of the navigation list.

## Verification Steps

1.  **Desktop View**:
    -   Verify the "TaskFlow" item appears at the bottom of the sidebar.
    -   Verify the `Globe` icon is correctly displayed.
    -   Click the link and ensure it opens `https://ebranxmels.lovable.app` in a new tab.
2.  **Mobile View**:
    -   Verify the "TaskFlow" item appears in the mobile header dropdown menu.
    -   Verify the `Globe` icon is correctly displayed.
    -   Click the link and ensure it opens the correct URL in a new tab.

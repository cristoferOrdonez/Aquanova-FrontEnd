# Logout Implementation

This document outlines the changes made to implement the logout functionality in the Aquanova application.

## 1. `src/components/ui/Navbar.jsx`

- Imported the `authService` to handle the authentication logic.
- Modified the `handleLogout` function to call `authService.logout()` and redirect the user to the `/login` page using the `navigate` function from `react-router-dom`.

The implementation follows the existing modular structure of the application, ensuring that the authentication logic is centralized in the `authService`.

import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// 1. Define which routes are protected
// This checks the Home page ('/') and any route starting with '/workflow'
const isProtectedRoute = createRouteMatcher([
  '/', 
  '/workflow(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  // 2. If the incoming request matches a protected route...
  if (isProtectedRoute(req)) {
    // 3. ...STOP them and redirect to Sign In if they aren't logged in
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
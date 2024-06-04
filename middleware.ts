import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const protectedRoute = createRouteMatcher([
  '/connect/',
  '/connect/upcoming',
  '/connect/meeting(.*)',
  '/connect/previous',
  '/connect/recordings',
  '/connect/personal-room',
]);

export default clerkMiddleware((auth, req) => {
  if (protectedRoute(req)) auth().protect();
});

export const config = {
  matcher: ['/connect/((?!.+\\.[\\w]+$|_next).*)', '/connect/', '/connect/(api|trpc)(.*)'],
};

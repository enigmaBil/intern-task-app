import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

/**
 * Middleware NextAuth avec Keycloak
 * Protège les routes et gère l'authentification
 */
export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const isAuthPage = req.nextUrl.pathname.startsWith('/login') || 
                       req.nextUrl.pathname.startsWith('/register');

    // Si l'utilisateur est authentifié et sur une page de login
    if (isAuthPage) {
      if (isAuth) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      return null;
    }

    // Si l'utilisateur n'est pas authentifié et essaie d'accéder à une page protégée
    if (!isAuth && req.nextUrl.pathname !== '/') {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL(`/api/auth/signin?callbackUrl=${encodeURIComponent(from)}`, req.url)
      );
    }

    // Vérifier si le token a une erreur (ex: RefreshAccessTokenError)
    if (token?.error === 'RefreshAccessTokenError') {
      // Rediriger vers la page de connexion
      return NextResponse.redirect(new URL('/api/auth/signin', req.url));
    }
  },
  {
    callbacks: {
      authorized: () => true, // Laissons le middleware gérer la logique
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (NextAuth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.svg).*)',
  ],
};

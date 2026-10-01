import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const sessionToken = request.cookies.get('sessionToken')?.value;
    const { pathname } = request.nextUrl;

    // Protect Admin Routes
    if (pathname.startsWith('/admin')) {
        // Check for admin session or generic session + role check (simplified here)
        if (!sessionToken && !pathname.includes('/admin/login')) {
            return NextResponse.redirect(new URL('/admin/login', request.url));
        }
    }

    // Protect User Customer Profile
    if (pathname.startsWith('/profile')) {
        if (!sessionToken) {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/profile/:path*'],
};

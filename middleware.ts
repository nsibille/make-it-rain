import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Rafraîchit la session Supabase à chaque navigation.
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Toutes les routes SAUF les assets statiques :
     * _next/static, _next/image, favicon, et fichiers image.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

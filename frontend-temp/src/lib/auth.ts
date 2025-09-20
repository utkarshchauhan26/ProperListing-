import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"

export async function getAuthSession() {
  return await getServerSession(authOptions)
}

export { authOptions }

import { checkAdminAuth } from "./actions"
import AdminLogin from "./admin-login"
import AdminDashboard from "./admin-dashboard"

export default async function AdminPage() {
  const isAuthenticated = await checkAdminAuth()

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-blue-50 to-pink-50 dark:from-black dark:via-black dark:to-black/90 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
          ABC StoryMaker Admin
        </h1>

        {isAuthenticated ? <AdminDashboard /> : <AdminLogin />}
      </div>
    </div>
  )
}


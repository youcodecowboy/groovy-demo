// Mock user type for development
interface User {
  id: string
  emailAddresses: { emailAddress: string }[]
  firstName: string
  lastName: string
  fullName: string
  imageUrl: string
  createdAt: Date
  updatedAt: Date
}

// Mock user for server-side auth checks
const mockUser: User = {
  id: "mock-user-123",
  emailAddresses: [{ emailAddress: "dev@example.com" }],
  firstName: "Developer",
  lastName: "User",
  fullName: "Developer User",
  imageUrl: "/placeholder-user.jpg",
  createdAt: new Date(),
  updatedAt: new Date(),
}

export async function currentUser(): Promise<User | null> {
  // Return mock user for development
  return mockUser
}

export function isAdminUser(user: User | null): boolean {
  // For development, always return true
  return true
}



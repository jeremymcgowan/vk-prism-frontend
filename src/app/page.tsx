import { redirect } from 'next/navigation'

export default function RootPage() {
  // Instantly push root traffic to dashboard, triggering the middleware auth wall
  redirect('/dashboard')
}
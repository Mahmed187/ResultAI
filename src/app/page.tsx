import { redirect } from 'next/navigation'

export default function HomePage() {
  // Server-side redirect for better performance
  redirect('/home')
} 
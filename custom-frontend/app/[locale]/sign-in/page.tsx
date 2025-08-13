import { AmbientColor } from "@/components/decorations/ambient-color";
import { Login } from "@/components/login";
import { redirect } from 'next/navigation';
import { getServerSideUserWithSession } from '@/lib/auth-session';

export default async function LoginPage() {
  // Check if user is already authenticated
  const user = await getServerSideUserWithSession();
  
  if (user) {
    // User is already logged in, redirect to dashboard
    redirect('/dashboard');
  }

  return (
    <div className="relative overflow-hidden">
      <AmbientColor />
      <Login />
    </div>
  );
} 
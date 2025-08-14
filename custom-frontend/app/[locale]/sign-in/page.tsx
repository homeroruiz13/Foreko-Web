import { AmbientColor } from "@/components/decorations/ambient-color";
import { Login } from "@/components/login";
import { redirect } from 'next/navigation';
import { getServerSideUserWithSession } from '@/lib/auth-session';

export default async function LoginPage({ searchParams }: { searchParams: { force?: string } }) {
  // Check if user is already authenticated (but allow forced login page)
  const user = await getServerSideUserWithSession();
  
  if (user && !searchParams.force) {
    // User is already logged in, redirect to dashboard
    redirect('/dashboard/default');
  }

  return (
    <div className="relative overflow-hidden">
      <AmbientColor />
      <Login />
    </div>
  );
} 
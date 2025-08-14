import { AmbientColor } from "@/components/decorations/ambient-color";
import { Login } from "@/components/login";
import { redirect } from 'next/navigation';
import { getServerSideUserWithSession } from '@/lib/auth-session';

export default async function LoginPage({ searchParams }: { searchParams: { force?: string } }) {
  // If force parameter is present, we're coming from a logout - don't check auth
  if (searchParams.force) {
    return (
      <div className="relative overflow-hidden">
        <AmbientColor />
        <Login forceLogout={true} />
      </div>
    );
  }
  
  // Check if user is already authenticated
  const user = await getServerSideUserWithSession();
  
  if (user) {
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
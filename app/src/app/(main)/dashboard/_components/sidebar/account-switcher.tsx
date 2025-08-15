"use client";

import { useState, useEffect } from "react";

import { BadgeCheck, Bell, CreditCard, LogOut } from "lucide-react";
import { useAuth } from "@/components/auth-handler";
import { clearAllAuthAndRedirect } from "@/lib/auth";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { cn, getInitials } from "@/lib/utils";

export function AccountSwitcher() {
  const authData = useAuth();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLogout = async () => {
    try {
      // Call the main app's logout API to clear server-side session first
      const mainAppUrl = process.env.NEXT_PUBLIC_MAIN_APP_URL || 'http://localhost:3000';
      await fetch(`${mainAppUrl}/api/auth/logout`, { 
        method: 'POST',
        credentials: 'include' // Include cookies for cross-origin request
      });
    } catch (error) {
      console.error('Error calling logout API:', error);
    } finally {
      // Always clear all auth and redirect with force parameter
      clearAllAuthAndRedirect();
    }
  };

  // Don't render until client-side hydration is complete
  if (!isClient || !authData) {
    return (
      <Avatar className="size-9 rounded-lg">
        <AvatarFallback className="rounded-lg">U</AvatarFallback>
      </Avatar>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-9 rounded-lg">
          <AvatarImage src={undefined} alt={authData.name} />
          <AvatarFallback className="rounded-lg">{getInitials(authData.name)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-56 space-y-1 rounded-lg" side="bottom" align="end" sideOffset={4}>
        <div className="flex w-full items-center justify-between gap-2 px-1 py-1.5">
          <Avatar className="size-9 rounded-lg">
            <AvatarImage src={undefined} alt={authData.name} />
            <AvatarFallback className="rounded-lg">{getInitials(authData.name)}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{authData.name}</span>
            <span className="truncate text-xs text-muted-foreground">{authData.email}</span>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <BadgeCheck />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <CreditCard />
            Billing
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Bell />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

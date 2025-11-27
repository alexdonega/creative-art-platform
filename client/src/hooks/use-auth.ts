import { useQuery, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/lib/auth";

export function useAuth() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: () => authService.getCurrentUser(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn: async (email: string, password: string) => {
      await authService.signIn(email, password);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    signUp: async (email: string, password: string) => {
      await authService.signUp(email, password);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    signOut: async () => {
      await authService.signOut();
      queryClient.setQueryData(["/api/auth/user"], null);
    },
  };
}

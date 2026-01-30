import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '../hooks/useFrameworkReady';
import { supabase } from '../lib/supabase';
import * as Linking from 'expo-linking';

import { useRootNavigationState } from 'expo-router';

export default function RootLayout() {
  useFrameworkReady();
  const router = useRouter();
  const segments = useSegments();
  const rootNavigationState = useRootNavigationState();

  // Navigate to splash on first load
  useEffect(() => {
    if (!rootNavigationState?.key) return;

    // Ensure navigation is ready by pushing to next tick
    const timer = setTimeout(() => {
      router.replace('/splash');
    }, 0);

    return () => clearTimeout(timer);
  }, [rootNavigationState?.key]);

  useEffect(() => {
    const handleUrl = async (event: { url: string }) => {
      const url = event.url;

      if (url.includes('access_token') || url.includes('#access_token')) {
        const params = new URLSearchParams(
          url.split('#')[1] || url.split('?')[1],
        );
        const access_token = params.get('access_token');
        const refresh_token = params.get('refresh_token');

        if (access_token && refresh_token) {
          await supabase.auth.setSession({
            access_token,
            refresh_token,
          });

          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user) {
            const { data: profile } = await supabase
              .from('user_profiles')
              .select('role')
              .eq('user_id', user.id)
              .maybeSingle();

            if (
              profile?.role === 'specialist' ||
              profile?.role === 'public_health'
            ) {
              router.replace('/specialist');
            } else if (profile?.role) {
              router.replace('/patient/(tabs)');
            } else {
              router.replace('/select-role');
            }
          }
        }
      }
    };

    const subscription = Linking.addEventListener('url', handleUrl);

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleUrl({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (
          profile?.role === 'specialist' ||
          profile?.role === 'public_health'
        ) {
          router.replace('/specialist');
        } else if (profile?.role) {
          router.replace('/patient/(tabs)');
        } else if (!segments.some((segment) => segment === 'select-role')) {
          router.replace('/select-role');
        }
      } else if (event === 'SIGNED_OUT') {
        router.replace('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, segments]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="splash" />
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="select-role" />
        <Stack.Screen name="patient" />
        <Stack.Screen name="specialist" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

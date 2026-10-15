create or replace function public.meltec_is_admin() returns boolean language sql stable security invoker set search_path = '' as $$ select meltec_private.is_admin() $$;
revoke all on function public.meltec_is_admin() from public, anon;
grant execute on function public.meltec_is_admin() to authenticated;
create schema if not exists meltec_private;
revoke all on schema meltec_private from public;
grant usage on schema meltec_private to anon, authenticated;
create table meltec_private.admins(email text primary key);
alter table meltec_private.admins enable row level security;
create table public.meltec_records(
 id text primary key,
 kind text not null check(kind in ('products','staff','clients','orders','groups','settings')),
 data jsonb not null check(jsonb_typeof(data)='object'),
 created_by uuid references auth.users(id) on delete set null default auth.uid(),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint product_no_cost check(kind <> 'products' or not(data ? 'cost'))
);
create index meltec_records_kind_idx on public.meltec_records(kind);
create index meltec_records_created_by_idx on public.meltec_records(created_by);
create unique index meltec_staff_email_unique on public.meltec_records(lower(data->>'email')) where kind='staff';
create unique index meltec_single_settings on public.meltec_records(kind) where kind='settings';
create table public.meltec_product_costs(product_id text primary key references public.meltec_records(id) on delete cascade,cost numeric(14,2) not null default 0 check(cost>=0));
alter table public.meltec_records enable row level security;
alter table public.meltec_product_costs enable row level security;
create function meltec_private.is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(select 1 from meltec_private.admins where email=lower(auth.jwt()->>'email'));
$$;
create function meltec_private.staff_id() returns text language sql stable security definer set search_path='' as $$
 select id from public.meltec_records where auth.uid() is not null and kind='staff' and lower(data->>'email')=lower(auth.jwt()->>'email') and coalesce((data->>'active')::boolean,true) limit 1;
$$;
revoke all on function meltec_private.is_admin() from public;
revoke all on function meltec_private.staff_id() from public;
grant execute on function meltec_private.is_admin() to anon,authenticated;
grant execute on function meltec_private.staff_id() to authenticated;
create policy records_public_read on public.meltec_records for select to anon,authenticated using(kind='settings' or (kind='products' and coalesce((data->>'published')::boolean,true)));
create policy records_admin_read on public.meltec_records for select to authenticated using((select meltec_private.is_admin()));
create policy records_staff_read on public.meltec_records for select to authenticated using((select meltec_private.staff_id()) is not null and (kind='products' or (kind='staff' and id=(select meltec_private.staff_id())) or (kind='orders' and data->>'assignedTo'=(select meltec_private.staff_id()))));
create policy records_admin_insert on public.meltec_records for insert to authenticated with check((select meltec_private.is_admin()));
create policy records_admin_update on public.meltec_records for update to authenticated using((select meltec_private.is_admin())) with check((select meltec_private.is_admin()));
create policy records_admin_delete on public.meltec_records for delete to authenticated using((select meltec_private.is_admin()));
create policy records_staff_insert on public.meltec_records for insert to authenticated with check(kind='products' and (select meltec_private.staff_id()) is not null and created_by=(select auth.uid()));
create policy records_staff_update on public.meltec_records for update to authenticated using((select meltec_private.staff_id()) is not null and ((kind='products' and created_by=(select auth.uid())) or (kind='orders' and data->>'assignedTo'=(select meltec_private.staff_id())))) with check((select meltec_private.staff_id()) is not null and ((kind='products' and created_by=(select auth.uid())) or (kind='orders' and data->>'assignedTo'=(select meltec_private.staff_id()))));
create policy costs_admin on public.meltec_product_costs for all to authenticated using((select meltec_private.is_admin())) with check((select meltec_private.is_admin()));
grant select on public.meltec_records to anon;
grant select,insert,update,delete on public.meltec_records to authenticated;
grant select,insert,update,delete on public.meltec_product_costs to authenticated;
create function meltec_private.guard_record() returns trigger language plpgsql security invoker set search_path='' as $$
 begin
 new.updated_at=now();
 if current_user in ('postgres','supabase_admin') and auth.uid() is null then return new; end if;
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if meltec_private.is_admin() then return new; end if;
 if meltec_private.staff_id() is null then raise exception 'Staff membership required'; end if;
 if tg_op='UPDATE' and (new.id<>old.id or new.kind<>old.kind or new.created_by is distinct from old.created_by) then raise exception 'Identity fields are immutable'; end if;
 if new.kind='orders' and tg_op='UPDATE' then
  if (new.data-array['status','notes','updatedAt']) is distinct from (old.data-array['status','notes','updatedAt']) then raise exception 'Only status and notes may be updated'; end if;
  if new.data->>'status' not in ('Recebido','Em diagnóstico','Aguardando aprovação','Em manutenção','Pronto para retirada','Entregue') then raise exception 'Invalid status'; end if;
 elsif new.kind='products' then
  if (new.data-array['name','sku','category','price','stock','image','description','published','featured','isDemo','createdAt','updatedAt','createdBy'])<>'{}'::jsonb then raise exception 'Invalid product fields'; end if;
  if new.data->>'createdBy' is distinct from meltec_private.staff_id() then raise exception 'Product owner mismatch'; end if;
  if nullif(trim(new.data->>'name'),'') is null or (new.data->>'price')::numeric<0 or (new.data->>'stock')::numeric<0 then raise exception 'Invalid product'; end if;
 else raise exception 'Not authorized';
 end if;
 return new;
 end;
$$;
revoke all on function meltec_private.guard_record() from public;
grant execute on function meltec_private.guard_record() to authenticated;
create trigger guard_meltec_record before insert or update on public.meltec_records for each row execute function meltec_private.guard_record();
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('meltec-catalog','meltec-catalog',true,5242880,array['image/png','image/jpeg','image/webp']) on conflict(id) do nothing;
create policy meltec_images_insert on storage.objects for insert to authenticated with check(bucket_id='meltec-catalog' and (select auth.uid())::text=(storage.foldername(name))[1] and ((select meltec_private.is_admin()) or (select meltec_private.staff_id()) is not null));

create policy admins_no_direct_access on meltec_private.admins for all to anon,authenticated using(false) with check(false);
revoke all on function public.rls_auto_enable() from public,anon,authenticated;
revoke execute on function meltec_private.is_admin() from anon;
revoke usage on schema meltec_private from anon;
-- Configure the administrator email privately in meltec_private.admins; never commit it.

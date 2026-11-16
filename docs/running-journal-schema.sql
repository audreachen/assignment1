create table public.journey_run_entries (
id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
album_title text not null check (length(album_title) between 1 and 200),
status text not null check (status in ('Want to try','Ran with it','Would run with again')),
run_date date, minutes integer check(minutes between 1 and 600), note text not null default '' check(length(note)<=1000),
created_at timestamptz not null default now(), unique(user_id,album_title));
alter table public.journey_run_entries enable row level security;
grant select,insert,update on public.journey_run_entries to authenticated;
create policy own_runs_select on public.journey_run_entries for select to authenticated using ((select auth.uid())=user_id);
create policy own_runs_insert on public.journey_run_entries for insert to authenticated with check ((select auth.uid())=user_id);
create policy own_runs_update on public.journey_run_entries for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy own_generation_requests on public.generation_requests for select to authenticated using ((select auth.uid())=user_id);
create table public.journey_media_ratings (
id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
request_id uuid not null references public.generation_requests(id), map_title text not null, map_description text not null,
energy integer[] not null check(cardinality(energy)=10), rating smallint not null check(rating between 1 and 5),
created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id,request_id));
alter table public.journey_media_ratings enable row level security;
grant select,insert,update on public.journey_media_ratings to authenticated;
create policy own_ratings_select on public.journey_media_ratings for select to authenticated using ((select auth.uid())=user_id);
create policy own_ratings_insert on public.journey_media_ratings for insert to authenticated with check ((select auth.uid())=user_id and exists(select 1 from public.generation_requests r where r.id=request_id and r.user_id=(select auth.uid()) and r.status='succeeded'));
create policy own_ratings_update on public.journey_media_ratings for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id and exists(select 1 from public.generation_requests r where r.id=request_id and r.user_id=(select auth.uid()) and r.status='succeeded'));

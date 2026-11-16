create table public.album_runner_recommendations (
id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
album_title text not null check(length(album_title) between 1 and 200), byline text not null check(length(trim(byline)) between 1 and 40),
comment text not null check(length(trim(comment)) between 10 and 1000), is_public boolean not null default true,
created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id,album_title));
alter table public.album_runner_recommendations enable row level security;
grant select on public.album_runner_recommendations to anon;
grant select,insert,update on public.album_runner_recommendations to authenticated;
create policy public_runner_recommendations on public.album_runner_recommendations for select to anon,authenticated using (is_public or user_id=(select auth.uid()));
create policy own_recommendation_insert on public.album_runner_recommendations for insert to authenticated with check(user_id=(select auth.uid()));
create policy own_recommendation_update on public.album_runner_recommendations for update to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create index album_runner_recommendations_feed on public.album_runner_recommendations (created_at desc) where is_public;

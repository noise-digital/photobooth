-- Tempel SELURUH isi file ini di Supabase > SQL Editor > Run
create table weddings(id text primary key,groom_name text,bride_name text,wedding_date date,cover_image text,theme text default 'default',status text default 'on',created_at timestamptz default now());
create table frames(id uuid primary key default gen_random_uuid(),wedding_id text default '',name text,category text,image_url text,photo_slots int,slot_coordinates jsonb,width int,height int,status text default 'on',created_at timestamptz default now());
create table photos(id uuid primary key,wedding_id text not null,frame_id text,image_url text not null,audio_url text default '',created_at timestamptz default now());
create table audios(id uuid primary key default gen_random_uuid(),wedding_id text,photo_id uuid,audio_url text,duration int,created_at timestamptz default now());
create table settings(id text primary key,brand text,max_audio int,quality numeric);
create table admins(user_id uuid primary key references auth.users(id) on delete cascade);

create function is_admin() returns boolean language sql security definer set search_path=public stable as $$select exists(select 1 from admins where user_id=auth.uid())$$;

alter table weddings enable row level security;alter table frames enable row level security;alter table photos enable row level security;
alter table audios enable row level security;alter table settings enable row level security;alter table admins enable row level security;

create policy r on weddings for select using(true);create policy a on weddings for all using(is_admin()) with check(is_admin());
create policy r on frames for select using(true);create policy a on frames for all using(is_admin()) with check(is_admin());
create policy r on settings for select using(true);create policy a on settings for all using(is_admin()) with check(is_admin());
create policy me on admins for select using(user_id=auth.uid());
-- tamu hanya boleh MENAMBAH foto/audio; daftar & hapus hanya admin
create policy g on photos for insert to anon,authenticated with check(length(image_url)<1000);
create policy a on photos for all using(is_admin()) with check(is_admin());
create policy g on audios for insert to anon,authenticated with check(true);
create policy a on audios for all using(is_admin()) with check(is_admin());

-- halaman kenangan: ambil 1 foto berdasarkan ID (tanpa membuka daftar semua foto)
create function get_photo(pid uuid) returns table(image_url text,audio_url text) language sql security definer set search_path=public as $$select image_url,audio_url from photos where id=pid$$;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('media','media',true,8388608,
 array['image/jpeg','image/png','audio/webm','audio/mp4','audio/ogg','audio/mpeg','audio/x-m4a']) on conflict(id) do nothing;
create policy "tamu upload" on storage.objects for insert to anon,authenticated with check(bucket_id='media' and (storage.foldername(name))[1] in ('photos','audio'));
create policy "admin semua" on storage.objects for all to authenticated using(bucket_id='media' and is_admin()) with check(bucket_id='media' and is_admin());

create table public.captions (
  id uuid not null default gen_random_uuid (),
  created_datetime_utc timestamp with time zone not null default now(),
  modified_datetime_utc timestamp with time zone not null default now(),
  content character varying null,
  is_public boolean not null,
  profile_id uuid not null,
  image_id uuid not null,
  humor_flavor_id bigint null,
  is_featured boolean not null default false,
  caption_request_id bigint null,
  like_count bigint not null default '0'::bigint,
  llm_prompt_chain_id bigint null,
  created_by_user_id uuid not null default auth.uid (),
  modified_by_user_id uuid not null default auth.uid (),
  constraint captions_pkey primary key (id),
  constraint captions_created_by_user_id_fkey foreign KEY (created_by_user_id) references profiles (id) on delete set null,
  constraint captions_humor_flavor_id_fkey foreign KEY (humor_flavor_id) references humor_flavors (id) on delete set null,
  constraint captions_image_id_fkey foreign KEY (image_id) references images (id) on delete CASCADE,
  constraint captions_llm_prompt_chain_id_fkey foreign KEY (llm_prompt_chain_id) references llm_prompt_chains (id) on delete CASCADE,
  constraint captions_modified_by_user_id_fkey foreign KEY (modified_by_user_id) references profiles (id) on delete set null,
  constraint captions_caption_request_id_fkey foreign KEY (caption_request_id) references caption_requests (id) on update CASCADE on delete CASCADE,
  constraint captions_profile_id_fkey foreign KEY (profile_id) references profiles (id) on delete set null
) TABLESPACE pg_default;

create index IF not exists idx_captions_image_id on public.captions using btree (image_id) TABLESPACE pg_default;

create index IF not exists idx_captions_like_count_desc_id on public.captions using btree (like_count desc, id) TABLESPACE pg_default;

create index IF not exists captions_image_id_idx on public.captions using btree (image_id) TABLESPACE pg_default;

create trigger set_created_and_modified_by_user_ids_before_write BEFORE INSERT
or
update on captions for EACH row
execute FUNCTION set_created_and_modified_by_user_ids ();

create trigger set_modified_datetime_utc_before_update BEFORE
update on captions for EACH row
execute FUNCTION set_modified_datetime_utc ();

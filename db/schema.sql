-- Reference schema for a future Supabase/Postgres adapter. NOT applied by this
-- demo. Requires auth.users, auth.uid(), roles authenticated and service_role.
-- Production API remains disabled until identity + transactions + RLS are tested.
begin;
create schema if not exists ifagrithm;
revoke all on schema ifagrithm from public;
grant usage on schema ifagrithm to authenticated, service_role;

create table ifagrithm.profiles (
 id uuid primary key references auth.users(id), display_name text not null,
 created_at timestamptz not null default now()
);
create table ifagrithm.account_roles (
 user_id uuid not null references ifagrithm.profiles(id),
 role text not null check(role in ('creator','founder','admin')),
 primary key(user_id,role)
);
create table ifagrithm.organisations (
 id uuid primary key default gen_random_uuid(), name text not null,
 website text not null, work_email text not null, description text not null,
 social_account text not null, created_at timestamptz not null default now()
);
create table ifagrithm.organisation_members (
 organisation_id uuid not null references ifagrithm.organisations(id),
 user_id uuid not null references ifagrithm.profiles(id),
 member_role text not null check(member_role in ('owner','member')),
 primary key(organisation_id,user_id)
);
create table ifagrithm.founder_applications (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references ifagrithm.profiles(id),
 organisation_id uuid not null references ifagrithm.organisations(id),
 approval_status text not null default 'pending' check(approval_status in ('pending','approved','rejected','suspended','revoked')),
 submitted_at timestamptz not null default now(), unique(user_id,organisation_id)
);
create table ifagrithm.approval_history (
 id uuid primary key default gen_random_uuid(), application_id uuid not null references ifagrithm.founder_applications(id),
 actor_id uuid not null references ifagrithm.profiles(id), action text not null,
 internal_note text not null, created_at timestamptz not null default now()
);

create function ifagrithm.is_admin() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from ifagrithm.account_roles where user_id=auth.uid() and role='admin');
$$;
create function ifagrithm.can_access_org(target uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(
  select 1 from ifagrithm.organisation_members m
  join ifagrithm.founder_applications a on a.user_id=m.user_id and a.organisation_id=m.organisation_id
  join ifagrithm.account_roles r on r.user_id=m.user_id and r.role='founder'
  where m.user_id=auth.uid() and m.organisation_id=target and a.approval_status='approved'
 );
$$;
revoke all on function ifagrithm.is_admin(),ifagrithm.can_access_org(uuid) from public;
grant execute on function ifagrithm.is_admin(),ifagrithm.can_access_org(uuid) to authenticated,service_role;

create table ifagrithm.campaigns (
 id uuid primary key default gen_random_uuid(), organisation_id uuid not null references ifagrithm.organisations(id),
 title text not null, objective text not null, eligibility jsonb not null,
 model text not null check(model in ('points_pool','fixed_per_qualified_referral','team_assessed_token_contributor_rewards')),
 rules jsonb not null, budget_cents bigint not null check(budget_cents>0), currency text not null default 'USD',
 start_at timestamptz not null, end_at timestamptz not null check(end_at>start_at),
 status text not null default 'draft' check(status in ('draft','pending_review','approved','rejected','live','paused','closed','finalised')),
 published boolean not null default false, specification_version integer not null default 1,
 unique(id,organisation_id)
);
create table ifagrithm.attributions (
 campaign_id uuid not null, organisation_id uuid not null, customer_id text not null,
 creator_id uuid not null references ifagrithm.profiles(id),
 primary key(campaign_id,customer_id), unique(campaign_id,organisation_id,customer_id,creator_id),
 foreign key(campaign_id,organisation_id) references ifagrithm.campaigns(id,organisation_id)
);
create table ifagrithm.product_events (
 id uuid primary key default gen_random_uuid(), campaign_id uuid not null, organisation_id uuid not null,
 customer_id text not null, creator_id uuid not null, source_event_id text not null,
 product_event text not null check(product_event in ('visit','signup','activation','deposit','volume','retention')),
 amount numeric(20,6) not null check(amount>0),
 verification_status text not null default 'pending' check(verification_status in ('pending','verified','rejected')),
 occurred_at timestamptz not null, received_at timestamptz not null default now(),
 unique(organisation_id,source_event_id),
 check(product_event='volume' or amount=1),
 foreign key(campaign_id,organisation_id,customer_id,creator_id) references ifagrithm.attributions(campaign_id,organisation_id,customer_id,creator_id)
);
create unique index one_customer_milestone on ifagrithm.product_events(campaign_id,customer_id,product_event)
 where product_event<>'volume' and verification_status<>'rejected';
create table ifagrithm.reward_ledger (
 id uuid primary key default gen_random_uuid(), campaign_id uuid not null, organisation_id uuid not null,
 creator_id uuid not null references ifagrithm.profiles(id), specification_version integer not null,
 points numeric(20,4) not null check(points>=0), allocation_cents bigint not null check(allocation_cents>=0),
 status text not null check(status in ('estimated','finalised')), finalised_at timestamptz,
 unique(campaign_id,creator_id,specification_version),
 foreign key(campaign_id,organisation_id) references ifagrithm.campaigns(id,organisation_id)
);
create table ifagrithm.team_invitations (
 id uuid primary key default gen_random_uuid(), organisation_id uuid not null references ifagrithm.organisations(id),
 email text not null, status text not null default 'pending_identity_verification',
 created_at timestamptz not null default now()
);

alter table ifagrithm.profiles enable row level security;
alter table ifagrithm.account_roles enable row level security;
alter table ifagrithm.organisations enable row level security;
alter table ifagrithm.organisation_members enable row level security;
alter table ifagrithm.founder_applications enable row level security;
alter table ifagrithm.approval_history enable row level security;
alter table ifagrithm.campaigns enable row level security;
alter table ifagrithm.attributions enable row level security;
alter table ifagrithm.product_events enable row level security;
alter table ifagrithm.reward_ledger enable row level security;
alter table ifagrithm.team_invitations enable row level security;

create policy profile_own on ifagrithm.profiles for select to authenticated using(id=auth.uid() or ifagrithm.is_admin());
create policy role_own on ifagrithm.account_roles for select to authenticated using(user_id=auth.uid() or ifagrithm.is_admin());
create policy org_approved on ifagrithm.organisations for select to authenticated using(ifagrithm.can_access_org(id) or ifagrithm.is_admin());
create policy member_scoped on ifagrithm.organisation_members for select to authenticated using(user_id=auth.uid() or ifagrithm.can_access_org(organisation_id) or ifagrithm.is_admin());
create policy application_own on ifagrithm.founder_applications for select to authenticated using(user_id=auth.uid() or ifagrithm.is_admin());
create policy review_admin on ifagrithm.approval_history for select to authenticated using(ifagrithm.is_admin());
create policy campaign_approved on ifagrithm.campaigns for select to authenticated using(ifagrithm.can_access_org(organisation_id) or ifagrithm.is_admin());
create policy attribution_scoped on ifagrithm.attributions for select to authenticated using(creator_id=auth.uid() or ifagrithm.can_access_org(organisation_id) or ifagrithm.is_admin());
create policy events_scoped on ifagrithm.product_events for select to authenticated using(creator_id=auth.uid() or ifagrithm.can_access_org(organisation_id) or ifagrithm.is_admin());
create policy ledger_scoped on ifagrithm.reward_ledger for select to authenticated using(creator_id=auth.uid() or ifagrithm.can_access_org(organisation_id) or ifagrithm.is_admin());
create policy invites_scoped on ifagrithm.team_invitations for select to authenticated using(ifagrithm.can_access_org(organisation_id) or ifagrithm.is_admin());

-- Browser identities receive read-only, policy-filtered access. Writes, approval
-- transitions and role assignment have no authenticated policies or write grants.
-- A future server adapter must authorise each write and use transactions; never
-- expose a service_role key. Published creator campaign briefs are API projections.
grant select on all tables in schema ifagrithm to authenticated;
grant all on all tables in schema ifagrithm to service_role;
commit;

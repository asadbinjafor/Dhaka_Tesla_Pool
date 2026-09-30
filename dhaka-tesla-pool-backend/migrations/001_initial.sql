CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE CHECK (email = lower(btrim(email)) AND length(email) BETWEEN 3 AND 254),
  display_name text NOT NULL CHECK (length(btrim(display_name)) BETWEEN 1 AND 100),
  password_hash text NOT NULL,
  role text NOT NULL CHECK (role IN ('PASSENGER','DRIVER')),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  UNIQUE (id, role)
);
CREATE TABLE sessions (
  token_hash text PRIMARY KEY CHECK (length(token_hash)=64),
  user_id uuid REFERENCES users(id) ON DELETE RESTRICT,
  csrf_token text NOT NULL CHECK (length(csrf_token)>=64),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CHECK (expires_at > created_at)
);
CREATE INDEX sessions_expiry_idx ON sessions(expires_at);
CREATE TABLE driver_profiles (
  user_id uuid PRIMARY KEY,
  role text NOT NULL DEFAULT 'DRIVER' CHECK (role='DRIVER'),
  online boolean NOT NULL DEFAULT false,
  FOREIGN KEY (user_id,role) REFERENCES users(id,role) ON DELETE RESTRICT
);
CREATE TABLE vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id uuid NOT NULL UNIQUE REFERENCES driver_profiles(user_id) ON DELETE RESTRICT,
  display_name text NOT NULL CHECK (length(display_name) BETWEEN 1 AND 100),
  capacity integer NOT NULL CHECK (capacity=3),
  UNIQUE(id,driver_id)
);
CREATE TABLE zones (id text PRIMARY KEY, label_en text NOT NULL, label_bn text NOT NULL);
CREATE TABLE route_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pickup_id text NOT NULL REFERENCES zones(id), destination_id text NOT NULL REFERENCES zones(id),
  group_id text NOT NULL, group_version integer NOT NULL CHECK(group_version>0),
  demo_distance_m integer NOT NULL CHECK(demo_distance_m>0 AND demo_distance_m%1000=0),
  base_poysha integer NOT NULL CHECK(base_poysha>=0), rate_poysha integer NOT NULL CHECK(rate_poysha>=0),
  discount_poysha integer NOT NULL CHECK(discount_poysha>=0 AND discount_poysha<=base_poysha),
  policy_version text NOT NULL, active boolean NOT NULL DEFAULT true,
  CHECK(pickup_id<>destination_id)
);
CREATE UNIQUE INDEX route_active_idx ON route_rules(pickup_id,destination_id) WHERE active;
CREATE TABLE fare_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), owner_id uuid NOT NULL REFERENCES users(id),
  route_id uuid NOT NULL REFERENCES route_rules(id),
  pickup_id text NOT NULL REFERENCES zones(id), destination_id text NOT NULL REFERENCES zones(id),
  group_id text NOT NULL, group_version integer NOT NULL CHECK(group_version>0),
  seats integer NOT NULL CHECK(seats BETWEEN 1 AND 3),
  demo_distance_m integer NOT NULL CHECK(demo_distance_m>0 AND demo_distance_m%1000=0),
  base_poysha integer NOT NULL CHECK(base_poysha>=0), rate_poysha integer NOT NULL CHECK(rate_poysha>=0),
  discount_poysha integer NOT NULL CHECK(discount_poysha>=0 AND discount_poysha<=base_poysha),
  policy_version text NOT NULL, currency text NOT NULL DEFAULT 'BDT' CHECK(currency='BDT'),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(), expires_at timestamptz NOT NULL,
  UNIQUE(id,owner_id), CHECK(expires_at>created_at), CHECK(pickup_id<>destination_id)
);
CREATE INDEX quote_expiry_idx ON fare_quotes(expires_at);
CREATE TABLE ride_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), passenger_id uuid NOT NULL REFERENCES users(id),
  quote_id uuid NOT NULL UNIQUE, booking_snapshot jsonb NOT NULL CHECK(jsonb_typeof(booking_snapshot)='object'),
  pickup_id text NOT NULL REFERENCES zones(id), destination_id text NOT NULL REFERENCES zones(id),
  group_id text NOT NULL, group_version integer NOT NULL CHECK(group_version>0),
  seats integer NOT NULL CHECK(seats BETWEEN 1 AND 3),
  status text NOT NULL CHECK(status IN ('REQUESTED','MATCHED','DRIVER_ARRIVED','STARTED','COMPLETED','CANCELLED')),
  version integer NOT NULL DEFAULT 1 CHECK(version>0),
  final_fare_snapshot jsonb, finalized_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(), matched_at timestamptz, arrived_at timestamptz,
  started_at timestamptz, completed_at timestamptz, cancelled_at timestamptz, cancellation_reason text,
  ended_at timestamptz GENERATED ALWAYS AS (COALESCE(completed_at,cancelled_at)) STORED,
  FOREIGN KEY(quote_id,passenger_id) REFERENCES fare_quotes(id,owner_id) ON DELETE RESTRICT,
  CHECK(pickup_id<>destination_id),
  CHECK((final_fare_snapshot IS NULL)=(finalized_at IS NULL)),
  CHECK(status NOT IN ('DRIVER_ARRIVED','STARTED','COMPLETED') OR final_fare_snapshot IS NOT NULL),
  CHECK((status='COMPLETED' AND completed_at IS NOT NULL AND cancelled_at IS NULL) OR
        (status='CANCELLED' AND cancelled_at IS NOT NULL AND completed_at IS NULL) OR
        (status NOT IN ('COMPLETED','CANCELLED') AND completed_at IS NULL AND cancelled_at IS NULL))
);
CREATE UNIQUE INDEX passenger_active_idx ON ride_requests(passenger_id) WHERE status IN ('REQUESTED','MATCHED','DRIVER_ARRIVED','STARTED');
CREATE INDEX passenger_history_idx ON ride_requests(passenger_id,ended_at DESC,id DESC) WHERE ended_at IS NOT NULL;
CREATE INDEX dispatch_idx ON ride_requests(group_id,group_version,pickup_id,created_at,id) WHERE status='REQUESTED';
CREATE TABLE pools (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), driver_id uuid NOT NULL REFERENCES driver_profiles(user_id),
  vehicle_id uuid NOT NULL, pickup_id text NOT NULL REFERENCES zones(id), group_id text NOT NULL,
  group_version integer NOT NULL CHECK(group_version>0), capacity_snapshot integer NOT NULL CHECK(capacity_snapshot=3),
  status text NOT NULL CHECK(status IN ('ACCEPTED','DRIVER_ARRIVED','STARTED','COMPLETED','CANCELLED')),
  version integer NOT NULL DEFAULT 1 CHECK(version>0),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(), arrived_at timestamptz, started_at timestamptz,
  completed_at timestamptz, cancelled_at timestamptz, cancellation_reason text,
  ended_at timestamptz GENERATED ALWAYS AS (COALESCE(completed_at,cancelled_at)) STORED,
  FOREIGN KEY(vehicle_id,driver_id) REFERENCES vehicles(id,driver_id) ON DELETE RESTRICT,
  CHECK((status='COMPLETED' AND completed_at IS NOT NULL AND cancelled_at IS NULL) OR
        (status='CANCELLED' AND cancelled_at IS NOT NULL AND completed_at IS NULL) OR
        (status NOT IN ('COMPLETED','CANCELLED') AND completed_at IS NULL AND cancelled_at IS NULL))
);
CREATE UNIQUE INDEX driver_active_idx ON pools(driver_id) WHERE status IN ('ACCEPTED','DRIVER_ARRIVED','STARTED');
CREATE UNIQUE INDEX vehicle_active_idx ON pools(vehicle_id) WHERE status IN ('ACCEPTED','DRIVER_ARRIVED','STARTED');
CREATE INDEX driver_history_idx ON pools(driver_id,ended_at DESC,id DESC) WHERE ended_at IS NOT NULL;
CREATE TABLE pool_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), pool_id uuid NOT NULL REFERENCES pools(id) ON DELETE RESTRICT,
  ride_request_id uuid NOT NULL UNIQUE REFERENCES ride_requests(id) ON DELETE RESTRICT,
  joined_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX pool_roster_idx ON pool_memberships(pool_id);
CREATE TABLE ride_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), ride_request_id uuid REFERENCES ride_requests(id), pool_id uuid REFERENCES pools(id),
  actor_id uuid NOT NULL REFERENCES users(id), event_type text NOT NULL, from_state text, to_state text NOT NULL,
  request_version integer, pool_version integer, recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CHECK(ride_request_id IS NOT NULL OR pool_id IS NOT NULL)
);
CREATE INDEX request_events_idx ON ride_events(ride_request_id,recorded_at,id);
CREATE INDEX pool_events_idx ON ride_events(pool_id,recorded_at,id);
CREATE TABLE idempotency_keys (
  actor_id uuid NOT NULL REFERENCES users(id), action_scope text NOT NULL, key uuid NOT NULL,
  target_ref text NOT NULL, request_hash text NOT NULL CHECK(length(request_hash)=64), receipt jsonb,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(), PRIMARY KEY(actor_id,action_scope,key)
);
-- Immutable identity/pricing/history protect all future application write paths.
CREATE FUNCTION protect_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF TG_TABLE_NAME='users' THEN
    IF (NEW.id,NEW.role,NEW.created_at) IS DISTINCT FROM (OLD.id,OLD.role,OLD.created_at) THEN RAISE EXCEPTION 'immutable user identity'; END IF;
  END IF;
  IF TG_TABLE_NAME='vehicles' THEN
    IF NEW IS DISTINCT FROM OLD THEN RAISE EXCEPTION 'immutable vehicle'; END IF;
  END IF;
  IF TG_TABLE_NAME='fare_quotes' THEN
    IF NEW IS DISTINCT FROM OLD THEN RAISE EXCEPTION 'immutable quote'; END IF;
  END IF;
  IF TG_TABLE_NAME='ride_requests' THEN
    IF (NEW.id,NEW.passenger_id,NEW.quote_id,NEW.booking_snapshot,NEW.pickup_id,NEW.destination_id,NEW.group_id,NEW.group_version,NEW.seats,NEW.created_at) IS DISTINCT FROM (OLD.id,OLD.passenger_id,OLD.quote_id,OLD.booking_snapshot,OLD.pickup_id,OLD.destination_id,OLD.group_id,OLD.group_version,OLD.seats,OLD.created_at) THEN RAISE EXCEPTION 'immutable booking'; END IF;
    IF OLD.status IN ('COMPLETED','CANCELLED') AND NEW IS DISTINCT FROM OLD THEN RAISE EXCEPTION 'immutable terminal request'; END IF;
    IF OLD.finalized_at IS NOT NULL AND (NEW.final_fare_snapshot,NEW.finalized_at) IS DISTINCT FROM (OLD.final_fare_snapshot,OLD.finalized_at) THEN RAISE EXCEPTION 'immutable final fare'; END IF;
  END IF;
  IF TG_TABLE_NAME='pools' THEN
    IF (NEW.id,NEW.driver_id,NEW.vehicle_id,NEW.pickup_id,NEW.group_id,NEW.group_version,NEW.capacity_snapshot,NEW.created_at) IS DISTINCT FROM (OLD.id,OLD.driver_id,OLD.vehicle_id,OLD.pickup_id,OLD.group_id,OLD.group_version,OLD.capacity_snapshot,OLD.created_at) THEN RAISE EXCEPTION 'immutable pool'; END IF;
    IF OLD.status IN ('COMPLETED','CANCELLED') AND NEW IS DISTINCT FROM OLD THEN RAISE EXCEPTION 'immutable terminal pool'; END IF;
  END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER users_immutable BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION protect_immutable();
CREATE TRIGGER vehicles_immutable BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION protect_immutable();
CREATE TRIGGER quotes_immutable BEFORE UPDATE ON fare_quotes FOR EACH ROW EXECUTE FUNCTION protect_immutable();
CREATE TRIGGER requests_immutable BEFORE UPDATE ON ride_requests FOR EACH ROW EXECUTE FUNCTION protect_immutable();
CREATE TRIGGER pools_immutable BEFORE UPDATE ON pools FOR EACH ROW EXECUTE FUNCTION protect_immutable();
INSERT INTO zones VALUES ('banani','Banani','বনানী'),('mohakhali','Mohakhali','মহাখালী'),('gulshan-1','Gulshan 1','গুলশান ১'),('gulshan-2','Gulshan 2','গুলশান ২');
INSERT INTO route_rules(pickup_id,destination_id,group_id,group_version,demo_distance_m,base_poysha,rate_poysha,discount_poysha,policy_version)
VALUES ('banani','mohakhali','BANANI_V1',1,2000,2000,1000,1000,'fare-v1'),('banani','gulshan-1','BANANI_V1',1,3000,2000,1000,1000,'fare-v1'),('banani','gulshan-2','BANANI_V1',1,4000,2000,1000,1000,'fare-v1');

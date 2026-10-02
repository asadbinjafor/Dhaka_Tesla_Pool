import { User } from '../../auth/entities/user.entity.js';
import { AuthSession } from '../../auth/entities/session.entity.js';
import { DriverProfile } from '../../auth/entities/driver-profile.entity.js';
import { Vehicle } from '../../auth/entities/vehicle.entity.js';
import { Zone } from '../../rides/entities/zone.entity.js';
import { RouteRule } from '../../rides/entities/route-rule.entity.js';
import { FareQuote } from '../../rides/entities/fare-quote.entity.js';
import { RideRequest } from '../../rides/entities/ride-request.entity.js';
import { RidePool } from '../../pools/entities/pool.entity.js';
import { PoolMembership } from '../../pools/entities/pool-membership.entity.js';
import { RideEvent } from '../../history/entities/ride-event.entity.js';
import { IdempotencyKey } from './idempotency-key.entity.js';
import { SchemaMigration } from './schema-migration.entity.js';

export const databaseEntities = [User, AuthSession, DriverProfile, Vehicle, Zone,
  RouteRule, FareQuote, RideRequest, RidePool, PoolMembership, RideEvent,
  IdempotencyKey, SchemaMigration];

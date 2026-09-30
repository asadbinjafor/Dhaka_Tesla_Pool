export const locales = ['en', 'bn'] as const;
export type Locale = (typeof locales)[number];
export type Theme = 'dark' | 'light';

export function isLocale(value: unknown): value is Locale {
  return value === 'en' || value === 'bn';
}

export function isTheme(value: unknown): value is Theme {
  return value === 'dark' || value === 'light';
}

export type ApiErrorCode = 'TEMPORARILY_UNAVAILABLE' | 'NOT_FOUND' | 'INVALID_INPUT' | 'INTERNAL_ERROR';
export interface ApiFailure {
  error: { code: ApiErrorCode; requestId?: string };
}

// These are client presentation containers, never a source of authorization or fares.
export interface ViewState {
  theme: Theme;
  authDraft: { name: string; email: string; password: string; confirm: string };
  bookingDraft: { pickupId: string; destinationId: string; seats: number };
  quoteId: string | null;
  currentRideId: string | null;
  pendingCommand: { key: string; target: string; body: Readonly<Record<string, unknown>> } | null;
  sessionGeneration: number;
}

export function withTheme(state: ViewState, theme: Theme): ViewState {
  return { ...state, theme };
}

export function clearPrivateView(state: ViewState): ViewState {
  return {
    ...state,
    authDraft: { name: '', email: '', password: '', confirm: '' },
    bookingDraft: { pickupId: '', destinationId: '', seats: 1 },
    quoteId: null,
    currentRideId: null,
    pendingCommand: null,
    sessionGeneration: state.sessionGeneration + 1,
  };
}

export function localePath(pathname: string, locale: Locale): string {
  const segments = pathname.split('/');
  if (!isLocale(segments[1])) throw new Error('A locale-prefixed UI path is required');
  segments[1] = locale;
  return segments.join('/');
}

export interface Fare {
  currency:'BDT'; policyVersion:string; seats:number; demoDistanceM:number;
  basePoysha:number; distancePoysha:number; discountPoysha:number; totalPoysha:number; soloMaximumPoysha:number;
}
export interface Quote {id:string;expiresAt:string;seats:number;route:{pickupId:string;destinationId:string;isDemoGeography:boolean};solo:Fare;pooled:Fare}
export interface Receipt {resourceId:string;action:string;appliedVersion:number}
export interface RideDetail {
  id:string;status:string;seats:number;createdAt:string;endedAt:string|null;cancellationReason:string|null;
  route:{pickupId:string;destinationId:string;isDemoGeography:boolean};
  fare:Fare & {kind:string;chargePoysha:number|null;collectionStatus:'NOT_TRACKED';historicalFinal:Fare|null};
  pool:{id:string;capacity:number;reservedSeats:number;ownSeats:number;status:string}|null;
  driver:{displayName:string;vehicleName:string}|null;allowedActions:string[];
  matchingHint:{state:'NO_ELIGIBLE_DRIVER'|'WAITING_FOR_ACCEPTANCE'|'UNKNOWN';asOf:string}|null;
  representationVersion:{request:number;pool:number};
}
export interface PoolDetail {
  id:string;status:string;capacity:number;reservedSeats:number;version:number;createdAt:string;endedAt:string|null;cancellationReason:string|null;
  members:{id:string;displayName:string;status:string;seats:number;pickupId:string;destinationId:string;fare:number;fareKind:string;historicalFinal:Fare|null}[];
  allowedActions:string[];
}
export interface Statistics {
  actorRole:'PASSENGER'|'DRIVER';timeZone:'Asia/Dhaka';currency:'BDT';population:'COMPLETED_ONLY';from:string;to:string;
  daily:{date:string;trips:number;seats?:number;capacity?:number;farePoysha?:number;discountPoysha?:number}[];
  totals:{trips:number;seats?:number;capacity?:number;farePoysha?:number;discountPoysha?:number;utilization?:number};
}
export interface HistoryPage<T> {items:T[];nextCursor:string|null;filters:{status:string;search:string};limit:number}

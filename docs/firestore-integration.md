# Connecting the operator portal to Firestore

Everything below is prepared but unproven — no code in this repo has run
against a live project. Work through the steps in order; each one is
verifiable on its own.

## What was built, and why it is shaped this way

The portal talks to a `DataRepository` interface (`src/data/repository.ts`).
Two implementations satisfy it: `MockRepository` (demo data) and
`FirestoreRepository` (live). `src/data/index.ts` picks between them from
`VITE_USE_FIREBASE`. No page or component imports Firestore, so going live
does not touch the UI.

### Two databases, on purpose

| Database | Contains | Why |
|---|---|---|
| `(default)` | `resources`, `users`, `organizations` | Shared with the consumer Expo app. The phone app reads `resources` with `where('status','==','active')`. Pantry identity, address, hours and coordinates are written **straight here**, so an operator's edit reaches families with no sync step to fall behind or fail silently. |
| `accessbelt-operator` | `inventory`, `broadcasts`, `closures`, `activity`, `liveStatus` | Portal-owned concepts that `resources` has no field for. Every document carries `orgId` + `pantryId` so it joins back to a resource. |

## Step 1 — Fill in the environment

Copy `.env.example` to `.env.local`, populate it from the Firebase console,
and set `VITE_USE_FIREBASE=true`. The web API key is not a secret; access
control comes from the rules below.

## Step 2 — Deploy rules and indexes

The operator database needs its own rules. **Do not** deploy
`firestore/operator.rules` to `(default)` — it would replace the existing
rules that govern `resources`.

```bash
firebase deploy --only firestore:rules   --database accessbelt-operator
firebase deploy --only firestore:indexes --database accessbelt-operator
```

Every portal query filters by `orgId` + `pantryId` and orders by time, which
needs the composite indexes in `firestore/operator.indexes.json`. Without
them the first load fails with a `failed-precondition` error containing a
link that creates the index — that link is the fastest fix if one is missed.

## Step 3 — Mint operator claims

This is the step with no client-side shortcut. `firestore.rules` reads
`role`, `orgId` and `counties` from the **auth token**, not from a user
document — a client can edit a document, it cannot edit a signed token.

The existing `grantAppAccess` function in the consumer repo
(`functions/index.js`) sets `appVerified`/`platform`/`claimedAt`. It does not
set any of the three the rules need. A new callable is required:

```js
exports.grantOperatorAccess = onCall({ cors: true }, async (request) => {
  // Caller must already be an org_admin for the org they are granting into,
  // or a state_admin. Never trust an orgId sent from the client alone.
  const caller = request.auth?.token;
  if (!caller) throw new HttpsError('unauthenticated', 'Sign in required.');

  const { uid, role, orgId, counties } = request.data;
  const isStateAdmin = caller.role === 'state_admin';
  const isOrgAdminForOrg = caller.role === 'org_admin' && caller.orgId === orgId;
  if (!isStateAdmin && !isOrgAdminForOrg) {
    throw new HttpsError('permission-denied', 'Not allowed to grant access to this organisation.');
  }

  await admin.auth().setCustomUserClaims(uid, { role, orgId, counties });
  // The token only picks up new claims on refresh:
  //   await auth.currentUser.getIdToken(true)
});
```

Role mapping is defined once, in `src/auth/permissions.ts`.

**Known gap, worth deciding on before launch.** The rules gate writes to
`resources` behind `isOrgStaff()`, which excludes `field_worker`. Volunteers
must be able to set status during a shift, so Volunteer maps to `org_staff`.
The consequence is that the Volunteer/Shift Lead distinction shown on the
Team page is enforced **in the UI only** — at the database level they have
the same reach. Closing it needs either a narrower rules path keyed on the
fields being written, or a new role.

## Step 4 — Seed one pantry and verify the round trip

Create a `resources` document whose `orgId` matches your claim and whose
`county` is in your `counties` claim, then sign in. In order, confirm:

1. The workspace loads (Step 2 is right).
2. Editing the pantry profile saves — this exercises `countyOk`,
   `validCoordinates` and `validGeohash` together.
3. Moving the map pin changes `geohash`. It is recomputed from coordinates on
   every write and never read back from the document, so a stale value cannot
   persist.
4. Shift Mode writes both `liveStatus/{pantryId}` and `resources.liveStatus`.
5. A rejected write rolls the UI back and shows a banner rather than leaving
   a change that never landed. Force one by editing a pantry outside your
   county claim.

## Step 5 — The two things still missing

Neither blocks the portal, but both are promises the UI currently makes that
the backend does not yet keep.

**Live status is not read by the consumer app.** `resources` has no
`liveStatus` in the phone app's read path — see `app/(tabs)/map.tsx`, which
maps a fixed field list and renders `formatHours(r.hours)`. Until that read
includes `liveStatus`, Shift Mode changes are recorded correctly but no
family sees them. This is the last step to close the loop.

**Broadcasts have no delivery mechanism.** There is no FCM registration, no
device-token collection and no send function anywhere in the consumer app.
The portal therefore writes broadcast records with `sentToApp: false`, and
the UI shows them as "Pending" rather than claiming a push went out. Delivery
needs: token registration in the Expo app, a token store indexed by location,
and a function that fans out within `radiusMiles`. Treat it as its own
project.

## Rolling back

Set `VITE_USE_FIREBASE=false`. The app returns to demo data with no code
change. That switch is also the fastest way to tell a portal bug apart from a
Firestore or rules problem.

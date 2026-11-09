# Security Specification: Casa & Beleza Express

## 1. Data Invariants

1. **User Identity & Admin Isolation**:
   - Only authenticated users can access or update their own user profile document (`/users/{userId}`).
   - User roles (`role: "admin"`) cannot be self-assigned; only predefined bootstrap admins (`wesleycorreacdm2023@gmail.com`) or users in `/admins/{adminId}` can have admin privileges.
2. **Product Catalog Integrity**:
   - Products are publicly readable by any visitor (`allow read: if true`).
   - Products can ONLY be created, updated, or deleted by authenticated administrators.
3. **Order Lifecycle & Customer Privacy**:
   - Orders can be created by visitors/customers with valid schemas (`orderNumber`, `customerEmail`, `items`, `total`).
   - Order reads are restricted to the owner (`customerId == request.auth.uid`), matching customer email, or administrators.
   - Status updates are restricted: customers cannot change order status once created; only administrators (or backend server webhook) can advance status.
4. **Reviews Moderation**:
   - Approved reviews (`status == 'approved'`) are publicly readable.
   - Anyone authenticated (or submitting a verified feedback payload) can create a pending review.
   - Only admins can update the status to `approved`/`rejected` or add `adminReply`.
5. **Coupons, Banners & Store Settings**:
   - Coupons, Banners, and Settings are publicly readable for storefront rendering.
   - Writes, mutations, and deletions are strictly restricted to administrators.
6. **Support Messages & Newsletter**:
   - Inquiries and newsletter subscriptions can be created with valid inputs.
   - Only administrators can list, read, or manage contact messages.

---

## 2. The "Dirty Dozen" Threat Payloads

1. **Payload 1 (Privilege Escalation on User Profile)**:
   - Attempt: User attempts to set `role: "admin"` during user doc creation.
   - Expected: `PERMISSION_DENIED` (role must default to customer unless verified admin).
2. **Payload 2 (Shadow Update on Product)**:
   - Attempt: Non-admin sends update to product price with `price: 0.01`.
   - Expected: `PERMISSION_DENIED`.
3. **Payload 3 (Product Creation by Guest)**:
   - Attempt: Unauthenticated write to `/products/fake-item`.
   - Expected: `PERMISSION_DENIED`.
4. **Payload 4 (Order Cross-Account Read)**:
   - Attempt: User B tries to read `/orders/userA_order123`.
   - Expected: `PERMISSION_DENIED`.
5. **Payload 5 (Order Status Tampering)**:
   - Attempt: Customer updates their own order from `aguardando_pagamento` to `pagamento_aprovado`.
   - Expected: `PERMISSION_DENIED`.
6. **Payload 6 (Oversized ID Resource Poisoning)**:
   - Attempt: Write to `/products/` with an ID of 5,000 characters.
   - Expected: `PERMISSION_DENIED` via `isValidId()`.
7. **Payload 7 (Ghost Fields Injection)**:
   - Attempt: Creating an order with unknown ghost fields `hacked: true`.
   - Expected: `PERMISSION_DENIED` via schema property validation.
8. **Payload 8 (Negative Price or Quantity)**:
   - Attempt: Product with `price: -100` or `stock: -5`.
   - Expected: `PERMISSION_DENIED`.
9. **Payload 9 (Fake Verified Review Injection)**:
   - Attempt: Visitor creates review directly with `status: "approved"`.
   - Expected: `PERMISSION_DENIED` (new reviews must have `status == "pending"`).
10. **Payload 10 (Coupon Manipulation by Customer)**:
    - Attempt: Customer updates coupon `value: 9999` and `discountType: "fixed"`.
    - Expected: `PERMISSION_DENIED`.
11. **Payload 11 (Store Settings Hijack)**:
    - Attempt: Non-admin modifies `whatsappNumber` or `paymentInstructions` in `/settings/store_config`.
    - Expected: `PERMISSION_DENIED`.
12. **Payload 12 (Unauthorized Message List)**:
    - Attempt: Customer lists all messages in `/messages`.
    - Expected: `PERMISSION_DENIED`.

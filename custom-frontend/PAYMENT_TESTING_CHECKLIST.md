# Payment Flow Testing Checklist

## Pre-Testing Setup
- [ ] Run database constraint fix: `psql -d your_database_name -f fix-invoice-constraint.sql`
- [ ] Start development server: `npm run dev`
- [ ] Ensure Stripe test keys are configured in environment

## 1. Header/Footer Removal Tests

### Subscription Page
- [ ] Navigate to `/en/subscription` (or your locale)
- [ ] Verify NO header/navbar visible at top
- [ ] Verify NO footer visible at bottom
- [ ] Page should have full-screen dark layout

### Payment Page  
- [ ] Navigate to `/en/payment?plan=test&billing=monthly`
- [ ] Verify NO header/navbar visible at top
- [ ] Verify NO footer visible at bottom
- [ ] Page should have full-screen dark layout

## 2. Payment Page Layout Tests

### Scrolling Test
- [ ] Navigate to payment page
- [ ] Try scrolling up and down
- [ ] Verify content scrolls properly (not fixed/hidden)
- [ ] Test on mobile viewport (Dev Tools)
- [ ] Verify form is fully accessible

### Responsive Design
- [ ] Test desktop view (1200px+)
- [ ] Test tablet view (768px-1199px) 
- [ ] Test mobile view (<768px)
- [ ] Verify payment form and order summary layout

## 3. Free Plan Payment Flow

### Test Data
- Plan: `test` (51¢)
- Use Stripe test card: `4242424242424242`
- CVV: Any 3 digits
- Expiry: Any future date

### Steps
- [ ] Navigate to subscription page
- [ ] Select test plan (51¢)
- [ ] Click "Get Started" or payment button
- [ ] Fill out payment form with test data
- [ ] Submit payment
- [ ] Verify success message appears
- [ ] Verify redirect to dashboard after 2 seconds
- [ ] Check browser console for errors

### Database Verification
```sql
-- Check invoice was created correctly
SELECT * FROM billing.invoices ORDER BY created_at DESC LIMIT 1;

-- Check subscription status
SELECT * FROM subscriptions.subscriptions ORDER BY updated_at DESC LIMIT 1;

-- Check billing events
SELECT * FROM billing.billing_events ORDER BY processed_at DESC LIMIT 1;
```

## 4. Paid Plan Payment Flow

### Test Data
- Plan: `starter`, `pro`, or `business`
- Use Stripe test card: `4242424242424242`
- CVV: Any 3 digits  
- Expiry: Any future date

### Steps
- [ ] Navigate to subscription page
- [ ] Select a paid plan
- [ ] Choose monthly or yearly billing
- [ ] Click "Get Started"
- [ ] Fill out payment form completely:
  - [ ] Cardholder name
  - [ ] Card information
  - [ ] Complete billing address
  - [ ] Country selection
- [ ] Submit payment
- [ ] Verify success message appears
- [ ] Verify redirect to correct locale dashboard
- [ ] Check browser console for errors

## 5. Error Handling Tests

### Invalid Card Test
- [ ] Use declined card: `4000000000000002`
- [ ] Verify proper error message display
- [ ] Verify form stays usable after error

### Network Error Test
- [ ] Disconnect internet during payment
- [ ] Verify proper error handling
- [ ] Verify user can retry

### Missing Fields Test
- [ ] Try submitting with empty required fields
- [ ] Verify validation messages appear

## 6. Dashboard Redirect Tests

### Locale-Aware Redirects
- [ ] Test from `/en/payment` → should redirect to `/en/dashboard`
- [ ] Test from `/es/payment` → should redirect to `/es/dashboard`
- [ ] Test from other locales if configured

### Authentication Check
- [ ] Verify dashboard requires authentication
- [ ] Verify user sees their company data
- [ ] Verify subscription status is updated

## 7. Browser Console Checks

### During Each Test
- [ ] Open browser DevTools → Console
- [ ] Look for any red errors
- [ ] Look for any network request failures
- [ ] Check for any React warnings

### Common Issues to Look For
- [ ] CORS errors
- [ ] Authentication token issues
- [ ] Database constraint violations
- [ ] Stripe API errors
- [ ] Navigation/routing errors

## 8. Mobile Testing

### Responsive Layout
- [ ] Open DevTools → Toggle device toolbar
- [ ] Test iPhone SE (375px)
- [ ] Test iPad (768px)
- [ ] Verify form fields are accessible
- [ ] Verify buttons are touchable
- [ ] Test form submission on mobile

## Troubleshooting

### If Header/Footer Still Appear
1. Check browser cache - hard refresh (Cmd+Shift+R)
2. Verify `DashboardAwareLayout.tsx` changes are applied
3. Check if you're on the correct URL path

### If Database Constraint Error Persists
1. Verify the SQL fix script ran successfully
2. Check database logs: `SELECT * FROM public.schema_migrations;`
3. Manually check constraint: 
```sql
SELECT con.conname, pg_get_constraintdef(con.oid) 
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE nsp.nspname = 'billing' AND rel.relname = 'invoices';
```

### If Redirect Fails
1. Check browser console for navigation errors
2. Verify dashboard route exists: `/[locale]/dashboard/page.tsx`
3. Check authentication state

### If Payment Processing Fails
1. Verify Stripe test keys are correct
2. Check network tab for API call failures
3. Verify environment variables are loaded
4. Check server logs for detailed error messages

## Success Criteria

### All Tests Pass When:
- [ ] No header/footer on subscription and payment pages
- [ ] Payment forms scroll properly on all devices
- [ ] Free plan (51¢) payment completes successfully
- [ ] Paid plans process payments correctly
- [ ] Users redirect to correct locale dashboard
- [ ] No database constraint errors occur
- [ ] No console errors during normal flow
- [ ] All database records are created properly

## Test Results Log

### Date: ___________
### Tester: ___________

| Test Case | Status | Notes |
|-----------|--------|-------|
| Subscription Header/Footer | ⏳ | |
| Payment Header/Footer | ⏳ | |
| Payment Page Scrolling | ⏳ | |
| Free Plan Payment | ⏳ | |
| Paid Plan Payment | ⏳ | |
| Dashboard Redirect | ⏳ | |
| Mobile Responsive | ⏳ | |
| Error Handling | ⏳ | |

### Overall Status: ⏳ Not Started | 🟡 In Progress | ✅ Pass | ❌ Fail

### Issues Found:
1. 
2. 
3.

### Next Steps:
1.
2. 
3.
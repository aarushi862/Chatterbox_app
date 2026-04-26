# Contact Sync Feature - Testing Guide

## Quick Start Testing

### 1. Start the Backend
```bash
cd backend
npm start
```

### 2. Start the Frontend
```bash
cd frontend
npm run dev
```

### 3. Test the Feature

#### A. Test with Contact Picker API (Mobile/Supported Browsers)
1. Open the app on a mobile device or Chrome Android
2. Login to your account
3. Click the "Sync Contacts" button (refresh icon) in the sidebar
4. Click "Sync Contacts" in the modal
5. Select contacts from your phone's contact picker
6. Verify results show:
   - Friends already on ChatterBox (with Message button)
   - Contacts to invite (with Invite button)
7. Check that the sidebar shows a green badge with synced count

#### B. Test with Fallback Mode (Desktop/Unsupported Browsers)
1. Open the app in Firefox or desktop Chrome
2. Login to your account
3. Click the "Sync Contacts" button
4. Click "Enter Manually"
5. Enter test data:
   ```
   test@email.com, +1234567890, friend@example.com
   ```
6. Click "Find Friends"
7. Verify results appear correctly

#### C. Test Message Functionality
1. After syncing, find a registered user in results
2. Click the green "Message" button
3. Verify it opens a direct chat with that user
4. Send a test message

#### D. Test Invite Functionality
1. Find an unregistered contact in results
2. Click the green "Invite" button
3. Verify WhatsApp opens with pre-filled message:
   ```
   Hey [Name]! Join me on ChatterBox 💬 [invite_link]
   ```
4. Check that the invite link is valid

#### E. Test Auto-Sync Indicator
1. After syncing, check the sidebar
2. Verify the sync button shows a green badge with count
3. Hover over the button to see tooltip: "X contacts synced"
4. Close and reopen the app
5. Verify the badge persists (localStorage)

### 4. API Testing

#### Test Contact Sync Endpoint
```bash
# Get auth token first
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your@email.com",
    "password": "yourpassword"
  }'

# Use the token to test sync
curl -X POST http://localhost:5000/api/contacts/sync \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "emails": ["test1@email.com", "test2@email.com"],
    "phones": ["1234567890", "9876543210"]
  }'
```

Expected Response:
```json
{
  "registered": [
    {
      "user": {
        "_id": "...",
        "name": "John Doe",
        "email": "test1@email.com",
        "phone": "1234567890",
        "avatar": ""
      },
      "matchedBy": "test1@email.com"
    }
  ],
  "unregistered": [
    {
      "email": "test2@email.com",
      "phone": null,
      "name": "test2"
    }
  ],
  "stats": {
    "total": 4,
    "found": 1,
    "notFound": 3
  }
}
```

## Test Scenarios

### Scenario 1: New User First Sync
**Steps:**
1. Register a new account
2. Click sync contacts
3. Grant permission
4. Select 5 contacts
5. Verify results

**Expected:**
- Permission dialog appears
- Contact picker opens
- Results show matched/unmatched
- Badge appears with count
- localStorage stores sync data

### Scenario 2: Existing User Re-Sync
**Steps:**
1. Login with existing account
2. Check badge shows previous count
3. Click sync again
4. Select different contacts
5. Verify count updates

**Expected:**
- Previous count visible
- New sync overwrites old data
- Badge updates immediately
- localStorage updates

### Scenario 3: No Matches Found
**Steps:**
1. Sync with contacts not on platform
2. Verify all show in "Invite" section
3. Click invite on one contact
4. Verify WhatsApp opens

**Expected:**
- "0 friends found" message
- All contacts in invite section
- WhatsApp link works
- Invite message is personalized

### Scenario 4: All Matches Found
**Steps:**
1. Sync with contacts all on platform
2. Verify all show in "Already on ChatterBox"
3. Click message on one
4. Verify chat opens

**Expected:**
- Success message with count
- All in registered section
- Message button works
- Chat opens correctly

### Scenario 5: Fallback Mode
**Steps:**
1. Open in unsupported browser
2. Try to sync
3. Verify fallback appears
4. Enter manual data
5. Verify results

**Expected:**
- Fallback mode activates
- Manual input appears
- Parsing works correctly
- Results display properly

### Scenario 6: Permission Denied
**Steps:**
1. Click sync contacts
2. Deny permission in browser
3. Verify error handling

**Expected:**
- Error message appears
- Returns to permission screen
- No crash or freeze
- Can try again

### Scenario 7: 24-Hour Auto-Refresh
**Steps:**
1. Sync contacts
2. Check localStorage timestamp
3. Manually set timestamp to 25 hours ago
4. Reload app
5. Verify sync indicator

**Expected:**
- Old timestamp detected
- Indicator suggests re-sync
- Badge still shows old count
- Can manually re-sync

## Browser Compatibility Testing

### Mobile Browsers
- [ ] Chrome Android (Contact Picker supported)
- [ ] Safari iOS (Contact Picker supported)
- [ ] Samsung Internet (Contact Picker supported)
- [ ] Firefox Android (Fallback mode)

### Desktop Browsers
- [ ] Chrome Desktop (Fallback mode)
- [ ] Firefox Desktop (Fallback mode)
- [ ] Safari Desktop (Fallback mode)
- [ ] Edge Desktop (Fallback mode)

## Performance Testing

### Load Testing
1. Sync with 100 contacts (max limit)
2. Verify response time < 2 seconds
3. Check UI remains responsive
4. Verify all contacts display

### Memory Testing
1. Sync multiple times
2. Check for memory leaks
3. Verify localStorage doesn't grow indefinitely
4. Monitor browser performance

## Security Testing

### Authentication
- [ ] Endpoint requires valid JWT token
- [ ] Invalid token returns 401
- [ ] Expired token returns 401

### Input Validation
- [ ] Empty arrays handled
- [ ] Invalid emails filtered
- [ ] Invalid phones filtered
- [ ] SQL injection attempts blocked
- [ ] XSS attempts sanitized

### Privacy
- [ ] No contact data stored on server
- [ ] Only matched user IDs returned
- [ ] Unregistered contacts not saved
- [ ] localStorage data is local only

## Edge Cases

### Edge Case 1: Duplicate Contacts
**Input:** Same email/phone multiple times
**Expected:** Deduplicated automatically

### Edge Case 2: Mixed Format Phones
**Input:** +1-234-567-8900, (234) 567-8900, 2345678900
**Expected:** All normalized to 2345678900

### Edge Case 3: Invalid Emails
**Input:** notanemail, @example.com, test@
**Expected:** Filtered out, no errors

### Edge Case 4: Very Long Names
**Input:** Contact with 100+ character name
**Expected:** Truncated or handled gracefully

### Edge Case 5: Special Characters
**Input:** Names with emojis, accents, symbols
**Expected:** Displayed correctly

### Edge Case 6: Network Failure
**Scenario:** API call fails mid-sync
**Expected:** Error message, return to permission screen

### Edge Case 7: Empty Results
**Scenario:** No contacts selected
**Expected:** Error message, prompt to select contacts

## Debugging Tips

### Check localStorage
```javascript
// In browser console
localStorage.getItem('lastContactSync')
localStorage.getItem('syncedContactsCount')
```

### Check API Response
```javascript
// In browser console (after sync)
// Check Network tab for /api/contacts/sync
// Verify request payload and response
```

### Check Contact Picker Support
```javascript
// In browser console
console.log('contacts' in navigator);
console.log('ContactsManager' in window);
```

### Clear Sync Data
```javascript
// In browser console
localStorage.removeItem('lastContactSync');
localStorage.removeItem('syncedContactsCount');
location.reload();
```

## Known Issues & Limitations

1. **Contact Picker API Limited Support**
   - Only works on mobile browsers and some Android browsers
   - Desktop browsers require fallback mode

2. **Phone Number Matching**
   - Requires users to have phone in their profile
   - Different formats may not match (needs normalization)

3. **WhatsApp Requirement**
   - Invite feature requires WhatsApp installed
   - No SMS fallback currently

4. **Sync Limit**
   - Maximum 100 contacts per sync
   - Prevents server overload

5. **No Background Sync**
   - Sync only happens when user clicks button
   - No automatic background refresh

## Success Criteria

✅ Contact Picker API works on supported browsers
✅ Fallback mode works on all browsers
✅ Registered users matched correctly
✅ Unregistered contacts identified
✅ Message button opens DM
✅ Invite button opens WhatsApp
✅ Sync count badge displays
✅ localStorage persists data
✅ 24-hour refresh logic works
✅ Error handling is graceful
✅ UI matches Instagram style
✅ Performance is acceptable
✅ Security is maintained
✅ Privacy is protected

## Conclusion

This testing guide covers all aspects of the Contact Sync feature. Follow each section systematically to ensure the feature works correctly across all scenarios, browsers, and edge cases.

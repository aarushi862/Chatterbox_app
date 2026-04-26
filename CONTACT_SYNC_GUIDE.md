# Instagram-Style Contact Sync Feature

## Overview
ChatterBox now features automatic contact synchronization similar to Instagram, allowing users to find friends who are already on the platform and invite those who aren't.

## Features

### 1. Automatic Phone Contact Sync
- **Contact Picker API Integration**: Uses the browser's native Contact Picker API
- **Permission Request**: Asks for contact access with a clear permission dialog
- **Automatic Selection**: Opens device's native contact picker for user selection
- **Multi-Contact Support**: Users can select multiple contacts at once
- **Data Extraction**: Automatically reads names, emails, and phone numbers

### 2. Smart Contact Matching
- **Backend Matching**: Sends collected data to `/api/contacts/sync` endpoint
- **Database Lookup**: Checks MongoDB Users collection for matches
- **Dual Matching**: Matches by both email and phone number
- **Two-List Results**:
  - **Already on ChatterBox**: Registered users with full profiles
  - **Not on ChatterBox**: Unregistered contacts ready to invite

### 3. Instagram-Style UI
- **Dark Theme**: Full-screen modal with dark background (#0a0a0a)
- **Green Accents**: Uses #22C55E for buttons and highlights
- **Avatar Circles**: Shows profile pictures or initials
- **Loading States**: "Finding your friends..." spinner during sync
- **Success Feedback**: "X friends found on ChatterBox!" message

### 4. Contact Actions

#### For Registered Users:
- **Message Button**: Opens direct chat immediately
- **User Info Display**: Shows avatar, name, and email
- **One-Click Access**: Instant messaging with found friends

#### For Unregistered Contacts:
- **Invite Button**: Opens WhatsApp with pre-filled message
- **WhatsApp Integration**: 
  ```
  https://wa.me/[phone]?text=Hey [name]! Join me on ChatterBox: [invite_link]
  ```
- **Personalized Messages**: Uses contact's name in invite
- **Automatic Invite Links**: Generates unique invite codes

### 5. Auto-Sync on Login
- **First-Time Sync**: Prompts for contact permission after login
- **localStorage Caching**: Stores sync timestamp to avoid repeated requests
- **24-Hour Refresh**: Automatically refreshes sync every 24 hours
- **Sync Indicator**: Shows "X contacts synced" badge in sidebar
- **Badge Counter**: Green badge showing number of synced contacts

### 6. Fallback Mode
- **Browser Compatibility**: Detects Contact Picker API support
- **Manual Entry**: Provides text input for unsupported browsers
- **Comma-Separated Input**: Accepts phone numbers and emails
- **Universal Support**: Works on all browsers as backup

## Technical Implementation

### Backend

#### New Endpoint: `/api/contacts/sync`
```javascript
POST /api/contacts/sync
Authorization: Bearer <token>

Request Body:
{
  "emails": ["friend1@email.com", "friend2@email.com"],
  "phones": ["1234567890", "9876543210"]
}

Response:
{
  "registered": [
    {
      "user": {
        "_id": "...",
        "name": "John Doe",
        "email": "john@email.com",
        "phone": "1234567890",
        "avatar": "..."
      },
      "matchedBy": "john@email.com"
    }
  ],
  "unregistered": [
    {
      "email": "friend@email.com",
      "phone": null,
      "name": "friend"
    }
  ],
  "stats": {
    "total": 10,
    "found": 3,
    "notFound": 7
  }
}
```

#### User Model Update
Added `phone` field to User schema:
```javascript
phone: {
  type: String,
  default: '',
  trim: true,
}
```

#### Contact Controller
- **Input Normalization**: Cleans and validates emails/phones
- **Duplicate Prevention**: Removes duplicate entries
- **Limit Protection**: Caps at 100 contacts per sync
- **Efficient Queries**: Uses MongoDB `$or` operator for matching

### Frontend

#### Contact Picker API Usage
```javascript
const contacts = await navigator.contacts.select(
  ['name', 'email', 'tel'],
  { multiple: true }
);
```

#### localStorage Management
```javascript
// Store sync data
localStorage.setItem('lastContactSync', Date.now().toString());
localStorage.setItem('syncedContactsCount', count.toString());

// Check if sync needed (24 hours)
const lastSync = localStorage.getItem('lastContactSync');
const needsSync = !lastSync || (Date.now() - parseInt(lastSync)) > 86400000;
```

#### Component Structure
- **ContactSyncModal.jsx**: Main sync interface
- **Three Steps**: permission → syncing → results
- **Responsive Design**: Works on mobile and desktop
- **Error Handling**: Graceful fallback for denied permissions

## User Flow

### First-Time User
1. User logs in to ChatterBox
2. Clicks "Sync Contacts" button in sidebar
3. Sees permission dialog: "ChatterBox would like to access your contacts"
4. Clicks "Sync Contacts" button
5. Native contact picker opens
6. User selects contacts to sync
7. App shows "Finding your friends..." loading state
8. Results appear with two sections:
   - Friends already on ChatterBox (with Message buttons)
   - Contacts to invite (with Invite buttons)
9. Sync count badge appears in sidebar

### Returning User
1. Badge shows "X contacts synced"
2. Can click to re-sync anytime
3. Auto-refreshes every 24 hours
4. Cached data prevents unnecessary API calls

### Inviting Friends
1. User clicks "Invite" next to unregistered contact
2. WhatsApp opens with pre-filled message:
   ```
   Hey [Name]! Join me on ChatterBox 💬 [invite_link]
   ```
3. User sends invite through WhatsApp
4. Friend receives link and can register

## Browser Compatibility

### Contact Picker API Support
- ✅ Chrome 80+ (Android)
- ✅ Edge 80+ (Android)
- ✅ Safari 14.5+ (iOS)
- ❌ Firefox (fallback mode)
- ❌ Desktop browsers (fallback mode)

### Fallback Mode
When Contact Picker API is not supported:
- Shows manual input textarea
- Accepts comma-separated phone numbers and emails
- Example: `+1234567890, friend@email.com, +9876543210`
- Works on all browsers

## Security & Privacy

### Permission Handling
- **Explicit Consent**: Clear permission dialog before access
- **User Control**: Users select which contacts to share
- **No Auto-Access**: Never accesses contacts without permission
- **Revocable**: Users can deny permission anytime

### Data Processing
- **Minimal Storage**: Only stores matched user IDs
- **No Contact Storage**: Doesn't save unregistered contact details
- **Secure Transmission**: All data sent over HTTPS
- **Token Authentication**: Requires valid JWT token

### Privacy Features
- **Local Caching**: Sync data stored locally, not on server
- **Opt-In Only**: Feature is completely optional
- **Transparent**: Clear messaging about what data is accessed

## UI/UX Design

### Color Scheme
- **Background**: #0a0a0a (dark black)
- **Accent**: #22C55E (green)
- **Text**: White with opacity variations
- **Borders**: Subtle green glows

### Typography
- **Headers**: 18px, bold, white
- **Body**: 13-14px, medium weight
- **Labels**: 11px, uppercase, green

### Spacing
- **Modal Padding**: 20-24px
- **Item Spacing**: 12px gaps
- **Border Radius**: 8-12px for modern look

### Animations
- **Loading Spinner**: Smooth rotation with green accent
- **Button Hover**: Subtle scale and brightness changes
- **Modal Entry**: Fade-in with scale animation

## Testing

### Manual Testing Checklist
- [ ] Contact Picker opens on supported browsers
- [ ] Fallback mode works on unsupported browsers
- [ ] Registered users show correct info
- [ ] Message button opens DM correctly
- [ ] Unregistered contacts show invite option
- [ ] WhatsApp invite link works
- [ ] Sync count badge updates
- [ ] localStorage persists across sessions
- [ ] 24-hour auto-refresh works
- [ ] Permission denial handled gracefully

### API Testing
```bash
# Test contact sync endpoint
curl -X POST http://localhost:5000/api/contacts/sync \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "emails": ["test@email.com"],
    "phones": ["1234567890"]
  }'
```

## Future Enhancements

### Planned Features
1. **Contact Sync History**: Show when last synced
2. **Sync Notifications**: Alert when new friends join
3. **Batch Invites**: Send multiple invites at once
4. **SMS Fallback**: Use SMS if WhatsApp not available
5. **Contact Groups**: Organize synced contacts
6. **Sync Settings**: Customize auto-sync frequency
7. **Privacy Controls**: Fine-grained permission settings

### Performance Optimizations
1. **Pagination**: Load contacts in batches
2. **Caching**: Cache matched users for faster access
3. **Background Sync**: Sync in background without blocking UI
4. **Debouncing**: Prevent rapid repeated syncs

## Troubleshooting

### Common Issues

**Contact Picker doesn't open**
- Check browser compatibility
- Ensure HTTPS connection (required for API)
- Try fallback mode

**No contacts found**
- Verify contacts have email or phone in profile
- Check if contacts are registered with same email/phone
- Ensure backend is running

**Invite link doesn't work**
- Check invite generation endpoint
- Verify CLIENT_URL in .env
- Test invite link manually

**Sync count not updating**
- Clear localStorage and re-sync
- Check browser console for errors
- Verify API response includes stats

## Conclusion

The Instagram-style Contact Sync feature provides a seamless way for users to discover friends on ChatterBox and grow the platform organically. With automatic contact access, smart matching, and easy invitations, it removes friction from the friend discovery process while maintaining user privacy and control.

# Contact Sync - Quick Reference Card

## 🚀 Quick Start

```bash
# Backend
cd backend && npm start

# Frontend  
cd frontend && npm run dev

# Open: http://localhost:5173
# Click: Sync Contacts button (refresh icon)
```

## 📡 API Endpoint

```javascript
POST /api/contacts/sync
Headers: { Authorization: "Bearer <token>" }
Body: { 
  emails: ["user@email.com"], 
  phones: ["1234567890"] 
}

Response: {
  registered: [{ user: {...}, matchedBy: "..." }],
  unregistered: [{ email: "...", phone: "...", name: "..." }],
  stats: { total: 10, found: 3, notFound: 7 }
}
```

## 🎨 UI Components

### ContactSyncModal States
1. **permission** - Shows sync button or manual input
2. **syncing** - Loading spinner
3. **results** - Two-section list (registered/unregistered)

### Sidebar Badge
```javascript
// Shows synced count
localStorage.getItem('syncedContactsCount')
// Shows last sync time
localStorage.getItem('lastContactSync')
```

## 🔧 Key Functions

### Contact Picker API
```javascript
const contacts = await navigator.contacts.select(
  ['name', 'email', 'tel'],
  { multiple: true }
);
```

### Check Support
```javascript
const supported = 'contacts' in navigator && 'ContactsManager' in window;
```

### WhatsApp Invite
```javascript
const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
window.open(url, '_blank');
```

## 🎯 User Actions

### Registered Users
- **Message Button** → Opens DM via `onStartDM(user)`
- **Shows**: Avatar, name, email
- **Color**: Green (#22C55E)

### Unregistered Contacts
- **Invite Button** → Opens WhatsApp
- **Shows**: Name, phone/email
- **Color**: Green outline

## 🔒 Security Checklist

- ✅ JWT token required
- ✅ Input validation (100 contact limit)
- ✅ Phone normalization (remove non-digits)
- ✅ Email normalization (lowercase, trim)
- ✅ No contact storage on server
- ✅ User permission required

## 🌐 Browser Support

| Browser | Contact Picker | Fallback |
|---------|---------------|----------|
| Chrome Android | ✅ | ✅ |
| Safari iOS | ✅ | ✅ |
| Firefox | ❌ | ✅ |
| Desktop | ❌ | ✅ |

## 🐛 Debug Commands

```javascript
// Check localStorage
localStorage.getItem('lastContactSync')
localStorage.getItem('syncedContactsCount')

// Clear sync data
localStorage.removeItem('lastContactSync')
localStorage.removeItem('syncedContactsCount')

// Check API support
console.log('contacts' in navigator)
```

## 📊 Test Data

```javascript
// Test sync with sample data
{
  "emails": [
    "test1@email.com",
    "test2@email.com",
    "test3@email.com"
  ],
  "phones": [
    "1234567890",
    "9876543210",
    "5555555555"
  ]
}
```

## 🎨 Color Palette

```css
--background: #0a0a0a
--accent: #22C55E
--text: #ffffff
--text-muted: rgba(255,255,255,0.6)
--border: rgba(34,197,94,0.2)
```

## 📱 Mobile Testing

```bash
# Test on mobile device
1. Connect phone to same network
2. Get computer IP: ipconfig (Windows) or ifconfig (Mac/Linux)
3. Update frontend vite.config.js:
   server: { host: '0.0.0.0' }
4. Access: http://<YOUR_IP>:5173
```

## ⚡ Performance Tips

- Limit: 100 contacts per sync
- Cache: Use localStorage
- Normalize: Clean inputs before API call
- Debounce: Prevent rapid re-syncs

## 🔄 Auto-Sync Logic

```javascript
const lastSync = localStorage.getItem('lastContactSync');
const now = Date.now();
const twentyFourHours = 24 * 60 * 60 * 1000;

if (!lastSync || (now - parseInt(lastSync)) > twentyFourHours) {
  // Show sync indicator or auto-sync
}
```

## 📝 Common Issues

| Issue | Solution |
|-------|----------|
| Contact Picker not opening | Check HTTPS, use fallback |
| No matches found | Verify user emails/phones in DB |
| Badge not updating | Clear localStorage, re-sync |
| WhatsApp not opening | Check phone format, test URL |

## 🎯 Success Criteria

- ✅ Contact Picker opens on mobile
- ✅ Fallback works on desktop
- ✅ Results display correctly
- ✅ Message button opens DM
- ✅ Invite opens WhatsApp
- ✅ Badge shows count
- ✅ localStorage persists

## 📚 Documentation Files

1. **CONTACT_SYNC_GUIDE.md** - Full feature guide
2. **TEST_CONTACT_SYNC.md** - Testing guide
3. **CONTACT_SYNC_SUMMARY.md** - Implementation summary
4. **CONTACT_SYNC_QUICK_REF.md** - This file

## 🚨 Emergency Fixes

### Reset Everything
```javascript
// Frontend
localStorage.clear();
location.reload();

// Backend
// Restart server
npm start
```

### Check Logs
```bash
# Backend console
# Look for: "Sync contacts error:"

# Frontend console
# Look for: Contact Picker errors
```

## 💡 Pro Tips

1. **Test on real mobile device** for best Contact Picker experience
2. **Use fallback mode** for quick desktop testing
3. **Check Network tab** to debug API calls
4. **Clear localStorage** between tests
5. **Use test accounts** with known emails/phones

## 🎉 Quick Demo Script

```
1. Login to ChatterBox
2. Click sync button (refresh icon)
3. Click "Sync Contacts"
4. Select 3-5 contacts
5. Wait for "Finding friends..."
6. View results (registered/unregistered)
7. Click "Message" on registered user
8. Click "Invite" on unregistered contact
9. Check badge shows count
10. Reload page - badge persists
```

---

**Need Help?** Check the full guides:
- Feature details → CONTACT_SYNC_GUIDE.md
- Testing → TEST_CONTACT_SYNC.md
- Implementation → CONTACT_SYNC_SUMMARY.md

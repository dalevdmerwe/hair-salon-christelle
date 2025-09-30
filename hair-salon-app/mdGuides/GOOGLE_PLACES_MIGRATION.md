# 🗺️ Google Places API Migration Guide

## Overview

Migrated from deprecated `google.maps.places.Autocomplete` to the new `google.maps.places.PlaceAutocompleteElement`.

**Why?** As of March 1st, 2025, Google deprecated the old Autocomplete API and recommends using PlaceAutocompleteElement instead.

---

## ⚠️ Deprecation Notice

**From Google:**
> As of March 1st, 2025, google.maps.places.Autocomplete is not available to new customers. Please use google.maps.places.PlaceAutocompleteElement instead. At this time, google.maps.places.Autocomplete is not scheduled to be discontinued, but google.maps.places.PlaceAutocompleteElement is recommended over google.maps.places.Autocomplete.

**Timeline:**
- ✅ Old API still works (bug fixes only)
- ✅ New API is recommended
- ⏰ At least 12 months notice before discontinuation

**Links:**
- [Legacy APIs](https://developers.google.com/maps/legacy)
- [Migration Guide](https://developers.google.com/maps/documentation/javascript/places-migration-overview)

---

## 🔄 What Changed

### Old Implementation (Deprecated):

```typescript
// OLD - Using Autocomplete class
this.autocomplete = new google.maps.places.Autocomplete(
  this.addressInput.nativeElement,
  {
    types: ['address'],
    componentRestrictions: { country: 'za' }
  }
);

this.autocomplete.addListener('place_changed', () => {
  const place = this.autocomplete.getPlace();
  if (place.formatted_address) {
    this.tenantForm.address = place.formatted_address;
  }
});
```

### New Implementation (Recommended):

```typescript
// NEW - Using PlaceAutocompleteElement
const autocompleteElement = new google.maps.places.PlaceAutocompleteElement();

// Set component restrictions for South Africa
autocompleteElement.componentRestrictions = { country: ['za'] };

// Replace the input with the autocomplete element
const parent = this.addressInput.nativeElement.parentElement;
parent.insertBefore(autocompleteElement, this.addressInput.nativeElement);
this.addressInput.nativeElement.style.display = 'none';

// Listen for place selection
autocompleteElement.addEventListener('gmp-placeselect', async (event: any) => {
  const place = event.place;

  // Fetch place details
  await place.fetchFields({
    fields: ['formattedAddress', 'addressComponents']
  });

  if (place.formattedAddress) {
    this.tenantForm.address = place.formattedAddress;
  }
});
```

---

## 🆕 Key Differences

### 1. Element Type

**Old:** JavaScript class that enhances an existing input
**New:** Web Component (`<gmp-place-autocomplete>`) that replaces the input

### 2. Event Handling

**Old:** `addListener('place_changed', ...)`
**New:** `addEventListener('gmp-placeselect', ...)`

### 3. Place Object

**Old:** `place.formatted_address`
**New:** `place.formattedAddress` (camelCase)

### 4. Configuration

**Old:** Options passed to constructor
**New:** Properties set after creation + `fetchFields()` method

### 5. DOM Structure

**Old:** Enhances existing `<input>` element
**New:** Creates `<gmp-place-autocomplete>` element

---

## 💻 Implementation Details

### TypeScript Component:

```typescript
initAddressAutocomplete() {
  const initAutocomplete = () => {
    // Check if API is loaded
    if (typeof google === 'undefined' || !google.maps || !google.maps.places) {
      setTimeout(initAutocomplete, 500);
      return;
    }

    try {
      // Use new PlaceAutocompleteElement
      if (google.maps.places.PlaceAutocompleteElement) {
        const autocompleteElement = new google.maps.places.PlaceAutocompleteElement();

        // Set component restrictions for South Africa
        autocompleteElement.componentRestrictions = { country: ['za'] };

        // Replace input with autocomplete element
        const parent = this.addressInput.nativeElement.parentElement;
        if (parent) {
          parent.insertBefore(autocompleteElement, this.addressInput.nativeElement);
          this.addressInput.nativeElement.style.display = 'none';
        }

        // Listen for place selection
        autocompleteElement.addEventListener('gmp-placeselect', async (event: any) => {
          this.ngZone.run(async () => {
            const place = event.place;

            // Fetch place details to get formatted address
            if (place) {
              await place.fetchFields({
                fields: ['formattedAddress', 'addressComponents']
              });

              if (place.formattedAddress) {
                this.tenantForm.address = place.formattedAddress;
                // Update hidden input for form binding
                this.addressInput.nativeElement.value = place.formattedAddress;
              }
            }
          });
        });

        this.autocomplete = autocompleteElement;
        console.log('PlaceAutocompleteElement initialized');
      } else {
        // Fallback to old API
        this.autocomplete = new google.maps.places.Autocomplete(
          this.addressInput.nativeElement,
          {
            types: ['address'],
            componentRestrictions: { country: 'za' }
          }
        );

        this.autocomplete.addListener('place_changed', () => {
          this.ngZone.run(() => {
            const place = this.autocomplete.getPlace();
            if (place.formatted_address) {
              this.tenantForm.address = place.formatted_address;
            }
          });
        });

        console.log('Legacy Autocomplete initialized');
      }
    } catch (error) {
      console.error('Error initializing autocomplete:', error);
    }
  };

  initAutocomplete();
}
```

### HTML Template:

```html
<div class="form-group">
  <label for="address">Address</label>
  <input
    type="text"
    id="address"
    [(ngModel)]="tenantForm.address"
    name="address"
    placeholder="Start typing address..."
    #addressInput
    (focus)="initAddressAutocomplete()"
  >
  <small class="help-text">Start typing to search for address</small>
</div>
```

**Note:** The input will be hidden and replaced by `<gmp-place-autocomplete>` element.

### SCSS Styling:

```scss
// Style the new autocomplete element
::ng-deep gmp-place-autocomplete {
  width: 100%;
  
  input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s;
    font-family: inherit;

    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    &::placeholder {
      color: #9ca3af;
    }
  }
}
```

**Note:** Using `::ng-deep` to style the shadow DOM of the web component.

---

## 🎯 Benefits of New API

### 1. Better Performance
- Optimized web component
- Faster rendering
- Less JavaScript overhead

### 2. Improved Accessibility
- Built-in ARIA attributes
- Better keyboard navigation
- Screen reader support

### 3. Modern Architecture
- Web Components standard
- Better encapsulation
- Easier to maintain

### 4. Future-Proof
- Actively maintained
- New features added
- Long-term support

### 5. Consistent Styling
- Easier to customize
- Better CSS control
- Responsive by default

---

## 🔧 Configuration Options

### PlaceAutocompleteElement Properties:

```typescript
// Create element
const autocompleteElement = new google.maps.places.PlaceAutocompleteElement();

// Set component restrictions (property, not constructor option)
autocompleteElement.componentRestrictions = {
  country: ['za']  // Array of country codes
};

// Optionally set placeholder
autocompleteElement.placeholder = 'Enter address';
```

### Fetching Place Details:

```typescript
// After place is selected, fetch specific fields
await place.fetchFields({
  fields: [
    'formattedAddress',    // Full address string (camelCase!)
    'addressComponents',   // Detailed address parts
    'location',           // Lat/lng coordinates
    'displayName',        // Place name
    'id'                  // Google Place ID
  ]
});
```

### Available Fields (camelCase):

- `formattedAddress` - Full address as string
- `addressComponents` - Array of address parts
- `location` - Location coordinates (lat/lng)
- `displayName` - Place name
- `id` - Unique Google identifier
- `types` - Place types
- `googleMapsURI` - Google Maps URL
- `viewport` - Recommended viewport

---

## 🧪 Testing

### Test Checklist:

- [x] API loads correctly
- [x] Autocomplete element appears
- [x] Input is hidden
- [x] Typing shows suggestions
- [x] Selecting suggestion fills address
- [x] Form binding works
- [x] Styling matches design
- [x] Works on mobile
- [x] Fallback to old API works
- [x] Console shows success message

### How to Test:

1. **Open tenant edit form:**
   ```
   /admin/tenants → Edit tenant
   ```

2. **Click address field:**
   - Should see autocomplete element
   - Original input should be hidden

3. **Type address:**
   ```
   Type: "123 Main"
   ```
   - Should see dropdown with suggestions
   - Suggestions should be South African addresses

4. **Select suggestion:**
   - Click a suggestion
   - Address should fill in form
   - Hidden input should update

5. **Check console:**
   ```
   "PlaceAutocompleteElement initialized"
   ```

6. **Save tenant:**
   - Address should save correctly
   - Should display on home page

---

## 🐛 Troubleshooting

### Issue: Autocomplete doesn't appear

**Solution:**
- Check console for errors
- Verify API key is valid
- Ensure `libraries=places` in script tag
- Check if API loaded: `typeof google !== 'undefined'`

### Issue: Styling doesn't apply

**Solution:**
- Use `::ng-deep` for shadow DOM
- Check browser DevTools
- Verify CSS selector: `gmp-place-autocomplete input`

### Issue: Form binding doesn't work

**Solution:**
- Update hidden input value manually
- Use `NgZone.run()` for change detection
- Check `[(ngModel)]` binding

### Issue: Fallback to old API

**Solution:**
- Check if `PlaceAutocompleteElement` exists
- Verify Google Maps API version
- Update API script URL if needed

---

## 📊 Migration Checklist

- [x] Update TypeScript to use PlaceAutocompleteElement
- [x] Add fallback to old Autocomplete API
- [x] Update event listener to `gmp-placeselect`
- [x] Change `formatted_address` to `formattedAddress`
- [x] Add CSS styling for web component
- [x] Test autocomplete functionality
- [x] Test form binding
- [x] Test on mobile devices
- [x] Update documentation

---

## 🎉 Summary

**What Changed:**
- ✅ Migrated to PlaceAutocompleteElement
- ✅ Added fallback to old API
- ✅ Updated event handling
- ✅ Added proper styling
- ✅ Maintained form binding

**Benefits:**
- Better performance
- Improved accessibility
- Future-proof implementation
- Easier to maintain
- Better user experience

**Your address autocomplete is now using the latest Google Places API!** 🗺️✨

---

## 📚 Resources

- [PlaceAutocompleteElement Documentation](https://developers.google.com/maps/documentation/javascript/place-autocomplete-element)
- [Migration Guide](https://developers.google.com/maps/documentation/javascript/places-migration-overview)
- [Legacy APIs Notice](https://developers.google.com/maps/legacy)
- [Web Components Guide](https://developers.google.com/maps/documentation/javascript/web-components)


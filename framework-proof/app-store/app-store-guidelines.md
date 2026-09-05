---
id: app-store
title: "Apple App Store Review Guidelines (selected provisions)"
status: binding-policy
source_url: https://developer.apple.com/app-store/review/guidelines/
source_name: "Apple Inc., App Store Review Guidelines (developer.apple.com/app-store/review/guidelines/)"
retrieved: 2026-09-05
note: "Apple revises these guidelines frequently and does not stamp a machine-readable version date on the page. This file is a selected, verbatim excerpt of the provisions this cartridge audits against, retrieved on the date above. Re-fetch and re-date before relying on it later."
---

# Apple App Store Review Guidelines (selected provisions)

Apple's policy for what an app and its App Store metadata must do to pass review. This is the standard this cartridge audits an app's store listing against. Each provision below is quoted verbatim from Apple's published guidelines, wrapped in an anchor so a finding can cite it and a reader can check the two match.

## Verbatim provisions

### 2.3.1 Accurate metadata (misleading marketing)
<!-- verbatim:app-2.3.1 -->
Similarly, marketing your app in a misleading way, such as by promoting content or services that it does not actually offer (e.g. iOS-based virus and malware scanners) or promoting a false price, whether within or outside of the App Store, is grounds for removal of your app from the App Store or a block from installing via alternative distribution and termination of your developer account.
<!-- /verbatim -->

### 2.3.7 App names and metadata
<!-- verbatim:app-2.3.7 -->
Choose a unique app name, assign keywords that accurately describe your app, and don't try to pack any of your metadata with trademarked terms, popular app names, pricing information, or other irrelevant phrases just to game the system. App names must be limited to 30 characters. Metadata such as app names, subtitles, screenshots, and previews should not include prices, terms, or descriptions that are not specific to the metadata type.
<!-- /verbatim -->

### 2.3.10 Platform references
<!-- verbatim:app-2.3.10 -->
Make sure your app is focused on the experience of the Apple platforms it supports, and don't include names, icons, or imagery of other mobile platforms or alternative app marketplaces in your app or metadata, unless there is specific, approved interactive functionality.
<!-- /verbatim -->

### 3.1.1 In-App Purchase
<!-- verbatim:app-3.1.1 -->
If you want to unlock features or functionality within your app, (by way of example: subscriptions, in-game currencies, game levels, access to premium content, or unlocking a full version), you must use in-app purchase. Apps may not use their own mechanisms to unlock content or functionality, such as license keys, augmented reality markers, QR codes, cryptocurrencies and cryptocurrency wallets, etc.
<!-- /verbatim -->

### 3.1.2(c) Subscription information
<!-- verbatim:app-3.1.2c -->
Before asking a customer to subscribe, you should clearly describe what the user will get for the price. How many issues per month? How much cloud storage? What kind of access to your service?
<!-- /verbatim -->

### 5.1.1(i) Privacy policies
<!-- verbatim:app-5.1.1i -->
All apps must include a link to their privacy policy in the App Store Connect metadata field and within the app in an easily accessible manner.
<!-- /verbatim -->

### 5.1.1(v) Account sign-in and deletion
<!-- verbatim:app-5.1.1v -->
If your app supports account creation, you must also offer account deletion within the app.
<!-- /verbatim -->

## What this cartridge can and cannot judge

This cartridge audits an app's STORE LISTING TEXT (name, subtitle, promotional text, description, what's-new, subscription and privacy copy) against the provisions above. It cannot judge things that only the app binary reveals at review time (crashes, performance, whether a feature actually works). Those are out of scope for a metadata audit and get flagged OUT_OF_SCOPE, not passed and not failed.

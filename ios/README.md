# BaerVault for iPhone

The native client uses Clerk for sign-in and household selection. It reads the selected month's income, budget categories, and budget purchases through the existing Next.js mobile endpoint. The server remains responsible for household authorization and Supabase access.

On a Mac, install Xcode and XcodeGen, then run `cd ios && xcodegen generate`. Open `BaerVault.xcodeproj`. In the target build settings, set `BAERVAULT_API` to the HTTPS origin for the BaerVault environment you want to test, and `CLERK_PUBLISHABLE_KEY` to that environment's publishable key. Use the same Clerk instance as the server. Follow Clerk's iOS quickstart to register your app identifier and configure associated domains and authentication callbacks for enabled sign-in methods. Select your own development team for a device build.

For the first smoke test, use a test account in an existing test household. Sign in, select the household, and compare Home, Budget, and Purchases with the same month on the website. Move back a month, switch households, and sign out. Confirm the previous household's values are cleared and the app handles a network failure with a retry action.

This is the first read-only client. Budget and purchase editing, the full bank transaction ledger, Plaid Link, accounts, recurring payments, goals, investments, and AI spending reviews still need native flows and any required API endpoints.

- [Budget App architecture](https://github.com/lruiz5/budget-app) for a Next.js and SwiftUI app in one repo.
- [Clerk iOS quickstart](https://github.com/clerk/clerk-ios/tree/main/Examples/Quickstart) for native authentication.
- [Apple Food Truck example](https://github.com/apple/sample-food-truck) for SwiftUI navigation and Charts.
- [Plaid Link iOS](https://github.com/plaid/plaid-link-ios) for a later bank linking flow.

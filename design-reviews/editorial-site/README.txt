ASHIRA TANTRA — HTML REVIEW

index.html inside the ZIP is the complete deployable HTML page. Fonts, images, short background films, CSS and scripts are included in the file. Open it directly in a modern browser. Full-length films load on demand from the existing public media source.

All approved copy and prices are preserved. Individual and couples session bookings now link to the supplied TidyCal URL. Services without a configured calendar retain the existing availability message.

The deployable HTML includes index/follow, Philadelphia service and FAQ structured data, and the existing canonical route https://www.ashiratantra.com/private-tantra-sessions-philadelphia/ . Update the canonical/og:url together if the final publishing route changes. The hosted review copy uses noindex/follow to avoid indexing a duplicate preview.

No application framework or production-site files were changed.

TIDYCAL CONFIGURATION — SESSION BOOKING ENABLED

Find window.ASHIRA_CONFIG in index.html:

  bookingEnabled: true
  sessionUrl: 'https://tidycal.com/ashira/paid-session'

The supplied Tantra & Kundalini URL is enabled at your request. Existing session booking buttons open the current session summary dialog, whose continuation link opens TidyCal in a new tab with noopener/noreferrer protection. TidyCal controls availability, booking details and payment processing. No provider embed or custom checkout is loaded on the page. Setting bookingEnabled to false turns paid handoffs off again.

Provider check: the supplied /ashira/paid-session URL currently redirects to /ashira and displays "No booking types currently available". The website handoff is enabled, but the paid-session booking type must be enabled/published within TidyCal for visitors to choose a time. This update does not change TidyCal account, availability, payment, or form settings.

This integration is for Tantra & Kundalini only. Empty service URLs keep the availability message. Memberships use membershipUrl; conversations use conversationUrl; referrals use referralUrl. They never fall back to the single paid-session URL.

Individual and couples sessions share the confirmed 2-hour/$460 offer and sessionUrl. Each offering has its own button, preserving the chosen audience. The featured single-session option and monthly/twice-monthly options also have direct inquiry controls. Introductory-call buttons always use conversationUrl and clear any previous membership selection. conversationUrl is still empty because no introductory-call calendar URL has been supplied; set it to the confirmed calendar when available. It does not fall back to the paid-session calendar.

The hero and mobile booking bar's Explore Sessions controls scroll to #session-offerings. The final Begin Your Practice invitation retains the original conversation copy and audience controls. The 13 approved FAQs and client acknowledgment remain unchanged.

BOOKING ACKNOWLEDGMENT — CONFIGURE IN TIDYCAL

The required acknowledgment belongs in the booking provider's form, labeled "Client acknowledgment", with the exact text below. It must start unchecked and prevent submission until actively checked. The website does not create a duplicate booking form or custom checkout. Provider form settings are not changed by this HTML update.

I understand that Tantra sessions are professional, nonsexual experiences. I agree to respect the practitioner's physical and professional boundaries, and understand that inappropriate sexual behavior, harassment, or boundary violations may result in immediate termination of the session.

ASHIRA TANTRA — HTML REVIEW

index.html inside the ZIP is the complete deployable HTML page. Fonts, images, short background films, CSS and scripts are included in the file. Open it directly in a modern browser. Full-length films load on demand from the existing public media source.

All approved copy and prices are preserved. TidyCal is prepared but paid booking remains disabled; the inquiry controls retain the existing availability message.

The deployable HTML includes index/follow, Philadelphia service and FAQ structured data, and the existing canonical route https://www.ashiratantra.com/private-tantra-sessions-philadelphia/ . Update the canonical/og:url together if the final publishing route changes. The hosted review copy uses noindex/follow to avoid indexing a duplicate preview.

No application framework or production-site files were changed.

TIDYCAL CONFIGURATION — NOT LIVE

Find window.ASHIRA_CONFIG in index.html:

  bookingEnabled: false
  sessionUrl: 'https://tidycal.com/ashira/paid-session'

The Tantra & Kundalini URL is saved, but bookingEnabled is deliberately false. Existing booking buttons still open the current availability dialog and cannot send visitors to TidyCal while disabled. After payment processing is connected and tested, set bookingEnabled to true to enable the configured paid-service URLs. The existing dialog's continuation link will then open the relevant provider in a new tab with noopener/noreferrer protection. No provider embed or checkout is loaded on the page.

This integration is for Tantra & Kundalini only. Empty service URLs keep the availability message. Memberships use membershipUrl; conversations use conversationUrl; referrals use referralUrl. They never fall back to the single paid-session URL.

Individual and couples sessions share the confirmed 2-hour/$460 offer and sessionUrl. Each offering has its own button, preserving the chosen audience. The featured single-session option and monthly/twice-monthly options also have direct inquiry controls. Introductory-call buttons always use conversationUrl and clear any previous membership selection. conversationUrl is still empty because no introductory-call calendar URL has been supplied; set it to the confirmed calendar when available. It does not fall back to the paid-session calendar.

The hero and mobile booking bar's Explore Sessions controls scroll to #session-offerings. The final Begin Your Practice invitation retains the original conversation copy and audience controls. The 13 approved FAQs and client acknowledgment remain unchanged.

BOOKING ACKNOWLEDGMENT — CONFIGURE IN TIDYCAL

Before activating paid booking, configure the required acknowledgment in the booking provider's form, labeled "Client acknowledgment", with the exact text below. It must start unchecked and prevent submission until actively checked. The website does not create a duplicate booking form or custom checkout.

I understand that Tantra sessions are professional, nonsexual experiences. I agree to respect the practitioner's physical and professional boundaries, and understand that inappropriate sexual behavior, harassment, or boundary violations may result in immediate termination of the session.

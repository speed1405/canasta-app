import { PageLayout } from '../components/PageLayout'

export function PrivacyPolicy() {
  const lastUpdated = '2026-03-18'

  return (
    <PageLayout title="Privacy Policy">
      <div className="prose dark:prose-invert max-w-none space-y-6 text-slate-700 dark:text-slate-300">
        <p className="text-sm text-slate-500 dark:text-slate-400">Last updated: {lastUpdated}</p>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">1. Overview</h2>
          <p>
            Canasta App ("we", "our", or "us") is committed to protecting your privacy. This
            Privacy Policy explains what information we collect, how we use it, and your rights
            regarding your data.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">2. Information We Collect</h2>
          <p>
            <strong>Guest users:</strong> When you use Canasta App without an account, no
            personal data is collected or transmitted to our servers. All data (game statistics,
            lesson progress, practice results, and preferences) is stored locally in your
            browser's localStorage.
          </p>
          <p>
            <strong>Registered users:</strong> When you create an account, we collect:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Email address (required for authentication)</li>
            <li>Display name (chosen by you)</li>
            <li>Google profile information (only when you use "Sign in with Google")</li>
            <li>Game statistics, lesson completion, practice results, and app preferences (to enable cross-device sync)</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">3. How We Use Your Information</h2>
          <p>We use your information solely to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Authenticate you and maintain your account</li>
            <li>Sync your game data across devices</li>
            <li>Allow you to reset your password</li>
          </ul>
          <p>
            We do <strong>not</strong> sell, rent, or share your personal data with third parties
            for marketing purposes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">4. Data Storage</h2>
          <p>
            Registered user data is stored in Google Firebase (Firestore and Firebase
            Authentication). Firebase is subject to Google's Privacy Policy. Data is stored
            in Google's secure data centres and is protected by Firebase's security rules,
            which ensure that each user can only access their own data.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">5. Your Rights</h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Access the data we hold about you (available on your Profile page)</li>
            <li>Export your game statistics (available on the Stats page)</li>
            <li>Delete your account and all associated data (via Settings → Delete my account, or Profile → Delete My Account)</li>
            <li>Continue using the app as a guest at any time without creating an account</li>
          </ul>
          <p>
            When you delete your account, all cloud-stored data is permanently deleted within
            24 hours.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">6. Cookies &amp; Local Storage</h2>
          <p>
            We use browser localStorage (not cookies) to store preferences and game data
            locally on your device. No tracking cookies are used. Firebase may set a cookie
            for session management when you are signed in.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">7. Children's Privacy</h2>
          <p>
            Canasta App is not directed to children under 13. We do not knowingly collect
            personal information from children under 13.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Changes will be posted on
            this page with an updated date. Continued use of the app after changes constitutes
            acceptance of the revised policy.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">9. Contact</h2>
          <p>
            If you have questions about this Privacy Policy or wish to exercise your data
            rights, please open an issue in the project's GitHub repository.
          </p>
        </section>
      </div>
    </PageLayout>
  )
}

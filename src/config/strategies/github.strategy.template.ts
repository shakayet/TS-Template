/**
 * TEMPLATE: GitHub OAuth Strategy
 *
 * This is a template for adding GitHub OAuth support.
 * Copy and adapt this for other providers (Facebook, Apple, etc.)
 *
 * To use this:
 * 1. Rename to github.strategy.ts in src/config/strategies/
 * 2. Install: npm install passport-github2 @types/passport-github2
 * 3. Register in src/config/strategies/index.ts
 * 4. Add environment variables to .env
 * 5. Update src/config/index.ts with GitHub config
 * 6. Add routes in src/app/modules/oauth/oauth.route.ts
 */

import { Strategy as GitHubStrategy } from 'passport-github2';
import config from '../index';
import { User } from '../../app/modules/user/user.model';

/**
 * GitHub OAuth 2.0 Strategy
 * Creates or updates user from GitHub profile
 */

let githubStrategy: GitHubStrategy | null = null;

// Only initialize strategy if credentials are provided
if (
  config.oauth.github &&
  config.oauth.github.clientID &&
  config.oauth.github.clientSecret
) {
  githubStrategy = new GitHubStrategy(
    {
      clientID: config.oauth.github.clientID,
      clientSecret: config.oauth.github.clientSecret,
      callbackURL: config.oauth.github.callbackURL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const { id, displayName, emails, photos } = profile;
        // GitHub doesn't always provide email, use profile.email
        const email = emails?.[0]?.value || (profile as any).email;

        if (!email) {
          return done(new Error('No email provided by GitHub'));
        }

        // Find or create user
        let user = await User.findOne({ email });

        if (!user) {
          // Create new user from GitHub profile
          user = await User.create({
            email,
            name: displayName || (profile as any).login || 'User',
            firstName: displayName?.split(' ')[0] || 'User',
            lastName: displayName?.split(' ').slice(1).join(' ') || '',
            avatar: photos?.[0]?.value || (profile as any).avatarUrl,
            provider: 'github',
            providerId: String(id),
            verified: true, // GitHub verified the email
            status: 'active',
            contact: '',
            location: (profile as any).location || '',
            password: null,
          });
        } else {
          // Update existing user with GitHub provider info if not set
          if (!user.providerId) {
            user.provider = 'github';
            user.providerId = String(id);
            if (
              !user.avatar &&
              (photos?.[0]?.value || (profile as any).avatarUrl)
            ) {
              user.avatar = photos?.[0]?.value || (profile as any).avatarUrl;
            }
            await user.save();
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    },
  );
}

export { githubStrategy };

/**
 * Configuration needed in src/config/index.ts:
 *
 * oauth: {
 *   ...other providers...,
 *   github: {
 *     clientID: process.env.GITHUB_OAUTH_CLIENT_ID || '',
 *     clientSecret: process.env.GITHUB_OAUTH_CLIENT_SECRET || '',
 *     callbackURL: process.env.GITHUB_OAUTH_CALLBACK_URL ||
 *                  'http://localhost:5000/api/v1/oauth/github/callback',
 *   },
 * }
 *
 * Environment variables (.env):
 *
 * GITHUB_OAUTH_CLIENT_ID=
 * GITHUB_OAUTH_CLIENT_SECRET=
 * GITHUB_OAUTH_CALLBACK_URL=http://localhost:5000/api/v1/oauth/github/callback
 *
 * Routes to add in src/app/modules/oauth/oauth.route.ts:
 *
 * // GitHub OAuth Routes
 * router.get(
 *   '/github',
 *   passport.authenticate('github', {
 *     scope: ['user:email'],
 *   })
 * );
 *
 * router.get(
 *   '/github/callback',
 *   passport.authenticate('github', {
 *     failureRedirect: '/api/v1/oauth/login-failed',
 *     session: true,
 *   }),
 *   OAuthController.googleCallback  // or create specific controller
 * );
 *
 * Obtaining Credentials:
 * 1. Go to GitHub Settings > Developer settings > OAuth Apps
 * 2. Create new OAuth App
 * 3. Set Authorization callback URL to http://localhost:5000/api/v1/oauth/github/callback
 * 4. Copy Client ID and Client Secret to .env
 */

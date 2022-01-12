import { query as q } from "faunadb";
import NextAuth from "next-auth";
import Github from "next-auth/providers/github";
import { fauna } from "../../../services/fauna";

export default NextAuth({
  secret: process.env.NEXT_AUTH_SECRET, 
  providers: [
    Github({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      authorization: {
        params: {
          scope: "read:user",
        },
      },
    }),
  ],
  callbacks: {
    async session({session}) {
      try {
        const userActiveSubscription = await fauna.query(
          q.Get(
            q.Intersection([
              q.Match(
                q.Index("subscription_by_user_ref"),
                q.Select(
                  "ref",
                  q.Get(
                    q.Match(
                      q.Index("user_by_email"), q.Casefold(session.user.email)
                    )
                  )
                )
              ),
              q.Match(q.Index("subscription_by_status"), "active"),
            ])
          )
        );

        return {
          ...session,
          activeSubscription: userActiveSubscription
        };
      } catch (err) {
        console.log(err)
        return {
          ...session,
          activeSubscription: null,
        }
      }

    },

    async signIn({ user, account, profile }) {
      const { email } = user;

      try {
        await fauna.query(
          q.If(
            q.Not(
              q.Exists(
                q.Match(
                  q.Index("user_by_email"),
                  q.Casefold(user.email) // normalizar o case para ficar tudo lowercase
                )
              )
            ),
            q.Create(q.Collection("users"), { data: { email } }),
            q.Get(
              q.Match(
                q.Index("user_by_email"),
                q.Casefold(user.email) // normalizar o case para ficar tudo lowercase
              )
            )
          )
        );
        return true;
      } catch {
        return false;
      }
    },
  },
});

import { render, screen , fireEvent} from "@testing-library/react";
import { mocked } from "jest-mock";
import { useSession, signIn } from "next-auth/react";
import { SubscribeButton } from ".";
import { useRouter } from 'next/router'
jest.mock("next-auth/react");
jest.mock('next/router')


describe("SubscribeButton component", () => {
    it("renders correctly when user is not authenticated", () => {
        const useSessionMocked = mocked(useSession);

        useSessionMocked.mockReturnValueOnce({
            data: null,
            status: "unauthenticated",
        }); 


        render(<SubscribeButton />);
        expect(screen.getByText("Subscribe now")).toBeInTheDocument();
    });

    it('redirects user to sign in when not authenticated', () => {
        const useSessionMocked = mocked(useSession);
        const signInMocked = mocked(signIn)

        useSessionMocked.mockReturnValueOnce({
            data: null,
            status: "unauthenticated",
        }); 
    
        render(<SubscribeButton />);

        const subscribeButton = screen.getByText("Subscribe now")

        fireEvent.click(subscribeButton)

        expect(signInMocked).toHaveBeenCalled()

    })

   it("redirects to posts when user already has a subscription", () => {
       const useRouterMocked = mocked(useRouter)
       const useSessionMocked = mocked(useSession);

       useSessionMocked.mockReturnValueOnce({
           data: {
               user: {
                   name: "John Doe",
                   email: "johndoe@gmail.com",
               },
               activeSubscription: 'fake-active-subs',
               expires: "expires",
           },
           status: "authenticated",
       });

       const pushMock = jest.fn()

       useRouterMocked.mockReturnValueOnce({
           push: pushMock
       } as any)

       render(<SubscribeButton />);

       const subscribeButton = screen.getByText("Subscribe now")
       
       fireEvent.click(subscribeButton)

       expect(pushMock).toHaveBeenCalledWith('/posts')
   })
});

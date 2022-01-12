import { render, screen } from '@testing-library/react'
import Post, { getStaticProps } from '../../pages/posts/preview/[slug]'
import { mocked } from 'jest-mock'
import { getPrismicClient } from '../../services/prismic'
import { getSession, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

const post = {
    slug: 'my-new-post',
    title: 'My new post',
    content: "<p>Post excerpt</p>",
    updatedAt: 'March, 10'
}

jest.mock('next-auth/react')
jest.mock('next/router')
jest.mock('../../services/prismic')

describe("Post Preview page", () => {
    it('renders correctly', () => {
        const useSessionMocked = mocked(useSession);

        useSessionMocked.mockReturnValueOnce({
            data: null,
            status: "unauthenticated",
        }); 

        render(<Post post={post} />)

        expect(screen.getByText("My new post")).toBeInTheDocument()
        expect(screen.getByText("Post excerpt")).toBeInTheDocument()
        expect(screen.getByText("Wanna continue reading?")).toBeInTheDocument()
    })

    it('redirects user to full psot when user is subscribed', async () => {
        const useSessionMocked = mocked(useSession);
        const userRouterMocked = mocked(useRouter)
        const pushMock = jest.fn()

        useSessionMocked.mockReturnValueOnce({
            data: {
                activeSubscription: 'fake-active-subs',
            },
            status: "authenticated",
        } as any);
        
        userRouterMocked.mockReturnValueOnce({
            push: pushMock,
        } as any)
        
        render(<Post post={post} />)

        expect(pushMock).toHaveBeenCalledWith('/posts/my-new-post')
       
    })

    it('load initial data', async () => {
        const getPrismicClientMocked = mocked(getPrismicClient)

        getPrismicClientMocked.mockReturnValueOnce({
            getByUID: jest.fn().mockResolvedValueOnce({
                data: {
                    title: [
                        {
                            type: 'heading', text: 'My new post'
                        }
                    ],
                    content: [
                        {
                            type: 'paragraph', text: 'Post content'
                        }
                    ],
                },
                last_publication_date: '04-04-2021'
            })
        } as any)


       

        const response = await getStaticProps({ params: { slug: 'my-new-post'}})

        expect(response).toEqual(
            expect.objectContaining({ // PARA VER SE ELE CONTEM ESSE OBJETO E NÃO EXTRITAMENTE IGUAL
                props: {
                    post: {
                        slug: 'my-new-post',
                        title: 'My new post',
                        content: "<p>Post content</p>",
                        updatedAt: '04 de abril de 2021'
                    }
                }
            })
        )


    })
})
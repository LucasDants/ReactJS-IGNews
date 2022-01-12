import { render, screen } from '@testing-library/react'
import Post, { getServerSideProps } from '../../pages/posts/[slug]'
import { mocked } from 'jest-mock'
import { getPrismicClient } from '../../services/prismic'
import { getSession } from 'next-auth/react'

const post = {
        slug: 'my-new-post',
        title: 'My new post',
        content: "<p>Post excerpt</p>",
        updatedAt: 'March, 10'
    }

jest.mock('next-auth/react')

jest.mock('../../services/prismic')

describe("Post page", () => {
    it('renders correctly', () => {
        render(<Post post={post} />)
        expect(screen.getByText("My new post")).toBeInTheDocument()
        expect(screen.getByText("Post excerpt")).toBeInTheDocument()
    })

    it('redirects user if no subscription is found', async () => {
       const getSessionMocked = mocked(getSession)

       getSessionMocked.mockResolvedValueOnce({
           activeSubscription: null
       } as any)

         const response = await getServerSideProps({ params: { slug: 'my-new-post'}} as any)

        expect(response).toEqual(
            expect.objectContaining({ // PARA VER SE ELE CONTEM ESSE OBJETO E NÃO EXTRITAMENTE IGUAL
                    redirect: expect.objectContaining({
                        destination: '/',
                    })
            })
        )
    })

    it('load initial data', async () => {
        const getPrismicClientMocked = mocked(getPrismicClient)
        const getSessionMocked = mocked(getSession)

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


        getSessionMocked.mockResolvedValueOnce({
            activeSubscription: 'fake-active'
        } as any)

        const response = await getServerSideProps({ params: { slug: 'my-new-post' } } as any)

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
import { render, screen, waitFor, waitForElementToBeRemoved } from '@testing-library/react'
import { Async } from '.'


test('renders correctly', async () => {
    render(<Async />)

    expect(screen.getByText('Hello')).toBeInTheDocument()
    
    //  expect(await screen.findByText('button', { timeout: })).toBeInTheDocument()
    await waitFor(() => {
        return expect(screen.getByText('button')).toBeInTheDocument()
    })
    
    //waitForElementToBeRemoved(screen.queryByText('button'))

})
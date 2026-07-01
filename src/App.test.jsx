import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from './App';

describe('removing an item from the cart', () => {
  it('only removes the clicked item, leaving the others in the cart', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('heading', { name: 'Bruschetta' }).closest('.dish-card').querySelector('.add-btn'));
    await user.click(screen.getByRole('heading', { name: 'Soup of the Day' }).closest('.dish-card').querySelector('.add-btn'));

    const cart = screen.getByRole('complementary');
    const bruschettaCartItem = within(cart).getByText('Bruschetta').closest('.cart-item');
    await user.click(within(bruschettaCartItem).getByRole('button'));

    expect(within(cart).queryByText('Bruschetta')).not.toBeInTheDocument();
    expect(within(cart).getByText('Soup of the Day')).toBeInTheDocument();
  });
});

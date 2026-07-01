import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('Cart - remove single item', () => {
  it('removes only the selected item, keeping the others in the cart', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Ajoute deux plats distincts au panier
    const addButtons = screen.getAllByRole('button', { name: /add to cart/i });
    await user.click(addButtons[0]);
    await user.click(addButtons[1]);

    const cart = screen.getByRole('complementary'); // <aside className="cart">
    let items = within(cart).getAllByRole('listitem');
    expect(items).toHaveLength(2);

    const firstItemName = within(items[0]).getByText((_, el) => el.className === 'cart-item-name').textContent;
    const secondItemName = within(items[1]).getByText((_, el) => el.className === 'cart-item-name').textContent;

    // Supprime uniquement le premier article
    const removeButtons = within(cart).getAllByRole('button', { name: '✕' });
    await user.click(removeButtons[0]);

    items = within(cart).getAllByRole('listitem');
    expect(items).toHaveLength(1);
    expect(within(cart).getByText(secondItemName)).toBeInTheDocument();
    expect(within(cart).queryByText(firstItemName)).not.toBeInTheDocument();
  });
});

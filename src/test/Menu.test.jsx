import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Menu from '../components/Menu';

const dishes = [
  { id: 1, name: 'Bruschetta', description: 'Desc', price: 6.5, category: 'Starters', emoji: '🍞' },
  { id: 2, name: 'Classic Burger', description: 'Desc', price: 14.0, category: 'Mains', emoji: '🍔' },
  { id: 3, name: 'Tiramisu', description: 'Desc', price: 7.0, category: 'Desserts', emoji: '☕' },
];

function renderMenu(selectedCategory, onCategoryChange = vi.fn()) {
  render(
    <Menu
      dishes={dishes}
      selectedCategory={selectedCategory}
      onCategoryChange={onCategoryChange}
      onAddToCart={vi.fn()}
    />
  );
}

describe('Menu filters', () => {
  it('shows all dishes when "All" is selected', () => {
    renderMenu('All');
    expect(screen.getByText('Bruschetta')).toBeInTheDocument();
    expect(screen.getByText('Classic Burger')).toBeInTheDocument();
    expect(screen.getByText('Tiramisu')).toBeInTheDocument();
  });

  it('shows only Starters when "Starters" is selected', () => {
    renderMenu('Starters');
    expect(screen.getByText('Bruschetta')).toBeInTheDocument();
    expect(screen.queryByText('Classic Burger')).not.toBeInTheDocument();
    expect(screen.queryByText('Tiramisu')).not.toBeInTheDocument();
  });

  it('shows only Mains when "Mains" is selected', () => {
    renderMenu('Mains');
    expect(screen.getByText('Classic Burger')).toBeInTheDocument();
    expect(screen.queryByText('Bruschetta')).not.toBeInTheDocument();
    expect(screen.queryByText('Tiramisu')).not.toBeInTheDocument();
  });

  it('shows only Desserts when "Desserts" is selected', () => {
    renderMenu('Desserts');
    expect(screen.getByText('Tiramisu')).toBeInTheDocument();
    expect(screen.queryByText('Bruschetta')).not.toBeInTheDocument();
    expect(screen.queryByText('Classic Burger')).not.toBeInTheDocument();
  });

  it('calls onCategoryChange with the correct category when a filter is clicked', async () => {
    const onCategoryChange = vi.fn();
    renderMenu('All', onCategoryChange);
    await userEvent.click(screen.getByRole('button', { name: 'Mains' }));
    expect(onCategoryChange).toHaveBeenCalledWith('Mains');
  });
});

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { DatePicker } from './date-picker';

// jsdom doesn't support the Popover API so the popover div is in the DOM but
// hidden from the accessibility tree. We use { hidden: true } or container
// queries to reach elements inside the popover.

function getGrid(container: HTMLElement) {
    const grid = container.querySelector('table[role="grid"]');
    if (!grid) throw new Error('Calendar grid not found');
    return grid as HTMLTableElement;
}

function getDialog(container: HTMLElement) {
    const dialog = container.querySelector('[role="dialog"]');
    if (!dialog) throw new Error('Dialog not found');
    return dialog as HTMLElement;
}

describe('DatePicker', () => {
    // ─── Rendering ───────────────────────────────────────────────────

    it('renders the trigger button with placeholder text', () => {
        render(<DatePicker onChange={vi.fn()} />);
        const button = screen.getByRole('button', { name: /pick a date/i });
        expect(button).toBeInTheDocument();
    });

    it('renders custom placeholder text', () => {
        render(<DatePicker onChange={vi.fn()} placeholder="Select deadline" />);
        expect(screen.getByRole('button', { name: /select deadline/i })).toBeInTheDocument();
    });

    it('displays the formatted date when a value is provided', () => {
        render(<DatePicker value="2025-03-15" onChange={vi.fn()} />);
        const button = screen.getByRole('button');
        expect(button).toHaveTextContent('Mar 15, 2025');
    });

    it('renders the calendar grid inside the popover', () => {
        const { container } = render(<DatePicker onChange={vi.fn()} />);
        expect(getGrid(container)).toBeInTheDocument();
    });

    it('applies disabled state to the trigger button', () => {
        render(<DatePicker onChange={vi.fn()} disabled />);
        expect(screen.getByRole('button')).toBeDisabled();
    });

    // ─── Accessibility ───────────────────────────────────────────────

    it('has aria-haspopup="dialog" on the trigger button', () => {
        render(<DatePicker onChange={vi.fn()} />);
        expect(screen.getByRole('button')).toHaveAttribute('aria-haspopup', 'dialog');
    });

    it('has aria-label reflecting selected date', () => {
        render(<DatePicker value="2025-06-20" onChange={vi.fn()} />);
        expect(screen.getByRole('button')).toHaveAttribute(
            'aria-label',
            expect.stringContaining('Jun 20, 2025')
        );
    });

    it('has aria-label with placeholder when no date selected', () => {
        render(<DatePicker onChange={vi.fn()} placeholder="Choose date" />);
        expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'Choose date');
    });

    it('renders the popover container with role="dialog"', () => {
        const { container } = render(<DatePicker onChange={vi.fn()} />);
        expect(getDialog(container)).toBeInTheDocument();
    });

    it('has aria-label="Date picker" on the dialog', () => {
        const { container } = render(<DatePicker onChange={vi.fn()} />);
        expect(getDialog(container)).toHaveAttribute('aria-label', 'Date picker');
    });

    it('hides the calendar icon from assistive technology', () => {
        const { container } = render(<DatePicker onChange={vi.fn()} />);
        const svg = container.querySelector('button > svg');
        expect(svg).toHaveAttribute('aria-hidden', 'true');
    });

    // ─── Date Selection ──────────────────────────────────────────────

    it('calls onChange with formatted date string when a day is clicked', async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();
        const { container } = render(<DatePicker value="2025-03-01" onChange={handleChange} />);

        const grid = getGrid(container);
        const day15 = within(grid).getByText('15');
        await user.click(day15);

        expect(handleChange).toHaveBeenCalledWith('2025-03-15');
    });

    it('does not call onChange when clicking a disabled date (before min)', async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();
        const { container } = render(
            <DatePicker
                value="2025-03-15"
                onChange={handleChange}
                min="2025-03-10"
            />
        );

        const grid = getGrid(container);
        const day5 = within(grid).getByText('5');
        await user.click(day5);

        expect(handleChange).not.toHaveBeenCalled();
    });

    it('does not call onChange when clicking a disabled date (after max)', async () => {
        const user = userEvent.setup();
        const handleChange = vi.fn();
        const { container } = render(
            <DatePicker
                value="2025-03-15"
                onChange={handleChange}
                max="2025-03-20"
            />
        );

        const grid = getGrid(container);
        const day25 = within(grid).getByText('25');
        await user.click(day25);

        expect(handleChange).not.toHaveBeenCalled();
    });

    // ─── Month Navigation ────────────────────────────────────────────

    it('navigates to the next month when the next button is clicked', async () => {
        const user = userEvent.setup();
        const { container } = render(<DatePicker value="2025-01-15" onChange={vi.fn()} />);
        const dialog = getDialog(container);

        expect(within(dialog).getByText(/January 2025/i)).toBeInTheDocument();

        const nextButton = within(dialog).getByLabelText(/next/i);
        await user.click(nextButton);

        expect(within(dialog).getByText(/February 2025/i)).toBeInTheDocument();
    });

    it('navigates to the previous month when the previous button is clicked', async () => {
        const user = userEvent.setup();
        const { container } = render(<DatePicker value="2025-03-15" onChange={vi.fn()} />);
        const dialog = getDialog(container);

        expect(within(dialog).getByText(/March 2025/i)).toBeInTheDocument();

        const prevButton = within(dialog).getByLabelText(/previous/i);
        await user.click(prevButton);

        expect(within(dialog).getByText(/February 2025/i)).toBeInTheDocument();
    });

    it('can navigate across year boundaries', async () => {
        const user = userEvent.setup();
        const { container } = render(<DatePicker value="2025-01-15" onChange={vi.fn()} />);
        const dialog = getDialog(container);

        expect(within(dialog).getByText(/January 2025/i)).toBeInTheDocument();

        const prevButton = within(dialog).getByLabelText(/previous/i);
        await user.click(prevButton);

        expect(within(dialog).getByText(/December 2024/i)).toBeInTheDocument();
    });

    // ─── Fixed Weeks (Consistent Height) ─────────────────────────────

    it('always renders exactly 6 week rows regardless of month', async () => {
        const user = userEvent.setup();
        const { container } = render(<DatePicker value="2025-02-01" onChange={vi.fn()} />);
        const dialog = getDialog(container);

        const getWeekRows = () => getGrid(container).querySelectorAll('tbody tr');

        // February 2025 starts on Saturday — only needs 5 rows normally
        expect(getWeekRows()).toHaveLength(6);

        // Navigate to March 2025
        const nextButton = within(dialog).getByLabelText(/next/i);
        await user.click(nextButton);
        expect(getWeekRows()).toHaveLength(6);

        // Navigate to April 2025
        await user.click(nextButton);
        expect(getWeekRows()).toHaveLength(6);
    });

    it('renders 6 week rows for months with different day counts', () => {
        const months = [
            '2025-01-01', // 31 days, starts Wednesday
            '2025-02-01', // 28 days, starts Saturday
            '2024-02-01', // 29 days (leap year), starts Thursday
            '2025-04-01', // 30 days, starts Tuesday
            '2025-08-01', // 31 days, starts Friday
        ];

        for (const month of months) {
            const { container, unmount } = render(<DatePicker value={month} onChange={vi.fn()} />);
            const weekRows = getGrid(container).querySelectorAll('tbody tr');
            expect(weekRows).toHaveLength(6);
            unmount();
        }
    });

    // ─── Edge Cases ──────────────────────────────────────────────────

    it('handles undefined value gracefully', () => {
        render(<DatePicker onChange={vi.fn()} />);
        const button = screen.getByRole('button');
        expect(button).toHaveTextContent('Pick a date');
    });

    it('handles empty string value gracefully', () => {
        render(<DatePicker value="" onChange={vi.fn()} />);
        const button = screen.getByRole('button');
        expect(button).toHaveTextContent('Pick a date');
    });

    it('renders weekday headers', () => {
        const { container } = render(<DatePicker value="2025-03-01" onChange={vi.fn()} />);
        const headers = getGrid(container).querySelectorAll('thead th');
        expect(headers.length).toBe(7);
    });

    it('highlights the selected date with aria-selected', () => {
        const { container } = render(<DatePicker value="2025-03-15" onChange={vi.fn()} />);
        const grid = getGrid(container);
        const day15 = within(grid).getByText('15');
        expect(day15.closest('td')).toHaveAttribute('aria-selected', 'true');
    });
});

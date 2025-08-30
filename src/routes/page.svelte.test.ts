import { describe, test, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import Page from './+page.svelte';

describe('/+page.svelte', () => {
	test('should render mortgage calculator', () => {
		render(Page);
		expect(screen.getByText('Hypotheek Calculator')).toBeInTheDocument();
		expect(screen.getByText('Parameters')).toBeInTheDocument();
		expect(screen.getByText('Resultaat')).toBeInTheDocument();
		expect(screen.getByLabelText('Lening bedrag (€)')).toBeInTheDocument();
	});
});

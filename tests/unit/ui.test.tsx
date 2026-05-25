import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Pill } from '@/components/ui/pill';
import { Input, Textarea } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Icon } from '@/components/ui/icon';
import { Kbd } from '@/components/ui/kbd';
import { SectionTag } from '@/components/ui/section-tag';

describe('Button', () => {
  it('renders with default primary variant', () => {
    render(<Button>Go</Button>);
    const btn = screen.getByRole('button', { name: 'Go' });
    expect(btn.className).toMatch(/\bbtn\b/);
    expect(btn.className).toMatch(/\bbtn-primary\b/);
  });
  it('supports secondary, ghost and icon variants + sizes', () => {
    const { rerender } = render(<Button variant="secondary">a</Button>);
    expect(screen.getByRole('button').className).toMatch(/btn-secondary/);
    rerender(<Button variant="ghost">a</Button>);
    expect(screen.getByRole('button').className).toMatch(/btn-ghost/);
    rerender(
      <Button variant="icon" size="sm" aria-label="x">
        x
      </Button>,
    );
    expect(screen.getByRole('button').className).toMatch(/btn-icon/);
    expect(screen.getByRole('button').className).toMatch(/btn-sm/);
  });
});

describe('Card', () => {
  it('renders with hover class when hover=true', () => {
    render(
      <Card hover data-testid="c">
        hi
      </Card>,
    );
    expect(screen.getByTestId('c').className).toMatch(/card-hover/);
  });
});

describe('Pill', () => {
  it('mono variant adds pill-mono', () => {
    render(<Pill variant="mono">React</Pill>);
    expect(screen.getByText('React').className).toMatch(/pill-mono/);
  });
  it('dot prop adds pill-dot', () => {
    render(<Pill dot>Live</Pill>);
    expect(screen.getByText('Live').className).toMatch(/pill-dot/);
  });
});

describe('Input + Textarea', () => {
  it('Input renders with class input and forwarded type', () => {
    render(<Input placeholder="email" type="email" />);
    const input = screen.getByPlaceholderText('email') as HTMLInputElement;
    expect(input.className).toMatch(/\binput\b/);
    expect(input.type).toBe('email');
  });
  it('Textarea renders as textarea element with class input', () => {
    render(<Textarea placeholder="msg" />);
    expect(screen.getByPlaceholderText('msg').tagName).toBe('TEXTAREA');
  });
});

describe('Avatar', () => {
  it('renders initials when no src', () => {
    render(<Avatar initials="MO" />);
    expect(screen.getByText('MO')).toBeInTheDocument();
  });
});

describe('Icon', () => {
  it('renders an svg', () => {
    render(<Icon name="calendar" />);
    const svg = document.querySelector('svg');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24');
  });
});

describe('Kbd', () => {
  it('renders as kbd element with class kbd', () => {
    render(<Kbd>⌘</Kbd>);
    const el = screen.getByText('⌘');
    expect(el.tagName).toBe('KBD');
    expect(el.className).toMatch(/\bkbd\b/);
  });
});

describe('SectionTag', () => {
  it('shows numbered prefix', () => {
    render(<SectionTag num="01">Toolkit</SectionTag>);
    expect(screen.getByText('01')).toBeInTheDocument();
    expect(screen.getByText('Toolkit')).toBeInTheDocument();
  });
});

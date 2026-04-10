import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

const matchMediaMock = vi.fn().mockImplementation((query) => ({
  matches: query.includes('dark'),
  media: query,
  onchange: null,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  addListener: vi.fn(),
  removeListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: matchMediaMock,
});

window.scrollTo = vi.fn();

vi.mock('framer-motion', async () => {
  const React = await import('react');

  const motionProps = new Set([
    'animate',
    'exit',
    'initial',
    'layout',
    'layoutId',
    'transition',
    'whileHover',
    'whileTap',
  ]);

  const createMotionComponent = (tag) =>
    Object.assign(
      React.forwardRef(({ children, ...props }, ref) => {
        const cleanedProps = { ...props, ref };

        motionProps.forEach((propName) => {
          delete cleanedProps[propName];
        });

        return React.createElement(tag, cleanedProps, children);
      }),
      {
        displayName: `MockMotion(${String(tag)})`,
      }
    );

  return {
    AnimatePresence: ({ children }) => children,
    LazyMotion: ({ children }) => children,
    MotionConfig: ({ children }) => children,
    domAnimation: {},
    motion: new Proxy(
      {},
      {
        get: (_target, property) => createMotionComponent(property),
      }
    ),
  };
});

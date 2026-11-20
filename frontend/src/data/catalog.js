export const collections = [
  { id: 'minimal', name: 'Minimal Setup', image: '/setups/setup 1.webp', copy: 'Clean lines, quieter finishes, and the essentials for a focused desk.', accent: 'cyan' },
  { id: 'rgb', name: 'RGB Setup', image: '/setups/setup2.webp', copy: 'Build a desk that comes alive after dark, one splash of colour at a time.', accent: 'pink' },
  { id: 'pro', name: 'Pro Setup', image: '/setups/setup2.webp', copy: 'Responsive controls, fast displays, and comfort for long sessions.', accent: 'purple' },
]

export const getCollection = (id) => collections.find((collection) => collection.id === id)

# A Boring TCG

A simple web-based Trading Card Game where you can open booster packs and collect cards.

## Features

- Open Humanoid Booster packs with a timer
- Collect and view your card collection
- Responsive design that works on desktop and mobile

## Local Development

1. Clone this repository
2. Open `index.html` in your browser

Or use a local server:

```bash
# Using Python (if installed)
python -m http.server 8000

# Or using Node.js
npx serve .
```

## Deployment

This is a static website that can be deployed to any static hosting service:

### GitHub Pages
1. Push your code to a GitHub repository
2. Go to Settings > Pages
3. Select the main branch and click Save

### Netlify
1. Drag and drop your project folder to Netlify's dashboard
2. Or connect your GitHub repository
3. Netlify will automatically deploy your site

### Vercel
1. Install Vercel CLI: `npm install -g vercel`
2. Run `vercel` in the project directory
3. Follow the prompts to deploy

## Technologies Used

- HTML5, CSS3, JavaScript (ES6+)
- LocalStorage for data persistence
- No external dependencies

## License

MIT

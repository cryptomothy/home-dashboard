# Home Dashboard

A modern, customizable personal dashboard built with SvelteKit, featuring real-time widgets for weather, transportation, news, cryptocurrency, and more.

![SvelteKit](https://img.shields.io/badge/SvelteKit-FF3E00?style=flat&logo=svelte&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)

## 📱 About

This dashboard is specifically designed to run on a **home tablet** (such as an iPad or Android tablet), providing an always-on information center for your household. The UI is optimized for tablet screens and includes features like real-time updates, an always-visible clock, and configurable widgets.

> **⚠️ Important Note**: Several widgets are specifically designed for **Quebec, Canada** and will only work in this region:
>
> - **🚴 Bike Widget**: Uses BIXI (Montreal's bike-sharing system)
> - **🚌 Bus Widget**: Integrates with RTC (Réseau de transport de la Capitale - Quebec City transit)
> - **🎯 Bonjour Quebec Widget**: Aggregates Quebec-specific content
>
> If you're outside Quebec, you can disable these widgets and use the other universal widgets (Weather, News, Crypto, Hacker News, Todo, Map).

## ✨ Features

### Available Widgets

#### 🌍 Universal Widgets (Work Anywhere)

- **🌤️ Weather Widget** - Real-time weather information and forecasts
- **📝 Todo Widget** - Task management with local storage persistence
- **🗺️ Map Widget** - Interactive map with multiple style options
- **💰 Crypto Widget** - Cryptocurrency prices and trends
- **📰 News Widget** - Latest news headlines
- **💻 Hacker News Widget** - Top stories from Hacker News

#### 🍁 Quebec-Specific Widgets

- **🚴 Bike Widget** - Real-time bike-sharing availability (BIXI - Montreal)
- **🚌 Bus Widget** - Public transit schedules and arrivals (RTC - Quebec City)
- **🎯 Bonjour Quebec Widget** - Quebec-specific content aggregator

### Core Features

- **🔒 IP-based Access Control** - Secure your dashboard with IP restrictions
- **⚙️ Widget Management** - Toggle widgets on/off via settings modal
- **🎨 Modern UI** - Beautiful gradient effects and smooth animations
- **📱 Responsive Design** - Works seamlessly across devices
- **⏰ Real-time Clock** - Always-visible time and date display
- **🎯 Grid Layout** - Flexible 8-column responsive grid system

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/home-dashboard.git
cd home-dashboard
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp env.example .env
```

Edit `.env` and configure your API keys and settings.

4. Start the development server:

```bash
pnpm dev
```

The app will be available at `http://localhost:5173`

## 📱 Tablet Setup (Recommended Usage)

This dashboard is designed to run continuously on a tablet at home. Here are some setup recommendations:

### For iPad/iOS:

1. Open the dashboard in Chrome
2. Add to Home Screen for full-screen experience
3. Enable "Guided Access" to prevent accidental navigation away
4. Disable auto-lock in Settings > Display & Brightness > Auto-Lock

### For Android Tablets:

1. Open the dashboard in Chrome
2. Add to Home Screen for full-screen experience
3. Use "Kiosk Mode" apps to lock the tablet to the dashboard
4. Adjust screen timeout settings to keep display on

### Network Configuration:

- Connect your tablet to your home WiFi
- Configure the `LOCAL_IP` and `ALLOWED_IP_*` variables in `.env` to include your home network IPs
- The dashboard includes IP-based access control for security

### Power Management:

- Keep the tablet plugged in continuously
- Consider using a tablet stand or wall mount
- Adjust screen brightness for comfortable 24/7 viewing

## 🛠️ Development

### Available Scripts

```bash
# Start development server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Type checking
pnpm check

# Type checking (watch mode)
pnpm check:watch
```

### Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── dashboard/          # Widget components
│   │   ├── ui/                 # shadcn-svelte UI components
│   │   └── WidgetSettingsModal.svelte
│   ├── services/               # API services for data fetching
│   ├── config/                 # Configuration files
│   ├── types/                  # TypeScript type definitions
│   └── utils.ts               # Utility functions
├── routes/
│   ├── +page.svelte           # Main dashboard page
│   ├── +layout.svelte         # Root layout
│   └── api/                   # API routes
└── app.html                   # HTML template
```

## 🎨 Customization

### Adapting for Your Region

If you're outside Quebec, you can easily adapt the dashboard:

1. **Disable Quebec-specific widgets** in the settings modal (⚙️ icon)
2. **Replace transit widgets**: Modify `src/lib/services/bikeService.ts` and `src/lib/services/rtcService.ts` to use your local transit APIs
3. **Adjust location settings**: Update `PUBLIC_DEFAULT_LAT` and `PUBLIC_DEFAULT_LON` in `.env` for your location
4. **Customize content sources**: Update API endpoints in the service files to match your preferred data sources

### Adding New Widgets

1. Create a new widget component in `src/lib/components/dashboard/`
2. Create a corresponding service in `src/lib/services/` if needed
3. Register the widget in `src/routes/+page.svelte`:

```typescript
let availableWidgets = [
  // ... existing widgets
  {
    name: 'myWidget',
    active: false,
    component: MyWidget,
  },
];
```

### Styling

The dashboard uses TailwindCSS with a custom dark theme featuring:

- Gradient effects (cyan, purple, green, orange)
- Glassmorphism effects
- Smooth animations and transitions

Modify `tailwind.config.js` to customize the theme.

## 🔐 Security

The dashboard includes IP-based access control. Configure allowed IPs in your environment variables or through the `ipRestrictionService`.

## 🏗️ Tech Stack

- **Framework**: [SvelteKit](https://kit.svelte.dev/)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: [shadcn-svelte](https://www.shadcn-svelte.com/)
- **Icons**: [Lucide Svelte](https://lucide.dev/)
- **Build Tool**: Vite

## 📦 Deployment

Build the production version:

```bash
pnpm build
```

The built app will be in the `build/` directory. Deploy it to your preferred hosting platform:

- Vercel
- Netlify
- Cloudflare Pages
- Your own server

> Note: You may need to install an appropriate [SvelteKit adapter](https://svelte.dev/docs/kit/adapters) for your target platform.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is private and proprietary.

## 🙏 Acknowledgments

- Weather data provided by appropriate weather APIs
- Transit data from RTC (Réseau de transport de la Capitale)
- Bike-sharing data from BIXI
- Built with amazing open-source tools and libraries

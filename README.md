# Whispy CV

A modern, React-based CV builder with live preview, watermark system, and PDF export.

## Features

- **CV Form Builder** – Fill in your personal details, work experience, education, and skills through an intuitive form.
- **Live Preview** – See a real-time preview of your CV as you type.
- **PDF Export** – Download your finished CV as a PDF file.
- **Free Tier with Watermark** – Generate and download a CV for free with a subtle watermark.
- **Premium (No Watermark)** – Pay via Stripe to remove the watermark and download a clean PDF.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | [React](https://reactjs.org/) |
| Authentication & Backend | [Firebase](https://firebase.google.com/) (Auth + Firestore / Functions) |
| Payments | [Stripe](https://stripe.com/) |
| PDF Generation | React-PDF / html2canvas or similar |

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm or yarn
- A Firebase project (Auth + Firestore enabled)
- A Stripe account (test keys for development)

### Installation

```bash
# Clone the repository
git clone https://github.com/Majk98/whispy-cv.git
cd whispy-cv

# Install dependencies
npm install
```

### Environment Variables

Copy the example env file and fill in your credentials:

```bash
cp .env.example .env
```

Required variables (see `.env.example` for a full list):

```
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_STRIPE_PUBLISHABLE_KEY=
```

### Running Locally

```bash
npm start
```

The app will be available at `http://localhost:3000`.

### Building for Production

```bash
npm run build
```

## Project Structure

```
whispy-cv/
├── public/             # Static assets
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page-level components
│   ├── firebase/       # Firebase configuration & helpers
│   ├── stripe/         # Stripe integration helpers
│   ├── utils/          # Utility functions (PDF generation, etc.)
│   └── App.js          # Root component
├── .env.example        # Example environment variables
├── .gitignore
└── package.json
```

## License

[MIT](LICENSE)

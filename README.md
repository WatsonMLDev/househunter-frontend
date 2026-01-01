# HouseHunter Frontend

The frontend for HouseHunter, built with React and Vite. It provides a modern, responsive interface for browsing real estate listings, visualizing them on a map with isochrone overlays, and managing your house hunt.

## 🚀 Features

- **Interactive Map:** Leaflet-based map visualization showing property locations and commute zone isochrones.
- **Property Cards:** Detailed cards showing price, address, stats, and images.
- **Filtering:** Robust sidebar for filtering by price, beds/baths, status, and custom "Hunter Tiers" (Gold/Silver/Bronze).
- **Workflow Management:** Mark properties as Favorites, Rejected, or Undecided.
- **History View:** Inspect price and status changes for any property.

## 🛠️ Tech Stack

- **Framework:** React 18 + Vite
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Map:** React Leaftlet
- **Icons:** Lucide React

## 🔧 Installation

### Prerequisites
- Node.js 18+
- npm

### Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/WatsonMLDev/househunter-frontend.git
    cd househunter-frontend
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file (or use defaults):
    ```env
    VITE_API_BASE_URL=http://localhost:8000
    ```

## 🏃 Usage

Start the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

## 📂 Project Structure

- `src/`
  - `components/`: Reusable UI components (`PropertyCard`, `FilterSidebar`)
  - `services/`: API integration and data services
  - `types.ts`: TypeScript definitions for the data model
  - `App.tsx`: Main application controller

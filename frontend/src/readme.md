

# 🌍 **TravelMind AI**

A full-stack travel planning web application that helps users create structured, personalized trip itineraries with real-time data integration.

---

## 📌 **Overview**

**TravelMind AI** allows users to plan complete trips from a single interface. It combines itinerary generation, weather insights, budgeting tools, emergency assistance, and trip management features into one platform.

The system uses a multi-step backend pipeline to gather external data (weather, currency, location) and generate structured travel plans that can be viewed, edited, shared, and exported.

---

## ✨ **Features**

### ✈️ Trip Planning

* Generate day-wise itineraries (morning / afternoon / evening)
* Supports international and domestic trips
* Preference-based customization (food, culture, adventure, etc.)

### 🌦 Weather Integration

* Current weather and 5-day forecast
* Weather-aware suggestions

### 💰 Budget Tracking

* Estimated cost breakdown
* Actual spend tracking with comparison

### 🗺 Maps & Emergency Services

* Interactive map view
* Nearby:

  * 🏥 Hospitals
  * 🚓 Police stations
  * 💊 Pharmacies

### 💬 AI Trip Assistant

* Ask follow-up questions
* Modify itinerary dynamically

### 📤 Sharing & Export

* Public shareable trip links
* Export as:

  * PDF
  * JSON
  * Text

### ❤️ Wishlist & Reminders

* Save destinations
* Email-based reminder system

### 👤 User Profiles

* Preferences (currency, travel style, country)
* Travel stats and history

### 🎨 Themes

* Multiple UI themes with instant switching

---

## 🧱 **Tech Stack**

### 🖥 Frontend

* React (Vite)
* Tailwind CSS
* React Router
* Axios
* Leaflet (maps)

### ⚙ Backend

* FastAPI
* PostgreSQL (SQLite fallback)
* SQLAlchemy
* JWT Authentication
* APScheduler
* ReportLab (PDF export)

### 🤖 AI & Data

* LangGraph + LangChain
* Groq API (LLaMA 3.3)
* OpenWeatherMap (weather)
* Frankfurter API (currency)
* OpenCage (geocoding)
* Overpass API (emergency services)

---

## ⚙️ **Setup Instructions**

### 🔧 Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate

pip install -r requirements.txt
```

---

### 🔐 Create `.env` file

```env
DATABASE_URL=postgresql://user:password@localhost:5432/travelmind

GROQ_API_KEY=your_key
OPENWEATHER_API_KEY=your_key
OPENCAGE_API_KEY=your_key

EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

JWT_SECRET=your_secret
```

---

### ▶ Run Backend

```bash
uvicorn main:app --reload
```

---

### 🎨 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 **Demo**

Use the following sample input:

* **Destination:** Paris
* **Budget:** 150000
* **Duration:** 5 days
* **Preferences:** Food, Culture, Nightlife

---

## 📸 **Screenshots**

*Add your screenshots here*

```md
![Dashboard](assets/screenshots/dashboard.png)
![Planner](assets/screenshots/plan-trip.png)
![Itinerary](assets/screenshots/itinerary.png)
```

---

## 🎥 **Demo Video**

*Add your demo video link here (YouTube recommended)*

```md
https://your-video-link
```

---

## 📂 **Project Structure**

```
backend/
frontend/
README.md
```

---

## 🚀 **Future Improvements**

* Booking integration (flights, hotels)
* Offline itinerary support
* Mobile-friendly version
* Advanced personalization using user history

---

## 👤 **Author**

**Jui Kulkarni**


<img width="1344" height="692" alt="image" src="https://github.com/user-attachments/assets/f339df5e-a412-4cdc-9f83-b8d03fb71686" />
<img width="1366" height="683" alt="image" src="https://github.com/user-attachments/assets/264c8829-956f-4e99-9cd4-b2231d183b6a" />
<img width="1366" height="683" alt="image" src="https://github.com/user-attachments/assets/85d9cafd-6c3f-41ba-884b-c3c04e6135d7" />
<img width="1366" height="699" alt="image" src="https://github.com/user-attachments/assets/da39207f-f9f2-4fc0-a456-c14fcbe2dc90" />






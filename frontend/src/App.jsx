import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/event/Dashboard';
import EventForm from './pages/event/Components/EventForm';
import Feed from './pages/feed/Feed';
import FeedDetail from './pages/feed/FeedDetail';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create" element={<EventForm />} />
        <Route path="/edit/:id" element={<EventForm />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/feed/:id" element={<FeedDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

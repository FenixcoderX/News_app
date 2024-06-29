import './App.css';
import NavBar from './components/NavBar';
import { Routes, Route } from 'react-router-dom';
import LogIn from './pages/LogIn';
import SignUp from './pages/SignUp';
import NewsList from './pages/NewsList';
import NewsNew from './pages/NewsNew';

function App() {

  return (
    <div className="App-main">
      <NavBar />
      <Routes>
        <Route path="/" exact element={<NewsList />} />
        <Route path="/new" element={<NewsNew />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </div>
  );
}

export default App;

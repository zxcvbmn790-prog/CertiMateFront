import { BrowserRouter } from 'react-router-dom'
import Header from './components/common/Header'
import AppRouter from './routes/AppRouter'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Header />
      <AppRouter />
    </BrowserRouter>
  )
}

export default App

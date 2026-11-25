import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home  from './pages/Home';
import Assistant from './pages/Assistant';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/assistente" element={<Assistant />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
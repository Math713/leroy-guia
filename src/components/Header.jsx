
import { Link } from 'react-router-dom';

function Header() {
    return (
        <header className="bg-white border-bottom">
            <nav className="container py-3 d-flex justify-content-between align-items-center">

                <Link to="/" className="text-decoration-none">
                    <h3 className="mb-0 text-success fw-bold">
                        Leroy Guia
                    </h3>
                </Link>

                <Link
                    to="/assistente"
                    className="btn btn-success"
                >
                    Acessar assistente
                </Link>

            </nav>
        </header>
    );
}

export default Header;
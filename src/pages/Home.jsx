
import { Link } from 'react-router-dom';
import Header from '../components/Header';

const categories = [
    {
        id: 1,
        name: 'Pintura',
        description: 'Tintas, pincéis e preparação',
        icon: '🎨',
        question: 'Quero pintar uma parede. O que eu preciso?'
    },
    {
        id: 2,
        name: 'Elétrica',
        description: 'Lâmpadas, tomadas e iluminação',
        icon: '💡',
        question: 'Preciso trocar uma lâmpada e uma tomada em casa. O que eu preciso?'
    },
    {
        id: 3,
        name: 'Hidráulica',
        description: 'Torneiras, tubos e vazamentos',
        icon: '🚿',
        question: 'Minha torneira está com vazamento. O que posso fazer?'
    },
    {
        id: 4,
        name: 'Reparos',
        description: 'Ferramentas e manutenção',
        icon: '🔧',
        question: 'Quero fazer pequenos reparos em casa. Quais ferramentas eu preciso?'
    }
];

function Home() {
    return (
        <>
            <Header />

            <main className="container py-5">
                
                <section className="text-center py-5">
                    <span className="badge bg-success-subtle text-success mb-3">
                        SEU GUIA PARA REFORMAS
                    </span>

                    <h1 className="display-4 fw-bold">
                        Sua próxima solução começa aqui.
                    </h1>

                    <p className="lead text-secondary mt-3">
                        Conte o que você precisa resolver em casa.
                        Nossa inteligência artificial ajuda você
                        a encontrar os produtos certos.
                    </p>

                    <Link
                        to="/assistente"
                        className="btn btn-success btn-lg mt-3"
                    >
                        Conversar com o assistente
                    </Link>
                </section>

                {/* Categorias */}
                <section className="mt-5">
                    <div className="text-center mb-4">
                        <h2 className="fw-bold">
                            Como podemos ajudar?
                        </h2>

                        <p className="text-secondary">
                            Escolha uma categoria para começar.
                        </p>
                    </div>

                    <div className="row g-3">
                        {categories.map((category) => (
                            <div
                                className="col-12 col-md-6"
                                key={category.id}
                            >
                                <Link
                                    to="/assistente"
                                    state={{ question: category.question }}
                                    className="text-decoration-none text-dark"
                                >
                                    <div className="card h-100 p-3">
                                        <div className="card-body">
                                            <h2>{category.icon}</h2>

                                            <h5 className="fw-bold">
                                                {category.name}
                                            </h5>

                                            <p className="text-secondary mb-0">
                                                {category.description}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </>
    );
}

export default Home;

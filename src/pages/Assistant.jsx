import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import ProductCard from '../components/ProductCard';
import { sendMessage } from '../services/api';

const initialMessages = [
    {
        id: 1,
        role: 'assistant',
        text: 'Olá! Descreva o problema ou a reforma que você quer resolver em casa.'
    }
];

const suggestions = [
    'Minha parede está com mofo, o que posso fazer?',
    'A torneira da cozinha está pingando',
    'Preciso trocar uma tomada que está solta',
    'Como preparo a parede para pintar?'
];

function Assistant() {
    const [messages, setMessages] = useState(initialMessages);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSlow, setIsSlow] = useState(false);
    const bottomRef = useRef(null);
    const inputRef = useRef(null);
    const autoSentRef = useRef(false);

    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, [messages, isLoading]);

    useEffect(() => {
        if (!isLoading && messages.length > 1) {
            inputRef.current?.focus();
        }
    }, [isLoading]);

    async function sendText(rawText) {
        const text = rawText.trim();
        if (!text || isLoading) return;

        const history = messages
            .slice(1)
            .filter((m) => !m.isError)
            .map((m) => ({ role: m.role, text: m.text }));

        const userMessage = { id: Date.now(), role: 'user', text };
        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setIsSlow(false);

        const slowTimer = setTimeout(() => setIsSlow(true), 6000);

        try {
            const data = await sendMessage(text, history);
            const reply = {
                id: Date.now() + 1,
                role: 'assistant',
                text: data.text,
                products: data.products
            };
            setMessages((prev) => [...prev, reply]);
        } catch (error) {
            const errorMessage = {
                id: Date.now() + 1,
                role: 'assistant',
                isError: true,
                text: 'Desculpe, não consegui responder agora. Tente novamente em instantes.'
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            clearTimeout(slowTimer);
            setIsLoading(false);
            setIsSlow(false);
        }
    }

    useEffect(() => {
        const question = location.state?.question;

        if (question && !autoSentRef.current) {
            autoSentRef.current = true;
            navigate(location.pathname, { replace: true, state: null });
            sendText(question);
        }
    }, []);

    function handleSubmit(event) {
        event.preventDefault();
        sendText(input);
    }

    function handleNewChat() {
        if (isLoading) return;
        setMessages(initialMessages);
        setInput('');
    }

    return (
        <>
            <Header />

            <main className="container py-4" style={{ maxWidth: '800px' }}>
                <div className="d-flex justify-content-end mb-2">
                    <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={handleNewChat}
                        disabled={isLoading || messages.length === 1}
                    >
                        Nova conversa
                    </button>
                </div>

                <div className="d-flex flex-column gap-3 mb-3">
                    {messages.map((message) => (
                        <div key={message.id} className="d-flex flex-column gap-2">
                            <div
                                className={
                                    message.role === 'user'
                                        ? 'align-self-end bg-success text-white rounded-4 px-3 py-2'
                                        : 'align-self-start bg-white border rounded-4 px-3 py-2'
                                }
                                style={{ maxWidth: '80%', whiteSpace: 'pre-wrap' }}
                            >
                                {message.text}
                            </div>

                            {message.products?.length > 0 && (
                                <div className="d-flex gap-3 overflow-auto pb-2">
                                    {message.products.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {messages.length === 1 && !isLoading && (
                        <div className="d-flex flex-wrap gap-2">
                            {suggestions.map((suggestion) => (
                                <button
                                    key={suggestion}
                                    type="button"
                                    className="btn btn-outline-success btn-sm rounded-pill"
                                    onClick={() => sendText(suggestion)}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    )}

                    {isLoading && (
                        <div className="align-self-start bg-white border rounded-4 px-3 py-2">
                            <span className="spinner-grow spinner-grow-sm text-success me-1"></span>
                            <span className="spinner-grow spinner-grow-sm text-success me-1"></span>
                            <span className="spinner-grow spinner-grow-sm text-success"></span>
                            {isSlow && (
                                <div className="small text-secondary mt-2">
                                    O servidor está iniciando, isso pode levar alguns segundos...
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="d-flex gap-2 position-sticky bottom-0 py-3"
                    style={{ backgroundColor: 'var(--color-background)' }}
                >
                    <input
                        ref={inputRef}
                        type="text"
                        className="form-control"
                        placeholder="Descreva seu problema..."
                        value={input}
                        onChange={(event) => setInput(event.target.value)}
                        disabled={isLoading}
                    />
                    <button type="submit" className="btn btn-success" disabled={isLoading}>
                        Enviar
                    </button>
                </form>

                <div ref={bottomRef} />
            </main>
        </>
    );
}

export default Assistant;
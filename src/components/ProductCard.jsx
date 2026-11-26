function ProductCard({ product }) {
    const formattedPrice = product.price.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    return (
        <div
            className="card flex-shrink-0"
            style={{ width: '200px' }}
        >
            <div
                className="d-flex align-items-center justify-content-center bg-light"
                style={{ height: '140px', fontSize: '3rem' }}
            >
                {product.image}
            </div>

            <div className="card-body p-3">
                <h6 className="card-title mb-1">{product.name}</h6>
                <p className="fw-bold mb-2">{formattedPrice}</p>

                <div className="d-flex justify-content-between small text-secondary">
                    <span>{product.brand}</span>
                    <span>⭐ {product.rating}</span>
                </div>

                {product.aisle && (
                    <div className="badge bg-success-subtle text-success text-wrap text-start mt-2">
                        📍 {product.aisle}
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProductCard;
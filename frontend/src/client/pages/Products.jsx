import { useEffect, useState } from "react";
import { API } from "../../services/api";

export default function Products() {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        API.get("/products")
            .then(res => setProducts(res.data))
            .catch(err => console.error("Failed to fetch products:", err));
    }, []);

    return (
        <div>
            {products.map(p => (
                <div key={p.id}>
                    <h3>{p.name}</h3>
                    <p>{p.price}</p>
                    {p.images?.map((img, i) => (
                        <img key={i} src={img} width="100" />
                    ))}
                </div>
            ))}
        </div>
    );
}
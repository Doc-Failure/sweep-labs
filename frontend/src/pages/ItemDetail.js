import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoading(true);
    fetch('http://localhost:5000/api/items/' + id)
      .then(res => res.ok ? res.json() : Promise.reject(res))
      .then((data) => {
        setItem(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        navigate('/');
      });
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-8 py-12">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="max-w-3xl mx-auto px-8 py-12">
      <Link to="/" className="text-gray-600 hover:text-indigo-600 text-sm mb-8 inline-block transition-colors">
        ← Back to Items
      </Link>

      <div className="mt-8">
        <h1 className="text-3xl font-light text-gray-800 mb-6">{item.name}</h1>

        <div className="space-y-3 text-gray-700">
          <div className="flex gap-2">
            <span className="text-gray-500">Category:</span>
            <span>{item.category}</span>
          </div>

          <div className="flex gap-2">
            <span className="text-gray-500">Price:</span>
            <span className="text-indigo-600 font-medium">${item.price}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ItemDetail;
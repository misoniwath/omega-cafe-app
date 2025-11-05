import drinksData from '../data/drinks.json';
import { useMemo, useState } from 'react';

function getLocalizedNames(drink) {
  if (drink.english_name || drink.khmer_name) {
    return {
      english: drink.english_name || '',
      khmer: drink.khmer_name || ''
    };
  }
  const raw = drink.name || '';
  const khmerMatch = raw.match(/[\u1780-\u17FF].*/);
  const khmer = khmerMatch ? khmerMatch[0].trim() : '';
  const english = khmer ? raw.replace(khmerMatch[0], '').trim() : raw.trim();
  return { english, khmer };
}

export default function DrinkList({ onAddToCart }) {
  const categories = useMemo(() => ['All', ...Object.keys(drinksData)], []);
  const [activeCategory, setActiveCategory] = useState('All');

  const visibleEntries = useMemo(() => {
    if (activeCategory === 'All') return Object.entries(drinksData);
    return Object.entries(drinksData).filter(([key]) => key === activeCategory);
  }, [activeCategory]);

  return (
    <div className="drink-list">
      <div className="category-filter" role="tablist" aria-label="Drink categories">
        <div className="filter-scroll">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-chip ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
              role="tab"
              aria-selected={activeCategory === cat}
            >
              {cat.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {visibleEntries.map(([category, drinks]) => (
        <div key={category} className="category-section">
          <h2 className="category-title">
            {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </h2>
          <div className="drink-grid">
            {drinks.map((drink, index) => (
              <div key={`${category}-${index}`} className="drink-card">
                {(() => {
                  const { english, khmer } = getLocalizedNames(drink);
                  return (
                    <>
                      <img 
                        src={drink.image} 
                        alt={english}
                        loading="lazy"
                  className="drink-image"
                  onError={(e) => {
                    e.target.src = '/drinks/default-drink.jpg';
                  }}
                      />
                      <h3 className="text-base font-semibold leading-snug text-center">
                        <span className="block text-gray-900">{english}</span>
                        <span className="block text-gray-600 text-sm font-khmer">{khmer}</span>
                      </h3>
                      <p>${drink.price.toFixed(2)}</p>
                      <button
                        className="w-full bg-green-600 text-white py-1 rounded mt-2"
                        onClick={() => onAddToCart({ 
                          id: `${category}-${index}`,
                          name: english, 
                          price: drink.price, 
                          quantity: 1 
                        })}>
                        Add to Cart
                      </button>
                    </>
                  );
                })()}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

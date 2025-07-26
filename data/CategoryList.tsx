import React, { useEffect, useRef } from 'react';
import categories from '@/data/category';

interface CategoryListProps {
  onCategorySelect: (category: string) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ onCategorySelect }) => {
  const ulRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (ulRef.current) {
      ulRef.current.scrollTop = 0; // Reset scroll to top on mount
    }
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md max-w-sm mx-auto mt-4">
      <h3 className="text-lg ml-4 text-rose-700 font-semibold mb-2">Categories</h3>
      <ul ref={ulRef} className="list-none space-y-2 p-5 max-h-[30vh] overflow-y-auto">
        {categories.map(category => (
          <li
            key={category.id}
            className="flex items-center border border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50"
            onClick={() => onCategorySelect(category.keyword)}
          >
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <g
                fill="none"
                stroke="#1e2939 "
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                dangerouslySetInnerHTML={{ __html: category.icon }}
              />
            </svg>
            <span className="text-sm uppercase font-semibold text-gray-700">{category.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryList;
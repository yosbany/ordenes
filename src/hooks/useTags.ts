import { useState, useEffect } from 'react';
import { ref, onValue, push, set } from 'firebase/database';
import { db } from '@/lib/firebase';

export function useTags() {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tagsRef = ref(db, 'tags');
    const productsRef = ref(db, 'products');
    
    // Load custom tag entries
    const unsubscribeTags = onValue(tagsRef, (snapshot) => {
      const data = snapshot.val();
      const customTags = data ? Object.values(data) as string[] : [];
      setTags(customTags.sort());
      setLoading(false);
    });

    // Also monitor products for their tags
    const unsubscribeProducts = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productTags = Object.values(data)
          .flatMap((product: any) => product.tags || [])
          .filter(Boolean)
          .map(tag => tag.toUpperCase());

        // Update suggestions with new unique values
        setTags(prev => {
          const newTags = [...new Set([...prev, ...productTags])];
          return newTags.sort();
        });
      }
    });

    return () => {
      unsubscribeTags();
      unsubscribeProducts();
    };
  }, []);

  const addTag = async (tag: string) => {
    const tagsRef = ref(db, 'tags');
    const newTagRef = push(tagsRef);
    await set(newTagRef, tag.toUpperCase());
  };

  return {
    tags,
    loading,
    addTag
  };
}
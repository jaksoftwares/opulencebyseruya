import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/components/providers/QueryProvider';
import { Database } from '@/lib/supabase';

// Types
type Product = Database['public']['Tables']['products']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

// Product API hooks
export function useProducts(filters?: {
  category_id?: string;
  search?: string;
  featured?: boolean;
  sort_by?: 'price' | 'name' | 'created_at';
  sort_order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: queryKeys.products.list(filters || {}),
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories!inner(
            id,
            name,
            slug
          )
        `)
        .eq('is_active', true);

      // Apply filters
      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
      }

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (filters?.featured) {
        query = query.eq('is_featured', true);
      }

      // Apply sorting
      const sortBy = filters?.sort_by || 'created_at';
      const sortOrder = filters?.sort_order || 'desc';
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });

      // Apply pagination
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }
      if (filters?.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      return data as any[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes for product lists
    gcTime: 5 * 60 * 1000, // 5 minutes cache time
  });
}

export function useInfiniteProducts(filters?: {
  category_id?: string;
  search?: string;
  featured?: boolean;
  pageSize?: number;
}) {
  return useInfiniteQuery({
    queryKey: queryKeys.products.list({ ...filters, infinite: true }),
    queryFn: async ({ pageParam }) => {
      const limit = filters?.pageSize || 20;
      const offset = typeof pageParam === 'number' ? pageParam : 0;

      let query = supabase
        .from('products')
        .select(`
          *,
          categories!inner(
            id,
            name,
            slug
          )
        `)
        .eq('is_active', true);

      // Apply filters
      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
      }

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (filters?.featured) {
        query = query.eq('is_featured', true);
      }

      // Apply pagination
      query = query.range(offset, offset + limit - 1);
      query = query.order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      return {
        data: data as any[],
        nextCursor: data.length === limit ? offset + limit : undefined,
      };
    },
    initialPageParam: 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: queryKeys.products.slug(slug),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories!inner(
            id,
            name,
            slug,
            description
          )
        `)
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching product:', error);
        throw error;
      }

      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes for individual products
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
  });
}

export function useRelatedProducts(productId: string, categoryId: string) {
  return useQuery({
    queryKey: queryKeys.products.related(productId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          price,
          compare_at_price,
          images,
          is_featured,
          is_top_deal,
          is_new_arrival,
          sku,
          rating,
          reviews,
          categories!inner(
            name,
            slug
          )
        `)
        .eq('category_id', categoryId)
        .eq('is_active', true)
        .neq('id', productId)
        .limit(4)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching related products:', error);
        throw error;
      }

      return data as any[];
    },
    staleTime: 3 * 60 * 1000,
    gcTime: 8 * 60 * 1000,
  });
}

export function useProductSearch(searchQuery: string, enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.products.search(searchQuery),
    queryFn: async () => {
      if (!searchQuery.trim()) return [];

      const { data, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          slug,
          price,
          compare_at_price,
          images,
          categories!inner(
            name
          )
        `)
        .eq('is_active', true)
        .ilike('name', `%${searchQuery}%`)
        .limit(8);

      if (error) {
        console.error('Error searching products:', error);
        throw error;
      }

      return (data || []).map(item => ({
        ...item,
        category_name: (item.categories as any)?.name,
      }));
    },
    enabled: enabled && !!searchQuery.trim(),
    staleTime: 1 * 60 * 1000, // 1 minute for search results
    gcTime: 3 * 60 * 1000, // 3 minutes cache time
    // Use debouncing in the component
  });
}

// Category API hooks
export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories.lists(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching categories:', error);
        throw error;
      }

      return data as Category[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes for categories (less frequently updated)
    gcTime: 30 * 60 * 1000, // 30 minutes cache time
  });
}

export function useCategory(slug: string) {
  return useQuery({
    queryKey: queryKeys.categories.slug(slug),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching category:', error);
        throw error;
      }

      return data as Category | null;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
  });
}

// Prefetch utilities
export function usePrefetchProducts() {
  const queryClient = useQueryClient();

  const prefetchProducts = (filters?: any) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.products.list(filters || {}),
      queryFn: async () => {
        // This would typically make the API call
        // For now, we'll rely on the useQuery hook to actually fetch
        return Promise.resolve();
      },
      staleTime: 2 * 60 * 1000,
    });
  };

  const prefetchProduct = (slug: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.products.slug(slug),
      queryFn: async () => {
        return Promise.resolve();
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchCategory = (slug: string) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.categories.slug(slug),
      queryFn: async () => {
        return Promise.resolve();
      },
      staleTime: 10 * 60 * 1000,
    });
  };

  return { prefetchProducts, prefetchProduct, prefetchCategory };
}

// Invalidate utilities
export function useInvalidateQueries() {
  const queryClient = useQueryClient();

  const invalidateProducts = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.products.all });
  };

  const invalidateProduct = (slug: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.products.slug(slug) });
  };

  const invalidateCategories = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
  };

  const invalidateCategory = (slug: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.categories.slug(slug) });
  };

  return {
    invalidateProducts,
    invalidateProduct,
    invalidateCategories,
    invalidateCategory,
  };
}
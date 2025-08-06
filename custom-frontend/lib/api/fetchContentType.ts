const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface FetchOptions {
  populate?: string;
  filters?: Record<string, any>;
  sort?: string;
  pagination?: {
    page?: number;
    pageSize?: number;
  };
}

export async function fetchContentType(
  contentType: string,
  options: FetchOptions = {},
  spreadData?: boolean
) {
  try {
    const params = new URLSearchParams();
    
    if (options.populate) {
      params.append('populate', options.populate);
    }
    
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(`filters[${key}]`, String(value));
        }
      });
    }
    
    if (options.sort) {
      params.append('sort', options.sort);
    }
    
    if (options.pagination) {
      if (options.pagination.page) {
        params.append('pagination[page]', String(options.pagination.page));
      }
      if (options.pagination.pageSize) {
        params.append('pagination[pageSize]', String(options.pagination.pageSize));
      }
    }

    const url = `${API_BASE_URL}/${contentType}${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${contentType}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // If spreadData is true, return the first item from the data array
    if (spreadData && data.data && Array.isArray(data.data) && data.data.length > 0) {
      return data.data[0];
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${contentType}:`, error);
    throw error;
  }
}

export async function fetchSingleContentType(
  contentType: string,
  id: string | number,
  options: FetchOptions = {}
) {
  try {
    const params = new URLSearchParams();
    
    if (options.populate) {
      params.append('populate', options.populate);
    }

    const url = `${API_BASE_URL}/${contentType}/${id}${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${contentType} with id ${id}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${contentType} with id ${id}:`, error);
    throw error;
  }
}

// Default export for backward compatibility
export default fetchContentType;
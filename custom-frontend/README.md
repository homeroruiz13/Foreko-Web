# Custom Frontend (Extracted from Strapi LaunchPad)

This Next.js frontend has been extracted from the Strapi LaunchPad project and modified to work with any custom backend API.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure your backend API:**
   ```bash
   cp .env.local.example .env.local
   ```
   Update `NEXT_PUBLIC_API_URL` in `.env.local` to point to your backend API.

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Visit [http://localhost:3000](http://localhost:3000)**

## 🔧 Backend API Requirements

Your backend API should provide the following endpoints:

### Required Endpoints

- `GET /api/pages` - Get all pages
- `GET /api/pages/{slug}` - Get page by slug
- `GET /api/articles` - Get all blog articles  
- `GET /api/articles/{slug}` - Get article by slug
- `GET /api/products` - Get all products
- `GET /api/products/{slug}` - Get product by slug
- `GET /api/global` - Get global site settings (navbar/footer)

### Expected Data Structure

Your API responses should follow this general structure:

```json
{
  "data": [
    {
      "id": 1,
      "slug": "example-page",
      "title": "Example Page",
      "content": "Page content...",
      "seo": {
        "metaTitle": "SEO Title",
        "metaDescription": "SEO Description",
        "metaImage": {
          "url": "/uploads/image.jpg",
          "alternativeText": "Image alt text"
        }
      }
    }
  ]
}
```

### Image Handling

The frontend expects images to have this structure:
```json
{
  "id": 1,
  "url": "/uploads/image.jpg",
  "alternativeText": "Alt text",
  "width": 800,
  "height": 600,
  "formats": {
    "thumbnail": { "url": "/uploads/thumb.jpg", "width": 150, "height": 150 },
    "small": { "url": "/uploads/small.jpg", "width": 300, "height": 300 },
    "medium": { "url": "/uploads/medium.jpg", "width": 600, "height": 600 }
  }
}
```

## 📁 Key Files Modified

- `/lib/api/fetchContentType.ts` - Generic API fetching utility
- `/lib/api/imageUtils.ts` - Image URL and utility functions
- All components updated to use new API utilities instead of Strapi-specific ones

## 🛠 Customization

1. **Update API endpoints** in `/lib/api/fetchContentType.ts`
2. **Modify data structure handling** in components as needed
3. **Update image handling** in `/lib/api/imageUtils.ts` if your backend uses different image formats

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Your backend API base URL | `http://localhost:3001/api` |
| `NEXT_PUBLIC_SITE_URL` | Your frontend URL | `http://localhost:3000` |

## 🎨 Features Included

- ✅ Responsive design with Tailwind CSS
- ✅ Dynamic routing for pages, blog posts, and products
- ✅ SEO optimization with Next.js metadata
- ✅ Internationalization support
- ✅ Modern UI components with Framer Motion
- ✅ Image optimization
- ✅ TypeScript support

## 🚫 Removed Strapi Dependencies

- Removed `@strapi/blocks-react-renderer`
- Removed Strapi-specific API utilities
- Updated all imports to use generic API functions
- Created custom image handling utilities

Now you can connect this frontend to any backend API of your choice!

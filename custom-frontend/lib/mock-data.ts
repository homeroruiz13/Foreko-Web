export const mockPageData = {
  locale: "en",
  dynamic_zone: [
    {
      __component: "dynamic-zone.hero",
      id: 1,
      heading: "Foreko Complete Dashboard Suite",
      sub_heading: "AI-powered inventory management and business insights for small businesses",
      CTAs: [
        {
          id: 1,
          text: "Start Free Trial",
          URL: "/sign-up",
          variant: "primary"
        }
      ]
    },
    {
      __component: "dynamic-zone.features",
      id: 2,
      heading: "Why Choose Foreko Over Spreadsheets?",
      sub_heading: "Move beyond manual spreadsheets with real-time data and AI automation",
      globe_card: {
        id: 1,
        title: "Real-Time Data",
        description: "Live updates on inventory, orders, and financials, reducing errors and delays",
        span: "two"
      },
      ray_card: {
        id: 2,
        title: "AI Automation",
        description: "Simplifies decision-making with predictive insights and plain-language recommendations",
        span: "one"
      },
      graph_card: {
        id: 3,
        title: "Seamless Integration",
        description: "Syncs with POS systems (Shopify, Square) and accounting software (QuickBooks)",
        span: "two"
      },
      social_media_card: {
        id: 4,
        title: "Cost-Effective",
        description: "Affordable cloud-based solution with no need for dedicated IT teams",
        span: "one"
      }
    },
    {
      __component: "dynamic-zone.testimonials",
      id: 3,
      heading: "What Small Business Owners Say",
      sub_heading: "Hear from entrepreneurs who transformed their operations",
      testimonials: [
        {
          id: 1,
          text: "Foreko eliminated our inventory headaches. The AI suggestions are spot-on and saved us thousands in lost sales.",
          user: {
            firstname: "Sarah",
            lastname: "Chen",
            job: "Owner, Chen's Boutique",
            image: {
              url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjNEY0NkU1Ii8+Cjx0ZXh0IHg9Ijc1IiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlNDPC90ZXh0Pgo8L3N2Zz4K",
              alternativeText: "Sarah Chen"
            }
          }
        },
        {
          id: 2,
          text: "Finally, a dashboard that speaks my language. No more complex spreadsheets - everything I need in one place.",
          user: {
            firstname: "Mike",
            lastname: "Rodriguez",
            job: "Founder, Rodriguez Auto Parts",
            image: {
              url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjREMyNjI2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TVI8L3RleHQ+Cjwvc3ZnPgo=",
              alternativeText: "Mike Rodriguez"
            }
          }
        },
        {
          id: 3,
          text: "The integration with our Shopify store is seamless. We can track everything from inventory to customer insights in real-time.",
          user: {
            firstname: "Emma",
            lastname: "Thompson",
            job: "CEO, Thompson's Online Store",
            image: {
              url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjMDU5NjY5Ii8+Cjx0ZXh0IHg9Ijc1IiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVUPC90ZXh0Pgo8L3N2Zz4K",
              alternativeText: "Emma Thompson"
            }
          }
        }
      ]
    },
    {
      __component: "dynamic-zone.brands",
      id: 4,
      heading: "Trusted by Small Businesses Nationwide",
      sub_heading: "Join thousands of entrepreneurs who trust Foreko for their business operations",
      logos: [
        {
          id: 1,
          title: "Shopify",
          image: {
            url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDIwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjOTVGN0YzIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TaG9waWZ5PC90ZXh0Pgo8L3N2Zz4K",
            alternativeText: "Shopify Logo"
          }
        },
        {
          id: 2,
          title: "Square",
          image: {
            url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDIwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMDAwMDAwIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TcXVhcmU8L3RleHQ+Cjwvc3ZnPgo=",
            alternativeText: "Square Logo"
          }
        },
        {
          id: 3,
          title: "QuickBooks",
          image: {
            url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDIwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjMDA4QzQ0Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5RdWlja0Jvb2tzPC90ZXh0Pgo8L3N2Zz4K",
            alternativeText: "QuickBooks Logo"
          }
        },
        {
          id: 4,
          title: "WooCommerce",
          image: {
            url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDIwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjOTY5OTY5Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iNTAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Xb29Db21tZXJjZTwvdGV4dD4KPC9zdmc+Cg==",
            alternativeText: "WooCommerce Logo"
          }
        }
      ]
    },
    {
      __component: "dynamic-zone.cta",
      id: 4,
      heading: "Ready to Transform Your Business?",
      sub_heading: "Join thousands of small business owners who've moved beyond spreadsheets",
      CTAs: [
        {
          id: 1,
          text: "Start Free Trial",
          URL: "/sign-up",
          variant: "primary"
        }
      ]
    }
  ]
};

export const mockBlogPage = {
  heading: "Foreko Blog",
  sub_heading: "Latest insights on small business management and inventory optimization"
};

export const mockArticles = {
  data: [
    {
      id: 1,
      title: "5 Ways AI is Transforming Small Business Inventory Management",
      description: "Discover how artificial intelligence is revolutionizing inventory management for small businesses",
      slug: "ai-inventory-management",
      publishedAt: "2024-01-15T00:00:00.000Z",
      createdAt: "2024-01-15T00:00:00.000Z",
      updatedAt: "2024-01-15T00:00:00.000Z",
      locale: "en",
      content: "Small businesses are increasingly turning to AI-powered solutions to streamline their inventory management processes...",
      dynamic_zone: [],
      image: {
        url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiBmaWxsPSIjMDA4QzQ0Ii8+Cjx0ZXh0IHg9IjI1MCIgeT0iMjUwIiBmb250LZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5BSSBJbnZlbnRvcnk8L3RleHQ+Cjwvc3ZnPgo=",
        alternativeText: "AI Inventory Management"
      },
      categories: [],
      seo: {
        metaTitle: "AI Inventory Management for Small Businesses",
        metaDescription: "Learn how AI is transforming inventory management for small businesses"
      }
    },
    {
      id: 2,
      title: "From Spreadsheets to Smart Dashboards: A Small Business Guide",
      description: "How to transition from manual spreadsheets to automated dashboard solutions",
      slug: "spreadsheets-to-dashboards",
      publishedAt: "2024-01-10T00:00:00.000Z",
      createdAt: "2024-01-10T00:00:00.000Z",
      updatedAt: "2024-01-10T00:00:00.000Z",
      locale: "en",
      content: "Many small businesses still rely on manual spreadsheets for their business operations...",
      dynamic_zone: [],
      image: {
        url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiBmaWxsPSIjRkY2QjM5Ii8+Cjx0ZXh0IHg9IjI1MCIgeT0iMjUwIiBmb250LZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TcHJlYWRzaGVldHMgdG8gRGFzaGJvYXJkczwvdGV4dD4KPC9zdmc+Cg==",
        alternativeText: "Spreadsheets to Dashboards"
      },
      categories: [],
      seo: {
        metaTitle: "From Spreadsheets to Smart Dashboards",
        metaDescription: "Guide to transitioning from manual spreadsheets to automated dashboards"
      }
    }
  ]
};

export const mockProductPage = {
  heading: "Foreko Dashboard Suite",
  sub_heading: "Five powerful dashboards designed specifically for small business needs",
  seo: {
    metaTitle: "Dashboard Suite - Foreko",
    metaDescription: "Explore our five core dashboards: Overview, Inventory & Reordering, Logistics & Orders, Financials & Cash Flow, and Customer Insights"
  },
  localizations: []
};

export const mockProducts = {
  data: [
    {
      id: 1,
      name: "Overview Dashboard",
      description: "High-level snapshot of critical business metrics for quick, informed decision-making",
      slug: "overview-dashboard",
      featured: true,
      price: 49.99,
      plans: [
        {
          id: 1,
          name: "Starter",
          price: 29,
          sub_text: "Perfect for small businesses",
          featured: false,
          CTA: {
            text: "Get Started",
            URL: "/sign-up",
            variant: "outline"
          },
          perks: [
            { text: "Business Health Score" },
            { text: "Inventory Status" },
            { text: "Order Status" },
            { text: "Cash Flow Snapshot" }
          ],
          additional_perks: []
        },
        {
          id: 2,
          name: "Professional",
          price: 49,
          sub_text: "Great for growing businesses",
          featured: true,
          CTA: {
            text: "Start Free Trial",
            URL: "/sign-up",
            variant: "primary"
          },
          perks: [
            { text: "All Starter features" },
            { text: "Customer Metrics" },
            { text: "AI Insights" },
            { text: "Export Reports" },
            { text: "Custom Alerts" },
            { text: "Mobile Access" }
          ],
          additional_perks: [
            { text: "API access" },
            { text: "White-label options" }
          ]
        }
      ],
      perks: [
        { text: "AI-generated Business Health Score" },
        { text: "Real-time inventory alerts" },
        { text: "30-day revenue trends" },
        { text: "Top customer insights" }
      ],
              dynamic_zone: [
          {
            __component: "dynamic-zone.pricing",
            id: 1,
            heading: "Choose Your Overview Dashboard Plan",
            sub_heading: "Select the perfect plan for your business needs",
            plans: [
              {
                id: 1,
                name: "Starter",
                price: 29,
                sub_text: "Perfect for small businesses",
                featured: false,
                CTA: {
                  text: "Get Started",
                  URL: "/sign-up",
                  variant: "outline"
                },
                perks: [
                  { text: "Business Health Score" },
                  { text: "Inventory Status" },
                  { text: "Order Status" },
                  { text: "Cash Flow Snapshot" }
                ],
                additional_perks: []
              },
              {
                id: 2,
                name: "Professional",
                price: 49,
                sub_text: "Great for growing businesses",
                featured: true,
                CTA: {
                  text: "Start Free Trial",
                  URL: "/sign-up",
                  variant: "primary"
                },
                perks: [
                  { text: "All Starter features" },
                  { text: "Customer Metrics" },
                  { text: "AI Insights" },
                  { text: "Export Reports" },
                  { text: "Custom Alerts" },
                  { text: "Mobile Access" }
                ],
                additional_perks: [
                  { text: "API access" },
                  { text: "White-label options" }
                ]
              }
            ]
          }
        ],
              images: [
          {
            url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiBmaWxsPSIjMDA4QzQ0Ii8+Cjx0ZXh0IHg9IjI1MCIgeT0iMjUwIiBmb250LZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5PdmVydmlldyBEYXNoYm9hcmQ8L3RleHQ+Cjwvc3ZnPgo=",
            alternativeText: "Overview Dashboard"
          }
        ],
      categories: []
    },
    {
      id: 2,
      name: "Inventory & Reordering Dashboard", 
      description: "Simplifies inventory tracking and reorder planning with AI automation",
      slug: "inventory-reordering-dashboard",
      featured: true,
      price: 59.99,
      plans: [
        {
          id: 3,
          name: "Starter",
          price: 39,
          sub_text: "Perfect for small inventory",
          featured: false,
          CTA: {
            text: "Get Started",
            URL: "/sign-up",
            variant: "outline"
          },
          perks: [
            { text: "Stock Level Tracking" },
            { text: "Low Stock Alerts" },
            { text: "Basic Reorder Suggestions" },
            { text: "Inventory Turnover" }
          ],
          additional_perks: []
        },
        {
          id: 4,
          name: "Professional",
          price: 59,
          sub_text: "Great for growing inventory",
          featured: true,
          CTA: {
            text: "Start Free Trial",
            URL: "/sign-up",
            variant: "primary"
          },
          perks: [
            { text: "All Starter features" },
            { text: "AI Demand Forecast" },
            { text: "One-Click Reorder" },
            { text: "Supplier Management" },
            { text: "Advanced Analytics" }
          ],
          additional_perks: [
            { text: "Export Reports" }
          ]
        }
      ],
      perks: [
        { text: "AI-powered reorder suggestions" },
        { text: "Real-time stock level monitoring" },
        { text: "30-day demand forecasting" },
        { text: "Automated supplier coordination" }
      ],
      dynamic_zone: [
        {
          __component: "dynamic-zone.pricing",
          id: 2,
          heading: "Simple Pricing",
          sub_heading: "Choose the plan that fits your needs",
          plans: [
            {
              id: 3,
              name: "Starter",
              price: 19,
              sub_text: "Perfect for small projects",
              featured: false,
              CTA: {
                text: "Get Started",
                URL: "/sign-up",
                variant: "outline"
              },
              perks: [
                { text: "Up to 3 projects" },
                { text: "Basic features" },
                { text: "Community support" },
                { text: "500MB storage" }
              ],
              additional_perks: []
            },
            {
              id: 4,
              name: "Standard",
              price: 49,
              sub_text: "Great for regular use",
              featured: true,
              CTA: {
                text: "Start Free Trial",
                URL: "/sign-up",
                variant: "primary"
              },
              perks: [
                { text: "Up to 20 projects" },
                { text: "Standard features" },
                { text: "Email support" },
                { text: "5GB storage" },
                { text: "Basic integrations" }
              ],
              additional_perks: [
                { text: "Export options" }
              ]
            }
          ]
        }
      ],
      images: [
        {
          url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiBmaWxsPSIjMzc0MTUxIi8+Cjx0ZXh0IHg9IjI1MCIgeT0iMjUwIiBmb250LZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TdGFuZGFyZCBQcm9kdWN0PC90ZXh0Pgo8L3N2Zz4K",
          alternativeText: "Standard Product"
        }
      ],
      categories: []
    },
    {
      id: 3,
      name: "Logistics & Orders Dashboard",
      description: "Streamlines order tracking and supplier coordination for small businesses",
      slug: "logistics-orders-dashboard", 
      featured: true,
      price: 69.99,
      plans: [
        {
          id: 5,
          name: "Starter",
          price: 49,
          sub_text: "Perfect for small order volume",
          featured: false,
          CTA: {
            text: "Get Started",
            URL: "/sign-up",
            variant: "outline"
          },
          perks: [
            { text: "Order Status Tracking" },
            { text: "On-Time Delivery Metrics" },
            { text: "Basic Supplier Ratings" },
            { text: "Shipping Cost Tracking" }
          ],
          additional_perks: []
        },
        {
          id: 6,
          name: "Professional",
          price: 69,
          sub_text: "Great for growing businesses",
          featured: true,
          CTA: {
            text: "Start Free Trial",
            URL: "/sign-up",
            variant: "primary"
          },
          perks: [
            { text: "All Starter features" },
            { text: "AI Delay Predictions" },
            { text: "Alternative Carrier Suggestions" },
            { text: "Advanced Supplier Analytics" },
            { text: "Custom Order Workflows" }
          ],
          additional_perks: [
            { text: "API access" },
            { text: "Custom integrations" }
          ]
        }
      ],
      perks: [
        { text: "Real-time order status tracking" },
        { text: "AI-powered delay predictions" },
        { text: "Automated carrier optimization" },
        { text: "Supplier performance analytics" }
      ],
      dynamic_zone: [
        {
          __component: "dynamic-zone.pricing",
          id: 3,
          heading: "Professional Plans",
          sub_heading: "Advanced solutions for professionals",
          plans: [
            {
              id: 5,
              name: "Professional",
              price: 149,
              sub_text: "For professionals",
              featured: true,
              CTA: {
                text: "Start Free Trial",
                URL: "/sign-up",
                variant: "primary"
              },
              perks: [
                { text: "Unlimited projects" },
                { text: "Advanced features" },
                { text: "Priority support" },
                { text: "50GB storage" },
                { text: "Advanced integrations" },
                { text: "Custom workflows" }
              ],
              additional_perks: [
                { text: "API access" },
                { text: "White-label options" },
                { text: "Custom branding" }
              ]
            },
            {
              id: 6,
              name: "Enterprise",
              price: 299,
              sub_text: "For large organizations",
              featured: false,
              CTA: {
                text: "Contact Sales",
                URL: "/contact",
                variant: "outline"
              },
              perks: [
                { text: "Everything in Professional" },
                { text: "Dedicated support" },
                { text: "Custom features" },
                { text: "Unlimited storage" },
                { text: "SLA guarantee" }
              ],
              additional_perks: [
                { text: "Dedicated account manager" },
                { text: "Custom development" },
                { text: "On-premise deployment" }
              ]
            }
          ]
        }
      ],
      images: [
        {
          url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiBmaWxsPSIjNEI1NTYzIi8+Cjx0ZXh0IHg9IjI1MCIgeT0iMjUwIiBmb250LZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5Qcm9mZXNzaW9uYWwgUHJvZHVjdDwvdGV4dD4KPC9zdmc+Cg==",
          alternativeText: "Professional Product"
        }
      ],
      categories: []
    },
    {
      id: 4,
      name: "Financials & Cash Flow Dashboard",
      description: "Combines financial monitoring and cash flow optimization for small businesses",
      slug: "financials-cashflow-dashboard", 
      featured: true,
      price: 79.99,
      plans: [
        {
          id: 7,
          name: "Starter",
          price: 59,
          sub_text: "Perfect for basic financial tracking",
          featured: false,
          CTA: {
            text: "Get Started",
            URL: "/sign-up",
            variant: "outline"
          },
          perks: [
            { text: "Net Cash Flow Tracking" },
            { text: "Revenue by Channel" },
            { text: "Expense Breakdown" },
            { text: "Profit Margin Analysis" }
          ],
          additional_perks: []
        },
        {
          id: 8,
          name: "Professional",
          price: 79,
          sub_text: "Great for advanced financial management",
          featured: true,
          CTA: {
            text: "Start Free Trial",
            URL: "/sign-up",
            variant: "primary"
          },
          perks: [
            { text: "All Starter features" },
            { text: "AI Cost Alerts" },
            { text: "Cash Flow Forecasting" },
            { text: "Cost-Saving Recommendations" },
            { text: "Advanced Financial Reports" }
          ],
          additional_perks: [
            { text: "Custom integrations" },
            { text: "Export capabilities" }
          ]
        }
      ],
      perks: [
        { text: "Real-time cash flow monitoring" },
        { text: "AI-powered cost optimization" },
        { text: "Automated financial reporting" },
        { text: "Predictive cash flow insights" }
      ],
      dynamic_zone: [
        {
          __component: "dynamic-zone.pricing",
          id: 4,
          heading: "Enterprise Solutions",
          sub_heading: "Full-featured solutions for large organizations",
          plans: [
            {
              id: 7,
              name: "Enterprise",
              price: 299,
              sub_text: "For large organizations",
              featured: true,
              CTA: {
                text: "Contact Sales",
                URL: "/contact",
                variant: "primary"
              },
              perks: [
                { text: "Unlimited everything" },
                { text: "Enterprise security" },
                { text: "24/7 dedicated support" },
                { text: "Custom features" },
                { text: "SLA guarantee" },
                { text: "Compliance ready" }
              ],
              additional_perks: [
                { text: "Dedicated account manager" },
                { text: "Custom development" },
                { text: "On-premise deployment" },
                { text: "Training & onboarding" }
              ]
            },
            {
              id: 8,
              name: "Custom",
              price: null,
              sub_text: "Tailored to your needs",
              featured: false,
              CTA: {
                text: "Contact Us",
                URL: "/contact",
                variant: "outline"
              },
              perks: [
                { text: "Custom pricing" },
                { text: "All Enterprise features" },
                { text: "Custom integrations" },
                { text: "Dedicated support team" }
              ],
              additional_perks: [
                { text: "Custom development" },
                { text: "Training & onboarding" }
              ]
            }
          ]
        }
      ],
      images: [
        {
          url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiBmaWxsPSIjNkI3MjgwIi8+Cjx0ZXh0IHg9IjI1MCIgeT0iMjUwIiBmb250LZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5FbnRlcnByaXNlIFByb2R1Y3Q8L3RleHQ+Cjwvc3ZnPgo=",
          alternativeText: "Enterprise Product"
        }
      ],
      categories: []
    },
    {
      id: 5,
      name: "Customer Insights Dashboard",
      description: "Delivers actionable customer and sales channel analytics to boost sales and loyalty",
      slug: "customer-insights-dashboard", 
      featured: true,
      price: 89.99,
      plans: [
        {
          id: 9,
          name: "Starter",
          price: 69,
          sub_text: "Perfect for basic customer analytics",
          featured: false,
          CTA: {
            text: "Get Started",
            URL: "/sign-up",
            variant: "outline"
          },
          perks: [
            { text: "Sales by Channel" },
            { text: "Top Customers" },
            { text: "Repeat Purchase Tracking" },
            { text: "Basic Customer Segmentation" }
          ],
          additional_perks: []
        },
        {
          id: 10,
          name: "Professional",
          price: 89,
          sub_text: "Great for advanced customer insights",
          featured: true,
          CTA: {
            text: "Start Free Trial",
            URL: "/sign-up",
            variant: "primary"
          },
          perks: [
            { text: "All Starter features" },
            { text: "AI Demand Trends" },
            { text: "Customer Loyalty Programs" },
            { text: "Advanced Segmentation" },
            { text: "Promotion Recommendations" }
          ],
          additional_perks: [
            { text: "Custom integrations" },
            { text: "Export capabilities" }
          ]
        }
      ],
      perks: [
        { text: "AI-powered customer segmentation" },
        { text: "Channel-specific demand predictions" },
        { text: "Automated loyalty program management" },
        { text: "Personalized promotion suggestions" }
      ],
      dynamic_zone: [
        {
          __component: "dynamic-zone.pricing",
          id: 5,
          heading: "Choose Your Customer Insights Plan",
          sub_heading: "Select the perfect plan for your customer analytics needs",
          plans: [
            {
              id: 9,
              name: "Starter",
              price: 69,
              sub_text: "Perfect for basic customer analytics",
              featured: false,
              CTA: {
                text: "Get Started",
                URL: "/sign-up",
                variant: "outline"
              },
              perks: [
                { text: "Sales by Channel" },
                { text: "Top Customers" },
                { text: "Repeat Purchase Tracking" },
                { text: "Basic Customer Segmentation" }
              ],
              additional_perks: []
            },
            {
              id: 10,
              name: "Professional",
              price: 89,
              sub_text: "Great for advanced customer insights",
              featured: true,
              CTA: {
                text: "Start Free Trial",
                URL: "/sign-up",
                variant: "primary"
              },
              perks: [
                { text: "All Starter features" },
                { text: "AI Demand Trends" },
                { text: "Customer Loyalty Programs" },
                { text: "Advanced Segmentation" },
                { text: "Promotion Recommendations" }
              ],
              additional_perks: [
                { text: "Custom integrations" },
                { text: "Export capabilities" }
              ]
            }
          ]
        }
      ],
      images: [
        {
          url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI1MDAiIGhlaWdodD0iNTAwIiBmaWxsPSIjRkY2QjM5Ii8+Cjx0ZXh0IHg9IjI1MCIgeT0iMjUwIiBmb250LZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5DdXN0b21lciBJbnNpZ2h0czwvdGV4dD4KPC9zdmc+Cg==",
          alternativeText: "Customer Insights Dashboard"
        }
      ],
      categories: []
    }
  ]
};

export const mockPages = {
  features: {
    slug: "features",
    locale: "en",
    seo: {
      metaTitle: "Features - Foreko Dashboard Suite",
      metaDescription: "Explore Foreko's powerful AI-driven features designed specifically for small business inventory management and analytics"
    },
    dynamic_zone: [
      {
        __component: "dynamic-zone.hero",
        id: 1,
        heading: "Powerful Features for Small Businesses",
        sub_heading: "AI-powered tools that replace spreadsheets and streamline your operations",
        CTAs: [
          {
            id: 1,
            text: "Start Free Trial",
            URL: "/sign-up",
            variant: "primary"
          },
          {
            id: 2,
            text: "View Demo",
            URL: "/contact",
            variant: "outline"
          }
        ]
      },
      {
        __component: "dynamic-zone.features",
        id: 2,
        heading: "Five Core Dashboards",
        sub_heading: "Everything you need to manage your business in one place",
        globe_card: {
          id: 1,
          title: "Overview Dashboard",
          description: "AI-generated Business Health Score, inventory alerts, cash flow snapshot, and top customer insights at a glance",
          span: "two"
        },
        ray_card: {
          id: 2,
          title: "Inventory & Reordering",
          description: "Smart reorder suggestions, demand forecasting, and automated supplier coordination",
          span: "one"
        },
        graph_card: {
          id: 3,
          title: "Logistics & Orders",
          description: "Real-time order tracking, delivery predictions, and carrier optimization recommendations",
          span: "two"
        },
        social_media_card: {
          id: 4,
          title: "Financials & Customer Insights",
          description: "Cash flow monitoring, cost optimization, and customer segmentation with AI-powered recommendations",
          span: "one"
        }
      },
      {
        __component: "dynamic-zone.features",
        id: 3,
        heading: "AI-Powered Automation",
        sub_heading: "Let artificial intelligence handle the complex calculations",
        globe_card: {
          id: 1,
          title: "Predictive Analytics",
          description: "30-day demand forecasting and inventory optimization based on sales trends and seasonality patterns",
          span: "two"
        },
        ray_card: {
          id: 2,
          title: "Smart Alerts",
          description: "Proactive notifications for low stock, delayed orders, and cost-saving opportunities",
          span: "one"
        },
        graph_card: {
          id: 3,
          title: "Plain-Language Insights",
          description: "AI recommendations in simple terms - no technical jargon, just actionable business advice",
          span: "two"
        },
        social_media_card: {
          id: 4,
          title: "One-Click Actions",
          description: "Approve AI suggestions with a single click - reorder inventory, switch carriers, or launch promotions",
          span: "one"
        }
      }
    ],
    localizations: []
  },
  "use-cases": {
    slug: "use-cases",
    locale: "en",
    seo: {
      metaTitle: "Use Cases - Foreko Dashboard Suite",
      metaDescription: "See how different types of small businesses use Foreko to streamline operations and boost profitability"
    },
    dynamic_zone: [
      {
        __component: "dynamic-zone.hero",
        id: 1,
        heading: "Real Use Cases for Real Businesses",
        sub_heading: "See how small businesses like yours are transforming their operations with Foreko",
        CTAs: [
          {
            id: 1,
            text: "Start Your Transformation",
            URL: "/sign-up",
            variant: "primary"
          }
        ]
      },
      {
        __component: "dynamic-zone.testimonials",
        id: 2,
        heading: "Retail & E-commerce",
        sub_heading: "From inventory chaos to streamlined operations",
        testimonials: [
          {
            id: 1,
            text: "Foreko helped us reduce inventory holding costs by 30% while eliminating stockouts. The AI predictions are incredibly accurate for our seasonal products.",
            user: {
              firstname: "Sarah",
              lastname: "Mitchell",
              job: "Owner, Mitchell's Outdoor Gear",
              image: {
                url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjMDA4QzQ0Ii8+Cjx0ZXh0IHg9Ijc1IiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlNNPC90ZXh0Pgo8L3N2Zz4K",
                alternativeText: "Sarah Mitchell"
              }
            }
          },
          {
            id: 2,
            text: "Managing 500+ SKUs across multiple channels was overwhelming. Now I have a single dashboard that shows me exactly what to reorder and when.",
            user: {
              firstname: "Carlos",
              lastname: "Rodriguez",
              job: "Founder, Rodriguez Electronics",
              image: {
                url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRkY2QjM5Ii8+Cjx0ZXh0IHg9Ijc1IiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlI8L3RleHQ+Cjwvc3ZnPgo=",
                alternativeText: "Carlos Rodriguez"
              }
            }
          }
        ]
      },
      {
        __component: "dynamic-zone.features",
        id: 3,
        heading: "Common Business Scenarios",
        sub_heading: "How Foreko solves everyday small business challenges",
        globe_card: {
          id: 1,
          title: "Multi-Channel Selling",
          description: "Sync inventory across Shopify, Amazon, and physical stores. Get unified reporting and prevent overselling",
          span: "two"
        },
        ray_card: {
          id: 2,
          title: "Seasonal Businesses",
          description: "AI learns your seasonal patterns and adjusts forecasting for holiday rushes and slow periods",
          span: "one"
        },
        graph_card: {
          id: 3,
          title: "Growing Operations",
          description: "Scale from 50 to 5,000 SKUs without losing control. Automated workflows grow with your business",
          span: "two"
        },
        social_media_card: {
          id: 4,
          title: "Cash Flow Management",
          description: "Know exactly when to reorder to optimize cash flow and avoid tying up capital in excess inventory",
          span: "one"
        }
      }
    ],
    localizations: []
  },
  resources: {
    slug: "resources",
    locale: "en",
    seo: {
      metaTitle: "Resources - Foreko Dashboard Suite",
      metaDescription: "Free resources, guides, and tools to help small businesses optimize their inventory management and operations"
    },
    dynamic_zone: [
      {
        __component: "dynamic-zone.hero",
        id: 1,
        heading: "Resources for Small Business Success",
        sub_heading: "Free guides, templates, and tools to help you optimize your business operations",
        CTAs: [
          {
            id: 1,
            text: "Download Free Inventory Template",
            URL: "/contact",
            variant: "primary"
          }
        ]
      },
      {
        __component: "dynamic-zone.features",
        id: 2,
        heading: "Free Business Tools",
        sub_heading: "Essential resources to get started",
        globe_card: {
          id: 1,
          title: "Inventory Management Template",
          description: "Excel template with formulas for reorder points, safety stock calculations, and inventory turnover tracking",
          span: "two"
        },
        ray_card: {
          id: 2,
          title: "Cash Flow Calculator",
          description: "Simple tool to project your cash flow and optimize purchasing decisions",
          span: "one"
        },
        graph_card: {
          id: 3,
          title: "ROI Calculator",
          description: "Calculate the return on investment for inventory management software and automation tools",
          span: "two"
        },
        social_media_card: {
          id: 4,
          title: "Setup Checklist",
          description: "Step-by-step guide to implementing Foreko in your business in under 30 minutes",
          span: "one"
        }
      },
      {
        __component: "dynamic-zone.features",
        id: 3,
        heading: "Learning Center",
        sub_heading: "Master inventory management with our expert guides",
        globe_card: {
          id: 1,
          title: "Small Business Inventory Guide",
          description: "Complete guide covering ABC analysis, economic order quantity, and demand forecasting basics",
          span: "two"
        },
        ray_card: {
          id: 2,
          title: "Integration Tutorials",
          description: "Step-by-step videos for connecting Shopify, Square, QuickBooks, and other platforms",
          span: "one"
        },
        graph_card: {
          id: 3,
          title: "Best Practices Library",
          description: "Industry-specific tips for retail, e-commerce, manufacturing, and service businesses",
          span: "two"
        },
        social_media_card: {
          id: 4,
          title: "Webinar Series",
          description: "Monthly webinars covering advanced inventory strategies and AI-powered optimization",
          span: "one"
        }
      },
      {
        __component: "dynamic-zone.cta",
        id: 4,
        heading: "Ready to Transform Your Business?",
        sub_heading: "Join thousands of small businesses using Foreko to optimize their operations",
        CTAs: [
          {
            id: 1,
            text: "Start Free Trial",
            URL: "/sign-up",
            variant: "primary"
          }
        ]
      }
    ],
    localizations: []
  },
  company: {
    slug: "company",
    locale: "en",
          seo: {
        metaTitle: "Company - Foreko",
        metaDescription: "Learn about Foreko's mission, team, and commitment to empowering small businesses with AI-powered solutions"
      },
    dynamic_zone: [
      {
        __component: "dynamic-zone.hero",
        id: 1,
        heading: "About Foreko",
        sub_heading: "Empowering small businesses with AI-powered dashboard solutions",
        CTAs: [
          {
            id: 1,
            text: "Start Free Trial",
            URL: "/sign-up",
            variant: "primary"
          },
          {
            id: 2,
            text: "Contact Us",
            URL: "/contact",
            variant: "outline"
          }
        ]
      },
      {
        __component: "dynamic-zone.testimonials",
        id: 2,
        heading: "Our Story",
        sub_heading: "Built by entrepreneurs, for entrepreneurs",
        testimonials: [
          {
            id: 1,
            text: "We started Foreko because we experienced firsthand the challenges of managing a small business with spreadsheets and disconnected tools.",
            user: {
              firstname: "Alex",
              lastname: "Johnson",
              job: "Co-Founder & CEO, Foreko",
              image: {
                url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjMDA4QzQ0Ii8+Cjx0ZXh0IHg9Ijc1IiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkFKPC90ZXh0Pgo8L3N2Zz4K",
                alternativeText: "Alex Johnson"
              }
            }
          }
        ]
      },
      {
        __component: "dynamic-zone.features",
        id: 3,
        heading: "Our Core Values",
        sub_heading: "What drives us every day",
        globe_card: {
          id: 1,
          title: "Small Business First",
          description: "Every feature we build is designed specifically for the unique challenges and constraints of small businesses",
          span: "two"
        },
        ray_card: {
          id: 2,
          title: "AI for Everyone",
          description: "Making advanced AI accessible and understandable for business owners without technical backgrounds",
          span: "one"
        },
        graph_card: {
          id: 3,
          title: "Transparent Pricing",
          description: "No hidden fees, no surprise charges. Simple, affordable pricing that scales with your business",
          span: "two"
        },
        social_media_card: {
          id: 4,
          title: "Customer Success",
          description: "Your success is our success. We're here to help you grow your business, not just sell software",
          span: "one"
        }
      }
    ],
    localizations: []
  },
  privacy: {
    slug: "privacy",
    locale: "en",
    seo: {
      metaTitle: "Privacy Policy - Foreko",
      metaDescription: "Learn about Foreko's privacy practices and how we protect your business data"
    },
    dynamic_zone: [
      {
        __component: "dynamic-zone.hero",
        id: 1,
        heading: "Privacy Policy",
        sub_heading: "How Foreko protects your business data and privacy",
        CTAs: [
          {
            id: 1,
            text: "Contact Privacy Team",
            URL: "/contact",
            variant: "outline"
          }
        ]
      },
      {
        __component: "dynamic-zone.features",
        id: 2,
        heading: "Data Protection Commitment",
        sub_heading: "Your business data security is our top priority",
        globe_card: {
          id: 1,
          title: "Bank-Level Encryption",
          description: "All your business data is encrypted in transit and at rest using AES-256 encryption standards",
          span: "two"
        },
        ray_card: {
          id: 2,
          title: "SOC 2 Compliant",
          description: "We maintain SOC 2 Type II compliance for data security and availability",
          span: "one"
        },
        graph_card: {
          id: 3,
          title: "Data Ownership",
          description: "Your business data belongs to you. We never sell or share your data with third parties",
          span: "two"
        },
        social_media_card: {
          id: 4,
          title: "GDPR & CCPA Ready",
          description: "Full compliance with international data protection regulations",
          span: "one"
        }
      },
      {
        __component: "dynamic-zone.cta",
        id: 3,
        heading: "Questions About Privacy?",
        sub_heading: "Our privacy team is here to help with any concerns",
        CTAs: [
          {
            id: 1,
            text: "Contact Privacy Team",
            URL: "/contact",
            variant: "primary"
          }
        ]
      }
    ],
    localizations: []
  },
  terms: {
    slug: "terms",
    locale: "en",
    seo: {
      metaTitle: "Terms of Service - Foreko",
      metaDescription: "Read Foreko's terms of service and usage guidelines for our dashboard suite"
    },
    dynamic_zone: [
      {
        __component: "dynamic-zone.hero",
        id: 1,
        heading: "Terms of Service",
        sub_heading: "Fair and transparent terms for using Foreko's dashboard suite",
        CTAs: [
          {
            id: 1,
            text: "Contact Legal Team",
            URL: "/contact",
            variant: "outline"
          }
        ]
      },
      {
        __component: "dynamic-zone.features",
        id: 2,
        heading: "Service Agreement",
        sub_heading: "Clear terms designed for small business owners",
        globe_card: {
          id: 1,
          title: "Fair Usage Policy",
          description: "Reasonable usage limits designed to ensure service quality for all small business customers",
          span: "two"
        },
        ray_card: {
          id: 2,
          title: "No Lock-In",
          description: "Cancel anytime with 30 days notice. Export your data whenever you want",
          span: "one"
        },
        graph_card: {
          id: 3,
          title: "Service Level Agreement",
          description: "99.9% uptime guarantee with transparent monitoring and status updates",
          span: "two"
        },
        social_media_card: {
          id: 4,
          title: "Support Guarantee",
          description: "Dedicated support team with guaranteed response times for all plan levels",
          span: "one"
        }
      },
      {
        __component: "dynamic-zone.cta",
        id: 3,
        heading: "Questions About Our Terms?",
        sub_heading: "We believe in transparent, fair business practices",
        CTAs: [
          {
            id: 1,
            text: "Contact Us",
            URL: "/contact",
            variant: "primary"
          }
        ]
      }
    ],
    localizations: []
  },
  contact: {
    slug: "contact",
    locale: "en",
    seo: {
      metaTitle: "Contact Us - Foreko",
      metaDescription: "Get in touch with the Foreko team for support, sales inquiries, and partnership opportunities"
    },
    dynamic_zone: [
      {
        __component: "dynamic-zone.hero",
        id: 1,
        heading: "Contact Foreko",
        sub_heading: "We're here to help your small business succeed",
        CTAs: [
          {
            id: 1,
            text: "Start Free Trial",
            URL: "/sign-up",
            variant: "primary"
          }
        ]
      },
      {
        __component: "dynamic-zone.features",
        id: 2,
        heading: "Get in Touch",
        sub_heading: "Multiple ways to reach our dedicated support team",
        globe_card: {
          id: 1,
          title: "Email Support",
          description: "General inquiries: hello@foreko.com | Technical support: support@foreko.com | Sales: sales@foreko.com",
          span: "two"
        },
        ray_card: {
          id: 2,
          title: "Live Chat",
          description: "Available Monday-Friday, 9 AM - 6 PM EST for real-time assistance",
          span: "one"
        },
        graph_card: {
          id: 3,
          title: "Phone Support",
          description: "Call +1 (555) 123-4567 for immediate help with your dashboard setup and questions",
          span: "two"
        },
        social_media_card: {
          id: 4,
          title: "Community",
          description: "Join our community forum and follow @foreko on social media for tips and updates",
          span: "one"
        }
      },
      {
        __component: "dynamic-zone.testimonials",
        id: 3,
        heading: "What Our Customers Say About Support",
        sub_heading: "We're proud of our customer service",
        testimonials: [
          {
            id: 1,
            text: "The Foreko support team helped us get set up in just 30 minutes. They really understand small business needs.",
            user: {
              firstname: "Maria",
              lastname: "Garcia",
              job: "Owner, Garcia's Restaurant Supply",
              image: {
                url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRkY2QjM5Ii8+Cjx0ZXh0IHg9Ijc1IiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk1HPC90ZXh0Pgo8L3N2Zz4K",
                alternativeText: "Maria Garcia"
              }
            }
          }
        ]
      }
    ],
    localizations: []
  },
  pricing: {
    slug: "pricing",
    locale: "en",
    seo: {
      metaTitle: "Pricing - Foreko Dashboard Suite",
      metaDescription: "Affordable pricing plans for Foreko's AI-powered dashboard suite designed for small businesses"
    },
    dynamic_zone: [
      {
        __component: "dynamic-zone.hero",
        id: 1,
        heading: "Simple, Affordable Pricing",
        sub_heading: "Choose the plan that fits your small business budget",
        CTAs: [
          {
            id: 1,
            text: "Start 14-Day Free Trial",
            URL: "/sign-up",
            variant: "primary"
          }
        ]
      },
      {
        __component: "dynamic-zone.pricing",
        id: 2,
        heading: "Choose Your Dashboard Suite",
        sub_heading: "All plans include access to all 5 core dashboards",
        plans: [
          {
            id: 1,
            name: "Starter",
            price: 49,
            sub_text: "Perfect for small businesses just getting started",
            featured: false,
            CTA: {
              text: "Start Free Trial",
              URL: "/sign-up",
              variant: "outline"
            },
            perks: [
              { text: "All 5 Core Dashboards" },
              { text: "Up to 1,000 SKUs" },
              { text: "Basic AI Insights" },
              { text: "Email Support" },
              { text: "2 Integrations" }
            ],
            additional_perks: []
          },
          {
            id: 2,
            name: "Professional",
            price: 99,
            sub_text: "Great for growing businesses",
            featured: true,
            CTA: {
              text: "Start Free Trial",
              URL: "/sign-up",
              variant: "primary"
            },
            perks: [
              { text: "Everything in Starter" },
              { text: "Up to 10,000 SKUs" },
              { text: "Advanced AI Predictions" },
              { text: "Live Chat Support" },
              { text: "Unlimited Integrations" },
              { text: "Custom Reports" }
            ],
            additional_perks: [
              { text: "API Access" },
              { text: "Priority Support" }
            ]
          },
          {
            id: 3,
            name: "Enterprise",
            price: 199,
            sub_text: "For established businesses with complex needs",
            featured: false,
            CTA: {
              text: "Contact Sales",
              URL: "/contact",
              variant: "outline"
            },
            perks: [
              { text: "Everything in Professional" },
              { text: "Unlimited SKUs" },
              { text: "Custom AI Models" },
              { text: "Phone Support" },
              { text: "White-label Options" },
              { text: "Advanced Security" }
            ],
            additional_perks: [
              { text: "Dedicated Account Manager" },
              { text: "Custom SLA" },
              { text: "On-premise Deployment" }
            ]
          }
        ]
      },
      {
        __component: "dynamic-zone.features",
        id: 3,
        heading: "Why Choose Foreko?",
        sub_heading: "More than just dashboards - a complete business transformation",
        globe_card: {
          id: 1,
          title: "14-Day Free Trial",
          description: "Try all features risk-free. No credit card required, cancel anytime during trial",
          span: "two"
        },
        ray_card: {
          id: 2,
          title: "No Setup Fees",
          description: "Get started immediately with our simple onboarding process",
          span: "one"
        },
        graph_card: {
          id: 3,
          title: "Money-Back Guarantee",
          description: "30-day money-back guarantee if you're not completely satisfied",
          span: "two"
        },
        social_media_card: {
          id: 4,
          title: "Cancel Anytime",
          description: "No long-term contracts or cancellation fees. Your data is always yours",
          span: "one"
        }
      }
    ],
    localizations: []
  },
  faq: {
    slug: "faq",
    locale: "en",
    seo: {
      metaTitle: "FAQ - Foreko Dashboard Suite",
      metaDescription: "Frequently asked questions about Foreko's AI-powered dashboard suite for small businesses"
    },
    dynamic_zone: [
      {
        __component: "dynamic-zone.hero",
        id: 1,
        heading: "Frequently Asked Questions",
        sub_heading: "Find answers to common questions about Foreko",
        CTAs: []
      },
      {
        __component: "dynamic-zone.faq",
        id: 2,
        heading: "Common Questions",
        sub_heading: "Everything you need to know about our dashboard suite",
        faqs: [
          {
            id: 1,
            question: "How does Foreko replace spreadsheets?",
            answer: "Foreko provides real-time data updates, AI automation, and seamless integrations that eliminate the need for manual spreadsheets. Our dashboards automatically sync with your POS systems and accounting software."
          },
          {
            id: 2,
            question: "What integrations does Foreko support?",
            answer: "We integrate with popular small business tools including Shopify, Square, QuickBooks, WooCommerce, and more. Our API allows for custom integrations with your existing systems."
          },
          {
            id: 3,
            question: "How accurate are the AI predictions?",
            answer: "Our AI models are trained on small business data and provide highly accurate predictions for inventory, demand forecasting, and cost optimization. The system learns from your business patterns over time."
          },
          {
            id: 4,
            question: "Can I try Foreko before committing?",
            answer: "Yes! We offer a 14-day free trial with full access to all five dashboards. No credit card required, and you can cancel anytime during the trial period."
          },
          {
            id: 5,
            question: "What kind of support do you provide?",
            answer: "We offer email support for all plans, live chat for Professional plans, and dedicated phone support for Enterprise customers. Our knowledge base and video tutorials are available 24/7."
          },
          {
            id: 6,
            question: "Is my business data secure?",
            answer: "Absolutely! We use bank-level encryption and security measures to protect your data. We're SOC 2 compliant and regularly audit our systems. Your data never leaves our secure cloud infrastructure."
          }
        ]
      }
    ],
    localizations: []
  },
  security: {
    slug: "security",
    locale: "en",
    seo: {
      metaTitle: "Data Security - Foreko",
      metaDescription: "Learn about Foreko's comprehensive data security measures and compliance standards"
    },
    dynamic_zone: [
      {
        __component: "dynamic-zone.hero",
        id: 1,
        heading: "Data Security",
        sub_heading: "Enterprise-grade security for your business data",
        CTAs: [
          {
            id: 1,
            text: "Security Whitepaper",
            URL: "/contact",
            variant: "outline"
          }
        ]
      },
      {
        __component: "dynamic-zone.features",
        id: 2,
        heading: "Security Infrastructure",
        sub_heading: "Multi-layered protection for your business data",
        globe_card: {
          id: 1,
          title: "End-to-End Encryption",
          description: "All data is encrypted using AES-256 encryption both in transit and at rest, ensuring your business information is always protected",
          span: "two"
        },
        ray_card: {
          id: 2,
          title: "SOC 2 Type II",
          description: "Independently audited and certified for security, availability, and confidentiality",
          span: "one"
        },
        graph_card: {
          id: 3,
          title: "Regular Penetration Testing",
          description: "Quarterly security assessments by third-party security experts to identify and address potential vulnerabilities",
          span: "two"
        },
        social_media_card: {
          id: 4,
          title: "24/7 Monitoring",
          description: "Continuous monitoring and threat detection to protect against unauthorized access",
          span: "one"
        }
      },
      {
        __component: "dynamic-zone.testimonials",
        id: 3,
        heading: "Trusted by Businesses",
        sub_heading: "Security you can count on",
        testimonials: [
          {
            id: 1,
            text: "As a business handling sensitive customer data, Foreko's security standards give us complete peace of mind. Their compliance certifications were exactly what we needed.",
            user: {
              firstname: "David",
              lastname: "Chen",
              job: "IT Director, Retail Solutions Inc",
              image: {
                url: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjMzc0MTUxIi8+Cjx0ZXh0IHg9Ijc1IiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkRDPC90ZXh0Pgo8L3N2Zz4K",
                alternativeText: "David Chen"
              }
            }
          }
        ]
      }
    ],
    localizations: []
  },
  // Legacy redirects
  about: {
    slug: "about",
    locale: "en",
    seo: {
      metaTitle: "Company - Foreko",
      metaDescription: "Learn about Foreko's mission, team, and commitment to empowering small businesses with AI-powered solutions"
    },
    dynamic_zone: [
      {
        __component: "dynamic-zone.hero",
        id: 1,
        heading: "About Foreko",
        sub_heading: "Empowering small businesses with AI-powered dashboard solutions",
        CTAs: [
          {
            id: 1,
            text: "Start Free Trial",
            URL: "/sign-up",
            variant: "primary"
          },
          {
            id: 2,
            text: "Contact Us",
            URL: "/contact",
            variant: "outline"
          }
        ]
      }
    ],
    localizations: []
  }
};

export const mockGlobalData = {
  seo: {
    metaTitle: "Foreko Complete Dashboard Suite - AI-Powered Business Management",
    metaDescription: "Streamlined, AI-powered solution designed specifically for small businesses. Real-time inventory management, order tracking, and actionable insights through five core dashboards."
  },
  navbar: {
    logo: {
      image: {
        url: "/images/ForekoLogo.png",
        alternativeText: "Foreko Logo"
      }
    },
    left_navbar_items: [
      { text: "Features", URL: "/features", target: "_self" },
      { text: "Pricing", URL: "/pricing", target: "_self" },
      { text: "Use Cases", URL: "/use-cases", target: "_self" },
      { text: "Resources", URL: "/resources", target: "_self" },
      { text: "Company", URL: "/company", target: "_self" }
    ],
    right_navbar_items: [
      { text: "Sign In", URL: "/sign-in", target: "_self" },
      { text: "Start Free Trial", URL: "/sign-up", target: "_self" }
    ]
  },
  footer: {
    logo: {
      image: {
        url: "/images/ForekoLogo.png",
        alternativeText: "Foreko Logo"
      }
    },
    description: "AI-powered dashboard suite designed specifically for small businesses. Real-time inventory management, order tracking, and actionable insights to replace manual spreadsheets.",
    copyright: "© 2024 Foreko. All rights reserved.",
    internal_links: [
      { text: "Home", URL: "/" },
      { text: "Features", URL: "/features" },
      { text: "Pricing", URL: "/pricing" },
      { text: "Use Cases", URL: "/use-cases" },
      { text: "Resources", URL: "/resources" },
      { text: "Company", URL: "/company" }
    ],
    policy_links: [
      { text: "Privacy Policy", URL: "/privacy" },
      { text: "Terms of Service", URL: "/terms" },
      { text: "Data Security", URL: "/security" }
    ],
    social_media_links: [
      { text: "Twitter", URL: "https://twitter.com/foreko" },
      { text: "LinkedIn", URL: "https://linkedin.com/company/foreko" },
      { text: "Facebook", URL: "https://facebook.com/foreko" }
    ]
  }
}; 
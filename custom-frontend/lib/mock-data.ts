export const mockPageData = {
  locale: "en",
  dynamic_zone: [
    {
      __component: "dynamic-zone.hero",
      id: 1,
      heading: "Inventory Reimagined",
      sub_heading: "AI-powered inventory management that predicts exactly what to order and when.",
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
        description: "Live inventory tracking, order status updates, and financial insights refreshed every minute",
        span: "one"
      },
      ray_card: {
        id: 2,
        title: "AI Automation",
        description: "Smart reorder alerts, demand forecasting, and cost optimization recommendations in plain English",
        span: "one"
      },
      graph_card: {
        id: 3,
        title: "Seamless Integration",
        description: "Connects instantly with Shopify, Square, QuickBooks, and 50+ business tools you already use",
        span: "one"
      },
      social_media_card: {
        id: 4,
        title: "Cost-Effective",
        description: "Complete business intelligence starting at $49/month - no IT team required",
        span: "one"
      },
      advanced_analytics_card: {
        id: 5,
        title: "Advanced Analytics",
        description: "Turn data into actionable insights with profit margin analysis, trend forecasting, and performance dashboards",
        span: "one"
      },
      mobile_access_card: {
        id: 6,
        title: "Mobile Access",
        description: "Monitor your business anywhere with our mobile-optimized dashboard and instant push notifications",
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
              url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
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
              url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
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
              url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
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
            url: "https://cdn.worldvectorlogo.com/logos/shopify.svg",
            alternativeText: "Shopify Logo"
          }
        },
        {
          id: 2,
          title: "Square",
          image: {
            url: "/images/square.png",
            alternativeText: "Square Logo"
          }
        },
        {
          id: 3,
          title: "QuickBooks",
          image: {
            url: "https://cdn.worldvectorlogo.com/logos/quickbooks.svg",
            alternativeText: "QuickBooks Logo"
          }
        },
        {
          id: 4,
          title: "WooCommerce",
          image: {
            url: "https://cdn.worldvectorlogo.com/logos/woocommerce.svg",
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
  heading: "Foreko Resources",
  sub_heading: "Latest insights on AI inventory management and small business optimization"
};

export const mockArticles = {
  data: [
    {
      id: 1,
      title: "The Complete Guide to AI-Powered Inventory Management",
      description: "How AI is revolutionizing inventory management for modern businesses. Discover how artificial intelligence is transforming the way businesses manage their stock.",
      slug: "ai-powered-inventory-management-guide",
      publishedAt: "2025-09-03T00:00:00.000Z",
      createdAt: "2025-09-03T00:00:00.000Z",
      updatedAt: "2025-09-03T00:00:00.000Z",
      locale: "en",
      content: `# The Complete Guide to AI-Powered Inventory Management

## How AI is Revolutionizing Inventory Management for Modern Businesses

Inventory management has evolved from clipboards and spreadsheets to sophisticated AI systems that predict, optimize, and automate. This guide explores how artificial intelligence is transforming the way businesses manage their stock.

## The Hidden Cost of Traditional Inventory Management

Most businesses don't realize how much poor inventory management costs them. Studies show that companies typically have 20-30% of their capital tied up in inventory, with much of it being dead stock or at risk of stockouts.

### The Real Numbers:
• **$1.1 trillion** globally tied up in excess inventory
• **23%** average dead stock across industries
• **4-6 hours** daily spent on manual inventory tasks
• **73%** of businesses experience monthly stockouts
• **65%** forecast accuracy with spreadsheets

These aren't just statistics - they represent real money lost and opportunities missed.

## Understanding AI in Inventory Management

### What Makes It "AI-Powered"?

Traditional inventory systems use fixed formulas and rules. If inventory drops below X, order Y. Simple, but inflexible.

AI-powered systems learn from patterns. They analyze:
• Historical sales data
• Seasonal trends
• Market conditions
• Weather patterns
• Social media sentiment
• Economic indicators
• Supplier performance

The AI discovers hidden patterns humans miss. For example, it might notice that rainy Tuesdays increase umbrella sales by 340%, or that social media mentions correlate with demand spikes 3 days later.

## Key Benefits of AI Inventory Management

### 1. Predictive Demand Forecasting
Instead of reacting to stockouts, AI predicts them weeks in advance. Machine learning algorithms analyze dozens of factors to forecast demand with 85-95% accuracy, compared to 60-70% with traditional methods.

### 2. Dynamic Reorder Points
**Traditional:** Fixed reorder point of 100 units
**AI-Powered:** Adjusts daily based on trends, seasonality, and risk factors

The AI might set your reorder point at 80 units in slow season but 150 during peak times, preventing both stockouts and overstock.

### 3. Automated Purchase Orders
AI doesn't just tell you what to order - it can generate complete purchase orders, select the best suppliers, and even negotiate optimal quantities for bulk discounts.

### 4. Dead Stock Prevention
By analyzing sales velocity and market trends, AI identifies slow-moving inventory before it becomes dead stock, suggesting promotions or transfers to prevent losses.

## Real-World Success Stories

• **Electronics Retailer:** Reduced stockouts by 78% while carrying 25% less inventory
• **Restaurant Chain:** Cut food waste by 42% across 18 locations
• **E-commerce Brand:** Eliminated overselling across 5 channels, improved margins by 15%
• **Distributor:** Reduced manual ordering time from 6 hours to 30 minutes daily

## How Confidence Scoring Works

One unique aspect of AI inventory management is confidence scoring. Every prediction includes a confidence level:

• **95-100% Confidence:** Highly reliable, safe to automate
• **85-94% Confidence:** Very good, minimal review needed
• **70-84% Confidence:** Good, quick review recommended
• **Below 70%:** Needs human judgment

This transparency helps you know when to trust the AI and when to apply human expertise.

## The Triple-Bucket Savings Approach

AI-powered systems track savings in three stages:
1. **Potential Savings** - Opportunities identified
2. **In-Flight Savings** - Actions being taken
3. **Realized Savings** - Money actually saved

This methodology proves ROI and helps prioritize actions.

## Is AI Right for Your Business?

AI inventory management works best for businesses with:
• At least 50 SKUs
• $1M+ annual revenue
• Historical sales data (6+ months)
• Desire to scale efficiently

Even smaller businesses benefit, but the ROI is most dramatic at scale.

## Getting Started with AI Inventory Management

1. **Assess Current State** - Understand your inventory challenges
2. **Clean Your Data** - AI needs quality data to learn
3. **Start Small** - Begin with top-selling SKUs
4. **Measure Results** - Track improvements in key metrics
5. **Scale Gradually** - Expand as confidence grows

## The Future of Inventory Management

AI is just beginning. Coming advances include:
• Voice-activated ordering
• Augmented reality warehouse management
• Blockchain supply chain tracking
• Quantum computing optimization
• Autonomous fulfillment centers

The question isn't whether to adopt AI, but how quickly you can implement it before competitors gain the advantage.`,
      dynamic_zone: [],
      image: {
        url: "/images/article1.png",
        alternativeText: "AI Inventory Management"
      },
      categories: [
        { name: "AI" },
        { name: "inventory" },
        { name: "guide" }
      ],
      seo: {
        metaTitle: "The Complete Guide to AI-Powered Inventory Management",
        metaDescription: "Learn how AI is revolutionizing inventory management with predictive forecasting, automated reordering, and real-time optimization."
      }
    },
    {
      id: 2,
      title: "The 7 Essential Dashboards Every Business Needs",
      description: "Why scattered data kills business growth and how integrated dashboards save it. Running a business with disconnected systems is like driving with multiple GPS devices showing different routes.",
      slug: "7-essential-dashboards-every-business-needs",
      publishedAt: "2025-08-27T00:00:00.000Z",
      createdAt: "2025-08-27T00:00:00.000Z",
      updatedAt: "2025-08-27T00:00:00.000Z",
      locale: "en",
      content: `# The 7 Essential Dashboards Every Business Needs

## Why Scattered Data Kills Business Growth (And How Integrated Dashboards Save It)

Running a business with disconnected systems is like driving with multiple GPS devices showing different routes. This guide explores the seven essential dashboards that give you complete business visibility.

## The Problem with Data Silos

Most businesses suffer from data fragmentation:
• Sales data in one system
• Inventory in spreadsheets
• Financials in accounting software
• Customer data in CRM
• Shipping in carrier portals

This fragmentation causes:
• **Delayed decisions** - Gathering data takes hours
• **Missed opportunities** - Can't spot trends quickly
• **Costly mistakes** - Acting on outdated information
• **Team frustration** - Everyone sees different numbers

## The Power of Integrated Dashboards

Integrated dashboards connect all your data sources into unified views. Like a pilot's cockpit, they show everything you need at a glance.

## Dashboard #1: Executive Dashboard

**Purpose:** Give leadership complete business oversight

**Key Metrics to Track:**
• Company health score
• Revenue vs. goals
• Cash position
• Critical alerts
• Department performance

**Why It Matters:** CEOs need to spot problems before they become crises. An executive dashboard provides early warning systems for the entire business.

**Real Impact:** "Our executive dashboard helped us spot a supply chain issue 3 weeks before it would have caused stockouts, saving us $200K" - Manufacturing CEO

## Dashboard #2: Financial Dashboard

**Purpose:** Monitor profitability and cash flow

**Critical Metrics:**
• Gross margins by product/customer
• Operating expenses
• Cash runway
• Budget variance
• Working capital

**Hidden Insights:** Most businesses don't know their true product profitability. A financial dashboard reveals which products make money and which drain resources.

**Power Move:** Set up alerts when margins drop below targets or expenses exceed budgets.

## Dashboard #3: Customer Dashboard

**Purpose:** Understand customer behavior and value

**Must-Track Metrics:**
• Customer lifetime value
• Retention rates
• Net promoter score
• Acquisition costs
• Churn indicators

**The 80/20 Rule:** Typically 20% of customers generate 80% of profits. A customer dashboard identifies your VIPs and at-risk accounts.

**Growth Hack:** Use cohort analysis to understand which customer segments grow fastest.

## Dashboard #4: AI Insights Dashboard

**Purpose:** Surface predictions and opportunities

**Intelligence Provided:**
• Demand forecasts
• Risk alerts
• Optimization opportunities
• Anomaly detection
• Savings tracking

**Competitive Advantage:** While competitors react to problems, you prevent them. AI insights help you see around corners.

**Example Alert:** "Unusual order pattern detected - possible bulk buyer. Recommendation: Reach out with volume discount offer."

## Dashboard #5: Orders Dashboard

**Purpose:** Optimize fulfillment and procurement

**Operational Metrics:**
• Order fill rates
• Cycle times
• Perfect order percentage
• Backorder levels
• Supplier performance

**The Domino Effect:** Poor order management cascades into inventory problems, customer complaints, and cash flow issues. This dashboard prevents that cascade.

**Quick Win:** Track "perfect orders" (complete, on-time, damage-free, accurate documentation) to identify process improvements.

## Dashboard #6: Inventory Dashboard

**Purpose:** Balance stock levels and cash flow

**Critical KPIs:**
• Turnover rates
• Stock accuracy
• Dead stock percentage
• Carrying costs
• Service levels

**Money Finder:** Most businesses have 20-30% dead stock. An inventory dashboard identifies it for liquidation, freeing up cash.

**Pro Tip:** Monitor ABC analysis - focus on the 20% of SKUs that generate 80% of revenue.

## Dashboard #7: Logistics Dashboard

**Purpose:** Ensure reliable, cost-effective delivery

**Performance Metrics:**
• On-time delivery rates
• Shipping costs
• Transit times
• Carrier performance
• Exception rates

**Customer Truth:** Delivery experience determines whether customers order again. This dashboard ensures you meet expectations.

**Cost Saver:** Compare carrier performance to negotiate better rates and service levels.

## How Dashboards Work Together

The magic happens when dashboards connect:
• Inventory low? → Orders dashboard triggers purchase order
• Customer complaint? → Check logistics for delivery issues
• Margins dropping? → Financial dashboard shows why
• Sales spike? → AI dashboard predicted it last week

## Building Your Dashboard Strategy

**Start Here:**
1. Identify your biggest pain point
2. Implement that dashboard first
3. Add connected dashboards gradually
4. Train teams on their relevant views
5. Review and refine weekly

**Common Mistakes to Avoid:**
• Information overload (too many metrics)
• Vanity metrics (impressive but not actionable)
• Set-and-forget (dashboards need evolution)
• One-size-fits-all (departments need different views)

## The ROI of Integrated Dashboards

Companies with integrated dashboards report:
• 40% faster decision-making
• 25% reduction in operational costs
• 30% improvement in customer satisfaction
• 50% less time gathering reports
• 3x more likely to spot opportunities

## Your Dashboard Maturity Journey

**Level 1: Chaos** - Data in spreadsheets, no visibility
**Level 2: Basic** - Some dashboards, still disconnected
**Level 3: Connected** - Integrated dashboards, real-time data
**Level 4: Intelligent** - AI-powered insights and predictions
**Level 5: Autonomous** - Self-optimizing operations

Most businesses are at Level 1-2. Leaders are pushing toward Level 4-5.`,
      dynamic_zone: [],
      image: {
        url: "/images/ordersdash.png",
        alternativeText: "Essential Business Dashboards"
      },
      categories: [
        { name: "dashboards" },
        { name: "analytics" },
        { name: "guide" }
      ],
      seo: {
        metaTitle: "The 7 Essential Dashboards Every Business Needs",
        metaDescription: "Learn why scattered data kills business growth and how integrated dashboards can save your business with complete visibility."
      }
    },
    {
      id: 3,
      title: "Industry Guide - Inventory Solutions by Sector",
      description: "Why generic inventory systems fail and what your industry really needs. Every industry has unique inventory challenges - explore specialized solutions for each sector.",
      slug: "industry-inventory-solutions-guide",
      publishedAt: "2025-08-27T00:00:00.000Z",
      createdAt: "2025-08-27T00:00:00.000Z",
      updatedAt: "2025-08-27T00:00:00.000Z",
      locale: "en",
      content: `# Industry Guide - Inventory Solutions by Sector

## Why Generic Inventory Systems Fail (And What Your Industry Really Needs)

Every industry has unique inventory challenges. A restaurant managing fresh ingredients has vastly different needs than an e-commerce store or manufacturer. This guide explores specialized solutions for each sector.

## Restaurant & Food Service

### Your Unique Challenges:

The food industry battles constant enemies: spoilage, fluctuating prices, and thin margins. With ingredients expiring daily and food costs typically 30% of revenue, precision matters.

### Critical Requirements:

**Recipe-Level Tracking:** You don't stock "pizza" - you stock dough, sauce, cheese, and toppings. Modern systems track ingredients and automatically calculate recipe costs as prices change.

**Expiration Management:** FIFO (First In, First Out) isn't just best practice - it's essential for food safety. Smart systems track expiration dates and alert before waste occurs.

**Multi-Location Complexity:** Chain restaurants need central kitchen management, transfer tracking between locations, and consistency across all sites.

### Technology Solutions:
• Predictive ordering based on weather and events
• Automatic recipe costing updates
• Prep planning based on forecasts
• Integration with POS systems
• Health compliance tracking

**Success Metric:** Leading restaurants achieve 4-6% food waste versus industry average of 10%.

## E-Commerce & Retail

### Your Unique Challenges:

Selling across multiple channels creates synchronization nightmares. One inventory pool must serve your website, Amazon, eBay, and physical store - without overselling.

### Critical Requirements:

**Channel Synchronization:** Real-time inventory updates across all platforms. When item sells on Amazon, your Shopify store must know instantly.

**FBA Optimization:** Balance between FBA fees and fulfillment speed. Smart systems calculate when to use FBA versus self-fulfillment.

**Seasonal Planning:** Black Friday can make or break your year. You need systems that predict seasonal spikes and ensure stock without overbuying.

### Technology Solutions:
• Multi-channel inventory pooling
• Automated repricing based on competition
• Return processing and restocking
• Bundle and kit management
• Marketplace fee optimization

**Success Metric:** Top e-commerce brands achieve 0% oversells and 15+ inventory turns annually.

## Manufacturing & Distribution

### Your Unique Challenges:

Complex bill of materials (BOMs), long supplier lead times, and production scheduling create planning nightmares. One missing component can halt entire production lines.

### Critical Requirements:

**BOM Management:** Multi-level BOMs with thousands of components. Systems must track raw materials through sub-assemblies to finished goods.

**MRP Calculations:** Material Requirements Planning that considers production schedules, lead times, and minimum order quantities.

**Quality Tracking:** Lot and serial number tracking for recalls and warranty claims. Complete traceability from supplier to customer.

### Technology Solutions:
• Multi-level BOM explosion
• Capacity planning integration
• Supplier performance scoring
• Alternative component management
• Cost rollup calculations

**Success Metric:** Leading manufacturers achieve 95% on-time delivery with 20% less inventory.

## Healthcare & Medical

### Your Unique Challenges:

Life-or-death inventory requirements with strict regulations. Expired medications can't be sold, recalls must be instant, and stockouts can impact patient care.

### Critical Requirements:

**Compliance Tracking:** FDA regulations, chain of custody, temperature monitoring, and audit trails. Every movement must be documented.

**Consignment Management:** Many high-value items (like surgical implants) are on consignment. Track ownership and usage accurately.

**Par Level Management:** Each department needs specific stock levels. OR requirements differ from ER or pharmacy needs.

### Technology Solutions:
• Automatic FDA compliance reporting
• Temperature and humidity monitoring
• Recall management systems
• Charge capture integration
• Expiration date automation

**Success Metric:** Leading healthcare providers achieve 99.9% availability with 0% expired product usage.

## Construction & Field Service

### Your Unique Challenges:

Inventory scattered across job sites, trucks, and warehouses. Tools disappear, materials get transferred between jobs, and weather delays change everything.

### Critical Requirements:

**Mobile Access:** Field workers need to check/update inventory from job sites, often without internet connection.

**Tool Tracking:** High-value tools and equipment need tracking. Who has it? Which job site? When due back?

**Project-Based Inventory:** Track materials by job for accurate costing. Know exactly what went into each project.

### Technology Solutions:
• Offline mobile apps
• Barcode/RFID tool tracking
• Job cost integration
• Equipment maintenance scheduling
• Weather-adjusted planning

**Success Metric:** Leading contractors reduce tool loss by 90% and improve job margins by 15%.

## 3PL & Logistics Providers

### Your Unique Challenges:

Managing multiple clients' inventory in shared spaces with different requirements, billing models, and SLAs.

### Critical Requirements:

**Client Segregation:** Complete separation of client inventories with individual portals and reporting.

**Billing Automation:** Complex billing based on storage, handling, and value-added services.

**SLA Management:** Track and prove compliance with service level agreements.

### Technology Solutions:
• Multi-tenant architecture
• Client portal access
• Automated billing calculations
• Cross-docking optimization
• Real-time visibility for clients

**Success Metric:** Top 3PLs achieve 99.8% inventory accuracy with 100% SLA compliance.

## Choosing the Right Solution

### Questions to Ask:
1. Does it handle my industry's specific requirements?
2. Can it integrate with my existing systems?
3. Will it scale as we grow?
4. Does it comply with our regulations?
5. What's the real ROI timeline?

### Red Flags to Avoid:
• "One size fits all" messaging
• No industry-specific features
• Limited integration options
• Unclear pricing models
• No customer references in your industry`,
      dynamic_zone: [],
      image: {
        url: "/images/smallwomen.png",
        alternativeText: "Restaurant owner using tablet for inventory management"
      },
      categories: [
        { name: "industry" },
        { name: "inventory" },
        { name: "guide" }
      ],
      seo: {
        metaTitle: "Industry Guide - Inventory Solutions by Sector",
        metaDescription: "Discover specialized inventory solutions for restaurants, e-commerce, manufacturing, healthcare, construction, and logistics industries."
      }
    },
    {
      id: 4,
      title: "The Small Business Guide to Inventory Management",
      description: "How to Compete with Big Business on a Small Budget. Large corporations have million-dollar systems and teams of analysts. But small businesses can be more agile and efficient with the right approach.",
      slug: "small-business-inventory-guide",
      publishedAt: "2025-08-26T00:00:00.000Z",
      createdAt: "2025-08-26T00:00:00.000Z",
      updatedAt: "2025-08-26T00:00:00.000Z",
      locale: "en",
      content: `# The Small Business Guide to Inventory Management

## How to Compete with Big Business on a Small Budget

Large corporations have million-dollar systems and teams of analysts. But small businesses can be more agile and efficient with the right approach. This guide shows you how.

## The Small Business Advantage

You might think size is a disadvantage, but small businesses have unique strengths:

• **Agility** - Change direction quickly
• **Relationships** - Know customers personally
• **Focus** - Fewer SKUs to manage
• **Innovation** - Try new approaches fast
• **Efficiency** - Less bureaucracy

The key is leveraging these advantages with smart inventory management.

## Start with the Basics

### The 80/20 Inventory Rule

Focus on the 20% of products that generate 80% of revenue. These are your "A" items that deserve most attention.

• **A Items (20%):** Count weekly, never run out
• **B Items (30%):** Count monthly, maintain buffer
• **C Items (50%):** Count quarterly, order when low

### The True Cost of Inventory

Most small businesses only consider purchase price, but true inventory cost includes:

• Storage space (rent/utilities)
• Insurance and taxes
• Handling labor
• Obsolescence risk
• Opportunity cost of cash

Total carrying cost is typically 25-30% of inventory value annually.

## Free and Low-Cost Tools

### Spreadsheet Power

Before buying software, maximize free tools:

**Google Sheets Inventory Tracker:**
• Product database
• Reorder point calculations
• Basic sales tracking
• Low stock alerts
• Simple reporting

**Key Formulas:**
• Reorder Point = (Average Daily Usage × Lead Time) + Safety Stock
• EOQ = √(2 × Annual Demand × Order Cost / Holding Cost)
• Turnover = Cost of Goods Sold / Average Inventory

### When to Upgrade

Consider inventory software when:
• Managing 50+ SKUs
• Selling on multiple channels
• Spending 2+ hours daily on inventory
• Making costly stock mistakes
• Ready to scale

## Cash Flow Management

### The Inventory-Cash Balance

Every dollar in inventory is a dollar not in your bank. Smart small businesses:

**Negotiate Payment Terms:**
• Customers: Net 15-30 days
• Suppliers: Net 45-60 days
• Result: Positive cash flow

**Use JIT Principles:**
• Order frequently in smaller quantities
• Reduce storage needs
• Minimize obsolescence
• Free up cash

**Consider Dropshipping:**
• No inventory investment
• No storage costs
• Focus on marketing
• Test new products risk-free

## Preventing Common Mistakes

**Mistake 1: Overordering "Deals"**
Buying 1000 units for 50% off seems smart until you realize it'll take 2 years to sell them.

*Solution:* Calculate turnover time and carrying costs before bulk buying.

**Mistake 2: Ignoring Seasonality**
Many businesses forget seasonal patterns and get stuck with off-season inventory.

*Solution:* Track monthly sales patterns and plan inventory accordingly.

**Mistake 3: Poor Organization**
Can't sell what you can't find. Disorganization leads to duplicate orders and lost sales.

*Solution:* Implement location tracking, even if it's just shelf labels.

**Mistake 4: No Backup Suppliers**
Relying on one supplier is risky. What if they raise prices or go out of business?

*Solution:* Maintain relationships with 2-3 suppliers for critical items.

## Growth Strategies

### Start Lean:
• Test new products with minimal quantities
• Use pre-orders to gauge demand
• Partner with suppliers for consignment
• Focus on fast-turning items

### Scale Smart:
• Reinvest profits into inventory
• Expand successful product lines
• Add complementary items
• Build supplier relationships

### Leverage Technology:
• Use marketplace fulfillment (FBA)
• Implement barcode scanning
• Automate reorder points
• Integrate sales channels

## Success Stories

• **Coffee Shop:** Reduced waste 40% by tracking ingredient usage daily instead of weekly.
• **Online Boutique:** Increased turns from 4 to 12 annually by focusing on bestsellers.
• **Hardware Store:** Cut stockouts 75% using simple min/max spreadsheet system.
• **Gift Shop:** Freed up $30K cash by liquidating dead stock identified through ABC analysis.

## Your 90-Day Action Plan

**Days 1-30: Assess**
• Count everything
• Identify dead stock
• Calculate carrying costs
• Analyze sales patterns

**Days 31-60: Optimize**
• Liquidate dead stock
• Set reorder points
• Organize storage
• Negotiate terms

**Days 61-90: Systematize**
• Implement tracking system
• Train any staff
• Document procedures
• Monitor improvements

## When You're Ready to Scale

Signs you need professional inventory management:
• Consistent profitable growth
• Multiple sales channels
• Growing product catalog
• Inventory errors costing money
• Manual tasks overwhelming

Modern cloud-based systems start at $50-200/month and deliver ROI within 60-90 days for most small businesses.`,
      dynamic_zone: [],
      image: {
        url: "/images/startup.png",
        alternativeText: "Small Business Inventory Management"
      },
      categories: [
        { name: "small-business" },
        { name: "inventory" },
        { name: "guide" }
      ],
      seo: {
        metaTitle: "The Small Business Guide to Inventory Management - Foreko",
        metaDescription: "Learn how to compete with big business on a small budget. Smart inventory management strategies for small businesses."
      }
    },
    {
      id: 5,
      title: "KPIs That Actually Matter - A Practical Guide",
      description: "Stop Tracking Vanity Metrics and Start Measuring What Drives Profit. Most businesses drown in data but thirst for insights. This guide cuts through the noise to focus on KPIs that actually impact your bottom line.",
      slug: "kpis-that-matter-practical-guide",
      publishedAt: "2025-08-25T00:00:00.000Z",
      createdAt: "2025-08-25T00:00:00.000Z",
      updatedAt: "2025-08-25T00:00:00.000Z",
      locale: "en",
      content: `# KPIs That Actually Matter - A Practical Guide

## Stop Tracking Vanity Metrics and Start Measuring What Drives Profit

Most businesses drown in data but thirst for insights. This guide cuts through the noise to focus on KPIs that actually impact your bottom line.

## The Problem with Most KPIs

Companies track dozens of metrics that sound important but don't drive action:
• Total website visits (but not conversion)
• Social media followers (but not engagement)
• Gross sales (but not profitability)

Real KPIs pass three tests:
1. **Actionable** - You can influence them
2. **Accessible** - You can measure them easily
3. **Auditable** - You can verify them

## The Essential Inventory KPIs

### 1. Inventory Turnover Rate

**What It Measures:** How quickly you sell and replace inventory

**Formula:** Cost of Goods Sold ÷ Average Inventory

**Target:** Varies by industry
• Grocery: 15-20 turns
• Fashion: 4-6 turns
• Electronics: 8-10 turns
• Furniture: 2-4 turns

**Why It Matters:** Money tied up in inventory can't be used elsewhere. Higher turnover = better cash flow.

**Action Steps:**
• Identify slow movers
• Reduce order quantities
• Improve demand forecasting
• Clear old stock quickly

### 2. Stock-to-Sales Ratio

**What It Measures:** Balance between inventory and sales

**Formula:** Inventory Value ÷ Sales Value

**Target:** 1.5-2.0 for most retail

**Why It Matters:** Too high = excess inventory. Too low = stockouts.

**Red Flags:**
• Ratio climbing monthly (building excess)
• Ratio varying wildly (poor planning)
• Ratio over 3 (cash flow danger)

### 3. Gross Margin Return on Investment (GMROI)

**What It Measures:** Profit generated per dollar of inventory

**Formula:** Gross Margin $ ÷ Average Inventory Cost

**Target:** Minimum 2.0 (making $2 for every $1 invested)

**Power Move:** Calculate GMROI by category to identify winners and losers.

## The Critical Order KPIs

### 4. Perfect Order Rate

**What It Measures:** Orders delivered complete, on-time, damage-free, with correct documentation

**Formula:** Perfect Orders ÷ Total Orders × 100

**Target:** 95% minimum

**Impact:** Each 1% improvement typically increases customer retention by 2%.

### 5. Order Cycle Time

**What It Measures:** Time from order placement to delivery

**Formula:** Average (Delivery Date - Order Date)

**Target:** Beat Amazon's standard in your area

**Customer Truth:** 73% of customers say delivery speed influences purchasing decisions.

## The Financial KPIs That Matter

### 6. Cash Conversion Cycle

**What It Measures:** Days to convert inventory investment back to cash

**Formula:** Days Inventory + Days Receivables - Days Payables

**Target:** As low as possible (negative is ideal!)

**Example:**
• Days to sell inventory: 30
• Days to collect payment: 45
• Days to pay suppliers: 60
• Cash Conversion Cycle: 15 days

### 7. Carrying Cost Percentage

**What It Measures:** True cost of holding inventory

**Includes:**
• Storage costs
• Insurance
• Taxes
• Obsolescence
• Opportunity cost

**Target:** 15-25% of inventory value annually

**Reality Check:** Most businesses underestimate by 10-15%.

## The Customer-Centric KPIs

### 8. Fill Rate

**What It Measures:** Percentage of demand met from stock

**Formula:** Units Shipped ÷ Units Ordered × 100

**Target:** 95-98%

**Lost Sale Reality:** Every 1% improvement in fill rate typically increases revenue by 0.5-1%.

### 9. Backorder Rate

**What It Measures:** Orders that can't be filled immediately

**Formula:** Backordered Items ÷ Total Items Ordered × 100

**Target:** <2%

**Hidden Cost:** Backorders cost 3x more to fulfill than regular orders.

## The Predictive KPIs

### 10. Forecast Accuracy

**What It Measures:** How well you predict demand

**Formula:** 1 - (|Forecast - Actual| ÷ Actual) × 100

**Target:** 85% or higher

**Improvement Path:**
• Start simple (moving averages)
• Add seasonality
• Include promotions
• Consider external factors
• Use AI for complex patterns

## Building Your KPI Dashboard

### Start Simple:
**Week 1:** Pick 3 KPIs most relevant to your biggest problem
**Week 2:** Set up tracking (spreadsheet is fine)
**Week 3:** Establish baselines
**Week 4:** Set improvement targets

### Review Rhythm:
• **Daily:** Operational KPIs (fill rate, orders)
• **Weekly:** Tactical KPIs (turnover, cycle time)
• **Monthly:** Strategic KPIs (margins, cash cycle)

### Warning Signs in Your KPIs:
• Sudden changes (>20% swing)
• Consistent decline (3+ periods)
• Missing targets repeatedly
• KPIs moving opposite directions

## From KPIs to Action

### The 5 Whys Method:
**Problem:** Inventory turnover dropped from 8 to 6
1. Why? Excess inventory built up
2. Why? Ordered too much last quarter
3. Why? Forecast was too high
4. Why? Didn't account for competitor's promotion
5. Why? No competitive monitoring process

**Solution:** Add competitive intelligence to forecast process

## Your KPI Maturity Path

**Level 1: Reactive** - Check KPIs after problems occur
**Level 2: Active** - Monitor KPIs regularly
**Level 3: Proactive** - Set alerts for KPI thresholds
**Level 4: Predictive** - Forecast future KPI trends
**Level 5: Prescriptive** - AI recommends actions

Most businesses operate at Level 1-2. Leaders push toward Level 4-5.`,
      dynamic_zone: [],
      image: {
        url: "/images/coffee.png",
        alternativeText: "KPIs Dashboard Analytics"
      },
      categories: [
        { name: "analytics" },
        { name: "KPIs" },
        { name: "metrics" }
      ],
      seo: {
        metaTitle: "KPIs That Actually Matter - A Practical Guide",
        metaDescription: "Stop tracking vanity metrics. Learn which KPIs actually impact your bottom line and how to measure them effectively."
      }
    },
    {
      id: 6,
      title: "Future-Proofing Your Business with Smart Inventory",
      description: "The Technologies and Strategies That Will Define the Next Decade. The future of inventory management is already here - it's just not evenly distributed. This guide explores emerging technologies and strategies that will separate winners from losers.",
      slug: "future-proofing-smart-inventory",
      publishedAt: "2025-08-24T00:00:00.000Z",
      createdAt: "2025-08-24T00:00:00.000Z",
      updatedAt: "2025-08-24T00:00:00.000Z",
      locale: "en",
      content: `# Future-Proofing Your Business with Smart Inventory

## The Technologies and Strategies That Will Define the Next Decade

The future of inventory management is already here - it's just not evenly distributed. This guide explores emerging technologies and strategies that will separate winners from losers.

## The Acceleration of Change

Inventory management evolved more in the last 5 years than the previous 50:
• AI went from concept to reality
• Same-day delivery became standard
• Omnichannel went from luxury to necessity
• Sustainability became a requirement
• Supply chains went global then local again

The next 5 years will be even more dramatic.

## Artificial Intelligence: From Prediction to Prescription

**Today's AI:** Predicts what will happen
**Tomorrow's AI:** Prescribes what to do

### Current State:
• Demand forecasting with 85% accuracy
• Anomaly detection
• Price optimization
• Supplier selection

### Coming Soon:
• 95%+ forecast accuracy
• Autonomous ordering
• Self-optimizing supply chains
• Negotiation bots
• Quality prediction

**Real Example:** Major retailers already use AI that automatically adjusts prices, orders stock, and routes shipments without human intervention.

## The Internet of Things (IoT) Revolution

### Smart Shelves and Sensors

Imagine shelves that:
• Weigh products continuously
• Alert when stock is low
• Track expiration dates
• Monitor temperature
• Count customer interactions

### RFID Everything

RFID costs dropped 90% in 10 years. Soon, every product will be trackable:
• Instant inventory counts
• Automatic checkout
• Loss prevention
• Recall management
• Supply chain visibility

**Practical Application:** A clothing retailer using RFID reduced inventory count time from 40 hours to 2 hours with 99.9% accuracy.

## Sustainability as Competitive Advantage

### The Circular Economy

Forward-thinking businesses are designing out waste:
• Products designed for disassembly
• Take-back programs
• Refurbishment operations
• Material recovery systems
• Waste-to-resource conversion

### Carbon-Optimized Inventory

New systems optimize for carbon footprint, not just cost:
• Local sourcing when carbon-efficient
• Consolidated shipments
• Optimal transport modes
• Warehouse location selection
• Product lifecycle tracking

**Consumer Reality:** 73% of millennials will pay more for sustainable products.

## The Automation Wave

### Robotic Warehouses

Automation is moving beyond Amazon:
• Autonomous picking robots
• Automated storage and retrieval
• Drone inventory counts
• Self-driving forklifts
• Lights-out warehouses

**Cost Reality:** Warehouse automation costs dropped 50% in 5 years and ROI improved to 2-3 years.

### Micro-Fulfillment Centers

Urban micro-warehouses enable:
• 30-minute delivery
• Lower last-mile costs
• Reduced transportation
• Fresh product delivery
• Competitive advantage

## Blockchain and Trust

### Supply Chain Transparency

Blockchain enables:
• Origin verification
• Authenticity guarantee
• Ethical sourcing proof
• Recall precision
• Regulatory compliance

### Smart Contracts

Automated execution when conditions are met:
• Payment on delivery confirmation
• Penalty for late shipment
• Quality-based pricing
• Automatic reordering
• Dispute resolution

**Industry Example:** Walmart requires suppliers to use blockchain for food tracking, reducing contamination investigation from weeks to seconds.

## The Experience Economy

### Personalized Inventory

Future inventory systems will maintain "inventory of one":
• Made-to-order everything
• Personalized products
• Individual pricing
• Custom bundles
• Unique experiences

### Experiential Retail

Physical stores become experience centers:
• Showrooming with home delivery
• Virtual reality try-ons
• Augmented reality placement
• Interactive displays
• Event spaces

## Preparing for the Future

### Build These Capabilities Now:

**Data Excellence**
• Clean, organized data
• Real-time visibility
• Historical patterns
• External data feeds

**Integration Readiness**
• API-first approach
• Cloud-based systems
• Flexible architecture
• Scalable infrastructure

**Team Development**
• Digital literacy
• Analytical thinking
• Continuous learning
• Change adaptability

**Customer Centricity**
• Experience focus
• Feedback loops
• Personalization capability
• Service excellence

## The Convergence Point

All these technologies converge into:
• **Autonomous Commerce** - Self-managing businesses
• **Predictive Operations** - Problems solved before they occur
• **Sustainable Profitability** - Good for planet and profit
• **Hyper-Personalization** - Every customer unique
• **Resilient Supply Chains** - Anti-fragile operations

## Your Future-Proofing Checklist

### Next 6 Months:
☐ Audit current technology stack
☐ Identify biggest vulnerability
☐ Test one new technology
☐ Train team on digital tools
☐ Build data foundation

### Next 12 Months:
☐ Implement AI/ML pilot
☐ Add IoT sensors
☐ Automate one process
☐ Launch sustainability initiative
☐ Create innovation budget

### Next 24 Months:
☐ Scale successful pilots
☐ Build competitive moat
☐ Lead in one area
☐ Share knowledge
☐ Plan next disruption

## The Choice Before You

Every business faces a choice:
1. Evolve and thrive in the new economy
2. Resist and become irrelevant

The tools exist. The knowledge is available. The only question is whether you'll act before competitors do.`,
      dynamic_zone: [],
      image: {
        url: "/images/smallbus.png",
        alternativeText: "Future-Proofing Business with Smart Inventory"
      },
      categories: [
        { name: "future" },
        { name: "technology" },
        { name: "innovation" }
      ],
      seo: {
        metaTitle: "Future-Proofing Your Business with Smart Inventory",
        metaDescription: "Explore emerging technologies and strategies that will define the next decade of inventory management."
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
      metaTitle: "Use Cases - Foreko AI Inventory Management",
      metaDescription: "See how different types of small businesses use Foreko to streamline inventory operations and boost profitability"
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
        heading: "Retail",
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
                url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
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
                url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
                alternativeText: "Carlos Rodriguez"
              }
            }
          }
        ]
      },
      {
        __component: "dynamic-zone.testimonials",
        id: 3,
        heading: "E-commerce",
        sub_heading: "From spreadsheets to smart inventory automation",
        testimonials: [
          {
            id: 3,
            text: "Before Foreko, I was constantly either out of stock or overstocked. The AI forecasting helped me optimize my inventory levels and increase profits by 25%.",
            user: {
              firstname: "Emma",
              lastname: "Thompson",
              job: "CEO, Thompson's Online Store",
              image: {
                url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
                alternativeText: "Emma Thompson"
              }
            }
          },
          {
            id: 4,
            text: "The integration with our Shopify store is seamless. We can track everything from inventory to customer insights in real-time across all our sales channels.",
            user: {
              firstname: "Michael",
              lastname: "Chen",
              job: "Founder, Chen's Tech Store",
              image: {
                url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
                alternativeText: "Michael Chen"
              }
            }
          }
        ]
      },
      {
        __component: "dynamic-zone.testimonials",
        id: 4,
        heading: "Restaurants",
        sub_heading: "From food waste to perfect portion planning",
        testimonials: [
          {
            id: 5,
            text: "Foreko's AI helped us reduce food waste by 40% by predicting exactly how much inventory we need based on seasonal patterns and local events.",
            user: {
              firstname: "Maria",
              lastname: "Garcia",
              job: "Owner, Garcia's Family Restaurant",
              image: {
                url: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
                alternativeText: "Maria Garcia"
              }
            }
          },
          {
            id: 6,
            text: "Managing inventory for three restaurant locations was a nightmare. Now I can see all locations in one dashboard and optimize ordering across all sites.",
            user: {
              firstname: "Antonio",
              lastname: "Rossi",
              job: "Chef & Owner, Rossi's Italian Kitchen",
              image: {
                url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
                alternativeText: "Antonio Rossi"
              }
            }
          }
        ]
      },
      {
        __component: "dynamic-zone.testimonials",
        id: 5,
        heading: "Field & Trades",
        sub_heading: "From tool chaos to organized efficiency",
        testimonials: [
          {
            id: 7,
            text: "As a contractor, keeping track of materials across multiple job sites was impossible. Foreko's mobile dashboard lets me manage inventory from anywhere.",
            user: {
              firstname: "James",
              lastname: "Wilson",
              job: "Owner, Wilson Construction",
              image: {
                url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
                alternativeText: "James Wilson"
              }
            }
          },
          {
            id: 8,
            text: "The AI predictions help us stock the right parts before service calls. Our technician efficiency improved by 35% since we're never missing critical components.",
            user: {
              firstname: "Lisa",
              lastname: "Johnson",
              job: "Operations Manager, Johnson HVAC",
              image: {
                url: "https://images.unsplash.com/photo-1494790108755-2616c669c8c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
                alternativeText: "Lisa Johnson"
              }
            }
          }
        ]
      }
    ],
    localizations: []
  },
  resources: {
    slug: "resources",
    locale: "en",
    seo: {
      metaTitle: "Resources - Foreko AI Inventory Management",
      metaDescription: "Latest insights on AI inventory management and small business optimization. Guides, case studies, and best practices."
    },
    dynamic_zone: [
      {
        __component: "dynamic-zone.blog-grid",
        id: 1,
        heading: "Foreko Resources",
        sub_heading: "Latest insights on AI inventory management and small business optimization",
        articles: [
          {
            id: 1,
            title: "The Complete Guide to AI-Powered Inventory Management",
            description: "How AI is revolutionizing inventory management for modern businesses. Discover how artificial intelligence is transforming the way businesses manage their stock, from predictive forecasting to automated reordering.",
            slug: "ai-powered-inventory-management-guide",
            publishedAt: "September 3, 2025",
            image: {
              url: "/images/article1.png",
              alternativeText: "AI Inventory Management"
            },
            categories: [
              { name: "AI" },
              { name: "inventory" },
              { name: "guide" }
            ]
          },
          {
            id: 2,
            title: "The 7 Essential Dashboards Every Business Needs",
            description: "Why scattered data kills business growth and how integrated dashboards save it. Running a business with disconnected systems is like driving with multiple GPS devices showing different routes.",
            slug: "7-essential-dashboards-every-business-needs",
            publishedAt: "August 27, 2025",
            image: {
              url: "/images/ordersdash.png",
              alternativeText: "Essential Business Dashboards"
            },
            categories: [
              { name: "dashboards" },
              { name: "analytics" },
              { name: "guide" }
            ]
          },
          {
            id: 3,
            title: "Industry Guide - Inventory Solutions by Sector",
            description: "Why generic inventory systems fail and what your industry really needs. Every industry has unique inventory challenges - explore specialized solutions for each sector.",
            slug: "industry-inventory-solutions-guide",
            publishedAt: "August 27, 2025",
            image: {
              url: "/images/smallwomen.png",
              alternativeText: "Restaurant owner using tablet for inventory management"
            },
            categories: [
              { name: "industry" },
              { name: "inventory" },
              { name: "guide" }
            ]
          },
          {
            id: 4,
            title: "The Small Business Guide to Inventory Management",
            description: "How to Compete with Big Business on a Small Budget. Large corporations have million-dollar systems and teams of analysts. But small businesses can be more agile and efficient with the right approach.",
            slug: "small-business-inventory-guide",
            publishedAt: "August 26, 2025",
            image: {
              url: "/images/startup.png",
              alternativeText: "Small Business Inventory Management"
            },
            categories: [
              { name: "small-business" },
              { name: "inventory" },
              { name: "guide" }
            ]
          },
          {
            id: 5,
            title: "KPIs That Actually Matter - A Practical Guide",
            description: "Stop Tracking Vanity Metrics and Start Measuring What Drives Profit. Most businesses drown in data but thirst for insights.",
            slug: "kpis-that-matter-practical-guide",
            publishedAt: "August 25, 2025",
            image: {
              url: "/images/coffee.png",
              alternativeText: "KPIs Dashboard Analytics"
            },
            categories: [
              { name: "analytics" },
              { name: "KPIs" },
              { name: "metrics" }
            ]
          },
          {
            id: 6,
            title: "Future-Proofing Your Business with Smart Inventory",
            description: "The Technologies and Strategies That Will Define the Next Decade. The future of inventory management is already here - it's just not evenly distributed.",
            slug: "future-proofing-smart-inventory",
            publishedAt: "August 24, 2025",
            image: {
              url: "/images/smallbus.png",
              alternativeText: "Future-Proofing Business with Smart Inventory"
            },
            categories: [
              { name: "future" },
              { name: "technology" },
              { name: "innovation" }
            ]
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
      metaTitle: "Company - Foreko AI Inventory Management",
      metaDescription: "Learn about Foreko's mission, team, and commitment to empowering small businesses with AI-powered inventory management solutions"
    },
    dynamic_zone: [
      {
        __component: "dynamic-zone.hero",
        id: 1,
        heading: "Our Mission",
        sub_heading: "Born from the struggle of small business owners, we're on a mission to level the playing field",
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
        __component: "dynamic-zone.team-static",
        id: 2,
        heading: "Meet our Founders",
        sub_heading: "The visionaries leading our mission to transform small business success",
        testimonials: [
          {
            id: 1,
            text: "As a Computer Science student at the University of Arkansas, I witnessed firsthand how small businesses struggled with inventory chaos while having no access to the advanced tools that could help them. At Foreko, I lead all software development including AI model architecture, front-end development, and the core technology that powers our inventory intelligence platform. Foreko was born from the belief that every entrepreneur deserves the same technological advantages, regardless of their company's size.",
            user: {
              firstname: "Homero",
              lastname: "Ruiz",
              job: "President",
              image: {
                url: "/images/Homero.png",
                alternativeText: "Homero Ruiz"
              },
              linkedin: "https://www.linkedin.com/in/homero-ruiz-77708621a/"
            }
          },
          {
            id: 2,
            text: "Pursuing Information Systems with Business Analytics concentration and Supply Chain Management minor at University of Arkansas. As President, Jason leads our database infrastructure and algorithm development, ensuring our software can scale efficiently. He combines deep technical expertise in data architecture with strategic business vision, helping shape Foreko's roadmap and core inventory intelligence algorithms.",
            user: {
              firstname: "Jason",
              lastname: "Luu",
              job: "Chief Executive Officer",
              image: {
                url: "/images/jason.png",
                alternativeText: "Jason Luu"
              },
              linkedin: "https://www.linkedin.com/in/jasonmluu/"
            }
          }
        ]
      },
      {
        __component: "dynamic-zone.team-static",
        id: 3,
        heading: "Team",
        sub_heading: "A passionate team dedicated to revolutionizing inventory management through AI",
        testimonials: [
          {
            id: 3,
            text: "University of Arkansas graduate with extensive financial analysis and Fintech background, including hands-on experience with SAP, Power Automate, and SQL at Tyson Foods. At Foreko, Hao specializes in financial analytics for our AI models, ensuring our inventory intelligence platform delivers accurate cost optimization and ROI predictions. His expertise helps small businesses make data-driven financial decisions about their inventory investments.",
            user: {
              firstname: "Hao",
              lastname: "Pham", 
              job: "Head of Finance",
              image: {
                url: "/images/hao.png",
                alternativeText: "Hao Pham"
              },
              linkedin: "https://www.linkedin.com/in/hao-pham912849/"
            }
          },
          {
            id: 4,
            text: "Supply Chain Management student at University of Arkansas specializing in logistics optimization. At Foreko, Alexis leads our marketing initiatives and develops the sophisticated logistical algorithms that power our inventory management models. His expertise ensures our AI understands real-world supply chain complexities and delivery optimization challenges that small businesses face daily.",
            user: {
              firstname: "Alexis",
              lastname: "Rodas",
              job: "Head of Supply Chain",
              image: {
                url: "/images/alexis.png",
                alternativeText: "Alexis Rodas"
              },
              linkedin: "https://www.linkedin.com/in/alexis-rodas-3b6890230/"
            }
          },
          {
            id: 5,
            text: "Industrial Engineering student at the University of Arkansas, Harish brings fresh analytical perspectives and innovative problem-solving approaches to Foreko's operations team. His academic focus on process optimization and systems analysis directly supports our mission to streamline inventory management for small businesses. Harish combines theoretical knowledge with practical application, helping design more efficient operational workflows that enhance our platform's effectiveness.",
            user: {
              firstname: "Harish",
              lastname: "Suresh",
              job: "Head of Operations",
              image: {
                url: "/images/harish.png",
                alternativeText: "Harish Suresh"
              },
              linkedin: "https://www.linkedin.com/in/harishsuresh0/"
            }
          },
          {
            id: 6,
            text: "Andrew leads Foreko's app development and machine learning initiatives, driving innovation in our AI-powered inventory intelligence platform. With expertise in both mobile application development and advanced machine learning algorithms, Andrew ensures our technology delivers cutting-edge solutions for small businesses. He spearheads the development of intelligent features that automate inventory management and provide actionable insights, making complex AI technology accessible and practical for everyday business operations.",
            user: {
              firstname: "Andrew",
              lastname: "Samountry",
              job: "Head of Engineering",
              image: {
                url: "/images/andrew.jpg",
                alternativeText: "Andrew Samountry"
              },
              linkedin: "https://www.linkedin.com/in/andrew-samountry-632807205/"
            }
          }
        ]
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
        updated_date: "Updated August 06, 2025",
        heading: "Privacy Policy",
        sub_heading: "How Foreko protects your business data and privacy",
        CTAs: []
      },
      {
        __component: "dynamic-zone.privacy-policy",
        id: 2,
        heading: "Privacy Policy",
        sub_heading: "Your privacy and data protection are our top priorities"
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
        updated_date: "Updated August 06 2025",
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
        __component: "dynamic-zone.terms-of-service",
        id: 2,
        heading: "Foreko Terms of Service",
        sub_heading: "Welcome to Foreko. These Terms of Service govern your access to and use of the Foreko platform."
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
        CTAs: []
      },
      {
        __component: "dynamic-zone.contact-form",
        id: 2,
        heading: "Get in Touch",
        sub_heading: "Fill out the form below and we'll get back to you as soon as possible"
      },
      {
        __component: "dynamic-zone.company-info",
        id: 3,
        heading: "Company Information",
        sub_heading: "Everything you need to know about reaching Foreko"
      },
      {
        __component: "dynamic-zone.testimonials",
        id: 4,
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
      metaTitle: "Pricing - Foreko AI Inventory Management",
      metaDescription: "AI-powered inventory management for small businesses. Choose from our affordable pricing plans starting at $25/month."
    },
    dynamic_zone: [
      {
        __component: "dynamic-zone.pricing",
        id: 1,
        heading: "Choose Your AI Inventory Management Plan",
        sub_heading: "Choose your payload.",
        plans: [
          {
            id: 1,
            name: "Starter Inventory",
            price: 50,
            sub_text: "Perfect for small businesses just getting started",
            featured: false,
            CTA: {
              text: "Get Started",
              URL: "/sign-up",
              variant: "outline"
            },
            perks: [
              { text: "Track up to 500 inventory items" },
              { text: "Basic AI Reorder Alerts" },
              { text: "Standard Analytics Dashboard" },
              { text: "Email Support" },
              { text: "Essential Inventory Reports" }
            ],
            additional_perks: []
          },
          {
            id: 2,
            name: "Pro Inventory",
            price: 100,
            sub_text: "Great for growing businesses with expanding inventory",
            featured: false,
            CTA: {
              text: "Get Started",
              URL: "/sign-up",
              variant: "outline"
            },
            perks: [
              { text: "Track up to 5,000 inventory items" },
              { text: "Advanced AI Demand Forecasting" },
              { text: "Advanced Analytics Dashboard" },
              { text: "Advanced inventory analytics" },
              { text: "Priority Support" },
              { text: "Multi-location inventory tracking" }
            ],
            additional_perks: [
              { text: "Everything included from Starter Inventory" }
            ]
          },
          {
            id: 3,
            name: "Business Intelligence",
            price: 150,
            sub_text: "For established businesses with complex inventory needs",
            featured: true,
            CTA: {
              text: "Get Started",
              URL: "/sign-up",
              variant: "primary"
            },
            perks: [
              { text: "Track up to 50,000 inventory items" },
              { text: "Collaborative AI Control Dashboard" },
              { text: "High-Speed Data Processing" },
              { text: "Advanced analytics and reporting" },
              { text: "Priority Support" },
              { text: "Team collaboration tools" },
              { text: "Custom integrations and workflows" }
            ],
            additional_perks: [
              { text: "Everything included from Starter Inventory" },
              { text: "Everything included from Pro Inventory" }
            ]
          },
          {
            id: 4,
            name: "Enterprise Inventory",
            price: null,
            sub_text: "Custom solutions for large organizations",
            featured: false,
            CTA: {
              text: "Contact us",
              URL: "/contact",
              variant: "outline"
            },
            perks: [
              { text: "Unlimited inventory items per system" },
              { text: "Customizable AI Control Dashboard" },
              { text: "Ultra-Speed Data Processing" },
              { text: "Comprehensive analytics and reporting" },
              { text: "Dedicated Support Team" },
              { text: "Custom Integrations and Solutions" },
              { text: "White-label deployment options" }
            ],
            additional_perks: [
              { text: "Everything included from Starter Inventory" },
              { text: "Everything included from Pro Inventory" },
              { text: "Everything included from Business Intelligence" }
            ]
          }
        ]
      },
      {
        __component: "dynamic-zone.brands",
        id: 3,
        heading: "Trusted by Leading Small Businesses",
        sub_heading: "Foreko is trusted by small business owners nationwide.",
        logos: [
          {
            id: 1,
            title: "Shopify",
            image: {
              url: "https://cdn.worldvectorlogo.com/logos/shopify.svg",
              alternativeText: "Shopify Logo"
            }
          },
          {
            id: 2,
            title: "Square",
            image: {
              url: "/images/square.png",
              alternativeText: "Square Logo"
            }
          },
          {
            id: 3,
            title: "QuickBooks",
            image: {
              url: "https://cdn.worldvectorlogo.com/logos/quickbooks.svg",
              alternativeText: "QuickBooks Logo"
            }
          },
          {
            id: 4,
            title: "WooCommerce",
            image: {
              url: "https://cdn.worldvectorlogo.com/logos/woocommerce.svg",
              alternativeText: "WooCommerce Logo"
            }
          }
        ]
      },
      {
        __component: "dynamic-zone.cta",
        id: 4,
        heading: "Ready to Launch Your Inventory Management?",
        sub_heading: "Join Foreko and start managing your inventory with the speed and reliability of AI-powered automation.",
        CTAs: [
          {
            id: 1,
            text: "Book a demo",
            URL: "/contact",
            variant: "outline"
          },
          {
            id: 2,
            text: "Sign up now",
            URL: "/sign-up",
            variant: "primary"
          }
        ]
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
      metaTitle: "Cookie Policy - Foreko",
      metaDescription: "Learn about how Foreko uses cookies and similar tracking technologies when you visit our website or use our platform"
    },
    dynamic_zone: [
      {
        __component: "dynamic-zone.hero",
        id: 1,
        heading: "Cookie Policy",
        sub_heading: "Learn how we use cookies and tracking technologies",
        updated_date: "Updated August 06 2025",
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
        __component: "dynamic-zone.cookie-policy",
        id: 2,
        heading: "Foreko Cookie Policy",
        sub_heading: "This Cookie Policy explains how Foreko uses cookies and similar tracking technologies when you visit our website or use our platform."
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
      { text: "Company", URL: "/company", target: "_self" },
      { text: "Contact", URL: "/contact", target: "_self" }
    ],
    right_navbar_items: [
      { text: "Log In", URL: "/sign-in", target: "_self" },
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
    sections: [
      {
        title: "Foreko",
        links: [
          { text: "Home", URL: "/" },
          { text: "Features", URL: "/features" },
          { text: "Pricing", URL: "/pricing" },
          { text: "Use Cases", URL: "/use-cases" },
          { text: "Resources", URL: "/resources" },
          { text: "Company", URL: "/company" },
          { text: "Contact", URL: "/contact" }
        ]
      },
      {
        title: "Legal",
        links: [
          { text: "Privacy Policy", URL: "/privacy" },
          { text: "Terms of Service", URL: "/terms" },
          { text: "Cookie Policy", URL: "/security" }
        ]
      },
      {
        title: "Socials",
        links: [
          { text: "Twitter", URL: "https://twitter.com/foreko" },
          { text: "LinkedIn", URL: "https://www.linkedin.com/company/foreko-inventory-intelligence-platform/?viewAsMember=true" },
          { text: "Facebook", URL: "https://facebook.com/foreko" }
        ]
      }
    ],
    internal_links: [
      { text: "Home", URL: "/" },
      { text: "Features", URL: "/features" },
      { text: "Pricing", URL: "/pricing" },
      { text: "Use Cases", URL: "/use-cases" },
      { text: "Resources", URL: "/resources" },
      { text: "Company", URL: "/company" },
      { text: "Contact", URL: "/contact" }
    ],
    policy_links: [
      { text: "Privacy Policy", URL: "/privacy" },
      { text: "Terms of Service", URL: "/terms" },
      { text: "Cookie Policy", URL: "/security" }
    ],
    social_media_links: [
      { text: "Twitter", URL: "https://twitter.com/foreko" },
      { text: "LinkedIn", URL: "https://www.linkedin.com/company/foreko-inventory-intelligence-platform/?viewAsMember=true" },
      { text: "Facebook", URL: "https://facebook.com/foreko" }
    ]
  }
}; 
import { Property } from "@/types/property";

export const FEATURED_PROPERTIES: Property[] = [
  {
    id: "the-glass-pavilion",
    title: "The Glass Pavilion",
    price: 5250000,
    type: "sale",
    category: "villa",
    location: {
      address: "Beverly Hills",
      city: "California",
    },
    features: {
      beds: 5,
      baths: 4.5,
      sqm: 4200,
    },
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCra-FKp81t0_OM8bWD55m2o9OOSnR_v7D0UilyExMImxyIcr9tIMZ2Py3HcC0ra_MtSsBkduMcwxUNKI9_iSXFFr_YRON1SF9hNM3fcYy-uG7N7uusL0Z367WINi1V7_GwfNQx-gsbUqLtzVi4ivFyqFQGb4qBs79bALeSFb6i3_ZnJnI1VVrN-VeZYHjfYyQI5C6zy90N3uxWZpwzIBhNoUDKKQjQ8EOEYPoyPTzhnh6b6AS3dkkFJ8t4xSDC6qjhMrQUoUPnAeM",
    imageAlt: "Luxury modern villa exterior with pool",
    badge: "Exclusive",
    isFeatured: true,
  },
  {
    id: "azure-heights-penthouse",
    title: "Azure Heights Penthouse",
    price: 3800000,
    type: "sale",
    category: "penthouse",
    location: {
      address: "Downtown",
      city: "Vancouver",
    },
    features: {
      beds: 3,
      baths: 3,
      sqm: 2100,
    },
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDurAGHzg_fpQxFal-obkFVy1Q3WLPdueAQpz0itcQiRV-WfvulnBEDJbNeV8J06q4mX7PTtXYVJjX4-mHVr_khZLZxQ_s8f6fruGqzeqALyMu8wEHRK1EsOs9f4_jPmS7FxcdzrDkR88Wz0GjaPLXkTZRoJQfur59rxYRLi-WYcW-VU_gKS39CPLOMlftvqGvW0IOk5tXgst5mJ4WQM-ICN4vkdel9ido9YFUQga0OI10i6NSe5W4owt33-2YRi_b_ltdZW2QZC5s",
    imageAlt: "Modern interior living room with view",
    badge: "New Arrival",
    isFeatured: true,
  },
];

export const INITIAL_MARKET_PROPERTIES: Property[] = [
  {
    id: "modern-family-home",
    title: "Modern Family Home",
    price: 850000,
    type: "sale",
    category: "house",
    location: {
      address: "123 Pine St",
      city: "Seattle",
    },
    features: {
      beds: 3,
      baths: 2,
      sqm: 120,
    },
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDuQ9M7U6euA6_cXmYuXnej-N5IuawAW8ds-4G1mzfqmiBc13qXsPhf9_j_zTB8gfEunrBHo8xMsxYwCw_pl8fsxbxRkmyvLR1N9Tiye5ZJG7fwlLn9MwyBanXYhE0emGwp59es1FEyQTRQbmXLUKO74Yj34ZHqrqIkOtMKhP8CmRFvfoHT5LAe10105vUhKNkxIBvtt530nfLigSUTemOOcJMVNmsgactntRJUwOBU_TZzND7BYtDklr8uZcNYlQOK5U74-ufIf-E",
    imageAlt: "Modern white house facade",
    badge: "FOR SALE",
    isFeatured: false,
  },
  {
    id: "urban-loft",
    title: "Urban Loft",
    price: 3200,
    pricePeriod: "month",
    type: "rent",
    category: "apartment",
    location: {
      address: "456 Elm Ave",
      city: "Portland",
    },
    features: {
      beds: 1,
      baths: 1,
      sqm: 85,
    },
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB4zNatD3vePhIZAi6OHHJKmamYSgeBNSKjEt32tvkkf4s6aBXCF8R4LNfDfPa9leA0t6N1OKOcP358WwZrnosbCBxSM7EaY2_P7qkx3MinRgmHQn7RvleNTwy8cLigMoR3iv0u83chBVbZYI6BcNMcqv80W-l1pIUgIWZcDIXEqtUatrsojSGfM0lTNDZpkBntBUkRY6NB4ZUymYNYvTHXKbO8NZ6N6uoyuuHqcaRWKzHCNXkOR3p-_EVFAHR8QwijIY_m1mefPZ4",
    imageAlt: "Stylish apartment living room",
    badge: "FOR RENT",
    isFeatured: false,
  },
  {
    id: "highland-retreat",
    title: "Highland Retreat",
    price: 620000,
    type: "sale",
    category: "house",
    location: {
      address: "789 Mountain Rd",
      city: "Bend",
    },
    features: {
      beds: 2,
      baths: 2,
      sqm: 98,
    },
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuARQWC19e7mleUpjb8CWLztEv_svJeRFOaC2i-9r9GctFuX5Barzhfai9wNM1WW8bcGlqdFM32d3KPf7SItom5ijdHOz5rGGQPeT7PlWs8-y9LkfcsHLQqsLxalhxP94XJo76_mAMp7T2dVj3hPKHNzTDLLiS6ujSdSsyo3onxQthp4ZkVE8op92gyTLUUucaGaxO8vJvyhH3HuWB07EPqT1WsW0lr9Of5lUPonjG9eiqE1XiJXTqzXUZQt5JorfPwCO1MioZA_Zro",
    imageAlt: "Cabin in the woods exterior",
    badge: "FOR SALE",
    isFeatured: false,
  },
  {
    id: "sea-view-penthouse",
    title: "Sea View Penthouse",
    price: 4500,
    pricePeriod: "month",
    type: "rent",
    category: "penthouse",
    location: {
      address: "321 Ocean Dr",
      city: "Miami",
    },
    features: {
      beds: 3,
      baths: 3,
      sqm: 180,
    },
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBGq4Phm0uDzCnjHAsnWpYTBVpOds_M6iOsJuRQQA5eUZHkztGgtc7eh_OE6wBeyW1-iZh7yyhROnvvmqkAZ9tyAWFGXk0FG52zU4kZ_EDLA0U0cRszy7byNXTeWe0_hS53SYmtCTEV8Y1AM-WxiIC38UMa15QwFDjXtCGQOxoh35K0Ol_70vfsxm0VqDbaWkr8tcEbLTLy0NXH_GcpGK4lAXizgxYOIlFWGyau-4OIfPZRpjCBDbz_qu3VlN201UUJGiuM9ajVd-U",
    imageAlt: "Bright bedroom with large window",
    badge: "FOR RENT",
    isFeatured: false,
  },
  {
    id: "central-studio",
    title: "Central Studio",
    price: 550000,
    type: "sale",
    category: "apartment",
    location: {
      address: "555 Main St",
      city: "Chicago",
    },
    features: {
      beds: 1,
      baths: 1,
      sqm: 50,
    },
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA1w-Hb1289NqZKon3VK8bpmMiCDYYiAMT5egzTINo9m9wSZRHv-k-1IGTVoL1NT8YeZXJHa87JPNDIPrtrbP7jChHq0ypXF90uByhC6VA9O788_B4FY8JVg4chbWN9bcrn9-9FvVvfZX8Aj60Iqg_C8CsCA9DEnJqi2rJvzmK5UP5z-9XRTRjBneAPCa8iGgGWBD9yYKsziN6vn0ePBDGo3inieQtmbr46W31p6UfQ649XRxTm7ygOY2J-jxW1r0qWs8i97KGpkTE",
    imageAlt: "Cozy apartment interior",
    badge: "FOR SALE",
    isFeatured: false,
  },
  {
    id: "garden-villa",
    title: "Garden Villa",
    price: 2800,
    pricePeriod: "month",
    type: "rent",
    category: "villa",
    location: {
      address: "999 Oak Ln",
      city: "Austin",
    },
    features: {
      beds: 2,
      baths: 2,
      sqm: 110,
    },
    imageUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCfGXdY0g51ojSg0GMeTW9ndLY3mpKK3oMtWxo2nwd_dwi1pgn1Boi_ovaDGIFhUA7nwu3WdBch8ZuHxoHu3QfgM5ceAsp8pglRVyCROWNcy9zeDNP2wqLoevyKGcaEyFYHYpIx2KK46nLWthnHiHugmkKw48kJsL8IjMO1bL3T1Zwt8bvQDTTUHTgB3GqZ2RU2asRzF1jVg0rLw3LWXXTq0YF1CsbhlWpYOuCEpH5bB8zkBlbKXR4At_M46AL8rJqn5c6BrPD5PP8",
    imageAlt: "Modern minimalist home exterior",
    badge: "FOR RENT",
    isFeatured: false,
  },
  {
    id: "villa-mirage-oasis",
    title: "Villa Mirage Oasis",
    price: 1450000,
    type: "sale",
    category: "villa",
    location: {
      address: "78 Palm Canyon Dr",
      city: "Palm Springs",
    },
    features: {
      beds: 4,
      baths: 3.5,
      sqm: 310,
    },
    imageUrl:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Modern luxury desert villa with pool",
    badge: "FOR SALE",
    isFeatured: false,
  },
  {
    id: "tribeca-glass-penthouse",
    title: "Tribeca Sky Penthouse",
    price: 7800,
    pricePeriod: "month",
    type: "rent",
    category: "penthouse",
    location: {
      address: "182 Franklin St",
      city: "New York",
    },
    features: {
      beds: 3,
      baths: 3,
      sqm: 220,
    },
    imageUrl:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Tribeca modern penthouse with city views",
    badge: "FOR RENT",
    isFeatured: false,
  },
  {
    id: "zen-forest-residence",
    title: "Zen Forest Residence",
    price: 920000,
    type: "sale",
    category: "house",
    location: {
      address: "44 Timberline Way",
      city: "Aspen",
    },
    features: {
      beds: 3,
      baths: 2.5,
      sqm: 175,
    },
    imageUrl:
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Architectural wooden residence in alpine forest",
    badge: "FOR SALE",
    isFeatured: false,
  },
  {
    id: "soho-artisan-loft",
    title: "SoHo Artisan Loft",
    price: 3950,
    pricePeriod: "month",
    type: "rent",
    category: "apartment",
    location: {
      address: "104 Prince St",
      city: "New York",
    },
    features: {
      beds: 2,
      baths: 2,
      sqm: 130,
    },
    imageUrl:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Spacious bright industrial chic loft",
    badge: "FOR RENT",
    isFeatured: false,
  },
  {
    id: "monaco-harbor-residence",
    title: "Riviera Waterfront Villa",
    price: 2850000,
    type: "sale",
    category: "villa",
    location: {
      address: "22 Boulevard de Suisse",
      city: "Monaco",
    },
    features: {
      beds: 5,
      baths: 5,
      sqm: 450,
    },
    imageUrl:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Mediterranean luxury villa with infinity pool",
    badge: "FOR SALE",
    isFeatured: false,
  },
  {
    id: "scandinavian-nordic-haven",
    title: "Nordic Minimalist House",
    price: 690000,
    type: "sale",
    category: "house",
    location: {
      address: "15 Fjord View",
      city: "Oslo",
    },
    features: {
      beds: 3,
      baths: 2,
      sqm: 145,
    },
    imageUrl:
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Minimalist Scandinavian timber home",
    badge: "FOR SALE",
    isFeatured: false,
  },
];

export const ADDITIONAL_MARKET_PROPERTIES: Property[] = [
  {
    id: "skyline-residence",
    title: "Skyline Residence",
    price: 1250000,
    type: "sale",
    category: "apartment",
    location: {
      address: "742 Montgomery St",
      city: "San Francisco",
    },
    features: {
      beds: 2,
      baths: 2,
      sqm: 115,
    },
    imageUrl:
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Skyline luxury residence",
    badge: "FOR SALE",
    isFeatured: false,
  },
  {
    id: "coastal-haven",
    title: "Coastal Haven",
    price: 4200,
    pricePeriod: "month",
    type: "rent",
    category: "villa",
    location: {
      address: "14 Malibu Point",
      city: "Malibu",
    },
    features: {
      beds: 4,
      baths: 3.5,
      sqm: 260,
    },
    imageUrl:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Coastal haven villa",
    badge: "FOR RENT",
    isFeatured: false,
  },
  {
    id: "brickell-bay-flat",
    title: "Brickell Bay Luxury Flat",
    price: 3400,
    pricePeriod: "month",
    type: "rent",
    category: "apartment",
    location: {
      address: "1200 Brickell Ave",
      city: "Miami",
    },
    features: {
      beds: 2,
      baths: 2,
      sqm: 95,
    },
    imageUrl:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Modern Miami apartment interior with floor-to-ceiling glass",
    badge: "FOR RENT",
    isFeatured: false,
  },
  {
    id: "bel-air-contemporary-estate",
    title: "Bel-Air Horizon Estate",
    price: 4100000,
    type: "sale",
    category: "house",
    location: {
      address: "850 Bellagio Rd",
      city: "Los Angeles",
    },
    features: {
      beds: 5,
      baths: 6,
      sqm: 520,
    },
    imageUrl:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Modern Bel-Air architectural mansion",
    badge: "FOR SALE",
    isFeatured: false,
  },
  {
    id: "olympic-village-penthouse",
    title: "Harbour Panorama Penthouse",
    price: 5800,
    pricePeriod: "month",
    type: "rent",
    category: "penthouse",
    location: {
      address: "88 Pacific Blvd",
      city: "Vancouver",
    },
    features: {
      beds: 3,
      baths: 3.5,
      sqm: 210,
    },
    imageUrl:
      "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Modern penthouse terrace with skyline vista",
    badge: "FOR RENT",
    isFeatured: false,
  },
  {
    id: "kyoto-modern-machi",
    title: "Kyoto Zen Townhouse",
    price: 740000,
    type: "sale",
    category: "house",
    location: {
      address: "27 Gion Garden Path",
      city: "Kyoto",
    },
    features: {
      beds: 2,
      baths: 2,
      sqm: 110,
    },
    imageUrl:
      "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=800&q=80",
    imageAlt: "Warm wood modern architectural home interior",
    badge: "FOR SALE",
    isFeatured: false,
  },
];

export const ALL_PROPERTIES: Property[] = [
  ...FEATURED_PROPERTIES,
  ...INITIAL_MARKET_PROPERTIES,
  ...ADDITIONAL_MARKET_PROPERTIES,
];

"use client"

import { useContext, useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import SearchBar from "../../components/searchBar/SearchBar"
import "./homePage.scss"
import { AuthContext } from "../../context/AuthContext"
import {
  Building,
  MapPin,
  Search,
  MessageCircle,
  Home,
  Check,
  Wifi,
  Car,
  Dumbbell,
  Waves,
  Coffee,
  Tv,
  Star,
  ChevronRight,
  ChevronLeft,
  Heart,
  ArrowRight,
  Users,
  Award,
  Shield,
  TrendingUp,
  Sparkles,
  Zap,
} from "lucide-react"

function HomePage() {
  const { currentUser } = useContext(AuthContext)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState({})
  const [activeTab, setActiveTab] = useState("all")
  const [activeCategory, setActiveCategory] = useState("all")
  const [currentSlide, setCurrentSlide] = useState(0)
  const heroRef = useRef(null)
  const featuredRef = useRef(null)
  const categoriesRef = useRef(null)
  const featuresRef = useRef(null)
  const howItWorksRef = useRef(null)
  const testimonialsRef = useRef(null)
  const featuredSliderRef = useRef(null)

  // Mouse tracking for 3D effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }))
          }
        })
      },
      { threshold: 0.1 },
    )

    const elements = [
      heroRef.current,
      featuredRef.current,
      categoriesRef.current,
      featuresRef.current,
      howItWorksRef.current,
      testimonialsRef.current,
    ].filter(Boolean)

    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  // Featured properties
  const featuredProperties = [
    {
      id: 1,
      title: "Modern Downtown Apartment",
      address: "123 Main St, Downtown",
      price: 2500,
      type: "rent",
      bedroom: 2,
      bathroom: 2,
      size: 1200,
      image: "/bg.png",
      rating: 4.9,
      reviews: 127,
      isNew: true,
      isFeatured: true,
      tags: ["Popular", "Verified"],
    },
    {
      id: 2,
      title: "Luxury Penthouse with View",
      address: "456 Park Ave, Uptown",
      price: 5000,
      type: "rent",
      bedroom: 3,
      bathroom: 3,
      size: 2200,
      image: "/placeholder.svg?height=300&width=400",
      rating: 4.8,
      reviews: 95,
      isNew: false,
      isFeatured: true,
      tags: ["Luxury", "Verified"],
    },
    {
      id: 3,
      title: "Cozy Studio in Arts District",
      address: "789 Art St, Arts District",
      price: 1800,
      type: "rent",
      bedroom: 1,
      bathroom: 1,
      size: 800,
      image: "/placeholder.svg?height=300&width=400",
      rating: 4.7,
      reviews: 84,
      isNew: true,
      isFeatured: false,
      tags: ["Trending", "Good Deal"],
    },
    {
      id: 4,
      title: "Family Home with Garden",
      address: "101 Family Rd, Suburbs",
      price: 750000,
      type: "sale",
      bedroom: 4,
      bathroom: 3,
      size: 2800,
      image: "/placeholder.svg?height=300&width=400",
      rating: 4.9,
      reviews: 56,
      isNew: false,
      isFeatured: true,
      tags: ["Family", "Garden"],
    },
  ]

  // Property categories
  const categories = [
    { id: "all", name: "All", icon: Home },
    { id: "apartment", name: "Apartments", icon: Building },
    { id: "house", name: "Houses", icon: Home },
    { id: "villa", name: "Villas", icon: Building },
    { id: "studio", name: "Studios", icon: Building },
  ]

  // Amenities
  const amenities = [
    { icon: Wifi, name: "Free WiFi" },
    { icon: Car, name: "Parking" },
    { icon: Dumbbell, name: "Fitness Center" },
    { icon: Waves, name: "Swimming Pool" },
    { icon: Coffee, name: "Coffee Shop" },
    { icon: Tv, name: "Smart TV" },
  ]

  // How it works steps
  const steps = [
    {
      icon: Search,
      title: "Search & Filter",
      description: "Browse thousands of properties with our advanced search filters to find your perfect match.",
    },
    {
      icon: MapPin,
      title: "Explore Locations",
      description: "Discover neighborhoods with detailed maps, nearby amenities, and local insights.",
    },
    {
      icon: MessageCircle,
      title: "Contact Owners",
      description: "Connect directly with property owners or agents through our secure messaging system.",
    },
    {
      icon: Check,
      title: "Book & Move In",
      description: "Schedule viewings, sign documents online, and move into your new home hassle-free.",
    },
  ]

  // Testimonials
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "First-time Buyer",
      image: "/placeholder.svg?height=60&width=60",
      content:
        "The platform made finding my dream home incredibly easy. The AI search understood exactly what I was looking for!",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Real Estate Investor",
      image: "/placeholder.svg?height=60&width=60",
      content:
        "Best real estate platform I've used. The market insights and analytics are game-changing for my investment decisions.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Property Owner",
      image: "/placeholder.svg?height=60&width=60",
      content: "Listing my property was seamless, and I found qualified tenants within days. Highly recommend!",
      rating: 5,
    },
  ]

  // Stats
  const stats = [
    { icon: Building, value: "50K+", label: "Properties Listed", color: "blue" },
    { icon: Users, value: "100K+", label: "Happy Customers", color: "green" },
    { icon: Award, value: "500+", label: "Awards Won", color: "purple" },
    { icon: Star, value: "4.9", label: "Average Rating", color: "yellow" },
  ]

  // Handle slider navigation
  const nextSlide = () => {
    if (featuredSliderRef.current) {
      const totalSlides = featuredProperties.length
      setCurrentSlide((prev) => (prev + 1) % totalSlides)
      featuredSliderRef.current.scrollTo({
        left: featuredSliderRef.current.clientWidth * ((currentSlide + 1) % totalSlides),
        behavior: "smooth",
      })
    }
  }

  const prevSlide = () => {
    if (featuredSliderRef.current) {
      const totalSlides = featuredProperties.length
      setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
      featuredSliderRef.current.scrollTo({
        left: featuredSliderRef.current.clientWidth * ((currentSlide - 1 + totalSlides) % totalSlides),
        behavior: "smooth",
      })
    }
  }

  // Format price
  const formatPrice = (price, type) => {
    if (price >= 1000000) {
      return `$${(price / 1000000).toFixed(1)}M${type === "rent" ? "/mo" : ""}`
    } else if (price >= 1000) {
      return `$${(price / 1000).toFixed(0)}K${type === "rent" ? "/mo" : ""}`
    }
    return `$${price.toLocaleString()}${type === "rent" ? "/mo" : ""}`
  }

  return (
    <div className="modern-real-estate-homepage">
      {/* Animated Background */}
      <div className="animated-background">
        <div
          className="gradient-blob blob-1"
          style={{
            transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
          }}
        ></div>
        <div
          className="gradient-blob blob-2"
          style={{
            transform: `translate(${mousePosition.x * -0.02}px, ${mousePosition.y * 0.03}px)`,
          }}
        ></div>
        <div
          className="gradient-blob blob-3"
          style={{
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * -0.02}px)`,
          }}
        ></div>
      </div>

      {/* Hero Section */}
      <section ref={heroRef} id="hero" className={`hero-section ${isVisible.hero ? "animate-in" : ""}`}>
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={16} />
              <span>Trusted by 100,000+ customers worldwide</span>
            </div>

            <h1 className="hero-title">
              Find Your <span className="gradient-text">Dream Home</span> With Confidence
            </h1>

            <p className="hero-description">
              Discover the perfect property with our AI-powered platform. From luxury apartments to family homes, we
              make finding your next home simple, fast, and enjoyable.
            </p>

            <div className="search-container">
              <SearchBar />
            </div>

            <div className="popular-searches">
              <span>Popular:</span>
              <div className="search-tags">
                <button>Apartments in Downtown</button>
                <button>Houses with Garden</button>
                <button>Pet-friendly</button>
              </div>
            </div>
          </div>

          <div className="hero-image-container">
            <div className="hero-image">
              <img src="/bg.png" alt="Modern apartment interior" />
              <div className="image-overlay"></div>

              <div className="floating-card price-card">
                <div className="card-content">
                  <span className="label">Starting at</span>
                  <span className="price">$1,200/mo</span>
                </div>
              </div>

              <div className="floating-card location-card">
                <div className="card-icon">
                  <MapPin size={16} />
                </div>
                <div className="card-content">
                  <span className="location-name">Downtown</span>
                  <span className="location-detail">Most popular area</span>
                </div>
              </div>

              <div className="floating-card rating-card">
                <div className="card-content">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} fill="currentColor" />
                    ))}
                  </div>
                  <span className="rating-text">4.9 (2.5k reviews)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-stats">
          <div className="container">
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className={`stat-item stat-${stat.color}`}>
                  <div className="stat-icon">
                    <stat.icon size={24} />
                  </div>
                  <div className="stat-content">
                    <span className="stat-value">{stat.value}</span>
                    <span className="stat-label">{stat.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section
        ref={categoriesRef}
        id="categories"
        className={`categories-section ${isVisible.categories ? "animate-in" : ""}`}
      >
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <Home size={16} />
              <span>Browse by Category</span>
            </div>
            <h2>Find Your Perfect Space</h2>
            <p>Explore our curated collection of properties across different categories</p>
          </div>

          <div className="categories-grid">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`category-card ${activeCategory === category.id ? "active" : ""}`}
                onClick={() => setActiveCategory(category.id)}
              >
                <div className="category-icon">
                  <category.icon size={24} />
                </div>
                <span className="category-name">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section ref={featuredRef} id="featured" className={`featured-section ${isVisible.featured ? "animate-in" : ""}`}>
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <Zap size={16} />
              <span>Featured Properties</span>
            </div>
            <h2>Discover Our Top Picks</h2>
            <p>Handpicked properties that match your lifestyle and preferences</p>
          </div>

          <div className="tabs-container">
            <div className="tabs">
              <button className={`tab ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>
                All
              </button>
              <button className={`tab ${activeTab === "rent" ? "active" : ""}`} onClick={() => setActiveTab("rent")}>
                For Rent
              </button>
              <button className={`tab ${activeTab === "sale" ? "active" : ""}`} onClick={() => setActiveTab("sale")}>
                For Sale
              </button>
            </div>
          </div>

          <div className="featured-slider-container">
            <div className="slider-controls">
              <button className="slider-btn prev" onClick={prevSlide}>
                <ChevronLeft size={20} />
              </button>
              <button className="slider-btn next" onClick={nextSlide}>
                <ChevronRight size={20} />
              </button>
            </div>

            <div className="featured-slider" ref={featuredSliderRef}>
              {featuredProperties
                .filter((property) => activeTab === "all" || property.type === activeTab)
                .map((property) => (
                  <div key={property.id} className="property-card">
                    <div className="property-image">
                      <img src={property.image || "/placeholder.svg"} alt={property.title} />
                      <div className="property-tags">
                        {property.tags.map((tag, index) => (
                          <span key={index} className="tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <button className="favorite-btn">
                        <Heart size={18} />
                      </button>
                      {property.isNew && <span className="new-badge">New</span>}
                      <div className="property-type">{property.type === "rent" ? "For Rent" : "For Sale"}</div>
                    </div>
                    <div className="property-content">
                      <div className="property-price">
                        <span>{formatPrice(property.price, property.type)}</span>
                      </div>
                      <h3 className="property-title">{property.title}</h3>
                      <div className="property-location">
                        <MapPin size={14} />
                        <span>{property.address}</span>
                      </div>
                      <div className="property-features">
                        <div className="feature">
                          <span className="value">{property.bedroom}</span>
                          <span className="label">Beds</span>
                        </div>
                        <div className="feature">
                          <span className="value">{property.bathroom}</span>
                          <span className="label">Baths</span>
                        </div>
                        <div className="feature">
                          <span className="value">{property.size}</span>
                          <span className="label">Sq Ft</span>
                        </div>
                      </div>
                      <div className="property-rating">
                        <div className="stars">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} size={14} fill={i < Math.floor(property.rating) ? "currentColor" : "none"} />
                          ))}
                        </div>
                        <span>
                          {property.rating} ({property.reviews} reviews)
                        </span>
                      </div>
                      <Link to={`/${property.id}`} className="view-property-btn">
                        View Property
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          <div className="view-all-container">
            <Link to="/list" className="view-all-btn">
              View All Properties
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} id="features" className={`features-section ${isVisible.features ? "animate-in" : ""}`}>
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <Shield size={16} />
              <span>Why Choose Us</span>
            </div>
            <h2>The Smarter Way to Find a Home</h2>
            <p>Experience the future of real estate with our innovative features</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <TrendingUp size={24} />
              </div>
              <h3>Real-time Market Data</h3>
              <p>Access up-to-date market trends, price history, and neighborhood analytics.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Search size={24} />
              </div>
              <h3>AI-Powered Search</h3>
              <p>Our intelligent algorithm learns your preferences to show you relevant properties.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <MapPin size={24} />
              </div>
              <h3>Interactive Maps</h3>
              <p>Explore neighborhoods with detailed maps showing amenities and points of interest.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <Shield size={24} />
              </div>
              <h3>Verified Listings</h3>
              <p>All properties are verified to ensure accurate information and prevent fraud.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        ref={howItWorksRef}
        id="how-it-works"
        className={`how-it-works-section ${isVisible["how-it-works"] ? "animate-in" : ""}`}
      >
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <Check size={16} />
              <span>Simple Process</span>
            </div>
            <h2>How It Works</h2>
            <p>Find and secure your dream property in just a few simple steps</p>
          </div>

          <div className="steps-container">
            {steps.map((step, index) => (
              <div key={index} className="step-card">
                <div className="step-number">{index + 1}</div>
                <div className="step-icon">
                  <step.icon size={24} />
                </div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        ref={testimonialsRef}
        id="testimonials"
        className={`testimonials-section ${isVisible.testimonials ? "animate-in" : ""}`}
      >
        <div className="container">
          <div className="section-header">
            <div className="section-badge">
              <Star size={16} />
              <span>Testimonials</span>
            </div>
            <h2>What Our Customers Say</h2>
            <p>Join thousands of satisfied customers who found their perfect properties</p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-header">
                  <img
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="testimonial-avatar"
                  />
                  <div className="testimonial-author">
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.role}</p>
                  </div>
                </div>
                <div className="testimonial-content">
                  <div className="stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < testimonial.rating ? "currentColor" : "none"} />
                    ))}
                  </div>
                  <p>{testimonial.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Find Your Dream Home?</h2>
            <p>Join thousands of satisfied customers who found their perfect properties through our platform.</p>
            <div className="cta-buttons">
              {!currentUser ? (
                <>
                  <Link to="/register" className="cta-btn primary">
                    Get Started Free
                    <ArrowRight size={16} />
                  </Link>
                  <Link to="/list" className="cta-btn secondary">
                    Browse Properties
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/add" className="cta-btn primary">
                    List Your Property
                    <ArrowRight size={16} />
                  </Link>
                  <Link to="/list" className="cta-btn secondary">
                    Browse Properties
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage
